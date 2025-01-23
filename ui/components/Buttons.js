const buttonStyles = {
  base: {
    padding: "10px 20px",
    border: "1px solid #FF8540",
    borderRadius: "37px",
    cursor: "pointer",
    transition: "background 0.2s",
  },
  primary: {
    background: "#FF8540",
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

  setHover(hoverStyles, defaultStyles) {
    this.addListener("mouseenter", () =>
      this.applyStyles({ ...this.styles, ...hoverStyles })
    ).addListener("mouseleave", () =>
      this.applyStyles({ ...this.styles, ...defaultStyles })
    );
    return this;
  }

  render() {
    return this.element;
  }
}

const createPrimaryButton = ({ text, onClick }) =>
  new Button(text).addListener("click", onClick).render();

const createSecondaryButton = ({ text, onClick }) =>
  new Button(text, "secondary")
    .setHover(buttonStyles.primary, buttonStyles.secondary)
    .addListener("click", onClick)
    .render();
