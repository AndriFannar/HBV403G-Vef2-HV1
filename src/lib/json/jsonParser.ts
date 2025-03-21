import { JsonSchema } from './jsonSchema.js';

/**
 * @file jsonParser.ts
 * @description A JSON parser utility that turns strings into objects, throwing away invalid JSON. Converted to TypeScript by ChatGPT from project 1.
 * @author Andri Fannar Kristjánsson
 * @version 2.5.1
 * @date January 26, 2025
 */

/**
 * Recursively validates a JSON value against a given schema.
 *
 * @param json - The JSON value to validate.
 * @param validSchema - The schema to validate against.
 * @param verbose - Whether to log extra information.
 * @returns The validated JSON value or null if invalid.
 */
export function validateJson(
  json: unknown,
  validSchema: JsonSchema,
  verbose = false
): unknown | null {
  switch (validSchema.type) {
    case 'string':
    case 'number':
    case 'boolean':
      return validatePrimitive(json, validSchema, verbose);
    case 'array':
      return validateArray(json, validSchema, verbose);
    case 'object':
      return validateObject(json, validSchema, verbose);
    default:
      console.warn(`[WARN]: Unknown type "${validSchema.type}".`);
      return null;
  }
}

/**
 * Validates a primitive JSON value.
 *
 * @param json - The JSON value to validate.
 * @param validSchema - The schema to validate against.
 * @param verbose - Whether to log extra information.
 * @returns The JSON value if valid, or null if invalid.
 */
function validatePrimitive(
  json: unknown,
  validSchema: JsonSchema,
  verbose = false
): unknown | null {
  if (verbose) {
    console.log(`[INFO]: Validating primitive with type "${typeof json}".`);
  }
  if (typeof json !== validSchema.type) {
    console.warn(
      `[WARN]: Expected type "${validSchema.type}" but received "${typeof json}".`
    );
    return null;
  }
  return json;
}

/**
 * Validates an array of JSON values against a schema.
 *
 * @param json - The JSON value to validate (expected to be an array).
 * @param validSchema - The schema to validate against.
 * @param verbose - Whether to log extra information.
 * @returns The validated array, or null if no valid items are found.
 */
function validateArray(
  json: unknown,
  validSchema: JsonSchema,
  verbose = false
): unknown[] | null {
  if (!Array.isArray(json)) {
    console.warn(`[WARN]: Expected array but received "${typeof json}".`);
    return null;
  }

  if (verbose) {
    console.log(`[INFO]: Validating array with "${json.length}" items.`);
  }

  const validArray: unknown[] = [];

  // Ensure we have an items schema
  if (!validSchema.items) {
    console.warn(`[WARN]: No "items" schema provided for array validation.`);
    return null;
  }

  json.forEach((item: unknown, index: number) => {
    if (verbose) {
      console.log(`[INFO]: Validating item at index [${index}]:`, item);
    }
    const validatedItem = validateJson(item, validSchema.items!, verbose);
    if (validatedItem !== null) {
      validArray.push(validatedItem);
    } else {
      console.warn(
        `[WARN]: Invalid item at index "${index}". Excluding this item.`
      );
    }
  });

  if (validArray.length === 0) {
    console.warn(
      `[WARN]: No valid items found in array. Excluding this field.`
    );
    return null;
  }
  return validArray;
}

/**
 * Validates a JSON object against a schema.
 *
 * @param json - The JSON object to validate.
 * @param validSchema - The schema to validate against.
 * @param verbose - Whether to log extra information.
 * @returns The validated object or null if validation fails.
 */
function validateObject(
  json: unknown,
  validSchema: JsonSchema,
  verbose = false
): { [key: string]: unknown } | null {
  if (typeof json !== 'object' || Array.isArray(json) || json === null) {
    console.warn(`[WARN]: Expected object but received "${typeof json}".`);
    return null;
  }

  // Ensure we have properties defined in the schema
  if (!validSchema.properties) {
    console.warn(
      `[WARN]: No "properties" schema provided for object validation.`
    );
    return null;
  }

  const validated: { [key: string]: unknown } = {};
  let isValid = true;

  for (const key in validSchema.properties) {
    const fieldSchema = validSchema.properties[key];
    const data = (json as { [key: string]: unknown })[key];

    if (verbose) {
      console.log(`[INFO]: Checking key: "${key}"`);
    }

    if (fieldSchema.required && (data === undefined || data === null)) {
      console.warn(`[WARN]: Missing required field: "${key}"`);
      isValid = false;
      continue;
    }

    // If the field is not required and data is missing, skip it.
    if (!fieldSchema.required && (data === undefined || data === null)) {
      continue;
    }

    const validatedField = validateJson(data, fieldSchema, verbose);
    if (validatedField === null) {
      console.warn(`[WARN]: Invalid field: "${key}". Excluding this field.`);
      isValid = false;
      continue;
    }
    validated[key] = validatedField;
  }
  return isValid ? validated : null;
}

/**
 * Parses a JSON string and optionally validates it against a schema.
 *
 * @param jsonString - The JSON string to parse.
 * @param validSchema - The optional schema to validate against.
 * @param verbose - Whether to log extra information.
 * @returns The parsed (and validated) JSON object or null if invalid.
 */
export function parseJson<T>(
  jsonString: string,
  validSchema: JsonSchema | null = null,
  verbose = false
): T | null {
  let parsed: unknown = null;

  if (verbose) {
    console.log('[INFO]: Parsing JSON...');
  }

  try {
    parsed = JSON.parse(jsonString);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('[ERROR]: Error parsing JSON:', err.message);
    } else {
      console.error('[ERROR]: Error parsing JSON:', err);
    }
    return null;
  }

  if (validSchema) {
    if (verbose) {
      console.log('[INFO]: Validating JSON against schema...');
    }
    try {
      parsed = validateJson(parsed, validSchema, verbose);
      if (parsed === null) {
        console.warn('[WARN]: JSON validation returned null. JSON is invalid.');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('[ERROR]: Error validating JSON:', err.message);
      } else {
        console.error('[ERROR]: Error validating JSON:', err);
      }
      return null;
    }
  }

  if (verbose) {
    console.log('[INFO]: JSON parsing complete.');
  }
  return parsed as T;
}
