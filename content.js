const checkInterval = 200; // Interval to check for changes (ms)
let flashCount = 0; // Tracks the number of flashes detected
let flashThreshold =  200; // Number of flashes needed to trigger a warning
let observationDuration = 1800000; // Time window to detect flashes (1800000ms = 30 minutes)
let recentFlashes = []; // Keeps track of recent flash timestamps

function detectFlashingGIFs() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node.tagName === 'IMG' && node.src.endsWith('.gif')) {
            monitorGIF(node);
          }
        });
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Monitor GIFs for potential flashing
  function monitorGIF(imgElement) {
    // Add a listener for when the GIF is loaded
    imgElement.addEventListener('load', () => {
      alert('GIF detected:', imgElement.src);
      
      // Optional: Analyze the animation (requires external libraries for deep analysis)
      analyzeGIF(imgElement.src).then(isFlashing => {
        if (isFlashing) {
          logFlash();
        }
      });
    });
  }

  // Example function to analyze GIFs (could be extended)
  async function analyzeGIF(src) {
    // Simple logic: Assume GIFs with rapid flashes are problematic
    // Advanced analysis may involve fetching and parsing GIF frames
    return new Promise((resolve) => {
      setTimeout(() => resolve(true), 500); // Placeholder for actual logic
    });
  }
}

// Helper function to calculate the difference between two RGB colors
function colorDifference(color1, color2) {
  const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
  const [r2, g2, b2] = color2.match(/\d+/g).map(Number);
  return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}

// Function to monitor video elements for flicker or flashing
function detectVideoFlashing() {
  const videos = document.querySelectorAll("video");
  
  videos.forEach(video => {
    video.addEventListener("play", () => {
      const videoInterval = setInterval(() => {
        if (video.paused || video.ended) {
          clearInterval(videoInterval); // Stop monitoring when video is not playing
          return;
        }
        // Example: Log flash when video is playing at a rapid rate (can be extended with frame/brightness analysis)
        // logFlash();
        blockFlashingContent()
      }, checkInterval);
    });
  });
}

// Function to monitor canvas elements for visual changes
function detectCanvasFlashing() {
  const canvases = document.querySelectorAll("canvas");

  canvases.forEach((canvas) => {
    const context = canvas.getContext("2d");
    if (!context) return;

    let lastImageData = null;

    const canvasInterval = setInterval(() => {
      try {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height).data;

        if (lastImageData) {
          let diff = 0;
          for (let i = 0; i < imageData.length; i++) {
            diff += Math.abs(imageData[i] - lastImageData[i]);
          }

          // Flash detected if visual difference is significant
          if (diff > 5000000) {
            // logFlash();
            blockFlashingContent()
          }
        }

        lastImageData = new Uint8ClampedArray(imageData);
      } catch (err) {
        console.error("Canvas monitoring error or restriction:", err);
      }
    }, checkInterval);
  });
}

// Function to detect CSS animations or transitions causing flashing
function detectCSSFlashing() {
    const colorHistory = new Map(); // To track background color changes for each element
  
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "style") {
          const target = mutation.target;
          const style = getComputedStyle(target);
  
          if (style.backgroundColor) {
            const currentColor = style.backgroundColor;
  
            // Check and log significant color changes
            trackColorChange(target, currentColor);
          }
  
          // Detect animations or transitions
          if (style.animationName || style.transitionDuration !== "0s") {
            logFlash();
          }
        }
      });
    });
  
    observer.observe(document.body, { attributes: true, subtree: true });
  
    /**
     * Tracks background color changes for an element and evaluates for flashing
     * @param {Element} element - The DOM element to track
     * @param {string} currentColor - The current background color
     */
    function trackColorChange(element, currentColor) {
      const now = Date.now();
      let history = colorHistory.get(element) || [];
  
      // Add current color and timestamp to history
      history.push({ color: currentColor, timestamp: now });
  
      // Filter out old records beyond the observation duration
      history = history.filter(entry => now - entry.timestamp <= 2000); // 2 seconds
  
      colorHistory.set(element, history);
  
      // Evaluate flashing: Check for frequent and significant color changes
      if (history.length > 1) {
        let significantChanges = 0;
  
        for (let i = 1; i < history.length; i++) {
          const diff = colorDifference(history[i - 1].color, history[i].color);
          if (diff > 200) significantChanges++;
        }
  
        // If significant changes exceed threshold, it's flashing
        if (significantChanges > 3) { // 3 changes in 2 seconds
          logFlash();
        }
      }
    }
  }

// Function to detect flashing from the background color
function detectBackgroundFlashing() {
  let lastBackgroundColor = getComputedStyle(document.body).backgroundColor;

  setInterval(() => {
    const currentBackgroundColor = getComputedStyle(document.body).backgroundColor;

    // If a significant background color change is detected
    if (colorDifference(lastBackgroundColor, currentBackgroundColor) > 200) {
      logFlash();
    // blockFlashingContent()
    }

    lastBackgroundColor = currentBackgroundColor;
  }, checkInterval);
}

// Function to log a detected flash
function logFlash() {
  const now = Date.now();
  recentFlashes.push(now);

  // Remove flashes older than the observation duration
  recentFlashes = recentFlashes.filter((timestamp) => now - timestamp <= observationDuration);

  if (recentFlashes.length >= flashThreshold) {
    notifyFlash();
  }
}

// Notify background of a flash detection
function notifyFlash() {
  console.log('Flash detected! Triggering alert...');

  // Create a custom alert to allow reset on dismissal
  const userResponse = confirm(
    'Flashing content detected! Please take precautions.\n\nClick "OK" to acknowledge and reset detection.'
  );

  if (userResponse) {
    resetFlashDetection();
  }

  chrome.runtime.sendMessage({ action: 'flashDetected' });
}

// Function to reset flash detection
function resetFlashDetection() {
  console.log('Flash detection reset.');
  flashCount = 0; // Reset flash count
  recentFlashes = []; // Clear recent flashes
}

// Optional: Provide a fallback method to block flashing content using CSS
function blockFlashingContent() {
  const style = document.createElement("style");
  style.innerHTML = `
    * {
      animation: none !important;
      transition: none !important;
    }
    video, canvas, img, .html5-video-player {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
  console.log("Flashing content blocked using CSS.");
}

// Ensure script runs after the page loads
window.addEventListener("load", () => {
  console.log("Starting flash detection...");
  detectFlashingGIFs()
  // detectBackgroundFlashing(); // Detect background color flashing
  detectVideoFlashing(); // Detect video flashing
  detectCanvasFlashing(); // Detect canvas flashing
  detectCSSFlashing(); // Detect CSS-based flashing
//   blockFlashingContent(); // Optional: Block flashing content globally
});

// If you want the extension to adapt instantly to settings changes:
chrome.storage.onChanged.addListener((changes) => {
  if (changes.checkInterval) {
    checkInterval = changes.checkInterval.newValue;
  }
  if (changes.flashThreshold) {
    flashThreshold = changes.flashThreshold.newValue;
  }
  if (changes.observationDuration) {
    observationDuration = changes.observationDuration.newValue;
  }
});

// Load user settings
chrome.storage.sync.get(
  ["checkInterval", "flashThreshold", "observationDuration"],
  (settings) => {
    checkInterval = settings.checkInterval || checkInterval;
    flashThreshold = settings.flashThreshold || flashThreshold;
    observationDuration = settings.observationDuration || observationDuration;

    // Start detection with updated settings
    detectFlashingGIFs();
    detectVideoFlashing();
    detectCanvasFlashing();
    detectCSSFlashing();
  }
);