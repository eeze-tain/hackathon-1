document.addEventListener("DOMContentLoaded", () => {
    const checkIntervalInput = document.getElementById("checkInterval");
    const flashThresholdInput = document.getElementById("flashThreshold");
    const observationDurationInput = document.getElementById("observationDuration");
  
    // Load saved settings
    chrome.storage.sync.get(
      ["checkInterval", "flashThreshold", "observationDuration"],
      (settings) => {
        checkIntervalInput.value = settings.checkInterval || 200;
        flashThresholdInput.value = settings.flashThreshold || 200;
        observationDurationInput.value = settings.observationDuration || 1800000;
      }
    );
  
    // Save settings
    document.getElementById("saveSettings").addEventListener("click", () => {
      const newSettings = {
        checkInterval: parseInt(checkIntervalInput.value, 10),
        flashThreshold: parseInt(flashThresholdInput.value, 10),
        observationDuration: parseInt(observationDurationInput.value, 10),
      };
  
      chrome.storage.sync.set(newSettings, () => {
        alert("Settings saved!");
      });
    });
  });