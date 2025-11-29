const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      error: 'File too large',
      message: 'Please upload a file smaller than 20MB',
      code: 'FILE_TOO_LARGE'
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      error: 'Unexpected field',
      message: 'Too many files uploaded',
      code: 'TOO_MANY_FILES'
    });
  }

  // Custom validation errors
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message,
      code: 'INVALID_FILE_TYPE'
    });
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    code: 'INTERNAL_ERROR'
  });
};

export default errorHandler;
