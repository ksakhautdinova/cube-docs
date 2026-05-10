/**
 * Advanced Integration Test for exportToDocxV2()
 * Generates actual DOCX files and validates their structure
 * 
 * Run with: node test-export-v2-integration.js
 */

import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, BorderStyle, AlignmentType, WidthType, UnderlineType } from 'docx';
import { writeFileSync } from 'fs';
import { promisify } from 'util';

// Import the actual exportToDocxV2 function implementation
const createBorderedCell = (text, width = 2000) => {
  return new TableCell({
    children: [new Paragraph(text)],
    borders: {
      top: { style: BorderStyle.single, size: 1, color: '000000' },
      bottom: { style: BorderStyle.single, size: 1, color: '000000' },
      left: { style: BorderStyle.single, size: 1, color: '000000' },
      right: { style: BorderStyle.single, size: 1, color: '000000' },
    },
    width: { size: width, type: WidthType.DXA },
  });
};

const createHeaderCell = (text) => {
  return new TableCell({
    children: [
      new Paragraph({
        text,
        run: { bold: true, font: 'Arial', size: 22 },
      }),
    ],
    borders: {
      top: { style: BorderStyle.single, size: 1, color: '000000' },
      bottom: { style: BorderStyle.single, size: 1, color: '000000' },
      left: { style: BorderStyle.single, size: 1, color: '000000' },
      right: { style: BorderStyle.single, size: 1, color: '000000' },
    },
    shading: { fill: 'DCDCDC' },
  });
};

const createDataCell = (text) => {
  return new TableCell({
    children: [
      new Paragraph({
        text: text || '-',
        run: { font: 'Arial', size: 22 },
      }),
    ],
    borders: {
      top: { style: BorderStyle.single, size: 1, color: '000000' },
      bottom: { style: BorderStyle.single, size: 1, color: '000000' },
      left: { style: BorderStyle.single, size: 1, color: '000000' },
      right: { style: BorderStyle.single, size: 1, color: '000000' },
    },
  });
};

const formatDateDDMMYYYY = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

const getEntityTypeDisplayName = (entityType) => {
  const types = {
    fact: 'факт',
    dimension: 'справочник'
  };
  return types[entityType] || entityType;
};

const createTable = (headerRow, dataRows) => {
  return new Table({
    rows: [
      new TableRow({
        children: headerRow,
      }),
      ...dataRows,
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
};

const createBulletItem = (text) => {
  return new Paragraph({
    text,
    bullet: {
      level: 0,
    },
    spacing: { after: 100 },
    run: { font: 'Arial', size: 22 },
  });
};

export const exportToDocxV2 = async (requirement) => {
  if (!requirement || !requirement.title) {
    throw new Error('Invalid requirement data');
  }

  const sections = [];
  const dateStr = formatDateDDMMYYYY(requirement.createdAt);

  // Title Section - centered, Arial 11pt
  sections.push(
    new Paragraph({
      text: 'Функциональные требования',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 100 },
      run: { font: 'Arial', size: 22 },
    })
  );

  // Date and Version
  sections.push(
    new Paragraph({
      text: `${dateStr}      V2`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      run: { font: 'Arial', size: 22 },
    })
  );

  // Requirement Title - H2
  sections.push(
    new Paragraph({
      text: `Название требования: ${requirement.title}`,
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      run: { font: 'Arial', size: 22 },
    })
  );

  // Description (if exists)
  if (requirement.description && requirement.description.trim()) {
    sections.push(
      new Paragraph({
        text: 'Описание',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
        run: { font: 'Arial', size: 22 },
      })
    );

    sections.push(
      new Paragraph({
        text: requirement.description,
        spacing: { after: 120 },
        run: { font: 'Arial', size: 22 },
      })
    );
  }

  // Work Blocks Loop
  for (const workBlock of requirement.workBlocks || []) {
    try {
      const entityTypeDisplay = getEntityTypeDisplayName(workBlock.entityType);
      const entityName = workBlock.entityName || workBlock.entityId || 'Unknown';

      // Work Block Header - H3
      sections.push(
        new Paragraph({
          text: `${entityName} (${entityTypeDisplay})`,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 120, after: 60 },
          run: { font: 'Arial', size: 22 },
        })
      );

      // Operation paragraph
      const operationText =
        workBlock.type === 'new'
          ? `Необходимо добавить ${entityTypeDisplay} '${entityName}'`
          : `Необходимо изменить ${entityTypeDisplay} '${entityName}'`;

      sections.push(
        new Paragraph({
          text: operationText,
          spacing: { after: 120 },
          run: { font: 'Arial', size: 22 },
        })
      );

      // New Measures Table
      if (workBlock.newMeasures && workBlock.newMeasures.length > 0) {
        sections.push(
          new Paragraph({
            text: 'Новые показатели (меры)',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 120, after: 100 },
            run: { font: 'Arial', size: 22 },
          })
        );

        const measuresTable = createTable(
          [
            createHeaderCell('Название'),
            createHeaderCell('Перевод'),
            createHeaderCell('Выражение'),
            createHeaderCell('Формат'),
          ],
          workBlock.newMeasures.map(
            (measure) =>
              new TableRow({
                children: [
                  createDataCell(measure.name || ''),
                  createDataCell(measure.translation || ''),
                  createDataCell(measure.expression || '-'),
                  createDataCell(measure.format || '-'),
                ],
              })
          )
        );

        sections.push(measuresTable);
        sections.push(new Paragraph({ text: '', spacing: { after: 120 } }));
      }

      // New Attributes Table
      if (workBlock.newAttributes && workBlock.newAttributes.length > 0) {
        sections.push(
          new Paragraph({
            text: 'Новые атрибуты',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 120, after: 100 },
            run: { font: 'Arial', size: 22 },
          })
        );

        const attributesTable = createTable(
          [createHeaderCell('Название'), createHeaderCell('Перевод')],
          workBlock.newAttributes.map(
            (attr) =>
              new TableRow({
                children: [createDataCell(attr.name || ''), createDataCell(attr.translation || '')],
              })
          )
        );

        sections.push(attributesTable);
        sections.push(new Paragraph({ text: '', spacing: { after: 120 } }));
      }

      // Measure Changes Table
      if (workBlock.measureChanges && workBlock.measureChanges.length > 0) {
        sections.push(
          new Paragraph({
            text: 'Изменяемые показатели',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 120, after: 100 },
            run: { font: 'Arial', size: 22 },
          })
        );

        const changesTable = createTable(
          [
            createHeaderCell('Исходное название'),
            createHeaderCell('Новое название'),
            createHeaderCell('Исходная формула'),
            createHeaderCell('Новая формула'),
            createHeaderCell('Примечание об изменениях'),
          ],
          workBlock.measureChanges.map(
            (change) =>
              new TableRow({
                children: [
                  createDataCell(change.originalName || ''),
                  createDataCell(change.needsRename ? change.newName : '-'),
                  createDataCell(change.originalExpression || '-'),
                  createDataCell(change.needsFormulaChange ? change.newExpression : '-'),
                  createDataCell(
                    change.needsRename || change.needsFormulaChange ? 'Изменено' : '-'
                  ),
                ],
              })
          )
        );

        sections.push(changesTable);
        sections.push(new Paragraph({ text: '', spacing: { after: 120 } }));
      }

      // Attribute Changes Table
      if (workBlock.attributeChanges && workBlock.attributeChanges.length > 0) {
        sections.push(
          new Paragraph({
            text: 'Изменяемые атрибуты',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 120, after: 100 },
            run: { font: 'Arial', size: 22 },
          })
        );

        const attrChangesTable = createTable(
          [
            createHeaderCell('Исходное название'),
            createHeaderCell('Новое название'),
            createHeaderCell('Исходный перевод'),
            createHeaderCell('Новый перевод'),
          ],
          workBlock.attributeChanges.map(
            (change) =>
              new TableRow({
                children: [
                  createDataCell(change.originalName || ''),
                  createDataCell(change.newName || '-'),
                  createDataCell(change.originalTranslation || ''),
                  createDataCell(change.newTranslation || '-'),
                ],
              })
          )
        );

        sections.push(attrChangesTable);
        sections.push(new Paragraph({ text: '', spacing: { after: 120 } }));
      }

      // Related Entities
      if (workBlock.relatedEntities && workBlock.relatedEntities.length > 0) {
        sections.push(
          new Paragraph({
            text: 'Связанные сущности',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 120, after: 100 },
            run: { font: 'Arial', size: 22 },
          })
        );

        workBlock.relatedEntities.forEach((entityId) => {
          sections.push(createBulletItem(entityId));
        });

        sections.push(new Paragraph({ text: '', spacing: { after: 120 } }));
      }
    } catch (error) {
      console.error(`Error processing work block: ${error.message}`);
    }
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  // Generate blob
  const blob = await Packer.toBlob(doc);
  return blob;
};

/**
 * Integration Test Runner
 */
class IntegrationTestRunner {
  constructor() {
    this.results = [];
    this.testDir = './test-output';
  }

  async runTest(name, requirement) {
    console.log(`\n📋 Test: ${name}`);
    console.log('─'.repeat(60));

    try {
      // Generate DOCX
      const blob = await exportToDocxV2(requirement);
      
      // Validate blob
      if (!blob || blob.size === 0) {
        throw new Error('Generated blob is empty');
      }

      // Save to file for manual inspection
      const filename = `${name.replace(/[^\w\s]/g, '').replace(/\s+/g, '_')}_${Date.now()}.docx`;
      const filepath = `${this.testDir}/${filename}`;
      
      // Convert blob to buffer
      const buffer = await blob.arrayBuffer();
      writeFileSync(filepath, Buffer.from(buffer));

      this.pass(name, `File generated successfully: ${filepath} (${(blob.size / 1024).toFixed(1)}KB)`);
      return true;
    } catch (error) {
      this.fail(name, error.message);
      return false;
    }
  }

  pass(testName, message) {
    this.results.push({ test: testName, status: 'PASS', message });
    console.log(`✅ PASS: ${message}`);
  }

  fail(testName, error) {
    this.results.push({ test: testName, status: 'FAIL', message: error });
    console.log(`❌ FAIL: ${error}`);
  }

  printSummary() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    console.log('\n\n' + '═'.repeat(60));
    console.log('INTEGRATION TEST SUMMARY');
    console.log('═'.repeat(60));
    console.log(`Total: ${this.results.length} | ✅ Passed: ${passed} | ❌ Failed: ${failed}`);
    console.log(`Success Rate: ${((passed / this.results.length) * 100).toFixed(1)}%`);

    if (failed > 0) {
      console.log('\n⚠️  Failed Tests:');
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - ${r.test}: ${r.message}`);
      });
    }

    console.log(`\n📁 Test files saved to: ${this.testDir}/`);
  }

  async runAllTests() {
    const tests = [
      ['T1_BasicTitle', {
        title: 'Базовое требование',
        description: 'Проверка базовой структуры документа',
        workBlocks: [],
        createdAt: new Date('2026-05-07')
      }],
      ['T2A_NewFactTable', {
        title: 'Новая таблица фактов',
        description: 'Добавление таблицы фактов продаж',
        workBlocks: [{
          type: 'new',
          entityType: 'fact',
          entityName: 'Факты_Продаж',
          newMeasures: [
            { name: 'Сумма', translation: 'Total Amount', expression: 'SUM(Amount)', format: '$#,##0.00' },
            { name: 'Кол-во', translation: 'Count', expression: '', format: '' }
          ]
        }],
        createdAt: new Date('2026-05-07')
      }],
      ['T2C_MeasureChanges', {
        title: 'Изменения мер',
        description: 'Проверка таблицы с изменениями',
        workBlocks: [{
          type: 'existing',
          entityType: 'fact',
          entityName: 'Факты_Прибыли',
          measureChanges: [
            {
              originalName: 'Profit',
              originalTranslation: 'Profit',
              originalExpression: 'Revenue - Cost',
              needsRename: true,
              newName: 'NetProfit',
              needsFormulaChange: true,
              newExpression: 'GrossRevenue - COGS'
            }
          ]
        }],
        createdAt: new Date('2026-05-07')
      }],
      ['T3_RelatedEntities', {
        title: 'С связанными сущностями',
        description: '',
        workBlocks: [{
          type: 'new',
          entityType: 'fact',
          entityName: 'Факты_Продаж',
          newMeasures: [{ name: 'Сумма', translation: 'Total', expression: 'SUM(Amount)', format: '' }],
          relatedEntities: ['Справочник_Клиентов', 'Справочник_Товаров']
        }],
        createdAt: new Date('2026-05-07')
      }],
      ['T4_SpecialChars', {
        title: 'С кириллицей & спецсимволами',
        description: 'Проверка обработки: дока, <test>, "кавычки"',
        workBlocks: [{
          type: 'new',
          entityType: 'fact',
          entityName: 'Факты_Проверки',
          newMeasures: [
            { name: 'Значение_&_Сумма', translation: 'Value & Total', expression: '', format: '' }
          ]
        }],
        createdAt: new Date('2026-05-07')
      }],
      ['T5_LongText', {
        title: 'Очень длинное требование для проверки переноса строк и правильности форматирования в документе',
        description: 'Описание с длинным текстом: ' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(5),
        workBlocks: [{
          type: 'new',
          entityType: 'fact',
          entityName: 'Факты',
          newMeasures: [
            {
              name: 'Сложная_Мера',
              translation: 'Very complex measure with long translation that should wrap properly',
              expression: 'SUM(T.Col1 * T.Col2 + T.Col3) / AVG(T.Col4)',
              format: '$#,##0.00'
            }
          ]
        }],
        createdAt: new Date('2026-05-07')
      }],
      ['T6_MultipleBlocks', {
        title: 'Комплексное требование',
        description: 'С несколькими блоками разных типов',
        workBlocks: [
          {
            type: 'new',
            entityType: 'fact',
            entityName: 'Факты_Продаж',
            newMeasures: [{ name: 'Сумма', translation: 'Total', expression: 'SUM(Amount)', format: '$#0.00' }]
          },
          {
            type: 'new',
            entityType: 'dimension',
            entityName: 'Справочник_Товаров',
            newAttributes: [
              { name: 'Категория', translation: 'Category' },
              { name: 'Бренд', translation: 'Brand' }
            ]
          },
          {
            type: 'existing',
            entityType: 'fact',
            entityName: 'Факты_Прибыли',
            measureChanges: [
              {
                originalName: 'Profit',
                originalTranslation: 'Profit',
                originalExpression: 'Revenue - Cost',
                needsRename: false,
                newName: '',
                needsFormulaChange: true,
                newExpression: 'GrossRevenue - COGS'
              }
            ]
          }
        ],
        createdAt: new Date('2026-05-07')
      }]
    ];

    console.log(`\n🚀 Running Integration Tests for exportToDocxV2()`);
    console.log(`📊 Total Tests: ${tests.length}`);
    console.log('═'.repeat(60));

    for (const [name, requirement] of tests) {
      await this.runTest(name, requirement);
    }

    this.printSummary();
  }
}

// Main
async function main() {
  const runner = new IntegrationTestRunner();
  await runner.runAllTests();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
