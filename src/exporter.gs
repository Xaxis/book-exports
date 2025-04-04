function exportEntireDocToDrive() {
  const doc = DocumentApp.getActiveDocument();
  const body = doc.getBody();
  const markdown = parseBodyToMarkdown(body);

  const file = DriveApp.createFile('full_document.md', markdown.trim(), MimeType.PLAIN_TEXT);
  DocumentApp.getUi().alert(`✅ Exported entire doc to:\n\n${file.getUrl()}`);
}

function exportChaptersToDrive() {
  const body = DocumentApp.getActiveDocument().getBody();
  const numElements = body.getNumChildren();
  const folder = DriveApp.createFolder(`Book_Export_${new Date().toISOString().replace(/[:.]/g, '-')}`);
  const chapters = [];

  let currentTitle = '';
  let currentChapter = '';
  let buffer = '';

  function flushChapter() {
    if (currentTitle && currentChapter && buffer.trim()) {
      chapters.push({
        filename: `${currentTitle}_${currentChapter}.md`,
        content: buffer.trim()
      });
      buffer = '';
    }
  }

  for (let i = 0; i < numElements; i++) {
    const element = body.getChild(i);
    const type = element.getType();

    if (type === DocumentApp.ElementType.PARAGRAPH) {
      const para = element.asParagraph();
      const heading = para.getHeading();
      const text = para.getText().trim();

      if (heading === DocumentApp.ParagraphHeading.HEADING1 && /^[IVXLCDM]+\./.test(text)) {
        flushChapter();
        currentTitle = sanitize(text);
        currentChapter = '';
        buffer = `# ${text}\n\n`;
      } else if (heading === DocumentApp.ParagraphHeading.HEADING1 && /^Chapter/.test(text)) {
        flushChapter();
        currentChapter = sanitize(text);
        buffer = `# ${text}\n\n`;
      } else {
        buffer += parseParagraph(para);
      }
    } else if (type === DocumentApp.ElementType.LIST_ITEM) {
      buffer += parseListItem(element);
    } else if (type === DocumentApp.ElementType.TABLE) {
      buffer += parseTable(element);
    }
  }

  flushChapter();

  chapters.forEach(({ filename, content }) => {
    folder.createFile(filename, content, MimeType.PLAIN_TEXT);
  });

  DocumentApp.getUi().alert(`✅ Exported ${chapters.length} chapters to:\n\n${folder.getUrl()}`);
}
