import { useEffect, useState } from 'react';
import { AcademyHomeScreen } from './academy-home-screen';
import { AcademyCourseScreen } from './academy-course-screen';
import { AcademyPlayerScreen } from './academy-player-screen';
import { AcademyQuizScreen } from './academy-quiz-screen';
import { AcademyQuizResultScreen } from './academy-quiz-result-screen';
import { AcademyVerifyScreen } from './academy-verify-screen';
import { AcademyCertificateScreen } from './academy-certificate-screen';
import { useTabBarVisibility } from '@/components/tab-bar-visibility';
import { useToast } from '@/components/toast';
import { exportCertificate } from './academy-certificate-export';
import {
  completeCourse,
  completeLesson,
  getCourse,
  getLessons,
  type Certificate,
  type CourseCompletion,
  type Lesson,
  type QuizAttempt,
} from '@/lib/api/academy';
import { ApiError, queryClient } from '@/lib/api/client';

type AcademyStage = 'home' | 'course' | 'player' | 'quiz' | 'result' | 'certificate' | 'verify';

type QuizOutcome = { attempt: QuizAttempt; lesson: Lesson; completion: CourseCompletion | null };

const lessonsKey = (courseId: string) => ['academy', 'lessons', courseId] as const;
const courseKey = (courseId: string) => ['academy', 'course', courseId] as const;

/**
 * Ids live in state because the Academy is one tab route with an in-screen stage machine;
 * every id is validated with `requireId` inside the API functions before it reaches a path.
 */
export function AcademyFlow() {
  const setTabBarHidden = useTabBarVisibility();
  const showToast = useToast();
  const [stage, setStage] = useState<AcademyStage>('home');
  const [courseId, setCourseId] = useState<string | null>(null);
  const [lessonId, setLessonId] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<QuizOutcome | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);

  useEffect(() => {
    setTabBarHidden(stage !== 'home');
    return () => setTabBarHidden(false);
  }, [setTabBarHidden, stage]);

  const openCourse = (id: string) => {
    setCourseId(id);
    setStage('course');
  };

  const openLesson = (id: string) => {
    setLessonId(id);
    setStage('player');
  };

  /** Credits the course once every lesson is done, then routes to the next lesson, the certificate, or the course. */
  const advanceAfterLesson = async (id: string): Promise<CourseCompletion | null> => {
    const lessons = await queryClient.fetchQuery({ queryKey: lessonsKey(id), queryFn: () => getLessons(id), staleTime: 0 });
    const next = lessons.items.find((item) => !item.isCompleted);
    if (next) return null;
    const course = await queryClient.fetchQuery({ queryKey: courseKey(id), queryFn: () => getCourse(id), staleTime: 0 });
    if (course.myProgress.isComplete) return null;
    return completeCourse(id);
  };

  const handleLessonCompleted = async (lesson: Lesson) => {
    if (!courseId) return;
    try {
      if (!lesson.isCompleted) await completeLesson({ courseId, lesson });
      const completion = await advanceAfterLesson(courseId);
      if (completion) {
        showToast('Course completed', `+${completion.milesAwarded} WowMiles credited.`, 'success');
        setStage(completion.certificate ? 'certificate' : 'course');
        return;
      }
      const lessons = await queryClient.fetchQuery({ queryKey: lessonsKey(courseId), queryFn: () => getLessons(courseId), staleTime: 0 });
      const next = lessons.items.find((item) => !item.isCompleted);
      if (next) openLesson(next.id);
      else setStage('course');
    } catch (error) {
      showToast('Could not save progress', error instanceof ApiError ? error.message : 'Please try again.', 'error');
    }
  };

  /** Retries `complete-course` when it failed after the last lesson was saved. */
  const finishCourse = async () => {
    if (!courseId) return;
    try {
      const completion = await completeCourse(courseId);
      showToast('Course completed', `+${completion.milesAwarded} WowMiles credited.`, 'success');
      setStage(completion.certificate ? 'certificate' : 'course');
    } catch (error) {
      showToast('Could not complete course', error instanceof ApiError ? error.message : 'Please try again.', 'error');
    }
  };

  const handleAttempt = async (attempt: QuizAttempt, lesson: Lesson) => {
    let completion: CourseCompletion | null = null;
    if (attempt.isPassed && courseId) {
      try {
        await completeLesson({ courseId, lesson });
        completion = await advanceAfterLesson(courseId);
      } catch (error) {
        showToast('Could not save progress', error instanceof ApiError ? error.message : 'Please try again.', 'error');
      }
    }
    setOutcome({ attempt, lesson, completion });
    setStage('result');
  };

  const downloadCertificate = async () => {
    if (!certificate) return;
    try {
      const result = await exportCertificate(certificate);
      if (result === 'print') {
        showToast('Certificate ready', 'Choose Save as PDF in the print dialog.', 'success');
      } else if (result === 'unavailable') {
        showToast('Sharing is unavailable', 'Try again on a device with PDF sharing enabled.', 'error');
      }
    } catch (error) {
      console.error('Unable to export Academy certificate', error);
      showToast('Could not export certificate', 'Please try downloading the PDF again.', 'error');
    }
  };

  if (stage === 'course' && courseId) {
    return (
      <AcademyCourseScreen
        courseId={courseId}
        onBack={() => setStage('home')}
        onOpenLesson={openLesson}
        onOpenCertificate={() => setStage('certificate')}
        onFinishCourse={finishCourse}
      />
    );
  }

  if (stage === 'player' && courseId && lessonId) {
    return (
      <AcademyPlayerScreen
        courseId={courseId}
        lessonId={lessonId}
        onClose={() => setStage('course')}
        onComplete={handleLessonCompleted}
        onStartQuiz={() => setStage('quiz')}
      />
    );
  }

  if (stage === 'quiz' && lessonId) {
    return (
      <AcademyQuizScreen
        courseId={courseId ?? ''}
        lessonId={lessonId}
        onSubmitted={(attempt, lesson) => void handleAttempt(attempt, lesson)}
        onClose={() => setStage('player')}
      />
    );
  }

  if (stage === 'result' && outcome) {
    return (
      <AcademyQuizResultScreen
        attempt={outcome.attempt}
        lesson={outcome.lesson}
        completion={outcome.completion}
        onAction={() => setStage(outcome.attempt.isPassed ? (outcome.completion?.certificate ? 'certificate' : 'course') : 'quiz')}
      />
    );
  }

  if (stage === 'verify') {
    return <AcademyVerifyScreen onBack={() => setStage('home')} />;
  }

  if (stage === 'certificate' && courseId) {
    return (
      <AcademyCertificateScreen
        courseId={courseId}
        onBack={() => setStage('home')}
        onLoaded={setCertificate}
        onDownload={() => void downloadCertificate()}
      />
    );
  }

  return <AcademyHomeScreen onOpenCourse={openCourse} onVerify={() => setStage('verify')} onOpenCertificate={(id) => { setCourseId(id); setStage('certificate'); }} />;
}
