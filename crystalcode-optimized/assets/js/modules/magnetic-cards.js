class MagneticCards {
  constructor() {
    this.cards = document.querySelectorAll("[data-tilt]");
    this.init();
  }

  init() {
    this.cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => this.handleMouseMove(e, card), {
        passive: true,
      });
      card.addEventListener(
        "mouseleave",
        (e) => this.handleMouseLeave(e, card),
        { passive: true }
      );
    });
  }

  handleMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    requestAnimationFrame(() => {
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(8px)`;
      card.style.setProperty("--mouse-x", `${(x / rect.width) * 100}%`);
      card.style.setProperty("--mouse-y", `${(y / rect.height) * 100}%`);
    });
  }

  handleMouseLeave(e, card) {
    requestAnimationFrame(() => {
      card.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    });
  }
}

export default {
  async init() {
    new MagneticCards();
  },
};
