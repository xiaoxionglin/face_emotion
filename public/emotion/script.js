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

// import Chart from './node_modules/chart.js/dist/chart.js';

import { v4 as uuidv4 } from '/uuid/index.js';
let clientId = localStorage.getItem('clientId');

if(!clientId) {
  clientId = uuidv4(); // Generate a new UUID.
  localStorage.setItem('clientId', clientId);
}


import CONFIG from './config.js';






const socket = new WebSocket(wsURL);

socket.onopen = function(event) {
  console.log("Connected to the server:", event);
  let dataToSend = {
    clientId: clientId
  };
  socket.send(JSON.stringify(dataToSend));
};

socket.onmessage = function(event) {
  console.log("Received from server:", event.data);
};
socket.onclose = function(event) {
  console.log("WebSocket connection closed:", event.code, event.reason);
};


// //function to get consent
// const consentForm = document.getElementById('consentForm');

// consentForm.addEventListener('submit', function(e) {
//   e.preventDefault();
  
//   const concertConsent = document.getElementById('concertConsent').checked;
//   const researchConsent = document.getElementById('researchConsent').checked;
  
//   if (concertConsent && researchConsent) {
//       // Collect and process the data as needed
//       console.log('Concert consent:', concertConsent);
//       console.log('Research consent:', researchConsent);
//       alert("Thank you! We won't collect any data without your consent.");
//       const consentFormDiv = document.getElementById('consentFormDiv');
//       consentFormDiv.style.display = 'none';
//       const videoWrapper = document.getElementById('video-wrapper');
//       videoWrapper.style.display = 'block';
//       const contentWrapper = document.getElementById('content-wrapper');
//       contentWrapper.style.display = 'block';
//   } else {
//       alert("Sorry! We need your consent to interact.");
//   }
// });


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

const emotions = {
  'neutral': 0,
  'happy': 2,
  'sad': 3,
  'angry': 4,
  'fearful': 5,
  'disgusted': 6,
  'surprised':10,

};
const ctxChart = document.getElementById('emotionChart').getContext('2d');

const emotionColors = {
  'neutral': 'rgba(200, 200, 200, 0.6)',
  'happy': 'rgba(255, 223, 85, 0.6)',
  'sad': 'rgba(85, 129, 255, 0.6)',
  'angry': 'rgba(255, 85, 85, 0.6)',
  'fearful': 'rgba(153, 85, 255, 0.6)',
  'disgusted': 'rgba(85, 255, 85, 0.6)',
  'surprised': 'rgba(255, 165, 0, 0.6)'
};

const emotionBorderColors = {
  'neutral': 'rgba(200, 200, 200, 1)',
  'happy': 'rgba(255, 223, 85, 1)',
  'sad': 'rgba(85, 129, 255, 1)',
  'angry': 'rgba(255, 85, 85, 1)',
  'fearful': 'rgba(153, 85, 255, 1)',
  'disgusted': 'rgba(85, 255, 85, 1)',
  'surprised': 'rgba(255, 165, 0, 1)'
};

const chart = new Chart(ctxChart, {
  type: 'bar',
  // responsive: false,
  data: {
    labels: Object.keys(emotions),
    datasets: [{
      // label: 'Detected Emotions',
      data: Object.values(emotions),
      backgroundColor: Object.values(emotionColors),
      borderColor: Object.values(emotionBorderColors),
      borderWidth: 1
    }]
  },

  options: {
    plugins: {
      legend: {
          display: false,
      }
    },
    scales: {
      y: {
        // beginAtZero: true
      }
    }
  }
});


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
    offScreenCanvas.id = 'hiddenCanvas';
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
      // console.log(detections[0])
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
        emotionData: exp,
        landmarks: detections[0].landmarks.positions,
        gender: gender,
        age : detections[0].age,
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


      const emotions = exp;
      
      const logEmotionData = {};
      for (let emotion in exp) {
        // Apply logarithm and add a small constant to prevent log(0) which is -Infinity
        logEmotionData[emotion] = Math.max(0, Math.log(exp[emotion] + 0.0001) +12);
      }

      chart.data.datasets[0].data = Object.values(logEmotionData);
      chart.update();

    } else {
      // avatarLamp.style.backgroundColor = "#ccc";
      panel.style.backgroundColor = "#d3d3d345";
      statusCode.innerHTML = "can't see you!..";
    }
  }, 250);

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