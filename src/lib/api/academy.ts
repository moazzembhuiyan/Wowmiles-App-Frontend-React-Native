import { ApiError, apiGet, apiPost, apiRequest, queryClient, requireId } from './client';

/** Mirrors `GET /me/academy/summary`. `learningTime` is in the unit of a lesson's `duration` (minutes). */
export type AcademySummary = {
  coursesCompleted: number;
  coursesInProgress: number;
  lessonsCompleted: number;
  learningTime: number;
  milesEarned: number;
  certificates: number;
  inProgress: { courseId: string; title: string; banner: string; completedRate: number; lastActivity: string }[];
};

export function getAcademySummary() {
  return apiGet<AcademySummary>('/me/academy/summary');
}

export type MyProgress = { enrolled: boolean; completedRate: number; isComplete: boolean; lastActivity: string | null };

/** An item of `GET /courses` (agent view) or `GET /courses/:id`. */
export type Course = {
  /** Mongo id, used in API paths. */
  _id: string;
  /** Public id such as `#CR-1042`. */
  id: string;
  title: string;
  description: string;
  category: string;
  banner: string;
  /** Minutes. */
  duration: number;
  lessons: number;
  miles: number;
  partner: { id: string; name: string; logo: string } | null;
  certifiedBy: string | null;
  fundedBy: string | null;
  certificate: { enabled: boolean; title: string | null; validityMonths: number | null };
  myProgress: MyProgress;
};

/** Partner or certifier shown above a course title, upper case. */
export const courseSource = (course: Pick<Course, 'fundedBy' | 'certifiedBy'>) =>
  (course.fundedBy ?? course.certifiedBy ?? 'WOWMILES').toUpperCase();

/** `GET /courses` (published, with `myProgress`), or the recommended list for the caller. */
export async function getCourses(input: { recommended?: boolean } = {}): Promise<Course[]> {
  const res = await apiRequest<Course[]>('/courses', {
    query: input.recommended ? { recommended: true, limit: 6 } : { limit: 100 },
  });
  return res.data;
}

/** `GET /courses/:id`. */
export function getCourse(id: string) {
  return apiGet<Course>(`/courses/${requireId(id)}`);
}

export type LessonType = 'video' | 'article' | 'presentation' | 'document' | 'audio' | 'quiz';

/** An item of `GET /courses/:id/lessons`. `media` is null until the caller is enrolled. */
export type Lesson = {
  id: string;
  moduleNo: number;
  moduleTitle: string;
  title: string;
  type: LessonType;
  duration: number;
  index: number;
  total: number;
  isCompleted: boolean;
  media: string | null;
  questions?: number;
  passMark?: number;
  attemptsAllowed?: number;
  keyTopics?: string[];
};

export type CourseLessons = { total: number; completed: number; items: Lesson[] };

/** `GET /courses/:id/lessons`. */
export function getLessons(courseId: string) {
  return apiGet<CourseLessons>(`/courses/${requireId(courseId)}/lessons`);
}

function refreshAcademy() {
  void queryClient.invalidateQueries({ queryKey: ['academy'] });
}

/** `POST /enrolled-courses/enroll`. */
export async function enrol(courseId: string) {
  await apiPost('/enrolled-courses/enroll', { course: requireId(courseId) });
  refreshAcademy();
}

/** `POST /enrolled-courses/watch-lecture`: marks a lesson complete (a quiz only after it was passed). */
export async function completeLesson(input: { courseId: string; lesson: Lesson }) {
  await apiPost('/enrolled-courses/watch-lecture', {
    course: requireId(input.courseId),
    content: requireId(input.lesson.id),
    durationWatched: input.lesson.duration,
  });
  refreshAcademy();
}

export type CourseCompletion = { milesAwarded: number; certificate: { id: string; publicId: string } | null };

/** `POST /enrolled-courses/complete-course`: credits the miles and issues the certificate, once. */
export async function completeCourse(courseId: string): Promise<CourseCompletion> {
  const data = await apiPost<CourseCompletion>('/enrolled-courses/complete-course', { course: requireId(courseId) });
  refreshAcademy();
  void queryClient.invalidateQueries({ queryKey: ['wallet'] });
  void queryClient.invalidateQueries({ queryKey: ['home'] });
  return data;
}

export type QuizQuestion = { id: string; title: string; options: { key: string; text: string }[] };

type RawQuestion = { _id: string; title: string; options: { optionLevel: string; optionText: string }[] };

export type Quiz = {
  questions: QuizQuestion[];
  attemptsRemaining: number;
  passMark: number;
};

/** Questions (no answer key) and the attempts left for a quiz lesson. */
export async function getQuiz(lesson: Pick<Lesson, 'id'>): Promise<Quiz> {
  const id = requireId(lesson.id);
  const [content, status] = await Promise.all([
    apiGet<{ quiz: { passMark?: number }; questions: RawQuestion[] }>(`/quiz-questions/quiz/${id}`),
    apiGet<{ attemptsRemaining: number; canAttempt: boolean; hasPassed: boolean }>(`/quiz-attempts/quiz/${id}`),
  ]);
  if (!status.canAttempt && !status.hasPassed) throw new ApiError('You have used all attempts for this quiz.', 400, 'NO_ATTEMPTS');
  return {
    questions: content.questions.map((q) => ({
      id: q._id,
      title: q.title,
      options: q.options.map((o) => ({ key: o.optionLevel, text: o.optionText })),
    })),
    attemptsRemaining: status.attemptsRemaining,
    passMark: content.quiz.passMark ?? 80,
  };
}

/** The graded attempt. `explanation` is only present after an attempt. */
export type QuizAttempt = {
  isPassed: boolean;
  marksObtained: number;
  totalMarks: number;
  correctRate: number;
  passMark: number;
  attemptNumber: number;
  answers: { questionTitle: string; isCorrect: boolean; explanation?: string }[];
};

/** `POST /quiz-attempts/submit`. */
export function submitQuiz(input: { lesson: Pick<Lesson, 'id'>; answers: { question: string; selectedOption: string }[]; timeTaken: number }) {
  return apiPost<QuizAttempt>('/quiz-attempts/submit', {
    quiz: requireId(input.lesson.id),
    answers: input.answers,
    timeTaken: input.timeTaken,
  });
}

export type Certificate = {
  id: string;
  publicId: string;
  verifyCode: string;
  nameOnCertificate: string;
  courseTitle: string;
  agencyName: string | null;
  issuedBy: { name: string };
  issuedAt: string;
  expiresAt: string | null;
  status: 'issued' | 'revoked' | 'expired';
  course: { _id: string; title: string } | null;
};

type RawCertificate = Omit<Certificate, 'id'> & { _id: string };

/** `GET /me/certificates`. */
export async function getCertificates(): Promise<Certificate[]> {
  const res = await apiRequest<RawCertificate[]>('/me/certificates', { query: { limit: 100 } });
  return res.data.map((item) => ({ ...item, id: item._id }));
}

/** The live certificate of one course, or null when none was issued (`GET /me/certificates?course=`). */
export async function getCertificateForCourse(courseId: string): Promise<Certificate | null> {
  const res = await apiRequest<RawCertificate[]>('/me/certificates', {
    query: { course: requireId(courseId), limit: 5 },
  });
  const live = res.data.find((item) => item.status !== 'revoked') ?? null;
  return live ? { ...live, id: live._id } : null;
}

/** `GET /certificates/verify/:verifyCode` (public): the holder, course and status of a certificate. */
export type CertificateVerification = {
  name: string;
  course: string;
  issuedAt: string;
  status: 'issued' | 'revoked' | 'expired';
};

/** Returns null when the code is malformed or unknown. */
export async function verifyCertificate(code: string): Promise<CertificateVerification | null> {
  const clean = code.trim();
  if (!/^[A-Za-z0-9-]{4,64}$/.test(clean)) return null;
  try {
    const res = await apiRequest<CertificateVerification>(`/certificates/verify/${encodeURIComponent(clean)}`, { auth: false });
    return res.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
