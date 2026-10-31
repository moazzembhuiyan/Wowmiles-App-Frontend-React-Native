export type AcademyModule = {
  title: string;
  format: 'Video' | 'Presentation' | 'Quiz';
  duration: string;
  status: 'complete' | 'current' | 'locked';
};

export const featuredCourse = {
  partner: 'EMIRATES',
  title: 'Premium Economy: selling the cabin',
  category: 'Airline expertise',
  modulesComplete: 3,
  moduleCount: 6,
  rewardMiles: 300,
  duration: '35 min',
  certificate: 'Emirates · 14 Oct 2026',
};

export const courseModules: AcademyModule[] = [
  { title: 'The cabin in context', format: 'Video', duration: '6 min', status: 'complete' },
  { title: 'Routes and aircraft', format: 'Presentation', duration: '8 min', status: 'complete' },
  { title: 'Pricing and fare rules', format: 'Video', duration: '9 min', status: 'complete' },
  { title: 'Handling objections', format: 'Video', duration: '10 min', status: 'current' },
  { title: 'Booking walkthrough', format: 'Presentation', duration: '7 min', status: 'locked' },
  { title: 'Knowledge check', format: 'Quiz', duration: '5 questions', status: 'locked' },
];

export const recommendedCourses = [
  { partner: 'MSC CRUISES', title: 'Selling Mediterranean cruises', details: '5 modules · 35 min · +500' },
  { partner: 'ANANTARA', title: 'Luxury resorts of the Maldives', details: '4 modules · 30 min · +400' },
];

export const quizQuestions = [
  {
    prompt: 'What makes Premium Economy different from Economy?',
    choices: [
      'A larger seat and more personal space',
      'A guaranteed Business Class upgrade',
      'The same seat with a different meal',
      'A first-class lounge on every route',
    ],
    correctIndex: 0,
  },
  {
    prompt: 'How should you explain the cabin comparison?',
    choices: [
      'Promise every advertised feature',
      'Use verified details for the chosen flight',
      'Assume it matches Business Class',
      'Describe features from another airline',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'What should you check before recommending a fare?',
    choices: [
      'Only the departure time',
      'The current fare conditions and inclusions',
      'Whether another airline has a sale',
      'The customer’s loyalty tier only',
    ],
    correctIndex: 1,
  },
  {
    prompt: 'Which detail should you verify for each itinerary?',
    choices: [
      'The aircraft and cabin on the chosen flight',
      'The aircraft used on a previous trip',
      'The route’s most popular cabin',
      'The fare on a different travel date',
    ],
    correctIndex: 0,
  },
  {
    prompt: 'What is the best way to answer a customer objection?',
    choices: [
      'Avoid discussing the fare difference',
      'Compare verified benefits against the customer’s needs',
      'Guarantee that every route is identical',
      'Recommend the most expensive option',
    ],
    correctIndex: 1,
  },
];

export const certificateTopics = [
  'Check the chosen flight and date',
  'Use verified cabin details',
  'Review the current fare conditions',
];
