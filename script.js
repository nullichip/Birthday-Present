const ribbon = document.getElementById('ribbon');
const capImg = document.getElementById('cap-img');
const presentBox = document.getElementById('present-box');
const photoStrip = document.getElementById('photo-strip');
const fadeOverlay = document.getElementById('fade-overlay');
const videoStage = document.getElementById('video-stage');

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
  presentBox.style.transform = 'translateY(100vh)';
  const mask = document.getElementById('strip-mask');
  if (mask) mask.style.transform = 'translateY(100vh)';
  
  photoStrip.style.transition = 'transform 10s linear';
  ribbon.style.transition = 'transform 10s linear';
  
  photoStrip.style.transform = `translateY(-2080px)`; 
  ribbon.style.transform = `translateY(-2160px)`; 
  
  // Wait 11 seconds, then fade to black
  setTimeout(() => {
    fadeOverlay.style.opacity = '1';
    
    // Swap stages after fade completes
    setTimeout(() => {
      document.getElementById('present-stage').style.display = 'none';
      finaleStage.classList.remove('hidden-stage');
      finaleStage.style.opacity = '1';
      fadeOverlay.style.opacity = '0'; 
      
      // Begin Phase 3
      scatterBackgroundPhotos();
    }, 2000); 
    
  }, 11000); 
}

// --- Phase 3: The 44 Photo Scatter ---
function scatterBackgroundPhotos() {
  const totalPhotos = 46;
  const popInSpeed = 300; // Milliseconds between each photo appearing
  
  for (let i = 1; i <= totalPhotos; i++) {
    let img = document.createElement('img');
    // Ensure you have photos named photo1.jpg through photo44.jpg in your assets folder
    img.src = `assets/photo${i}.png`; 
    img.className = 'final-scatter-photo';
    
    let randomTop = Math.floor(Math.random() * 80) + 10; 
    let randomLeft = Math.floor(Math.random() * 80) + 10; 
    let randomRotation = Math.floor(Math.random() * 60) - 30; 
    
    img.style.top = `${randomTop}%`;
    img.style.left = `${randomLeft}%`;
    img.style.transform = `translate(-50%, -50%) scale(0.5) rotate(${randomRotation}deg)`;
    img.style.zIndex = i; // Ensure newer photos stack on top of older ones
    
    finaleStage.appendChild(img);

    setTimeout(() => {
      img.style.opacity = '1';
      img.style.transform = `translate(-50%, -50%) scale(1) rotate(${randomRotation}deg)`;
    }, i * popInSpeed); 
  }

  // Trigger videos to start right after the 44th photo lands
  setTimeout(playVideosSequentially, (totalPhotos * popInSpeed) + 1000);
}

// --- Phase 4: The 5 Videos ---
function playVideosSequentially() {
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
  videoZones.sort(() => Math.random() - 0.5); // Shuffle zones
  
  const videoElements = [];

  videoFiles.forEach((file, index) => {
    let vid = document.createElement('video');
    vid.src = file;
    vid.controls = false; 
    vid.muted = false; 
    vid.autoplay = true; 
    vid.playsInline = true; 
    vid.className = 'stacked-video';
    
    // Put videos above all 44 scattered photos (z-index 100+)
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
        // Wait 15 seconds after the 5th video before starting the final text
        setTimeout(showFinalMessages, 15000);
      }
    }
  }

  showNextVideo();
}

// --- Phase 5: The Final Message & Reset Loop ---
function showFinalMessages() {
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
    "Happy birthday dad",
    "Although we might not always agree, you always continue to inspire us",
    "and that's why we're here today",
    "And though we don't say it much",
    "We will forever and always love you",
    "Happy birthday"
  ];

  let messageIndex = 0;

  function showNextMessage() {
    if (messageIndex < messages.length) {
      textElement.innerText = messages[messageIndex];
      textElement.style.opacity = '1';
      
      setTimeout(() => {
        textElement.style.opacity = '0';
        messageIndex++;
        
        // If there are more messages, keep going
        if (messageIndex < messages.length) {
          setTimeout(showNextMessage, 1500); 
        } else {
          // If all messages are done, trigger the final fade to black
          setTimeout(() => {
            fadeOverlay.style.zIndex = '9999'; // Bring overlay to the very front
            fadeOverlay.style.opacity = '1';
            
            // Wait 2 seconds for it to go fully black, then run the reset
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
  // 1. Wipe the finale stage clean of all photos, videos, and text
  finaleStage.innerHTML = '';
  finaleStage.classList.add('hidden-stage');
  finaleStage.style.opacity = '0';

  // 2. Unhide the present stage
  document.getElementById('present-stage').style.display = 'flex';

  // 3. Remove transitions temporarily so things snap back instantly
  photoStrip.style.transition = 'none';
  ribbon.style.transition = 'none';
  presentBox.style.transition = 'none';
  
  const mask = document.getElementById('strip-mask');
  if (mask) mask.style.transition = 'none';

  // 4. Snap everything back to their starting coordinates
  presentBox.style.transform = 'translateY(0)';
  if (mask) mask.style.transform = 'translateY(0)';
  photoStrip.style.transform = 'translateY(0px)';
  ribbon.style.transform = 'translateY(-80px)';

  // 5. Force the browser to register the snap before turning transitions back on
  void photoStrip.offsetWidth;

  // 6. Restore the smooth drag transitions for the next time it gets pulled
  photoStrip.style.transition = 'transform 0.1s ease-out';
  ribbon.style.transition = 'transform 0.1s ease-out';
  
  // Note: presentBox and strip-mask transitions will be reapplied in CSS automatically 
  // on the next triggerReveal() call since we remove the inline 'none' style here:
  presentBox.style.transition = ''; 
  if (mask) mask.style.transition = '';

  // 7. Fade the black overlay away to reveal the starting box
  fadeOverlay.style.opacity = '0';
  
  // 8. Put the overlay back in its normal background position after fading
  setTimeout(() => {
    fadeOverlay.style.zIndex = '50';
  }, 2000);
}