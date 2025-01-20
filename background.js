let recentFlashes = []; // Store timestamps of flashes

// Helper function to detect flashes
function logFlash() {
  const now = Date.now();
  recentFlashes.push(now);

  // Keep only the flashes in the last 1 second
  recentFlashes = recentFlashes.filter(timestamp => now - timestamp <= 1000);

  if (recentFlashes.length >= 500) {  // Trigger if 5 flashes detected within 1 second
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Flashing Detected',
      message: 'Flashing content detected on this page. Please be cautious.'
    });
  }
}

// Listen for messages from content scripts to detect flashes
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'flashDetected') {
    logFlash();
  }
});