const DAX_KEYWORDS = [
  'VAR',
  'RETURN',
  'CALCULATE',
  'FILTER',
  'SUMX',
  'AVERAGEX',
  'DIVIDE',
  'IF',
  'SWITCH',
  'DISTINCTCOUNT'
];

const TOKEN_REGEX = /(\s+|[\(\)\[\]\{\},]|[A-Za-z_][A-Za-z0-9_]*|.)/g;

export const formatDaxExpression = (expression = '') => {
  const source = String(expression || '').trim();
  if (!source) return '';

  let formatted = source.replace(/\s+,/g, ',').replace(/,\s*/g, ',\n  ');

  DAX_KEYWORDS.forEach((keyword) => {
    const keywordRegex = new RegExp(`\\b${keyword}\\b`, 'g');
    formatted = formatted.replace(keywordRegex, `\n${keyword}`);
  });

  return formatted.replace(/\n{2,}/g, '\n').trim();
};

export const tokenizeDaxExpression = (expression = '') => {
  const formatted = formatDaxExpression(expression);
  if (!formatted) return [];

  return formatted.split('\n').map((line) => {
    const rawTokens = line.match(TOKEN_REGEX) || [];
    return rawTokens.map((token, index) => {
      if (/^[\(\)\[\]\{\}]$/.test(token)) {
        return { value: token, type: 'bracket' };
      }

      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(token)) {
        const upper = token.toUpperCase();
        const nextToken = rawTokens.slice(index + 1).find((value) => value.trim() !== '');
        if (nextToken === '(') {
          return { value: token, type: 'method' };
        }
        if (DAX_KEYWORDS.includes(upper)) {
          return { value: token, type: 'keyword' };
        }
      }

      return { value: token, type: 'plain' };
    });
  });
};
