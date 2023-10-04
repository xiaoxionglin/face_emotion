


const express = require('express');
// const request = require('request'); // using 'request' npm package
const https = require('https');
const fs = require('fs');
const WebSocket = require('ws');





// Create two Express app instances
const appHome = express();
const appEmotion = express();
// const app = express();
const portEmotion = 4443;



const path = require('path');

appEmotion.use('/emotion',express.static('public/emotion'));
appEmotion.use('/libs', express.static(path.join(__dirname, 'libs')));
console.log(path.join(__dirname, 'libs'));
appEmotion.use('/weights', express.static(path.join(__dirname, 'weights')));
appEmotion.use('/uuid', express.static(path.join(__dirname, 'node_modules/uuid/dist/esm-browser')));

// Serve static files for the homepage
appHome.use(express.static(path.join(__dirname, 'public')));

// // Serve static files for the emotion page
// appEmotion.use(express.static(path.join(__dirname, 'public/emotion')));

// SSL certificate details
const httpsOptions = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem'),
  passphrase: 'Hidalgo'
};

// Listen on port 80 for the homepage
appHome.listen(80, () => {
    console.log('Homepage is running on http://localhost:80');
});

// Listen on port 4443 for the emotion page using HTTPS
const server=https.createServer(httpsOptions, appEmotion).listen(portEmotion, '0.0.0.0', () => {
  console.log(`Server running at https://localhost:${portEmotion}/`);
});





const wss = new WebSocket.Server({ server });


const receiver='jupyter-xxl'

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
      console.log('Client ID:', clientId);
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