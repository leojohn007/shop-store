# Image Upload Server

A fully functional Node.js server for uploading and managing images with MongoDB and Cloudinary.

## Features

- Upload images via file upload or URL
- Store image metadata in MongoDB
- Image processing and storage with Cloudinary
- JWT authentication for secure access
- RESTful API endpoints
- Responsive front-end interface for testing
- Easy deployment to Render

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Image Storage**: Cloudinary
- **Authentication**: JWT
- **Validation**: Joi
- **File Handling**: Multer

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB database (local or MongoDB Atlas)
- Cloudinary account

### Installation

1. Clone the repository
2. Create a `.env` file based on `.env.example`
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CORS_ORIGIN=http://localhost:5173
```

## API Endpoints

### Authentication

- `POST /api/users` - Register a new user
- `POST /api/users/login` - Login and get token
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Images

- `POST /api/images/upload` - Upload image (file)
- `POST /api/images/url` - Upload image from URL
- `GET /api/images` - Get all images
- `GET /api/images/:id` - Get image by ID
- `PUT /api/images/:id` - Update image details
- `DELETE /api/images/:id` - Delete image

## Deployment

### Deploying to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `npm install`
4. Set the start command: `node src/server.js`
5. Add all required environment variables
6. Deploy

## License

This project is licensed under the MIT License.#   s h o p - s t o r e  
 