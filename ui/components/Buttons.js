const buttonStyles = {
  base: {
    padding: "10px 20px",
    border: "1px solid #8239BC",
    borderRadius: "37px",
    cursor: "pointer",
  },
  primary: {
    background: "#8239BC",
    color: "#fff",
  },
  secondary: {
    background: "#fff",
    color: "#000",
  },
};

class Button {
  constructor(text, variant = "primary") {
    this.element = document.createElement("button");
    this.styles = buttonStyles[variant];
    this.element.textContent = text;
    this.applyStyles(this.styles);
  }

  applyStyles(styles) {
    Object.assign(this.element.style, { ...buttonStyles.base, ...styles });
  }

  addListener(event, handler) {
    this.element.addEventListener(event, handler);
    return this;
  }

  render() {
    return this.element;
  }
}
