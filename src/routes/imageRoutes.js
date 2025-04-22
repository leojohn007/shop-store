import express from 'express';
import { 
  uploadImage, 
  uploadImageFromUrl, 
  getImages, 
  getImage,
  deleteImage,
  updateImage
} from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router
  .route('/')
  .get(getImages);

router
  .route('/upload')
  .post(upload.single('image'), uploadImage);

router
  .route('/url')
  .post(uploadImageFromUrl);

router
  .route('/:id')
  .get(getImage)
  .put(updateImage)
  .delete(deleteImage);

export default router;