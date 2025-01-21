let settings = {
  checkInterval: 1000 / 60, // 60 fps
  flashesHz: 30,
};

// NOTE: Explore how to improve performance - Increase pixelsCount?
function analyzeFrameLuminance(context, width, height) {
  const imageData = context.getImageData(0, 0, width, height, {
    willReadFrequently: true,
  });
  const pixels = imageData.data;

  let totalLuminance = 0;
  let sampledPixels = 0;
  const pixelsCount = 1;

  for (let i = 0; i < pixels.length; i += 4 * pixelsCount) {
    const r = pixels[i]; // Red
    const g = pixels[i + 1]; // Green
    const b = pixels[i + 2]; // Blue

    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Accumulate the total luminance
    totalLuminance += luminance;
    sampledPixels++;
  }

  const averageLuminance = totalLuminance / sampledPixels;

  return averageLuminance; // Return the average luminance value
}

function main() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const luminancePercentThreshold = 50;
  let flashingElements = new Map();

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

        if (percentChange > luminancePercentThreshold) {
          stats.changes += 1;
        }

        const elapsed = Date.now() - stats.startTime;
        const flashesRate = stats.changes / (elapsed / 1000);

        stats.lastLuminance = currentLuminance;
        stats.lastCheckTime = Date.now();
        flashingElements.set(element, stats);

        if (
          flashesRate > (settings.flashesHz * elapsed) / 1000 &&
          stats.changes >= 3
        ) {
          alert("Flashing element detected");
          console.log({ stats });
          console.log(element);
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

          // node.querySelectorAll("video, img, canvas").forEach(checkElement);
        });
      }

      if (mutation.type === "attributes") {
        flashingElements.delete(mutation.target);
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // document.querySelectorAll("video, img, canvas").forEach(checkElement);

  setInterval(() => {
    document.querySelectorAll("video, img, canvas").forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight) {
        checkElement(element);
      }
    });
  }, settings.checkInterval);
}

chrome.storage.sync.set(settings, () => {
  // alert("Settings saved!", settings);
  console.log("Settings saved!", settings);
});

// Get settings from storage
chrome.storage.sync.get(Object.keys(settings), (stored) => {
  settings = { ...settings, ...stored };
  main();
});
