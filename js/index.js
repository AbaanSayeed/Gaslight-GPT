const video = document.getElementById("videoContainer");
const isScreenSmall = window.matchMedia("(max-width: 700px)");
let predictedAges = [];

// Roast data
const roasts = {
  happy: [
    "Why you happy you noob? You're worthless.",
    "What's so funny? Your life is still a joke.",
    "You smiling? Rent due tomorrow.",
    "Happiness? Never heard of it.",
    "Bro thinks he's in a movie with that smile.",
    "Laughing? Ain't no way you're serious.",
    "You acting like you won, but you still losing.",
    "Bro got nothing going on but still happy 💀."
  ],
  sad: [
    "Stay sad. It's all you're good at.",
    "Crying? That's your personality now.",
    "Tears won't fix your ugly face.",
    "Just accept it. This is your life now.",
    "Sad? Good, stay that way.",
    "Yeah, keep crying. World still don’t care.",
    "Depressed? Good, you're not special.",
    "You sad again? That's just your default mode."
  ],
  angry: [
    "Oh, you're mad? Cry about it.",
    "Yeah, that's all you can do.",
    "Rage harder, it's not gonna help.",
    "Temper tantrum? So mature.",
    "Mad? Bet you still won’t do anything.",
    "Bro thinks he's intimidating. Cute.",
    "Oh, you mad? Go punch the air or something.",
    "Angry? Keep going, it only makes you look dumber."
  ],
  neutral: [
    "Look at you, so boring.",
    "You exist? That's unfortunate.",
    "Bro is stuck in NPC mode.",
    "Your face says 'mid' all over it.",
    "A walking L in human form.",
    "Neutral? You just gave up on emotions huh?",
    "Bro really just... exists.",
    "No thoughts. Just pure background character energy."
  ]
};

// Load Face-API models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  faceapi.nets.ageGenderNet.loadFromUri("/models")
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices
    .getUserMedia({ video: {} })
    .then((stream) => (video.srcObject = stream))
    .catch((err) => console.error("Error accessing webcam:", err));
}

// Adjust video size based on screen width
function screenResize(isScreenSmall) {
  video.style.width = isScreenSmall.matches ? "320px" : "500px";
}

screenResize(isScreenSmall);
isScreenSmall.addListener(screenResize);

// Face detection & roasting logic
video.addEventListener("playing", () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  let container = document.querySelector(".container");
  container.append(canvas);

  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi
      .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions()
      .withAgeAndGender();

    if (!detections) {
      console.log("No face detected.");
      document.getElementById("emotion").innerText = "Emotion - No face detected";
      document.getElementById("roast").innerText = "Bro not even showing his face.";
      return;
    }

    const { age, gender, expressions } = detections;

    console.log("Detected expressions:", expressions); // Debugging

    if (!expressions) {
      console.log("Expressions not detected.");
      document.getElementById("emotion").innerText = "Emotion - Undetected";
      document.getElementById("roast").innerText = "Your face confusing even AI.";
      return;
    }

    // Get emotion with highest probability
    const maxValue = Math.max(...Object.values(expressions));
    const emotion = Object.keys(expressions).find(key => expressions[key] === maxValue) || "neutral";
    const emotionn = Object.keys(expressions).filter(
      item => expressions[item] === maxValue
    );
    // Debugging info
    console.log(`Detected emotion: ${emotion}`);

    // Update UI
    document.getElementById("emotion").innerText = `Emotion - ${emotion}`;
    document.getElementById("age").innerText = `Age - predator (how is bro ${Math.round(age)})`;
    document.getElementById("gender").innerText = `Gender - absolutely no rizz weird ugly mf (was ${gender})`;
    document.getElementById("emotion").innerText = `Emotion - ${emotionn[0]}`;
    // Display roast message
    const roastBox = document.getElementById("roast");
    roastBox.innerText = roasts[emotion]
      ? roasts[emotion][Math.floor(Math.random() * roasts[emotion].length)]
      : "Bro just standing there like an NPC.";
  }, 2000);
});
