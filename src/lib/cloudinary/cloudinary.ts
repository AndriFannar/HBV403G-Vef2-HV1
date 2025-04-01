/**
 * @file cloudinary.ts
 * @description Handles image uploads to Cloudinary.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date April 1, 2025
 * @dependencies
 */

import { getEnvironment } from '../config/environment.js';
import { fileTypeFromBuffer } from 'file-type';
import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../io/logger.js';

const environment = getEnvironment(process.env, logger);

if (!environment) {
  process.exit(1);
}

cloudinary.config({
  // eslint-disable-next-line camelcase
  cloud_name: 'dwolxjvuv',
  // eslint-disable-next-line camelcase
  api_key: '997231526211666',
  // eslint-disable-next-line camelcase
  api_secret: environment.cloudinarySecret,
});

/**
 * Uploads an image from formData in the context to Cloudinary.
 * @param c - Current context
 * @param projectId - Project ID to associate with the image
 * @returns - A hyperlink to the uploaded image
 */
export const uploadImage = async (
  image: FormDataEntryValue | null,
  projectId: number
): Promise<string> => {
  if (!(image instanceof File)) {
    return '';
  }

  const arrayBuffer = await image.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const imageInfo = await fileTypeFromBuffer(buffer);
  if (
    !imageInfo ||
    (imageInfo.mime !== 'image/jpeg' && imageInfo.mime !== 'image/png')
  ) {
    throw new Error('Invalid file type. Only JPEG and PNG are allowed.');
  }

  const publicId = `project-${projectId}-diagram`;

  try {
    await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        // eslint-disable-next-line camelcase
        { public_id: publicId },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(buffer);
    });
  } catch (error) {
    throw new Error('Image upload failed:' + error);
  }

  return cloudinary.url(publicId);
};
