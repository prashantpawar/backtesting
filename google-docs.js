const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const R = require('ramda');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

function authenticateGDocs() {
  const returnPromise = new Promise((resolve, reject) => {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
      if (err) return reject('Error loading client secret file:' + err);
      // Authorize a client with credentials, then call the Google Sheets API.
      authorize(JSON.parse(content), resolve);
    });
  });
  return returnPromise;
}

/**
* Create an OAuth2 client with the given credentials, and then execute the
* given callback function.
* @param {Object} credentials The authorization client credentials.
* @param {function} callback The callback to call with the authorized client.
*/
function authorize(credentials, callback) {
  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error while trying to retrieve access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Fetches the data from the spreadsheet
 * @see https://docs.google.com/spreadsheets/d/1Ms45f7L3ZUDjBFMkznOBRVCorvORNly1ZXH3NK9oYD4/edit#gid=0
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 */
function listTable(auth) {
  const sheets = google.sheets({ version: 'v4', auth });
  sheets.spreadsheets.values.get({
    spreadsheetId: '1Ms45f7L3ZUDjBFMkznOBRVCorvORNly1ZXH3NK9oYD4',
    range: 'A1:B3',
  }, (err, res) => {
    if (err) return console.log('The API returned an error: ' + err);
    const rows = res.data.values;
    if (rows.length) {
      // Print columns A and E, which correspond to indices 0 and 4.
      rows.map((row) => {
        console.log(`${row[0]}, ${row[1]}`);
      });
    } else {
      console.log('No data found.');
    }
  });
}

/**
 * Writes a table into the spreadsheet
 * @see https://docs.google.com/spreadsheets/d/<ID>/edit#gid=0
 * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
 * @param {string} table The table to write into the spreadsheet.
 */
function writeTable(spreadsheetId, range, tableData, auth) {
  const returnPromise = new Promise((resolve, reject) => {
    const resource = {
      values: tableData,
    };
    const sheets = google.sheets({ version: 'v4', auth });
    sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: 'USER_ENTERED',
      resource: resource,
    }, (err, result) => {
      if (err) {
        // Handle error
        reject(err);
      } else {
        resolve(result.updatedCells);
      }
    });
  });
  return returnPromise;
}

module.exports = {
  authenticateGDocs: R.curry(authenticateGDocs),
  writeTable: R.curry(writeTable)
}