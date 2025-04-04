const Exporter = (() => {

  function exportWholeDoc(folder) {
    const doc = DocumentApp.getActiveDocument();
    const content = doc.getBody().getText();
    const markdown = Formatter.toMarkdown('Full Document', content);
    DriveUtils.saveFile(folder, 'full_document.md', markdown);
  }

  function exportBySections(folder) {
    const doc = DocumentApp.getActiveDocument();
    const paragraphs = doc.getBody().getParagraphs();

    let currentSection = '';
    let buffer = '';
    const sections = [];

    paragraphs.forEach(p => {
      const style = p.getHeading();
      const text = p.getText();

      if (style === DocumentApp.ParagraphHeading.HEADING1) {
        if (currentSection && buffer) {
          sections.push({ title: currentSection, content: buffer });
        }
        currentSection = sanitize(text);
        buffer = '';
      } else {
        buffer += p.getText() + '\n';
      }
    });

    if (currentSection && buffer) {
      sections.push({ title: currentSection, content: buffer });
    }

    sections.forEach(({ title, content }) => {
      const markdown = Formatter.toMarkdown(title, content);
      DriveUtils.saveFile(folder, `${title}.md`, markdown);
    });
  }

  function exportByChapters(folder) {
    const doc = DocumentApp.getActiveDocument();
    const body = doc.getBody();
    const paragraphs = body.getParagraphs();

    const chapters = [];
    let currentEpoch = '';
    let currentChapter = '';
    let contentBuffer = '';

    paragraphs.forEach(p => {
      const text = p.getText();
      const style = p.getHeading();

      if (style === DocumentApp.ParagraphHeading.HEADING1 && text.startsWith('Epoch')) {
        currentEpoch = sanitize(text);
      } else if (style === DocumentApp.ParagraphHeading.HEADING2 && /^Chapter/.test(text)) {
        if (currentChapter && contentBuffer) {
          chapters.push({ epoch: currentEpoch, chapter: currentChapter, content: contentBuffer });
        }
        currentChapter = sanitize(text);
        contentBuffer = '';
      } else {
        contentBuffer += p.getText() + '\n';
      }
    });

    if (currentChapter && contentBuffer) {
      chapters.push({ epoch: currentEpoch, chapter: currentChapter, content: contentBuffer });
    }

    const folder = DriveUtils.createExportFolder();

    chapters.forEach(({ epoch, chapter, content }) => {
      const md = Formatter.toMarkdown(chapter, content);
      const filename = `${epoch}_${chapter}.md`;
      DriveUtils.saveFile(folder, filename, md);
    });

    Logger.log(`Exported ${chapters.length} chapters to: ${folder.getUrl()}`);
  }

  function sanitize(str) {
    return str.trim().replace(/\s+/g, '_');
  }

  return {
    exportWholeDoc,
    exportBySections,
    exportByChapters,
  };
})();
