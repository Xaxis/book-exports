function onOpen() {
    DocumentApp.getUi()
        .createMenu('📘 Book Export')
        .addItem('Export Chapters (Markdown)', 'splitAndDownloadMarkdownChapters')
        .addToUi();
}

function splitAndDownloadMarkdownChapters() {
    const doc = DocumentApp.getActiveDocument();
    const docId = doc.getId();

    const markdown = fetchNativeMarkdown(docId);
    if (!markdown) {
        DocumentApp.getUi().alert('❌ Failed to export Markdown from Google Docs.');
        return;
    }

    const chapters = splitIntoChapters(markdown);
    if (chapters.length === 0) {
        DocumentApp.getUi().alert('❌ No chapters detected.');
        return;
    }

    const script = chapters.map(({ title, content }) => {
        const safeTitle = sanitize(title) + '.md';
        return `
      (function() {
        const blob = new Blob([${JSON.stringify(content)}], { type: 'text/markdown' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = ${JSON.stringify(safeTitle)};
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })();
    `;
    }).join('\n');

    const html = HtmlService.createHtmlOutput(`
    <html><body>
      <script>
        ${script}
        setTimeout(() => window.close(), 3000);
      </script>
    </body></html>
  `).setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    DocumentApp.getUi().showModalDialog(html, '📥 Downloading Chapters...');
}

function fetchNativeMarkdown(docId) {
    const url = `https://docs.google.com/feeds/download/documents/export/Export?exportFormat=markdown&id=${docId}`;
    const token = ScriptApp.getOAuthToken();

    try {
        const response = UrlFetchApp.fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            muteHttpExceptions: true
        });

        if (response.getResponseCode() !== 200) {
            Logger.log('Fetch failed: ' + response.getContentText());
            return null;
        }

        return response.getContentText();
    } catch (e) {
        Logger.log('Error fetching markdown: ' + e);
        return null;
    }
}

function splitIntoChapters(markdown) {
    const lines = markdown.split('\n');
    const chapters = [];

    let buffer = '';
    let titleParts = [];
    let h1Streak = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const isH1 = /^# /.test(line);

        if (isH1) {
            h1Streak++;

            if (h1Streak === 2) {
                if (buffer && titleParts.length > 0) {
                    chapters.push({
                        title: titleParts.join('_'),
                        content: buffer.trim()
                    });
                    buffer = '';
                }

                // Update title parts with current H1
                titleParts = [titleParts[1] || titleParts[0], line.replace(/^# /, '').trim()];
                h1Streak = 1;
            } else {
                titleParts = [line.replace(/^# /, '').trim()];
            }
        } else {
            h1Streak = 0;
        }

        buffer += lines[i] + '\n';
    }

    if (buffer && titleParts.length > 0) {
        chapters.push({
            title: titleParts.join('_'),
            content: buffer.trim()
        });
    }

    return chapters;
}

function sanitize(str) {
    return str.trim()
        .replace(/\s+/g, '_')
        .replace(/[^\w\-_\.]/g, '');
}
