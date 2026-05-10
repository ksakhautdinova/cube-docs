import { writeFile, mkdir } from 'fs/promises';
import { dirname, resolve } from 'path';
import { statSync } from 'fs';

/**
 * Generate output JSON file
 * @param {Array} entities - All transformed entities
 * @param {Array} tableRelations - All relationships
 * @param {string} outputPath - Path to write the output file
 * @returns {Promise<{success: boolean, stats?: object, error?: string}>}
 */
export async function generateOutput(entities, tableRelations, outputPath) {
  try {
    const absolutePath = resolve(outputPath);
    
    // Separate facts and dimensions
    const measureGroups = entities.filter(e => e.measures !== undefined);
    const dimensionEntities = entities.filter(e => e.type === 'dimension');

    // Build final structure
    const output = {
      entities,
      measureGroups,
      dimensionEntities,
      tableRelations
    };

    // Create directory if it doesn't exist
    const dir = dirname(absolutePath);
    try {
      await mkdir(dir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore
    }

    // Write JSON with 2-space indentation
    const json = JSON.stringify(output, null, 2);
    await writeFile(absolutePath, json, 'utf-8');

    // Get file stats
    const stats = statSync(absolutePath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);

    return {
      success: true,
      stats: {
        entityCount: entities.length,
        factCount: measureGroups.length,
        dimensionCount: dimensionEntities.length,
        relationshipCount: tableRelations.length,
        outputPath: absolutePath,
        fileSize: fileSizeKB
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to write output: ${error.message}`
    };
  }
}
