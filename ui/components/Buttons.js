const Buttons = {
  _createButton(text, customStyles, eventListeners) {
    const button = document.createElement("button");

    button.textContent = text;
    button.style.cssText = Object.entries({
      ...this._baseStyles,
      ...customStyles,
    })
      .map(([key, value]) => `${key}: ${value};`)
      .join("");

    if (eventListeners?.length > 0) {
      eventListeners.forEach(([event, listener]) => {
        button.addEventListener(event, listener);
      });
    }

    return button;
  },
  _baseStyles: {
    padding: "10px 20px",
    border: "1px solid #FF8540",
    "border-radius": "37px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  primaryStyles: {
    background: "#FF8540",
    color: "#fff",
  },
  secondaryStyles: {
    background: "#fff",
    color: "#000",
  },

  /**
   * @param {string} text
   * @param {Function} onClick
   * @returns {HTMLButtonElement}
   */
  primary(text, eventListeners) {
    const primary = this._createButton(
      text,
      this.primaryStyles,
      eventListeners
    );

    return primary;
  },

  /**
   * @param {string} text
   * @param {Function} onClick
   * @returns {HTMLButtonElement}
   */
  secondary(text, eventListeners) {
    const secondary = this._createButton(
      text,
      this.secondaryStyles,
      eventListeners
    );

    secondary.addEventListener("mouseenter", () => {
      secondary.style.background = this.primaryStyles.background;
      secondary.style.color = this.primaryStyles.color;
    });
    secondary.addEventListener("mouseleave", () => {
      secondary.style.background = this.secondaryStyles.background;
      secondary.style.color = this.secondaryStyles.color;
    });

    return secondary;
  },
};
