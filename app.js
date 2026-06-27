import {
  FaceLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let faceLandmarker;

/*
 Face oval landmarks
 */
const FACE_OVAL = [
  10,338,297,332,284,251,389,356,
  454,323,361,288,397,365,379,378,
  400,377,152,148,176,149,150,136,
  172,58,132,93,234,127,162,21,
  54,103,67,109
];

async function initialize() {

  const stream =
    await navigator.mediaDevices.getUserMedia({
      video:true
    });

  video.srcObject = stream;

  await video.play();

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const vision =
    await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm"
    );

  faceLandmarker =
    await FaceLandmarker.createFromOptions(
      vision,
      {
        baseOptions:{
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
        },

        runningMode:"VIDEO",

        numFaces:5
      }
    );

  requestAnimationFrame(render);
}

function blurFacePolygon(face) {

  ctx.save();

  ctx.beginPath();

  FACE_OVAL.forEach((idx, i) => {

    const point = face[idx];

    const x = point.x * canvas.width;
    const y = point.y * canvas.height;

    if(i === 0){
      ctx.moveTo(x,y);
    }else{
      ctx.lineTo(x,y);
    }
  });

  ctx.closePath();

  ctx.clip();

  ctx.filter = "blur(20px)";

  ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.restore();
}

function drawMesh(face){

  for(const point of face){

    const x = point.x * canvas.width;
    const y = point.y * canvas.height;

    ctx.beginPath();

    ctx.arc(
      x,
      y,
      1,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = "lime";
    ctx.fill();
  }
}

function render() {

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );

  const results =
    faceLandmarker.detectForVideo(
      video,
      performance.now()
    );

  if(results.faceLandmarks){

    for(const face of results.faceLandmarks){

      blurFacePolygon(face);

      drawMesh(face);
    }
  }

  requestAnimationFrame(render);
}

initialize();