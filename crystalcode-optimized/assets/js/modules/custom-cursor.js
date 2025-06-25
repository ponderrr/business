class CustomCursor {
  constructor() {
    this.cursor = document.getElementById("customCursor");
    this.isMobile = window.innerWidth <= 768;
    this.active = false;
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
    this.initializeCursor();
  }

  initializeCursor() {
    // Always re-fetch the cursor element in case DOM changes
    this.cursor = document.getElementById("customCursor");
    this.isMobile = window.innerWidth <= 768;
    if (this.cursor && !this.isMobile) {
      if (!this.active) {
        this.init();
        document.body.style.cursor = "none";
        this.active = true;
      }
    } else {
      if (this.active) {
        document.body.style.cursor = "";
        if (this.cursor) this.cursor.style.display = "none";
        this.active = false;
      }
    }
  }

  handleResize() {
    this.initializeCursor();
  }

  init() {
    if (!this.cursor) {
      console.warn(
        "CustomCursor: #customCursor element not found. Skipping initialization."
      );
      return;
    }
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
    const formElements = document.querySelectorAll(".glass-input, .send-btn");
    if (!formElements.length) {
      console.warn(
        "CustomCursor: No elements found for .glass-input or .send-btn. Skipping custom cursor form interactions."
      );
      return;
    }
    formElements.forEach((el) => {
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
