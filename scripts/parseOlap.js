import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { loadOlapModel } from './modules/jsonLoader.js';
import {
  extractTables,
  extractRelationships,
  extractCultures
} from './modules/modelExtractor.js';
import { buildTranslationIndex } from './modules/translationIndexer.js';
import { transformTable } from './modules/entityTransformer.js';
import { buildRelationships } from './modules/relationshipBuilder.js';
import { generateOutput } from './modules/outputGenerator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('Loading OLAP model from olap.md...');

  const inputPath = resolve(__dirname, '..', 'olap.md');
  const result = await loadOlapModel(inputPath);

  if (!result.success) {
    console.error('Failed to load OLAP model:');
    console.error(`   ${result.error}`);
    process.exit(1);
  }

  const model = result.model;

  console.log('Extracting model components...');
  const tables = extractTables(model);
  const rawRelationships = extractRelationships(model);
  const cultures = extractCultures(model);

  console.log(`   Found ${tables.length} tables`);
  console.log(`   Found ${rawRelationships.length} relationships`);

  console.log('Building translation index...');
  const translationIndex = buildTranslationIndex(cultures);

  console.log('Building relationships...');
  const { tableRelations } = buildRelationships(rawRelationships);

  console.log('Transforming entities...');
  const entities = tables.map(table =>
    transformTable(table, translationIndex, tableRelations)
  );

  const factCount = entities.filter(e => e.measures !== undefined).length;
  const dimensionCount = entities.filter(e => e.type === 'dimension').length;

  console.log(`   ${factCount} fact tables`);
  console.log(`   ${dimensionCount} dimension tables`);

  console.log('Generating output...');
  const outputPath = resolve(__dirname, '..', 'cube-docs', 'src', 'data', 'cubeData.json');
  const outputResult = await generateOutput(entities, tableRelations, outputPath);

  if (!outputResult.success) {
    console.error('Failed to generate output:');
    console.error(`   ${outputResult.error}`);
    process.exit(1);
  }

  console.log('Successfully generated cubeData.json');
  const stats = outputResult.stats;
  console.log(`   Entities: ${stats.entityCount}`);
  console.log(`   Facts: ${stats.factCount}`);
  console.log(`   Dimensions: ${stats.dimensionCount}`);
  console.log(`   Relationships: ${stats.relationshipCount}`);
  console.log(`   Output: ${stats.outputPath}`);
  console.log(`   Size: ${stats.fileSize} KB`);
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
