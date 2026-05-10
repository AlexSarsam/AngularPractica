import { v2 as cloudinary } from 'cloudinary'
import multer from 'multer'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Solo se permiten imágenes JPEG, PNG o WebP'))
  }
})

export const uploadToCloudinary = (buffer) => new Promise((resolve, reject) => {
  cloudinary.uploader.upload_stream(
    { folder: 'sneakers-ecommerce', transformation: [{ width: 800, height: 800, crop: 'limit' }], format: 'webp' },
    (error, result) => error ? reject(error) : resolve(result)
  ).end(buffer)
})
