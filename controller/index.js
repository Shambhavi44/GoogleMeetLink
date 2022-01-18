const fs = require("fs");
const readline = require("readline");
const { google } = require("googleapis");

const getlink = (req, res) => {
  // If modifying these scopes, delete token.json.
  const SCOPES = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/plus.login",
  ];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = "token.json";

  // Load client secrets from a local file.
  fs.readFile("credentials.json", (err, content) => {
    if (err)
      res.status(500).send({ error: "Error loading client secret file:", err });
    // Authorize a client with credentials, then call the Google Classroom API.
    authorize(JSON.parse(content), listCourses);
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    const { client_secret, client_id, redirect_uris } = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      redirect_uris[0]
    );

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
      access_type: "offline",
      scope: SCOPES,
    });
    // res.redirect(authUrl);
    console.log("Authorize this app by visiting this url:", authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question("Enter the code from that page here: ", (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) {
          res.status(500).send({ error: "Error retrieving access token", err });
        } else {
          oAuth2Client.setCredentials(token);
          // Store the token to disk for later program executions
          fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
            if (err) return res.status(500).send({ error: err });
            console.log("Token stored to", TOKEN_PATH);
          });
          callback(oAuth2Client);
        }
      });
    });
  }

  /**
   * Lists the first 10 courses the user has access to.
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */
  function listCourses(auth) {
    var calendar = google.calendar("v3");
    var event = {
      summary: "Google I/O 2015",
      start: {
        dateTime: new Date().toISOString(),
      },
      end: {
        dateTime: new Date().toISOString(),
      },
      conferenceData: { createRequest: { requestId: "7qxalsvy2f" } },
    };
    calendar.events.insert(
      {
        auth: auth,
        calendarId: "primary",
        resource: event,
        conferenceDataVersion: 1,
      },
      function (err, event) {
        if (err) {
          res.status(500).send({
            error: "There was an error contacting the Calendar service: " + err,
          });
        } else {
          res.send({
            message: "Event created",
            link: event.data.htmlLink,
            meetlink: event.data.conferenceData.entryPoints[0].uri,
          });
        }
      }
    );
  }
};

const authorizeUrl = (req, res) => {
  console.log("came");
  const authUrl = req.body.authUrl;
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  // rl.question("Enter the code from that page here: ", (code) => {
  //   rl.close();
  //   oAuth2Client.getToken(code, (err, token) => {
  //     if (err) {
  //       res.status(500).send({ error: "Error retrieving access token", err });
  //     } else {
  //       oAuth2Client.setCredentials(token);
  //       // Store the token to disk for later program executions
  //       fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
  //         if (err) return res.status(500).send({ error: err });
  //         console.log("Token stored to", TOKEN_PATH);
  //       });
  //       callback(oAuth2Client);
  //     }
  //   });
  // });
};

const getMeetingLink = (req, res) => {
  const Meeting = require("google-meet-api").meet;
  let fileContent = {};
  fs.readFile("credentials.json", (err, content) => {
    if (err)
      res.status(500).send({ error: "Error loading client secret file:", err });
    fileContent = JSON.parse(content);
  });

  Meeting({
    clientId: fileContent.client_id,
    clientSecret: fileContent.client_secret,
    refreshToken:
      "1//0gJ7zHIhmLHQkCgYIARAAGBASNwF-L9IrOlUK4fFWoCMTFRLwidj4ZE4aeNFSZ5M9UrewOboBbn-uG4sAkv9XO_nsCjmdjdoExCM",
    date: "2020-12-01",
    time: "10:59",
    summary: "summary",
    location: "location",
    description: "description",
  }).then(function (result) {
    console.log(result); //result is the final link
    res.send(result);
  });
};

module.exports = { getlink, authorizeUrl, getMeetingLink };
