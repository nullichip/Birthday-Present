const ribbon = document.getElementById('ribbon');
const capImg = document.getElementById('cap-img');
const presentBox = document.getElementById('present-box');
const photoStrip = document.getElementById('photo-strip');
const fadeOverlay = document.getElementById('fade-overlay');
const videoStage = document.getElementById('video-stage');
const bgMusic = document.getElementById('bg-music');

// Create the final stage dynamically if it's not in HTML
let finaleStage = document.getElementById('finale-stage');
if (!finaleStage) {
  finaleStage = document.createElement('div');
  finaleStage.id = 'finale-stage';
  finaleStage.className = 'hidden-stage';
  document.body.appendChild(finaleStage);
}

let isDragging = false;
let startY = 0;
let audioUnlocked = false; 
let audioCtx;
let track;
let gainNode;

// Initialize the 7 strip photos on load
document.addEventListener('DOMContentLoaded', () => {
  for (let i = 1; i <= 7; i++) {
    let img = document.createElement('img');
    img.src = `assets/frames/${i}.png`; 
    img.alt = `Strip Memory ${i}`;
    img.className = 'photo'; 
    photoStrip.appendChild(img);
  }
});

// --- Phase 1: Draggable Cap Logic ---
capImg.addEventListener('pointerdown', (e) => {
  isDragging = true;
  startY = e.clientY;
  capImg.setPointerCapture(e.pointerId);
  capImg.style.cursor = 'grabbing';
  
  if (!audioUnlocked) {
    // 1. Initialize the Web Audio API
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
    
    // 2. Connect your MP4 to the Gain Node (the volume booster)
    track = audioCtx.createMediaElementSource(bgMusic);
    gainNode = audioCtx.createGain();
    track.connect(gainNode).connect(audioCtx.destination);
    
    // 3. Set your boosted starting volume (1.5 = 150%, 2.0 = 200%)
    gainNode.gain.value = 2.0;

    bgMusic.play().then(() => {
      bgMusic.pause();
      bgMusic.currentTime = 0;
      audioUnlocked = true;
    }).catch(err => console.log("Audio unlock pending:", err));
  }
});

capImg.addEventListener('pointermove', (e) => {
  if (!isDragging) return;
  const deltaY = e.clientY - startY;
  
  if (deltaY < 0) {
    ribbon.style.transform = `translateY(${deltaY - 80}px)`; 
    photoStrip.style.transform = `translateY(${deltaY}px)`; 
    
    if (deltaY < -150) {
      isDragging = false;
      triggerReveal();
    }
  }
});

capImg.addEventListener('pointerup', () => {
  if (isDragging) {
    ribbon.style.transform = 'translateY(-80px)';
    photoStrip.style.transform = 'translateY(0px)';
    capImg.style.cursor = 'grab';
    isDragging = false;
  }
});

// --- Phase 2: Reveal & Camera Pan ---
function triggerReveal() {
  // CRITICAL FIX: Volume cannot exceed 1.0
  gainNode.gain.value = 2.0; 
  bgMusic.play().catch(e => console.log("Audio play prevented:", e));

  presentBox.style.transform = 'translateY(100vh)';
  const mask = document.getElementById('strip-mask');
  if (mask) mask.style.transform = 'translateY(100vh)';
  
  photoStrip.style.transition = 'transform 10s linear';
  ribbon.style.transition = 'transform 10s linear';
  
  photoStrip.style.transform = `translateY(-2080px)`; 
  ribbon.style.transform = `translateY(-2160px)`; 
  
  setTimeout(() => {
    fadeOverlay.style.opacity = '1';
    
    setTimeout(() => {
      document.getElementById('present-stage').style.display = 'none';
      finaleStage.classList.remove('hidden-stage');
      finaleStage.style.opacity = '1';
      fadeOverlay.style.opacity = '0'; 
      
      scatterBackgroundPhotos();
    }, 2000); 
    
  }, 11000); 
}

// --- Phase 3: The 44 Photo Scatter ---
function scatterBackgroundPhotos() {
  gainNode.gain.value = 2.0; 
  const totalPhotos = 46;
  const popInSpeed = 300; 
  
  for (let i = 1; i <= totalPhotos; i++) {
    let img = document.createElement('img');
    img.src = `assets/photo${i}.png`; 
    img.className = 'final-scatter-photo';
    
    let randomTop = Math.floor(Math.random() * 80) + 10; 
    let randomLeft = Math.floor(Math.random() * 80) + 10; 
    let randomRotation = Math.floor(Math.random() * 60) - 30; 
    
    img.style.top = `${randomTop}%`;
    img.style.left = `${randomLeft}%`;
    img.style.transform = `translate(-50%, -50%) scale(0.5) rotate(${randomRotation}deg)`;
    img.style.zIndex = i; 
    
    finaleStage.appendChild(img);

    setTimeout(() => {
      img.style.opacity = '1';
      img.style.transform = `translate(-50%, -50%) scale(1) rotate(${randomRotation}deg)`;
    }, i * popInSpeed); 
  }

  setTimeout(playVideosSequentially, (totalPhotos * popInSpeed) + 1000);
}

// --- Phase 4: The 5 Videos ---
function playVideosSequentially() {
  // CRITICAL FIX: Set to 0.7 so it's slightly quieter than the 1.0 max volume
  gainNode.gain.value = 0.7; 

  const videoFiles = [
    'assets/videos/1.mp4', 
    'assets/videos/2.mp4',
    'assets/videos/3.mp4',
    'assets/videos/4.mp4',
    'assets/videos/5.mp4'
  ];

  const videoZones = [
    { top: 25, left: 25 },
    { top: 25, left: 75 },
    { top: 75, left: 25 },
    { top: 75, left: 75 },
    { top: 50, left: 50 }
  ];
  videoZones.sort(() => Math.random() - 0.5); 
  
  const videoElements = [];

  videoFiles.forEach((file, index) => {
    let vid = document.createElement('video');
    vid.src = file;
    vid.controls = true; 
    
    vid.autoplay = true; 
    vid.playsInline = true; 
    
    vid.muted = false; 
    vid.volume = 0.2; 
    
    vid.className = 'stacked-video';
    vid.style.zIndex = 100 + index;
    
    let zone = videoZones[index];
    let randomTop = zone.top + (Math.random() * 10 - 5); 
    let randomLeft = zone.left + (Math.random() * 10 - 5); 
    let randomRotation = Math.floor(Math.random() * 10) - 5; 
    
    vid.style.top = `${randomTop}%`;
    vid.style.left = `${randomLeft}%`;
    vid.style.transform = `translate(-50%, -50%) rotate(${randomRotation}deg)`;
    
    finaleStage.appendChild(vid);
    videoElements.push(vid);
  });

  let currentVideoIndex = 0;

  function showNextVideo() {
    if (currentVideoIndex < videoElements.length) {
      let activeVideo = videoElements[currentVideoIndex];
      activeVideo.classList.add('active-video');
      activeVideo.currentTime = 0;
      activeVideo.play().catch(e => console.log("Autoplay prevented:", e));
      
      currentVideoIndex++;
      
      if (currentVideoIndex < videoElements.length) {
        setTimeout(showNextVideo, 6000); 
      } else {
        setTimeout(showFinalMessages, 15000);
      }
    }
  }

  showNextVideo();
}

// --- Phase 5: The Final Message & Reset Loop ---
function showFinalMessages() {
  // CRITICAL FIX: Return to max 1.0 volume for the emotional finale
  gainNode.gain.value = 2.0;

  let textBackdrop = document.createElement('div');
  textBackdrop.style.position = 'absolute';
  textBackdrop.style.width = '100%';
  textBackdrop.style.height = '100%';
  textBackdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  textBackdrop.style.zIndex = '200'; 
  textBackdrop.style.opacity = '0';
  textBackdrop.style.transition = 'opacity 2s ease-in-out';
  finaleStage.appendChild(textBackdrop);
  
  void textBackdrop.offsetWidth;
  textBackdrop.style.opacity = '1';

  let textElement = document.createElement('div');
  textElement.className = 'finale-message';
  textElement.style.zIndex = '201';
  textElement.style.position = 'absolute';
  textElement.style.top = '50%';
  textElement.style.left = '50%';
  textElement.style.transform = 'translate(-50%, -50%)';
  textElement.style.width = '80%';
  finaleStage.appendChild(textElement);

  const messages = [
    "Happy birthday Dad",
    "Although we might not always agree, you always continue to inspire us",
    "To fight, to persevere, and to never give up",
    "and that's why we're here today",
    "And although we don't say it much",
    "You should already know that we will forever and always love you",
    "Happy 44th birthday, Dad. We love you."
  ];

  let messageIndex = 0;

  function showNextMessage() {
    if (messageIndex < messages.length) {
      textElement.innerText = messages[messageIndex];
      textElement.style.opacity = '1';
      
      setTimeout(() => {
        textElement.style.opacity = '0';
        messageIndex++;
        
        if (messageIndex < messages.length) {
          setTimeout(showNextMessage, 1500); 
        } else {
          setTimeout(() => {
            fadeOverlay.style.zIndex = '9999'; 
            fadeOverlay.style.opacity = '1';
            
            setTimeout(resetExperience, 2000);
          }, 1500);
        }
        
      }, 4000);
    }
  }

  setTimeout(showNextMessage, 2000);
}

// --- NEW: Reset Function ---
function resetExperience() {
  bgMusic.pause();
  bgMusic.currentTime = 0;
  gainNode.gain.value = 1.0;

  finaleStage.innerHTML = '';
  finaleStage.classList.add('hidden-stage');
  finaleStage.style.opacity = '0';

  document.getElementById('present-stage').style.display = 'flex';

  photoStrip.style.transition = 'none';
  ribbon.style.transition = 'none';
  presentBox.style.transition = 'none';
  
  const mask = document.getElementById('strip-mask');
  if (mask) mask.style.transition = 'none';

  presentBox.style.transform = 'translateY(0)';
  if (mask) mask.style.transform = 'translateY(0)';
  photoStrip.style.transform = 'translateY(0px)';
  ribbon.style.transform = 'translateY(-80px)';

  void photoStrip.offsetWidth;

  photoStrip.style.transition = 'transform 0.1s ease-out';
  ribbon.style.transition = 'transform 0.1s ease-out';
  
  presentBox.style.transition = ''; 
  if (mask) mask.style.transition = '';

  fadeOverlay.style.opacity = '0';
  
  setTimeout(() => {
    fadeOverlay.style.zIndex = '50';
  }, 2000);
}