const express = require('express');
// const request = require('request'); // using 'request' npm package
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const port = 4443;

const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: 'lxxk4n'
};

const path = require('path');

app.use(express.static('public'));
app.use('/libs', express.static(path.join(__dirname, 'libs')));
app.use('/weights', express.static(path.join(__dirname, 'weights')));

// app.get('/getIP', (req, res) => {
//   request('http://ipinfo.io/ip', (error, response, body) => {
//     if (!error && response.statusCode == 200) {
//       res.send(body);
//     } else {
//       res.send("Error getting IP");
//     }
//   });
// });

// app.listen(9000);


const server = https.createServer(httpsOptions, app).listen(port, '0.0.0.0', () => {
  console.log(`Server running at https://localhost:${port}/`);
});



const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('message', (message) => {
    const emotionData = JSON.parse(message);
    console.log('Received:', emotionData);
    // Process or save the emotionData as required
  });
  ws.send('Welcome to the server!');
});

wss.onerror = function(error) {
  console.error("WebSocket Error:", error);
};
