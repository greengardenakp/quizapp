import express from 'express';
import upload from 'multer.js';
import { uploadFile, getUploadStatus } from 'uploadController.js';

const router = express.Router();

// Get upload service status
router.get('/status', getUploadStatus);

// File upload endpoint
router.post('/', upload.single('file'), uploadFile);

export default router;
