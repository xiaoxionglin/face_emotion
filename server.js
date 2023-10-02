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
  passphrase: 'Hidalgo'
};

const path = require('path');

app.use(express.static('public'));
app.use('/libs', express.static(path.join(__dirname, 'libs')));
app.use('/weights', express.static(path.join(__dirname, 'weights')));
app.use('/uuid', express.static(path.join(__dirname, 'node_modules/uuid/dist/esm-browser')));

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


const receiver='34c33e5a-e6cf-4c50-8dcd-841c09539ede'

// Object to store client WebSocket connections using clientId as key
const clients = {};

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    try {
      const payload = JSON.parse(message);
      const { clientId, emotionData } = payload;
      
      if (clientId) {
        // Update the clients map with the current WebSocket connection
        clients[clientId] = ws;
      }
      console.log(clientId);
      console.log('Received:', emotionData);

      if (receiver){
        sendMessageToClient(receiver,message);
      }

      // Process or save the emotionData as required
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.send('Welcome to the server!');
});

wss.onerror = function(error) {
  console.error("WebSocket Error:", error);
};

// Function to send a message to a specific client using its clientId
function sendMessageToClient(clientId, message) {
  const clientWs = clients[clientId];
  if (clientWs && clientWs.readyState === WebSocket.OPEN) {
    clientWs.send(message);
  } else {
    console.error("Client not connected or WebSocket not in OPEN state");
  }
}