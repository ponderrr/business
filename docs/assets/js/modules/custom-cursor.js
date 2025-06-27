class CustomCursor {
  constructor() {
    this.cursor = document.getElementById("customCursor");
    this.active = false;
    this.eventHandlers = new Map(); // Store references to event handlers
    this.formElements = []; // Store references to form elements
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
    this.eventHandlers.set("window-resize", {
      element: window,
      event: "resize",
      handler: this.handleResize,
    });
    this.initializeCursor();
  }

  initializeCursor() {
    // Always re-fetch the cursor element in case DOM changes
    this.cursor = document.getElementById("customCursor");
    if (this.cursor /* && !this.isMobile */) {
      if (!this.active) {
        this.init();
        document.body.style.cursor = "none";
        this.active = true;
      }
    } else {
      if (this.active) {
        this.cleanup(); // Clean up event listeners when disabling
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
    // Create bound event handlers and store references
    const handleMouseMove = (e) => {
      requestAnimationFrame(() => {
        this.cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      });
    };

    const handleMouseDown = () => {
      this.cursor.classList.add("clicking");
    };

    const handleMouseUp = () => {
      this.cursor.classList.remove("clicking");
    };

    // Add event listeners
    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("mouseup", handleMouseUp, { passive: true });

    // Store references for cleanup
    this.eventHandlers.set("document-mousemove", {
      element: document,
      event: "mousemove",
      handler: handleMouseMove,
    });
    this.eventHandlers.set("document-mousedown", {
      element: document,
      event: "mousedown",
      handler: handleMouseDown,
    });
    this.eventHandlers.set("document-mouseup", {
      element: document,
      event: "mouseup",
      handler: handleMouseUp,
    });
  }

  setupFormInteractions() {
    const formElements = document.querySelectorAll(".glass-input, .send-btn");
    if (!formElements.length) {
      console.warn(
        "CustomCursor: No elements found for .glass-input or .send-btn. Skipping custom cursor form interactions."
      );
      return;
    }

    // Clear previous form elements
    this.formElements = [];

    formElements.forEach((el, index) => {
      // Create bound event handlers
      const handleMouseEnter = () => {
        this.cursor.classList.add("form-focus");
      };

      const handleMouseLeave = () => {
        this.cursor.classList.remove("form-focus");
      };

      // Add event listeners
      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);

      // Store references for cleanup
      this.eventHandlers.set(`form-${index}-mouseenter`, {
        element: el,
        event: "mouseenter",
        handler: handleMouseEnter,
      });
      this.eventHandlers.set(`form-${index}-mouseleave`, {
        element: el,
        event: "mouseleave",
        handler: handleMouseLeave,
      });
      this.formElements.push(el);
    });
  }

  cleanup() {
    // Remove all stored event listeners
    this.eventHandlers.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });

    // Clear the event handlers map
    this.eventHandlers.clear();

    // Clear form elements array
    this.formElements = [];
  }

  destroy() {
    // Remove the window resize listener
    window.removeEventListener("resize", this.handleResize);

    // Clean up all other event listeners
    this.cleanup();

    // Reset cursor styles
    if (this.cursor) {
      this.cursor.style.display = "none";
    }
    document.body.style.cursor = "";

    // Reset state
    this.active = false;
    this.cursor = null;
  }
}

export default {
  async init() {
    new CustomCursor();
  },
};
