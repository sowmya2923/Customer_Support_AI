const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary if credentials are set
const isCloudinaryConfigured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a local file to Cloudinary or falls back to local URL
 * @param {string} filePath - Absolute path to local file
 * @returns {Promise<string>} - Public accessible URL
 */
const uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) return null;

    if (!isCloudinaryConfigured) {
      // Return local server URL path.
      // Ex: C:/Users/.../public/uploads/file.png -> /uploads/file.png
      const filename = path.basename(filePath);
      return `/uploads/${filename}`;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'ai_support_tickets',
    });

    // Delete local file after upload to save storage
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary Upload Error:', error.message);
    // On error, fallback to local file url instead of failing
    const filename = path.basename(filePath);
    return `/uploads/${filename}`;
  }
};

module.exports = { uploadToCloudinary };
