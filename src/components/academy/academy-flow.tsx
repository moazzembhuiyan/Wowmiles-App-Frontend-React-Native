import { useEffect, useState } from 'react';
import { AcademyHomeScreen } from './academy-home-screen';
import { AcademyCourseScreen } from './academy-course-screen';
import { AcademyPlayerScreen } from './academy-player-screen';
import { AcademyQuizScreen } from './academy-quiz-screen';
import { AcademyQuizResultScreen } from './academy-quiz-result-screen';
import { AcademyCertificateScreen } from './academy-certificate-screen';
import { courseModules, quizQuestions } from './academy-data';
import { useTabBarVisibility } from '@/components/tab-bar-visibility';
import { useToast } from '@/components/toast';
import { exportCertificate } from './academy-certificate-export';

type AcademyStage = 'home' | 'course' | 'player' | 'quiz' | 'result' | 'certificate';

export function AcademyFlow() {
  const setTabBarHidden = useTabBarVisibility();
  const showToast = useToast();
  const [stage, setStage] = useState<AcademyStage>('home');
  const [activeModule, setActiveModule] = useState(3);
  const [questionIndex, setQuestionIndex] = useState(1);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(1);
  const [finalScore, setFinalScore] = useState(4);
  const [courseCompleted, setCourseCompleted] = useState(false);

  useEffect(() => {
    setTabBarHidden(stage !== 'home');
    return () => setTabBarHidden(false);
  }, [setTabBarHidden, stage]);

  const startQuiz = () => {
    setQuestionIndex(1);
    setSelectedAnswer(null);
    setCorrectAnswers(1);
    setStage('quiz');
  };

  const advanceQuiz = () => {
    if (selectedAnswer === null) return;
    const isCorrect = selectedAnswer === quizQuestions[questionIndex].correctIndex;
    const score = correctAnswers + Number(isCorrect);
    setCorrectAnswers(score);

    if (questionIndex === quizQuestions.length - 1) {
      setFinalScore(score);
      setCourseCompleted(score >= 4);
      setStage('result');
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelectedAnswer(null);
  };

  const downloadCertificate = async () => {
    try {
      const result = await exportCertificate();
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

  const openModule = (moduleIndex: number) => {
    if (courseModules[moduleIndex]?.status === 'locked' && !courseCompleted) return;
    setActiveModule(moduleIndex);
    setStage('player');
  };

  if (stage === 'course') {
    return (
      <AcademyCourseScreen
        courseCompleted={courseCompleted}
        onBack={() => setStage('home')}
        onContinue={() => {
          if (courseCompleted) {
            setStage('certificate');
          } else {
            setActiveModule(3);
            setStage('player');
          }
        }}
        onSelectModule={openModule}
      />
    );
  }

  if (stage === 'player') {
    return (
      <AcademyPlayerScreen
        moduleIndex={activeModule}
        onClose={() => setStage('course')}
        onComplete={startQuiz}
      />
    );
  }

  if (stage === 'quiz') {
    return (
      <AcademyQuizScreen
        questionIndex={questionIndex}
        selectedAnswer={selectedAnswer}
        onSelectAnswer={setSelectedAnswer}
        onNext={advanceQuiz}
        onClose={() => setStage('player')}
      />
    );
  }

  if (stage === 'result') {
    return (
      <AcademyQuizResultScreen
        score={finalScore}
        onAction={() => {
          if (finalScore >= 4) {
            setStage('certificate');
          } else {
            startQuiz();
          }
        }}
      />
    );
  }

  if (stage === 'certificate') {
    return (
      <AcademyCertificateScreen
        onBack={() => setStage('home')}
        onDownload={() => void downloadCertificate()}
      />
    );
  }

  return (
    <AcademyHomeScreen
      courseCompleted={courseCompleted}
      onResume={() => setStage(courseCompleted ? 'certificate' : 'course')}
      onOpenCertificate={() => setStage('certificate')}
      onUnavailable={(title) => showToast('Course coming soon', `${title} will be available in a future release.`, 'info')}
    />
  );
}
