import { readFile } from 'fs/promises';
import { resolve } from 'path';

/**
 * Load and parse the OLAP model from a file
 * @param {string} filePath - Path to the OLAP model file
 * @returns {Promise<{success: boolean, model?: object, error?: string}>}
 */
export async function loadOlapModel(filePath) {
  try {
    const absolutePath = resolve(filePath);
    
    let content;
    try {
      content = await readFile(absolutePath, 'utf-8');
    } catch (error) {
      if (error.code === 'ENOENT') {
        return {
          success: false,
          error: `FILE_NOT_FOUND: Could not find file at ${absolutePath}`
        };
      }
      throw error;
    }

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      return {
        success: false,
        error: `INVALID_JSON: Failed to parse JSON at ${error.message}`
      };
    }

    if (!parsed?.create?.database?.model) {
      return {
        success: false,
        error: 'INVALID_STRUCTURE: Missing create.database.model in the JSON structure'
      };
    }

    return {
      success: true,
      model: parsed.create.database.model
    };
  } catch (error) {
    return {
      success: false,
      error: `Unexpected error: ${error.message}`
    };
  }
}
