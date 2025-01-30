document.addEventListener("DOMContentLoaded", () => {
    const checkIntervalInput = document.getElementById("checkInterval");
    const flashesPerSecond = document.getElementById("flashesPerSecond");
    const luminancePercentThreshold = document.getElementById("luminancePercentThreshold");
  
    // Load saved settings
    chrome.storage.sync.get(
      ["checkInterval", "flashesPerSecond"],
      (settings) => {
        checkIntervalInput.value = settings.checkInterval || 200;
        flashesPerSecond.value = settings.flashesPerSecond || 200;
        luminancePercentThreshold.value = settings.luminancePercentThreshold || 1;
      }
    );
  
    // Save settings
    document.getElementById("saveSettings").addEventListener("click", () => {
      const newSettings = {
        checkInterval: parseInt(checkIntervalInput.value, 10),
        flashesPerSecond: parseInt(flashesPerSecond.value, 10),
        luminancePercentThreshold: parseInt(luminancePercentThreshold.value, 10),
      };
  
      chrome.storage.sync.set(newSettings, () => {
        alert("Settings saved!");
        // Trigger custom event after saving options
        const event = new CustomEvent('settingsChanged', { detail: newSettings });
        document.dispatchEvent(event);
      });
    });
  });