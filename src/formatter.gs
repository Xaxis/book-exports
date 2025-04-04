function parseBodyToMarkdown(body) {
  let result = '';
  const count = body.getNumChildren();

  for (let i = 0; i < count; i++) {
    const el = body.getChild(i);
    const type = el.getType();

    if (type === DocumentApp.ElementType.PARAGRAPH) {
      result += parseParagraph(el);
    } else if (type === DocumentApp.ElementType.LIST_ITEM) {
      result += parseListItem(el);
    } else if (type === DocumentApp.ElementType.TABLE) {
      result += parseTable(el);
    }
  }

  return result.trim();
}

function sanitize(str) {
  return str.trim().replace(/\s+/g, '_').replace(/[^\w\-_\.]/g, '');
}

function parseParagraph(paragraph) {
  const heading = paragraph.getHeading();
  const text = parseTextElements(paragraph).trim();
  if (!text) return '';

  switch (heading) {
    case DocumentApp.ParagraphHeading.HEADING1:
      return `\n# ${text}\n\n`;
    case DocumentApp.ParagraphHeading.HEADING2:
      return `\n## ${text}\n\n`;
    case DocumentApp.ParagraphHeading.HEADING3:
      return `\n### ${text}\n\n`;
    default:
      return `${text}\n\n`;
  }
}

function parseListItem(item) {
  const glyph = item.getGlyphType();
  const indent = '  '.repeat(item.getNestingLevel());
  const bullet = glyph && glyph.includes('NUMBER') ? '1.' : '-';
  const text = parseTextElements(item);
  return `${indent}${bullet} ${text}\n`;
}

function parseTable(table) {
  let result = '';
  const rows = table.getNumRows();

  for (let i = 0; i < rows; i++) {
    const row = table.getRow(i);
    const cells = [];

    for (let j = 0; j < row.getNumCells(); j++) {
      const cell = row.getCell(j);
      const text = parseTextElements(cell);
      cells.push(text.trim());
    }

    result += `| ${cells.join(' | ')} |\n`;
    if (i === 0) {
      result += `| ${cells.map(() => '---').join(' | ')} |\n`;
    }
  }

  return result + '\n';
}

function parseTextElements(container) {
  let result = '';
  const numChildren = container.getNumChildren();

  for (let i = 0; i < numChildren; i++) {
    const part = container.getChild(i);
    if (part.getType() === DocumentApp.ElementType.TEXT) {
      const textElement = part.asText();
      const text = textElement.getText();

      for (let j = 0; j < text.length; j++) {
        const style = {
          bold: textElement.isBold(j),
          italic: textElement.isItalic(j),
          linkUrl: textElement.getLinkUrl(j)
        };

        if (style.linkUrl) {
          const linkEnd = findRunEnd(textElement, j, 'linkUrl');
          const linkText = text.substring(j, linkEnd + 1);
          result += `[${linkText}](${style.linkUrl})`;
          j = linkEnd;
        } else {
          let formatted = text[j];
          if (style.bold) formatted = `**${formatted}**`;
          if (style.italic) formatted = `_${formatted}_`;
          result += formatted;
        }
      }
    }
  }

  return result;
}

function findRunEnd(textElement, startIndex, styleKey) {
  const length = textElement.getText().length;
  const getter = `get${styleKey.charAt(0).toUpperCase()}${styleKey.slice(1)}`;
  const initialValue = textElement[getter](startIndex);

  for (let i = startIndex + 1; i < length; i++) {
    if (textElement[getter](i) !== initialValue) {
      return i - 1;
    }
  }
  return length - 1;
}
