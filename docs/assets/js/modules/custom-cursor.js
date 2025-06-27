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
    // Check if we're on desktop
    const isDesktop = window.innerWidth > 768;

    console.log("🔍 Cursor Debug:", {
      isDesktop,
      windowWidth: window.innerWidth,
      cursorElement: !!document.getElementById("customCursor"),
    });

    this.cursor = document.getElementById("customCursor");

    if (this.cursor && isDesktop) {
      // Desktop: Use custom cursor
      if (!this.active) {
        this.init();
        document.body.classList.add("custom-cursor-active");
        document.body.style.cursor = "none";
        this.cursor.style.display = "block";
        this.active = true;
        console.log("✅ Custom cursor activated for desktop");
      }
    } else {
      // Mobile or no cursor element: Use system cursor
      this.enableFallbackCursor();
      console.log("✅ System cursor activated for mobile/fallback");
    }
  }

  enableFallbackCursor() {
    document.body.classList.remove("custom-cursor-active");
    document.body.style.cursor = "auto";
    if (this.cursor) {
      this.cursor.style.display = "none";
    }
    this.active = false;
  }

  canUseCustomCursor() {
    return (
      !this.isMobile &&
      "addEventListener" in document &&
      "requestAnimationFrame" in window
    );
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
    const handleMouseMove = (e) => {
      if (this.cursor && window.innerWidth > 768) {
        requestAnimationFrame(() => {
          // Force position update with stronger styles
          this.cursor.style.left = e.clientX + "px";
          this.cursor.style.top = e.clientY + "px";
          this.cursor.style.transform = "translate(-50%, -50%)";
          this.cursor.style.display = "block";
          this.cursor.style.opacity = "1";
          this.cursor.style.visibility = "visible";
          this.cursor.style.zIndex = "99999";
        });
      }
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

// Force immediate initialization for debugging
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    console.log("🔴 DEBUG: Initializing custom cursor immediately");
    try {
      const cursor = new CustomCursor();
      window.debugCursor = cursor; // For debugging
      console.log("🔴 DEBUG: Custom cursor initialized", cursor);
    } catch (error) {
      console.error("🔴 DEBUG: Custom cursor failed", error);
      document.body.style.cursor = "auto";
    }
  });
}

export default {
  async init() {
    return new CustomCursor();
  },
};
