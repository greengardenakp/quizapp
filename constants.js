export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint', 
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const QUIZ_CONFIG = {
  maxQuestions: 15,
  minTextLength: 50,
  defaultDifficulty: 'medium'
};
