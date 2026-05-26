const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('✅ Cloudinary initialized successfully.');
} else {
  console.log('ℹ️ Cloudinary credentials not configured. Falling back to local placeholder URLs.');
}

// Wrapper upload function
async function uploadImage(fileBufferOrPath, folder = 'circuitops') {
  if (isConfigured) {
    try {
      const result = await cloudinary.uploader.upload(fileBufferOrPath, {
        folder: folder,
        resource_type: 'auto'
      });
      return result.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Image upload failed: ' + error.message);
    }
  } else {
    // Fallback placeholder images
    const placeholders = [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500',
      'https://images.unsplash.com/photo-1496181130204-7552cc14ac1a?q=80&w=500',
      'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=500',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=500'
    ];
    // Return a random placeholder or first one
    return placeholders[Math.floor(Math.random() * placeholders.length)];
  }
}

module.exports = {
  cloudinary: isConfigured ? cloudinary : null,
  uploadImage,
  isConfigured: !!isConfigured
};
