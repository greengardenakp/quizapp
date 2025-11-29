import FileProcessor from 'fileProcessor.js';
import QuizGenerator from 'quizGenerator.js';
import { validateFile } from 'middleware/validation.js';

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        code: 'NO_FILE'
      });
    }

    // Validate file
    const validationError = validateFile(req.file);
    if (validationError) {
      return res.status(400).json({
        error: validationError,
        code: 'INVALID_FILE'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;

    console.log(`Processing file: ${fileName}, Type: ${fileType}`);

    // Process file and extract text
    const extractedText = await FileProcessor.processFile(filePath, fileType);
    
    if (!extractedText || extractedText.trim().length < 50) {
      return res.status(400).json({
        error: 'Insufficient text content found in the file. Please ensure the file contains readable text.',
        code: 'INSUFFICIENT_CONTENT'
      });
    }

    // Generate MCQs from extracted text
    const mcqData = await QuizGenerator.generateMCQs(extractedText, fileName);

    // Clean up uploaded file
    await FileProcessor.cleanupFile(filePath);

    // Send success response
    res.json({
      success: true,
      message: 'Quiz generated successfully',
      data: {
        fileName: fileName,
        fileType: fileType,
        totalSlides: mcqData.totalSlides || Math.ceil(extractedText.length / 500),
        textPreview: extractedText.substring(0, 300) + '...',
        questions: mcqData.questions,
        processingTime: mcqData.processingTime,
        wordCount: extractedText.split(/\s+/).length
      }
    });

  } catch (error) {
    next(error);
  }
};

export const getUploadStatus = (req, res) => {
  res.json({
    status: 'active',
    maxFileSize: '20MB',
    allowedFormats: ['PDF', 'PPT', 'PPTX', 'DOC', 'DOCX'],
    features: ['MCQ Generation', 'Text Extraction', 'Multiple Formats']
  });
};
