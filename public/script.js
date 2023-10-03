let currentHost = window.location.hostname;
let wsURL = `wss://${currentHost}:4443/`;

const video = document.getElementById("video");
const startVideoButton = document.getElementById("startVideoButton");
const stopStreaming = document.querySelector("#stopStreaming");
const avatarImgs = document.querySelectorAll(".img-avatar");
const avatarImgStart = document.querySelector(".img-avatar-start");
const avatarLamp = document.querySelector(".avatar-lamp");
const panelBox = document.querySelector("#panelBox");
const expressionTxt = document.querySelector("#expression-txt");
const expressionTitle = document.querySelector("#expression-title");
const loader = document.querySelector(".loading");
const status = document.querySelector("#status");
const statusCode = document.querySelector("#statusCode");
const statusBox = document.querySelector("#statusBox");
const panel = document.querySelector(".panel");
const dateTime = document.querySelector("#date");
const models = "/weights"//"https://simhub.github.io/avatar-face-expression/models";


let ua = navigator.userAgent.toLowerCase();
let is_safari = ua.indexOf("safari/") > -1 && ua.indexOf("chrome") < 0;
let gender = "";
let age = "";
let exp = "";
let d = new Date();
let nD = d.toString();
let sD = nD.split(" ").splice(0, 5);


import { v4 as uuidv4 } from '/uuid/index.js';
let clientId = localStorage.getItem('clientId');

if(!clientId) {
  clientId = uuidv4(); // Generate a new UUID.
  localStorage.setItem('clientId', clientId);
}

// fetch('https://yourserver.com/getIP').then(response => response.text()).then(ip => {
//   // Use IP to establish WebSocket connection
//   const socket = new WebSocket('ws://' + ip + ':4443');
// });
import CONFIG from './config.js';





// const ips = CONFIG.WS_URLS;//['ws://192.168.1.10', 'ws://192.168.1.11', 'ws://192.168.1.12'];
// // console.log(ips);
// // const socket = new WebSocket('wss://localhost:4443');
// let socket;



// async function connectToServer(ip) {
//   return new Promise((resolve, reject) => {
//     const localSocket = new WebSocket(ip);
//     const timeout = setTimeout(() => {
//       localSocket.close();
//       reject(new Error('Connection timeout for ' + ip));
//     }, 2000); // 5 seconds timeout for example.

//     localSocket.onopen = function () {
//       clearTimeout(timeout);
//       console.log('connected to the server', ip);
//       resolve(localSocket);
//     };

//     localSocket.onmessage = function (event) {
//       console.log("Received from server:", event.data);
//     };

//     localSocket.onerror = function (e) {
//       clearTimeout(timeout);
//       console.error('failed to connect to', ip, e.message);
//       reject(new Error('Failed to connect'));
//     };

//     localSocket.onclose = function (e) {
//       if (e.wasClean === false) {
//         clearTimeout(timeout);
//         reject(new Error('Connection was closed before being established'));
//       }
//     };
//   });
// }

// async function connectSequentially(ips) {
//     for (let ip of ips) {
//         try {
//             const localSocket = await connectToServer(ip);
//             socket = localSocket;
//             break;
//         } catch (e) {
//             console.log(e.message);
//             await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second before trying the next IP.
//         }
//     }
// }

// connectSequentially(ips);



const socket = new WebSocket(wsURL);

socket.onopen = function(event) {
  console.log("Connected to the server:", event);
};

socket.onmessage = function(event) {
  console.log("Received from server:", event.data);
};
socket.onclose = function(event) {
  console.log("WebSocket connection closed:", event.code, event.reason);
};




startVideoButton.addEventListener("click", function() {
    // Load models if they aren't loaded yet, then start the video
    
dateTime.innerText = `${sD[0]} ${sD[1]} ${sD[2]} ${sD[3]} ${sD[4]}`;
statusCode.innerHTML = "loading module...";
statusBox.classList.add("progress-animation");

    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(models),
      faceapi.nets.faceLandmark68Net.loadFromUri(models),
      faceapi.nets.faceRecognitionNet.loadFromUri(models),
      faceapi.nets.faceExpressionNet.loadFromUri(models),
      faceapi.nets.ageGenderNet.loadFromUri(models)
    ]).then(startVideo);
});

async function startVideo() {
    video.setAttribute("autoplay", "");
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");

    navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "user" } })
        .then(function(stream) {
            video.srcObject = stream;
            startVideoButton.disabled = true; // Disable the button to prevent starting video multiple times

            // const videoTrack = stream.getVideoTracks()[0];
            // const trackSettings = videoTrack.getSettings();
          
            // video.width = trackSettings.width;
            // video.height = trackSettings.height;

        })
        .catch(function(err) {
            console.error("Media Access Error:", err);
        });
  statusCode.innerHTML = "start video session...";
  statusBox.style.width = "34%";
  if (is_safari) {
    setTimeout(function() {
      video.play();
    }, 50);
  }
}

function stopStreamedVideo(videoElem) {
  let stream = videoElem.srcObject;
  let tracks = stream.getTracks();
  // console.log(stream,tracks)
  tracks.forEach(function(track) {
    track.stop();
  });
  videoElem.srcObject = null;
}
video.addEventListener("play", () => {
  // panel.style.height = "400px";
  // expressionTxt.style.fontSize = "3.2em";
  setTimeout(() => {
    statusCode.innerHTML = "just a moment please..";
    // avatarImgStart.style.display = "block";
    // expressionTxt.innerText = "i am still focusing 🧐";
    statusBox.style.width = "80%";
  }, 200);


  // Use the offScreenCanvas for detection instead of the video
  setInterval(async () => {
    const offScreenCanvas = document.createElement('canvas');
    offScreenCanvas.width = video.clientWidth;
    offScreenCanvas.height = video.clientHeight;
    const ctx = offScreenCanvas.getContext('2d',{ willReadFrequently: true });
  
    // Draw the video frame onto the off-screen canvas (flipped)
    ctx.translate(offScreenCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, offScreenCanvas.width, offScreenCanvas.height);

    const detections = await faceapi
    .detectAllFaces(ctx.canvas, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions()
    .withAgeAndGender();


  // const canvas = document.getElementById('canvas');
  // const displaySize = { width: video.clientWidth, height: video.clientHeight };
  // console.log(displaySize);
  // const rect = video.getBoundingClientRect();
  // const displaySize = { width: rect.width, height: rect.height };
  // let displaySize
  // video.addEventListener('loadedmetadata', function() {
  //   displaySize = { width: video.clientWidth, height: video.clientHeight };

  // });

  // faceapi.matchDimensions(canvas, displaySize);

  // setInterval(async () => {
  //   const detections = await faceapi
  //   .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
  //   .withFaceLandmarks()
  //   .withFaceExpressions()
  //   .withAgeAndGender();
    if (detections[0]) {
      gender = detections[0].gender;
      // status.innerHTML= "";
      // status.style.visibility = 'hidden';
      // status.style.dislay = 'none';
      // statusBox.style.visibility = 'hidden';
      statusBox.style.width = "100%";
      statusBox.classList.remove("progress-animation");
      statusCode.innerHTML = "ready!";
      loader.style.display = "none"; // hide preloader
      // avatarImgStart.style.display = "none";
      // avatarLamp.style.backgroundColor = "lightgreen";



      exp = detections[0].expressions;


      // socket.send(JSON.stringify(exp));

      const payload = {
        clientId: clientId,
        emotionData: exp
      };
      
      socket.send(JSON.stringify(payload));




      const displaySize = { width: video.clientWidth, height: video.clientHeight };
      // console.log(displaySize);
      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.width=displaySize.width;
      canvas.height=displaySize.height;
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      
      faceapi.draw.drawDetections(canvas, resizedDetections);
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    } else {
      // avatarLamp.style.backgroundColor = "#ccc";
      panel.style.backgroundColor = "#d3d3d345";
      statusCode.innerHTML = "can't see you!..";
    }
  }, 500);

  stopStreaming.style.display = "block";

  stopStreaming.addEventListener("click", e => {
    let el = e.target;
    let elClass = e.target.classList[1];
    // console.log(elClass);
    if (elClass === "icon-cross") {
      el.classList.remove("icon-cross");
      el.classList.add("icon-refresh");
      stopStreamedVideo(video);
    }
    if (elClass === "icon-refresh") {
      el.classList.remove("icon-refresh");
      el.classList.add("icon-cross");
      // avatarLamp.style.backgroundColor = "#ccc";
    }
  });
});