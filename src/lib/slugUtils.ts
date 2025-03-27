/**
 * @file slugGenerator.ts
 * @description Contains a function for generating slugs for Entities.
 * @author Andri Fannar Kristjánsson
 * @version 1.0.0
 * @date March 27, 2025
 * @dependencies none
 */

const DEFAULT_MAX_SLUG_LENGTH = 50;

/**
 * Generates a slug for an Entity.
 * @param name - The name of the Entity.
 * @param id - The ID of the Entity.
 * @param publicId - The public ID of the Entity, if applicable.
 * @returns - The generated slug.
 */
export function generateSlug(
  name: string,
  id: number,
  publicId: string = '',
  maxSlugLength: number = DEFAULT_MAX_SLUG_LENGTH
): string {
  let slugPart = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const idStr = id.toString();
  const publicIdPart = publicId ? `${publicId}:` : '';
  const staticPart = publicIdPart ? `${idStr}-${publicIdPart}` : `${idStr}:`;

  const reservedLength = staticPart.length;
  const availableLength = maxSlugLength - reservedLength;

  if (availableLength < 0) {
    throw new Error(
      'maxSlugLength is too short to accommodate the id and publicId.'
    );
  }
  slugPart = slugPart.slice(0, availableLength);

  return `${staticPart}${slugPart}`;
}
