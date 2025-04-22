import asyncHandler from 'express-async-handler';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import Image from '../models/imageModel.js';
import { validateImageUpload, validateUrlUpload } from '../utils/validation.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Upload image file
// @route   POST /api/images/upload
// @access  Private
export const uploadImage = asyncHandler(async (req, res) => {
  // Validate request
  const { error } = validateImageUpload(req);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  // Check if file exists
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image file');
  }

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'uploads',
      resource_type: 'image',
    });

    // Remove file from local storage
    fs.unlinkSync(req.file.path);

    // Create new image record
    const image = await Image.create({
      name: req.body.name || req.file.originalname,
      description: req.body.description || '',
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      user: req.user.id,
      tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()) : [],
      size: result.bytes,
      format: result.format,
    });

    res.status(201).json({
      success: true,
      data: image,
    });
  } catch (error) {
    // Remove file from local storage if upload fails
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500);
    throw new Error('Image upload failed');
  }
});

// @desc    Upload image from URL
// @route   POST /api/images/url
// @access  Private
export const uploadImageFromUrl = asyncHandler(async (req, res) => {
  // Validate request
  const { error } = validateUrlUpload(req.body);
  if (error) {
    res.status(400);
    throw new Error(error.details[0].message);
  }

  const { imageUrl, name, description, tags } = req.body;

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'uploads',
      resource_type: 'image',
    });

    // Create new image record
    const image = await Image.create({
      name: name || 'URL Image',
      description: description || '',
      imageUrl: result.secure_url,
      cloudinaryId: result.public_id,
      user: req.user.id,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      size: result.bytes,
      format: result.format,
      originalUrl: imageUrl,
    });

    res.status(201).json({
      success: true,
      data: image,
    });
  } catch (error) {
    res.status(500);
    throw new Error('URL image upload failed');
  }
});

// @desc    Get all images
// @route   GET /api/images
// @access  Private
export const getImages = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  
  const query = { user: req.user.id };
  
  // Filter by tags if provided
  if (req.query.tags) {
    const tags = req.query.tags.split(',').map(tag => tag.trim());
    query.tags = { $in: tags };
  }
  
  // Search by name or description
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const total = await Image.countDocuments(query);
  const images = await Image.find(query)
    .sort({ createdAt: -1 })
    .skip(startIndex)
    .limit(limit);

  res.status(200).json({
    success: true,
    count: images.length,
    total,
    pagination: {
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    data: images,
  });
});

// @desc    Get single image
// @route   GET /api/images/:id
// @access  Private
export const getImage = asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id);

  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }

  // Check user
  if (image.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to access this image');
  }

  res.status(200).json({
    success: true,
    data: image,
  });
});

// @desc    Delete image
// @route   DELETE /api/images/:id
// @access  Private
export const deleteImage = asyncHandler(async (req, res) => {
  const image = await Image.findById(req.params.id);

  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }

  // Check user
  if (image.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to delete this image');
  }

  // Delete from Cloudinary
  if (image.cloudinaryId) {
    await cloudinary.uploader.destroy(image.cloudinaryId);
  }

  // Delete from database
  await Image.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc    Update image details
// @route   PUT /api/images/:id
// @access  Private
export const updateImage = asyncHandler(async (req, res) => {
  let image = await Image.findById(req.params.id);

  if (!image) {
    res.status(404);
    throw new Error('Image not found');
  }

  // Check user
  if (image.user.toString() !== req.user.id) {
    res.status(401);
    throw new Error('Not authorized to update this image');
  }

  // Update fields
  const { name, description, tags } = req.body;
  
  const updateData = {};
  if (name) updateData.name = name;
  if (description) updateData.description = description;
  if (tags) updateData.tags = tags.split(',').map(tag => tag.trim());

  // Update image
  image = await Image.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    data: image,
  });
});