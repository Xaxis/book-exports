function onOpen() {
    UI.buildMenu();
}

function handleExportRequest(mode, userInputFolderId) {
    const folder = DriveUtils.resolveFolder(userInputFolderId);
    if (!folder) {
        DocumentApp.getUi().alert("Invalid folder ID. Please double-check and try again.");
        return;
    }

    switch (mode) {
        case 'whole':
            Exporter.exportWholeDoc(folder);
            break;
        case 'sections':
            Exporter.exportBySections(folder);
            break;
        case 'chapters':
            Exporter.exportByChapters(folder);
            break;
    }
}
