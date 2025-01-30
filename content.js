let settings = {
  checkInterval: 1000 / 60, // 60 fps
  flashesPerSecond: 30,
  luminancePercentThreshold: 50, 

};

function main() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  let flashingElements = new WeakMap();

  function checkElement(element) {
    const elementTypes = [
      element.tagName === "VIDEO",
      element.tagName === "CANVAS",
      element.tagName === "IMG" && element.src.endsWith(".gif"),
    ];

    const bounds = element.getBoundingClientRect();
    if (bounds.width === 0 || bounds.height === 0) return;

    if (elementTypes.some((elementType) => elementType)) {
      canvas.width = bounds.width;
      canvas.height = bounds.height;

      try {
        context.drawImage(element, 0, 0, canvas.width, canvas.height);
        const currentLuminance = analyzeFrameLuminance(
          context,
          canvas.width,
          canvas.height
        );

        const stats = flashingElements.get(element) || {
          lastLuminance: currentLuminance,
          changes: 0,
          startTime: Date.now(),
          lastCheckTime: Date.now(),
        };

        const timeDiff = Date.now() - stats.startTime;

        if (timeDiff > 1000) {
          flashingElements.delete(element);
          return false;
        }

        const luminanceDiff = Math.abs(currentLuminance - stats.lastLuminance);
        const percentChange = (luminanceDiff / stats.lastLuminance) * 100;

        if (percentChange > settings.luminancePercentThreshold) {
          stats.changes += 1;
        }

        const elapsed = Date.now() - stats.startTime;
        const flashesRate = stats.changes / (elapsed / 1000);

        stats.lastLuminance = currentLuminance;
        stats.lastCheckTime = Date.now();
        flashingElements.set(element, stats);

        if (
          flashesRate > (settings.flashesPerSecond * elapsed) / 1000 &&
          stats.changes >= 3
        ) {
          element.style.display = "none";
          if (element.tagName === "VIDEO") {
            element.pause();
          }

          document.body.appendChild(warning);

          return true;
        }
      } catch (error) {
        console.error("Error analyzing element:", error);
      }
    }
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          checkElement(node);
        });
      }

      if (mutation.type === "attributes") {
        flashingElements.delete(mutation.target);
      }
    }
  });

  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  setInterval(() => {
    document.querySelectorAll("video, img, canvas").forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight) {
        checkElement(element);
      }
    });
  }, settings.checkInterval);
}

// Function to update settings
function updateSettings(newSettings) {
  settings = { ...settings, ...newSettings };
  console.log("Settings saved!",  settings);
}

// Listen for the custom event and call updateSettings
document.addEventListener('settingsChanged', (event) => {
    updateSettings(event.detail);
});

// Get settings from storage
chrome.storage.sync.get(Object.keys(settings), (stored) => {
  updateSettings(stored);
  main();
});
