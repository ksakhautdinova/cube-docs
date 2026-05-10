import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, HeadingLevel, BorderStyle, AlignmentType, WidthType, UnderlineType } from 'docx';
import { getEntity, getDimensionEntity } from './mockData';

export const exportToMarkdown = (requirement) => {
  const lines = [];
  
  lines.push(`# Функциональные требования\n`);
  lines.push(`**${requirement.title}**\n`);
  lines.push(`Дата создания: ${requirement.createdAt.toLocaleString('ru-RU')}\n`);
  
  lines.push(`## Группа мер\n`);
  if (requirement.isNewGroup) {
    lines.push(`**Новая группа мер:** ${requirement.newGroupName}\n`);
  } else {
    lines.push(`**Существующая группа:** ${requirement.measureGroupName}\n`);
  }
  
  if (requirement.description) {
    lines.push(`## Описание\n`);
    lines.push(`${requirement.description}\n`);
  }
  
  if (requirement.newMeasures.length > 0) {
    lines.push(`## Новые меры\n`);
    lines.push(`| ID | Название | Описание | Выражение | Формат |\n`);
    lines.push(`|----|----------|---------|-----------|--------|\n`);
    requirement.newMeasures.forEach(m => {
      lines.push(`| ${m.id} | ${m.name} | ${m.description || '-'} | ${m.expression || '-'} | ${m.formatString} |\n`);
    });
  }
  
  if (requirement.newDimensions.length > 0) {
    lines.push(`\n## Новые измерения\n`);
    lines.push(`| ID | Название | Описание |\n`);
    lines.push(`|----|----------|----------|\n`);
    requirement.newDimensions.forEach(d => {
      lines.push(`| ${d.id} | ${d.name} | ${d.description || '-'} |\n`);
    });
  }
  
  if (requirement.relations.length > 0) {
    lines.push(`\n## Связи\n`);
    lines.push(`| Мера | Измерение | Тип |\n`);
    lines.push(`|------|-----------|-----|\n`);
    requirement.relations.forEach(r => {
      lines.push(`| ${r.measureId} | ${r.dimensionId} | ${r.relationshipType} |\n`);
    });
  }
  
  return lines.join('');
};

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

export const exportToDocx = async (requirement) => {
  const sections = [];
  
  // Заголовок
  sections.push(
    new Paragraph({
      text: 'Функциональные требования',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );
  
  // Основная информация
  sections.push(
    new Paragraph({
      text: `Название: ${requirement.title}`,
      spacing: { after: 100 },
    })
  );
  
  sections.push(
    new Paragraph({
      text: `Дата создания: ${requirement.createdAt.toLocaleString('ru-RU')}`,
      spacing: { after: 200 },
    })
  );
  
  // Группа мер
  sections.push(
    new Paragraph({
      text: 'Группа мер',
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 100 },
    })
  );
  
  if (requirement.isNewGroup) {
    sections.push(
      new Paragraph({
        text: `Новая группа: ${requirement.newGroupName}`,
        spacing: { after: 200 },
      })
    );
  } else {
    sections.push(
      new Paragraph({
        text: `Существующая группа: ${requirement.measureGroupName}`,
        spacing: { after: 200 },
      })
    );
  }
  
  // Описание
  if (requirement.description) {
    sections.push(
      new Paragraph({
        text: 'Описание',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      })
    );
    
    sections.push(
      new Paragraph({
        text: requirement.description,
        spacing: { after: 200 },
      })
    );
  }
  
  // Новые меры
  if (requirement.newMeasures.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Новые меры',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      })
    );
    
    const measuresTable = new Table({
      rows: [
        new TableRow({
          children: [
            createBorderedCell('ID', 800),
            createBorderedCell('Название', 1500),
            createBorderedCell('Описание', 2000),
            createBorderedCell('Формат', 1200),
          ],
        }),
        ...requirement.newMeasures.map(m =>
          new TableRow({
            children: [
              createBorderedCell(m.id, 800),
              createBorderedCell(m.name, 1500),
              createBorderedCell(m.description || '-', 2000),
              createBorderedCell(m.formatString, 1200),
            ],
          })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    
    sections.push(measuresTable);
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }
  
  // Новые измерения
  if (requirement.newDimensions.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Новые измерения',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      })
    );
    
    const dimensionsTable = new Table({
      rows: [
        new TableRow({
          children: [
            createBorderedCell('ID', 1000),
            createBorderedCell('Название', 2000),
            createBorderedCell('Описание', 2500),
          ],
        }),
        ...requirement.newDimensions.map(d =>
          new TableRow({
            children: [
              createBorderedCell(d.id, 1000),
              createBorderedCell(d.name, 2000),
              createBorderedCell(d.description || '-', 2500),
            ],
          })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    
    sections.push(dimensionsTable);
    sections.push(new Paragraph({ text: '', spacing: { after: 200 } }));
  }
  
  // Связи
  if (requirement.relations.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Связи между мерами и измерениями',
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
      })
    );
    
    const relationsTable = new Table({
      rows: [
        new TableRow({
          children: [
            createBorderedCell('Мера', 1500),
            createBorderedCell('Измерение', 1500),
            createBorderedCell('Тип связи', 1500),
          ],
        }),
        ...requirement.relations.map(r =>
          new TableRow({
            children: [
              createBorderedCell(r.measureId, 1500),
              createBorderedCell(r.dimensionId, 1500),
              createBorderedCell(r.relationshipType, 1500),
            ],
          })
        ),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    
    sections.push(relationsTable);
  }
  
  const doc = new Document({
    sections: [{ children: sections }],
  });
  
  const blob = await Packer.toBlob(doc);
  return blob;
};

export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Helper: Create a table cell with borders and proper styling
 */
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

/**
 * Helper: Create a regular table cell
 */
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

/**
 * Helper: Format date as dd.mm.yyyy
 */
const formatDateDDMMYYYY = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
};

/**
 * Helper: Get entity type display name (Russian)
 */
const getEntityTypeDisplayName = (entityType) => {
  const types = {
    fact: 'факт',
    dimension: 'справочник'
  };
  return types[entityType] || entityType;
};

/**
 * Helper: Create a table for a specific section
 */
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

/**
 * Helper: Create a bulleted list item
 */
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

/**
 * Main export function for V2 requirements
 * Generates a docx document with work blocks structure
 */
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
