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
appHome.use('/.well-known', express.static(path.join(__dirname, 'public', '.well-known')));


// // Serve static files for the emotion page
// appEmotion.use(express.static(path.join(__dirname, 'public/emotion')));

// SSL certificate details
const privateKey = fs.readFileSync('private/private.key', 'utf8');
const certificate = fs.readFileSync('private/certificate.crt', 'utf8');
const ca = fs.readFileSync('private/ca_bundle.crt', 'utf8');


const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca
};


// Listen on port 80 for the homepage
appHome.listen(80, () => {
    console.log('Homepage is running on http://localhost:80');
});

// Listen on port 4443 for the emotion page using HTTPS
const server=https.createServer(credentials, appEmotion).listen(portEmotion, '0.0.0.0', () => {
  console.log(`Server running at https://localhost:${portEmotion}/`);
});





const wss = new WebSocket.Server({ server });

date=new Date().toDateString();
const filePath = path.join(__dirname, 'data', 'emotionData'+date+'.txt');
console.log(filePath);
const buffer = [];
const MAX_BUFFER_SIZE = 1000;

const receiver='Hidalgo_WhoAreYou';

// Object to store client WebSocket connections using clientId as key
const clients = {};

wss.on('connection', (ws) => {
  console.log('Client connected');
  
  ws.on('message', (message) => {
    try {
      const payload = JSON.parse(message);
      const { clientId, emotionData,landmarks,tmpA,tmpB } = payload;
      const dataToSend={
        clientId,
        emotionData
      }
      if (clientId) {
        clients[clientId] = ws;
      }
      // console.log('Client ID:', clientId);
      // console.log('Received:', emotionData);
      payload.timestamp = new Date().toISOString();

      if (receiver in clients) {
        // sendMessageToClient(receiver, "you are Paul?");
        // console.log('found receiver');
        if (emotionData && Object.keys(emotionData).length > 0) {
          sendMessageToClient(receiver, JSON.stringify(dataToSend));
        }
      }
      
      buffer.push(JSON.stringify(payload));
      if (buffer.length >= MAX_BUFFER_SIZE) {
        const dataToWrite = buffer.join('\n') + '\n';
        buffer.length = 0;  // clear the buffer
        fs.appendFile(filePath, dataToWrite, (err) => {
          if (err) {
            console.log( err);
          }
          console.log('Data stored');
        });
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });



  ws.on('error', (error) => {
    console.error("WebSocket Client Error:", error);
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

function flushBuffer() {
  if (buffer.length > 0) {
      const dataToWrite = buffer.join('\n') + '\n';
      buffer.length = 0;  // clear the buffer
      fs.appendFileSync(filePath, dataToWrite); // Use synchronous method to ensure data gets written before exit
      console.log('Last bit of data stored');
  }
}

// Listen to the exit event
process.on('exit', flushBuffer);

// Optionally, you can also handle other signals like SIGINT (Ctrl+C) or uncaught exceptions
process.on('SIGINT', function() {
  flushBuffer();
  process.exit(0); // this is required to actually terminate the process after writing the buffer
});

process.on('uncaughtException', function(err) {
  console.error('Caught exception:', err);
  flushBuffer();
  process.exit(1); // this is required to actually terminate the process after writing the buffer
});

