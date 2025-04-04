function onOpen() {
  DocumentApp.getUi()
      .createMenu('Book Exports')
      .addItem('📘 Export Entire Doc to Drive', 'exportEntireDocToDrive')
      .addItem('📘 Export by Chapter to Drive', 'exportChaptersToDrive')
      .addToUi();
}