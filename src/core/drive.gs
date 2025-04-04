const DriveUtils = (() => {
  const PROPS = PropertiesService.getUserProperties();
  const FOLDER_KEY = 'lastUsedFolderId';

  function resolveFolder(userInput) {
    let folderId = null;

    if (userInput) {
      folderId = extractFolderId(userInput);
    } else {
      folderId = PROPS.getProperty(FOLDER_KEY);
    }

    if (folderId) {
      try {
        const folder = DriveApp.getFolderById(folderId);
        PROPS.setProperty(FOLDER_KEY, folderId); // save it for next time
        return folder;
      } catch (err) {
        Logger.log(`Invalid folder ID: ${folderId}`);
        return null;
      }
    }

    // Fallback: create a new folder if nothing valid provided
    const newFolder = DriveApp.createFolder("BookExports_" + new Date().getTime());
    PROPS.setProperty(FOLDER_KEY, newFolder.getId());
    return newFolder;
  }

  function extractFolderId(input) {
    if (!input) return null;
    const match = input.match(/[-\w]{25,}/);
    return match ? match[0] : null;
  }

  function saveFile(folder, name, content) {
    folder.createFile(name, content, MimeType.PLAIN_TEXT);
  }

  return {
    resolveFolder,
    saveFile,
  };
})();
