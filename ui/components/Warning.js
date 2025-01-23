const overlay = document.createElement("div");
overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
    font-family: Inter;
  `;

const warningBox = document.createElement("div");
warningBox.style.cssText = `
    background: white;
    padding: 24px;
    border-radius: 16px;
    max-width: 400px;
    text-align: center;
    box-shadow: 0px 4px 20px 0px #00000099;
  `;

const title = document.createElement("h2");
title.textContent = "⚠️ Warning: Flashing Content Detected";
title.style.cssText = `
    color: #000;
    margin-bottom: 18px;
    font-size: 24px;
    font-weight: 700;
    line-height: 32px;
  `;

const message = document.createElement("p");
message.textContent =
  "This page contains rapidly flashing content that may trigger seizures in people with photosensitive epilepsy. Do you want to disable flashing content?";
message.style.cssText = `
    color: #2c3e50;
    margin-bottom: 18px;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
  `;

const buttonGroup = document.createElement("div");
buttonGroup.style.cssText = `
    display: flex;
    justify-content: center;
    gap: 16px;
  `;

warningBox.appendChild(title);
warningBox.appendChild(message);
buttonGroup.appendChild(
  Buttons.secondary("Cancel", [["click", () => overlay.remove()]])
);
buttonGroup.appendChild(
  Buttons.primary("CONTINUE", [["click", () => overlay.remove()]])
);
warningBox.appendChild(buttonGroup);
overlay.appendChild(warningBox);

const Warning = overlay;
