/**
 * CrystalCode Critical JavaScript
 * Loads immediately for essential functionality
 * Contains performance optimizations and lazy loading orchestration
 */

"use strict";

// Critical performance monitoring
const DEBUG = false;
const PERFORMANCE_BUDGET = {
  FCP: 1500, // First Contentful Paint
  LCP: 2500, // Largest Contentful Paint
  FID: 100, // First Input Delay
  CLS: 0.1, // Cumulative Layout Shift
};

// Global optimization state
const OptimizationState = {
  isHighPerformanceDevice: navigator.hardwareConcurrency >= 4,
  prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)")
    .matches,
  isMobile: window.innerWidth <= 768,
  isOnline: navigator.onLine,
  loadedModules: new Set(),
  observers: new Map(),
  animationFrameId: null,
};

/**
 * Critical Performance Manager
 * Handles initial page load optimizations
 */
class CriticalPerformanceManager {
  constructor() {
    this.metrics = new Map();
    this.loadStartTime = performance.now();
    this.init();
  }

  init() {
    this.measureCriticalMetrics();
    this.setupCriticalObservers();
    this.initializeLazyLoading();
    this.setupEventListeners();

    if (DEBUG) {
      console.log("🚀 Critical Performance Manager initialized");
    }
  }

  measureCriticalMetrics() {
    // Measure and report core web vitals
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.entryType === "paint") {
          this.metrics.set(entry.name, entry.startTime);
          this.checkPerformanceBudget(entry.name, entry.startTime);
        }
      }
    }).observe({ entryTypes: ["paint"] });

    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.set("LCP", lastEntry.startTime);
      this.checkPerformanceBudget("LCP", lastEntry.startTime);
    }).observe({ entryTypes: ["largest-contentful-paint"] });

    // Cumulative Layout Shift
    new PerformanceObserver((entryList) => {
      let clsValue = 0;
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      this.metrics.set("CLS", clsValue);
      this.checkPerformanceBudget("CLS", clsValue);
    }).observe({ entryTypes: ["layout-shift"] });
  }

  checkPerformanceBudget(metric, value) {
    const budget = PERFORMANCE_BUDGET[metric];
    if (budget && value > budget) {
      console.warn(
        `⚠️ Performance budget exceeded for ${metric}: ${value}ms (budget: ${budget}ms)`
      );
    }
  }

  setupCriticalObservers() {
    // Intersection Observer for lazy loading sections
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadSection(entry.target);
            entry.target.classList.add("visible");
            sectionObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    // Observe lazy sections
    document.querySelectorAll(".lazy-section").forEach((section) => {
      sectionObserver.observe(section);
    });

    OptimizationState.observers.set("sections", sectionObserver);
  }

  async loadSection(section) {
    const sectionType = section.dataset.lazyLoad;
    const moduleRequests = [];

    switch (sectionType) {
      case "services":
        moduleRequests.push(this.loadModule("magnetic-cards"));
        moduleRequests.push(this.loadModule("gsap-animations"));
        break;
      case "portfolio":
        moduleRequests.push(this.loadModule("magnetic-cards"));
        moduleRequests.push(this.loadModule("gsap-animations"));
        break;
      case "form":
        moduleRequests.push(this.loadModule("form-handler"));
        break;
    }

    // Load all required modules for this section
    await Promise.all(moduleRequests);
  }

  async loadModule(moduleName) {
    if (OptimizationState.loadedModules.has(moduleName)) {
      return;
    }

    try {
      const startTime = performance.now();

      // Dynamic import with error handling
      const module = await import(`./modules/${moduleName}.js`);

      if (module.default && typeof module.default.init === "function") {
        await module.default.init();
      }

      OptimizationState.loadedModules.add(moduleName);

      const loadTime = performance.now() - startTime;
      if (DEBUG) {
        console.log(
          `📦 Module ${moduleName} loaded in ${loadTime.toFixed(2)}ms`
        );
      }
    } catch (error) {
      console.error(`❌ Failed to load module: ${moduleName}`, error);
      // Fallback: try to load from CDN or show graceful degradation
      this.handleModuleLoadError(moduleName, error);
    }
  }

  handleModuleLoadError(moduleName, error) {
    // Implement graceful degradation
    console.warn(`Graceful degradation for ${moduleName}`);

    // Remove interactive dependencies for failed modules
    document.querySelectorAll(`[data-module="${moduleName}"]`).forEach((el) => {
      el.style.cursor = "default";
      el.removeAttribute("data-tilt");
    });
  }

  initializeLazyLoading() {
    // Progressive image loading
    this.setupProgressiveImageLoading();

    // Preload critical modules after initial load
    this.preloadCriticalModules();
  }

  setupProgressiveImageLoading() {
    const imageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadProgressiveImage(entry.target);
            imageObserver.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "100px", // Start loading images 100px before they enter viewport
      }
    );

    document.querySelectorAll(".progressive-image").forEach((img) => {
      imageObserver.observe(img);
    });

    OptimizationState.observers.set("images", imageObserver);
  }

  loadProgressiveImage(img) {
    const startTime = performance.now();

    // Create temporary image for preloading
    const tempImg = new Image();

    tempImg.onload = () => {
      // Use requestAnimationFrame for smooth transition
      requestAnimationFrame(() => {
        img.src = tempImg.src;
        img.classList.add("loaded");

        const loadTime = performance.now() - startTime;
        if (DEBUG) {
          console.log(`🖼️ Image loaded in ${loadTime.toFixed(2)}ms`);
        }
      });
    };

    tempImg.onerror = () => {
      console.warn("Image failed to load:", img.dataset.src);
      img.classList.add("error");
    };

    // Load the actual image
    tempImg.src = img.dataset.src;
  }

  preloadCriticalModules() {
    // Preload modules that are likely to be needed soon
    requestIdleCallback(
      () => {
        if (OptimizationState.isHighPerformanceDevice) {
          this.loadModule("particle-system");
          this.loadModule("custom-cursor");
          this.loadModule("gsap-animations");
        }
      },
      { timeout: 3000 }
    );
  }

  setupEventListeners() {
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", this.handleSmoothScroll.bind(this));
    });

    // Network status monitoring
    window.addEventListener("online", () => {
      OptimizationState.isOnline = true;
      this.handleNetworkChange();
    });

    window.addEventListener("offline", () => {
      OptimizationState.isOnline = false;
      this.handleNetworkChange();
    });

    // Performance monitoring
    window.addEventListener("load", () => {
      this.measureFinalMetrics();
    });
  }

  handleSmoothScroll(e) {
    e.preventDefault();
    const target = document.querySelector(e.currentTarget.getAttribute("href"));

    if (target) {
      const headerOffset = 80; // Account for fixed navigation
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }

  handleNetworkChange() {
    if (OptimizationState.isOnline) {
      // Resume normal loading when back online
      this.preloadCriticalModules();
    } else {
      // Implement offline strategies
      console.log("📱 Offline mode: Reducing resource usage");
    }
  }

  measureFinalMetrics() {
    const loadTime = performance.now() - this.loadStartTime;
    console.log(`⏱️ Total page load time: ${loadTime.toFixed(2)}ms`);

    // Report to analytics (if available)
    if (typeof gtag !== "undefined") {
      gtag("event", "page_load_time", {
        value: Math.round(loadTime),
        custom_parameter: "performance_monitoring",
      });
    }
  }
}

/**
 * Critical Utilities
 * Essential helper functions needed immediately
 */
class CriticalUtils {
  static throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  static isHighPerformanceDevice() {
    return (
      navigator.hardwareConcurrency >= 4 &&
      !window.matchMedia("(max-width: 768px)").matches
    );
  }

  static supportsWebP() {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => resolve(webP.height === 2);
      webP.src =
        "data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA";
    });
  }

  static getDeviceType() {
    const width = window.innerWidth;
    if (width <= 480) return "mobile";
    if (width <= 768) return "tablet";
    if (width <= 1024) return "laptop";
    return "desktop";
  }

  static measureElementPerformance(element, operation) {
    const start = performance.now();
    const result = operation();
    const end = performance.now();

    if (DEBUG) {
      console.log(`🔧 ${element}: ${(end - start).toFixed(2)}ms`);
    }

    return result;
  }
}

/**
 * Critical Error Handler
 * Manages errors during critical loading phase
 */
class CriticalErrorHandler {
  constructor() {
    this.errors = [];
    this.setupGlobalErrorHandling();
  }

  setupGlobalErrorHandling() {
    window.addEventListener("error", (event) => {
      this.handleError({
        type: "javascript",
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.handleError({
        type: "promise",
        message: event.reason?.message || "Unhandled promise rejection",
        error: event.reason,
      });
    });
  }

  handleError(errorInfo) {
    this.errors.push({
      ...errorInfo,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    if (DEBUG) {
      console.error("💥 Critical error:", errorInfo);
    }

    // Implement graceful degradation
    this.implementFallbacks(errorInfo);
  }

  implementFallbacks(errorInfo) {
    if (
      errorInfo.type === "javascript" &&
      errorInfo.filename?.includes("modules/")
    ) {
      // Module loading failed - remove interactive dependencies
      document.querySelectorAll("[data-module]").forEach((el) => {
        el.style.cursor = "default";
        el.removeAttribute("data-tilt");
      });
    }
  }

  getErrorReport() {
    return {
      errors: this.errors,
      performance: OptimizationState,
      timestamp: Date.now(),
    };
  }
}

/**
 * Critical Form Handler
 * Basic form functionality loaded immediately
 */
class CriticalFormHandler {
  constructor() {
    this.form = document.getElementById("contactForm");
    if (this.form) {
      this.init();
    }
  }

  init() {
    this.form.addEventListener("submit", this.handleSubmit.bind(this));

    // Add basic accessibility enhancements
    this.enhanceAccessibility();
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const submitButton = this.form.querySelector(".send-btn");

    // Basic loading state
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const response = await fetch(this.form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        this.showSuccess();
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      this.showError();
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Send Transmission";
    }
  }

  showSuccess() {
    const successElement = document.getElementById("formSuccess");
    if (successElement) {
      successElement.classList.add("active");

      // Reset form after delay
      setTimeout(() => {
        this.form.reset();
        successElement.classList.remove("active");
      }, 3000);
    } else {
      alert("✅ Message sent successfully!");
    }
  }

  showError() {
    alert("⚠️ Something went wrong. Please try again.");
  }

  enhanceAccessibility() {
    // Add proper ARIA labels and error handling
    const inputs = this.form.querySelectorAll("input, textarea");
    inputs.forEach((input) => {
      input.addEventListener("invalid", (e) => {
        e.target.setAttribute("aria-invalid", "true");
      });

      input.addEventListener("input", (e) => {
        e.target.removeAttribute("aria-invalid");
      });
    });
  }
}

/**
 * Basic Custom Cursor (Critical Version)
 * Lightweight cursor for immediate loading
 */
class BasicCustomCursor {
  constructor() {
    this.cursor = document.getElementById("customCursor");
    this.isMobile = window.innerWidth <= 768;

    if (this.cursor && !this.isMobile) {
      this.init();
    }
  }

  init() {
    // Use passive listeners for better performance
    document.addEventListener("mousemove", this.updatePosition.bind(this), {
      passive: true,
    });
    document.addEventListener("mousedown", this.handleMouseDown.bind(this), {
      passive: true,
    });
    document.addEventListener("mouseup", this.handleMouseUp.bind(this), {
      passive: true,
    });

    this.cursor.style.display = "block";
  }

  updatePosition(e) {
    // Use transform instead of left/top for better performance
    requestAnimationFrame(() => {
      this.cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
  }

  handleMouseDown() {
    this.cursor.classList.add("clicking");
  }

  handleMouseUp() {
    this.cursor.classList.remove("clicking");
  }
}

/**
 * Initialize Critical Systems
 * Called immediately when DOM is ready
 */
function initializeCriticalSystems() {
  const startTime = performance.now();

  // Initialize critical managers
  const performanceManager = new CriticalPerformanceManager();
  const errorHandler = new CriticalErrorHandler();
  const formHandler = new CriticalFormHandler();
  const basicCursor = new BasicCustomCursor();

  // Store references globally for debugging
  if (DEBUG) {
    window.CrystalCode = {
      performanceManager,
      errorHandler,
      formHandler,
      basicCursor,
      OptimizationState,
    };
  }

  const initTime = performance.now() - startTime;
  console.log(`🎯 Critical systems initialized in ${initTime.toFixed(2)}ms`);
}

/**
 * DOM Ready Handler
 * Optimized to run as soon as possible
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeCriticalSystems);
} else {
  // DOM is already ready
  initializeCriticalSystems();
}

/**
 * Service Worker Registration (if available)
 * For caching and offline functionality
 */
if ("serviceWorker" in navigator && OptimizationState.isOnline) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        if (DEBUG) {
          console.log("🔧 Service Worker registered:", registration);
        }
      })
      .catch((error) => {
        if (DEBUG) {
          console.log("🔧 Service Worker registration failed:", error);
        }
      });
  });
}

/**
 * Critical CSS Loading
 * Loads non-critical CSS after critical rendering
 */
function loadNonCriticalCSS() {
  const links = document.querySelectorAll('link[media="print"]');
  links.forEach((link) => {
    link.addEventListener("load", function () {
      this.media = "all";
      this.onload = null;
    });
  });
}

// Load non-critical CSS after critical path
requestIdleCallback(loadNonCriticalCSS, { timeout: 2000 });

/**
 * Performance Budget Monitoring
 * Warns when performance thresholds are exceeded
 */
function monitorPerformanceBudget() {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.duration > 50) {
        // Long task threshold
        console.warn(`⚠️ Long task detected: ${entry.duration.toFixed(2)}ms`);
      }
    });
  });

  observer.observe({ entryTypes: ["longtask"] });
}

// Start performance monitoring
if (DEBUG && "PerformanceObserver" in window) {
  monitorPerformanceBudget();
}

/**
 * Export for module system
 */
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CriticalPerformanceManager,
    CriticalUtils,
    CriticalErrorHandler,
    OptimizationState,
  };
}

console.log("⚡ CrystalCode Critical JavaScript loaded successfully!");
