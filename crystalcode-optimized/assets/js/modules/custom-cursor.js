class CustomCursor {
  constructor() {
    this.cursor = document.getElementById("customCursor");
    this.isMobile = window.innerWidth <= 768;
    if (this.cursor && !this.isMobile) {
      this.init();
    }
  }

  init() {
    this.setupCursorTracking();
    this.setupFormInteractions();
    this.cursor.style.display = "block";
  }

  setupCursorTracking() {
    document.addEventListener(
      "mousemove",
      (e) => {
        requestAnimationFrame(() => {
          this.cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        });
      },
      { passive: true }
    );

    document.addEventListener(
      "mousedown",
      () => {
        this.cursor.classList.add("clicking");
      },
      { passive: true }
    );

    document.addEventListener(
      "mouseup",
      () => {
        this.cursor.classList.remove("clicking");
      },
      { passive: true }
    );
  }

  setupFormInteractions() {
    document.querySelectorAll(".glass-input, .send-btn").forEach((el) => {
      el.addEventListener("mouseenter", () => {
        this.cursor.classList.add("form-focus");
      });
      el.addEventListener("mouseleave", () => {
        this.cursor.classList.remove("form-focus");
      });
    });
  }
}

export default {
  async init() {
    new CustomCursor();
  },
};
