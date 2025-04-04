# book-exports

A Google Docs add-on that allows you to export chapters from Google Docs to markdown format.

## Getting Started

### Google Cloud Platform Configuration

1. Go to the [Google Cloud console](https://console.cloud.google.com/) and create a new project called `Book Exports`.

2. Enable the Google Sheets API and Google Drive API for your project:
    - Go to APIs & Services > Credentials.
    - Click Create Credentials and select Service account and name it `Book Exports`.
    - Follow the steps to create a service account.
    - After creating the service account, click on it, go to the Keys tab, and add a new key. Choose JSON and download the key file.
    - Name the key file `book-exports-key.json`.
    - Place the key file in the `/keys` directory of the project.
    - Enable the Google Drive API, Google Docs API, and Apps Script API for your project.

### Installation

1. Run the following command to install the project dependencies:

    ```bash
    npm install
    ```

2. You'll need to install `clasp` to deploy the Apps Script to your Google Sheets. You can do so by running the following command:

    ```bash
    npm install -g @google/clasp
    ```

3. Log in to your Google account by running the following command:

    ```bash
    clasp login
    ```

4. Create a new Apps Script project by running the following command:

    ```bash
   clasp create --title "Book Exports" --type standalone --rootDir ./src
    ```

5. (Alternatively) You can clone the project by running the following command:

    ```bash
    clasp clone <script_id>
    ```
   You can find the `script_id` in management settings of your Apps Script project.

### Development & Deployment

1. Run the following command to push the code to the Apps Script project:

   ```bash
   clasp push
   ```
   Note that you will run this every time you make changes to the Apps Script project. BE WARNED: This will overwrite the current Apps Script project with the code in the `src` directory.

2. To create a version for the Apps Script, run the following command:

    ```bash
    clasp version "v1.0.0"
    ```

3. To deploy the Apps Script, run the following command:

    ```bash
    clasp deploy --description "v1.0.0"
    ```



