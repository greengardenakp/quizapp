export const validateFile = (file) => {
  if (!file) {
    return 'No file provided';
  }

  // Check file size (20MB limit)
  const maxSize = 20 * 1024 * 1024;
  if (file.size > maxSize) {
    return 'File size exceeds 20MB limit';
  }

  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return 'Invalid file type. Please upload PDF, PPT, PPTX, DOC, or DOCX files.';
  }

  return null;
};
