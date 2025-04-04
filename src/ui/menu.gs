const UI = (() => {

  function buildMenu() {
    DocumentApp.getUi()
        .createMenu('📦 Export Tools')
        .addItem('Export Markdown...', 'showExportOptionsDialog')
        .addToUi();
  }

  function showExportOptionsDialog() {
    const html = HtmlService.createHtmlOutputFromFile('ExportOptions')
        .setWidth(400)
        .setHeight(300);
    DocumentApp.getUi().showModalDialog(html, 'Choose Export Mode');
  }

  return {
    buildMenu,
    showExportOptionsDialog
  };
})();
