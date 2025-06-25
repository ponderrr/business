/**
 * Virtual Particle System - Optimized for Performance
 * Uses canvas rendering and object pooling for maximum efficiency
 * DOM Optimization with intersection observers and culling
 */

"use strict";

class VirtualParticleSystem {
  constructor() {
    this.canvas = document.getElementById("particle-canvas");
    this.ctx = null;
    this.particles = [];
    this.particlePool = [];
    this.visibleParticles = new Set();

    // Performance settings
    this.maxParticles = this.getOptimalParticleCount();
    this.isVisible = true;
    this.isPaused = false;
    this.lastFrame = 0;
    this.frameCount = 0;
    this.targetFPS = 60;
    this.frameInterval = 1000 / this.targetFPS;

    // Mouse interaction
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.lastMouseUpdate = 0;
    this.mouseInfluenceRadius = 150;

    // Scroll and section theming
    this.scrollY = 0;
    this.currentSection = "hero";
    this.sectionColors = {
      hero: { r: 255, g: 255, b: 255, a: 0.6 },
      services: { r: 0, g: 255, b: 247, a: 0.6 },
      projects: { r: 255, g: 20, b: 147, a: 0.6 },
      contact: { r: 255, g: 215, b: 0, a: 0.6 },
    };

    // Performance monitoring
    this.performanceMetrics = {
      averageFPS: 60,
      frameTime: 0,
      particlesRendered: 0,
      lastOptimization: 0,
    };

    this.init();
  }

  init() {
    if (!this.canvas) {
      console.warn("Particle canvas not found");
      return;
    }

    this.setupCanvas();
    this.createParticlePool();
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.setupPerformanceMonitoring();
    this.start();

    console.log(
      `🌟 Virtual Particle System initialized with ${this.maxParticles} particles`
    );
  }

  getOptimalParticleCount() {
    const devicePixelRatio = window.devicePixelRatio || 1;
    const screenArea = window.innerWidth * window.innerHeight;
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;

    // Base particle count on screen size and device capability
    let baseCount = Math.floor(screenArea / 15000); // ~1 particle per 15000 pixels

    // Adjust for device performance
    if (hardwareConcurrency >= 8) {
      baseCount *= 1.5;
    } else if (hardwareConcurrency <= 2) {
      baseCount *= 0.5;
    }

    // Adjust for pixel density
    if (devicePixelRatio > 2) {
      baseCount *= 0.8;
    }

    // Mobile optimization
    if (window.innerWidth <= 768) {
      baseCount *= 0.3;
    }

    return Math.min(Math.max(baseCount, 50), 300); // Min 50, max 300
  }

  setupCanvas() {
    this.ctx = this.canvas.getContext("2d", {
      alpha: true,
      antialias: false,
      desynchronized: true, // For better performance
    });

    this.resizeCanvas();

    // Canvas optimization
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.globalCompositeOperation = "source-over";
  }

  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set actual size in memory (scaled up for retina)
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;

    // Scale the drawing context so everything draws at the correct size
    this.ctx.scale(dpr, dpr);

    // Set display size (CSS pixels)
    this.canvas.style.width = rect.width + "px";
    this.canvas.style.height = rect.height + "px";
  }

  createParticlePool() {
    // Pre-create particle objects to avoid garbage collection
    const poolSize = this.maxParticles * 2;

    for (let i = 0; i < poolSize; i++) {
      this.particlePool.push({
        x: 0,
        y: 0,
        baseX: 0,
        baseY: 0,
        vx: 0,
        vy: 0,
        size: 1,
        opacity: 0,
        active: false,
        layer: 0,
        parallaxFactor: 1,
        color: { r: 255, g: 255, b: 255, a: 0.6 },
        lastUpdate: 0,
      });
    }

    // Initialize active particles
    for (let i = 0; i < this.maxParticles; i++) {
      this.activateParticle();
    }
  }

  activateParticle() {
    const particle = this.getParticleFromPool();
    if (!particle) return null;

    // Randomize particle properties
    particle.baseX = Math.random() * this.canvas.width;
    particle.baseY = Math.random() * this.canvas.height;
    particle.x = particle.baseX;
    particle.y = particle.baseY;
    particle.vx = (Math.random() - 0.5) * 0.5;
    particle.vy = (Math.random() - 0.5) * 0.5;
    particle.size = 1 + Math.random() * 3;
    particle.opacity = 0.3 + Math.random() * 0.5;
    particle.layer = Math.floor(Math.random() * 3);
    particle.parallaxFactor = 0.2 + particle.layer * 0.2;
    particle.color = { ...this.sectionColors[this.currentSection] };
    particle.lastUpdate = performance.now();

    this.particles.push(particle);
    this.visibleParticles.add(particle);

    return particle;
  }

  getParticleFromPool() {
    for (let particle of this.particlePool) {
      if (!particle.active) {
        particle.active = true;
        return particle;
      }
    }
    return null; // Pool exhausted
  }

  returnParticleToPool(particle) {
    particle.active = false;
    particle.opacity = 0;

    // Remove from active arrays
    const index = this.particles.indexOf(particle);
    if (index > -1) {
      this.particles.splice(index, 1);
    }
    this.visibleParticles.delete(particle);
  }

  setupEventListeners() {
    // Throttled mouse movement
    let mouseTimeout;
    document.addEventListener(
      "mousemove",
      (e) => {
        if (mouseTimeout) return;

        mouseTimeout = setTimeout(() => {
          this.mouseX = e.clientX;
          this.mouseY = e.clientY;
          this.lastMouseUpdate = performance.now();
          mouseTimeout = null;
        }, 16); // ~60fps throttle
      },
      { passive: true }
    );

    // Throttled scroll handling
    let scrollTimeout;
    window.addEventListener(
      "scroll",
      () => {
        if (scrollTimeout) return;

        scrollTimeout = setTimeout(() => {
          this.scrollY = window.scrollY;
          this.updateCurrentSection();
          scrollTimeout = null;
        }, 16);
      },
      { passive: true }
    );

    // Resize handling with debounce
    let resizeTimeout;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.resizeCanvas();
        this.maxParticles = this.getOptimalParticleCount();
        this.optimizeParticleCount();
      }, 150);
    });

    // Visibility change handling
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (!this.isVisible) {
            this.pause();
          } else if (!this.isPaused) {
            this.resume();
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(this.canvas);
  }

  setupPerformanceMonitoring() {
    let frameCount = 0;
    let lastFPSUpdate = performance.now();

    const monitorPerformance = () => {
      frameCount++;
      const now = performance.now();

      // Update FPS every second
      if (now - lastFPSUpdate >= 1000) {
        this.performanceMetrics.averageFPS = frameCount;
        frameCount = 0;
        lastFPSUpdate = now;

        // Auto-optimize if performance is poor
        if (this.performanceMetrics.averageFPS < 30) {
          this.optimizeForPerformance();
        }
      }

      if (this.isVisible && !this.isPaused) {
        requestAnimationFrame(monitorPerformance);
      }
    };

    requestAnimationFrame(monitorPerformance);
  }

  updateCurrentSection() {
    const scrollPosition = this.scrollY + window.innerHeight / 2;
    const sections = [
      { element: document.querySelector(".hero"), name: "hero" },
      { element: document.querySelector(".services"), name: "services" },
      { element: document.querySelector(".portfolio"), name: "projects" },
      { element: document.querySelector(".contact"), name: "contact" },
    ];

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section.element && scrollPosition >= section.element.offsetTop) {
        if (this.currentSection !== section.name) {
          this.currentSection = section.name;
          this.updateParticleColors();
        }
        break;
      }
    }
  }

  updateParticleColors() {
    const targetColor = this.sectionColors[this.currentSection];

    this.particles.forEach((particle) => {
      // Gradually transition colors
      particle.color = { ...targetColor };
    });
  }

  cullInvisibleParticles() {
    const margin = 100;
    const bounds = {
      left: -margin,
      right: window.innerWidth + margin,
      top: -margin,
      bottom: window.innerHeight + margin,
    };

    let culledCount = 0;

    this.particles.forEach((particle) => {
      const isVisible =
        particle.x >= bounds.left &&
        particle.x <= bounds.right &&
        particle.y >= bounds.top &&
        particle.y <= bounds.bottom;

      if (!isVisible && this.visibleParticles.has(particle)) {
        this.visibleParticles.delete(particle);
        culledCount++;
      } else if (isVisible && !this.visibleParticles.has(particle)) {
        this.visibleParticles.add(particle);
      }
    });

    this.performanceMetrics.particlesRendered = this.visibleParticles.size;
  }

  updateParticle(particle, deltaTime) {
    const now = performance.now();

    // Skip update if particle was recently updated
    if (now - particle.lastUpdate < 16) return;
    particle.lastUpdate = now;

    // Apply base velocity
    particle.x += particle.vx * deltaTime * 0.01;
    particle.y += particle.vy * deltaTime * 0.01;

    // Mouse interaction (only for nearby particles)
    const dx = this.mouseX - particle.x;
    const dy = this.mouseY - particle.y;
    const distance = dx * dx + dy * dy; // Skip sqrt for performance

    if (distance < this.mouseInfluenceRadius * this.mouseInfluenceRadius) {
      const normalizedDistance = Math.sqrt(distance);
      const force =
        (this.mouseInfluenceRadius - normalizedDistance) /
        this.mouseInfluenceRadius;
      const influence = force * particle.parallaxFactor * 0.0005;

      particle.vx += dx * influence;
      particle.vy += dy * influence;
    }

    // Parallax scrolling effect
    const parallaxOffset = this.scrollY * particle.parallaxFactor * 0.1;

    // Smooth movement towards target position
    const targetX =
      particle.baseX +
      (this.mouseX - particle.baseX) * particle.parallaxFactor * 0.01;
    const targetY =
      particle.baseY +
      (this.mouseY - particle.baseY) * particle.parallaxFactor * 0.01 +
      parallaxOffset;

    particle.x += (targetX - particle.x) * 0.02;
    particle.y += (targetY - particle.y) * 0.02;

    // Apply damping
    particle.vx *= 0.98;
    particle.vy *= 0.98;

    // Boundary wrapping
    if (particle.x < -50) particle.x = window.innerWidth + 50;
    if (particle.x > window.innerWidth + 50) particle.x = -50;
    if (particle.y < -50) particle.y = window.innerHeight + 50;
    if (particle.y > window.innerHeight + 50) particle.y = -50;
  }

  renderParticle(particle) {
    const { r, g, b, a } = particle.color;

    this.ctx.save();
    this.ctx.globalAlpha = particle.opacity * a;

    // Use efficient rectangle instead of arc when possible
    if (particle.size <= 2) {
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
      this.ctx.fillRect(
        particle.x - particle.size / 2,
        particle.y - particle.size / 2,
        particle.size,
        particle.size
      );
    } else {
      // Use arc for larger particles with glow effect
      this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fill();

      // Add subtle glow for larger particles
      if (particle.size > 2) {
        this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
        this.ctx.shadowBlur = particle.size * 2;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
      }
    }

    this.ctx.restore();
  }

  animate(currentTime = performance.now()) {
    if (!this.isVisible || this.isPaused) return;

    const deltaTime = currentTime - this.lastFrame;

    // Maintain target FPS
    if (deltaTime < this.frameInterval) {
      requestAnimationFrame((time) => this.animate(time));
      return;
    }

    this.lastFrame = currentTime;
    this.frameCount++;

    // Clear canvas efficiently
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Cull invisible particles every 30 frames (~0.5 seconds at 60fps)
    if (this.frameCount % 30 === 0) {
      this.cullInvisibleParticles();
    }

    // Update and render only visible particles
    let rendered = 0;
    this.visibleParticles.forEach((particle) => {
      this.updateParticle(particle, deltaTime);
      this.renderParticle(particle);
      rendered++;
    });

    this.performanceMetrics.frameTime = performance.now() - currentTime;
    this.performanceMetrics.particlesRendered = rendered;

    requestAnimationFrame((time) => this.animate(time));
  }

  optimizeForPerformance() {
    const now = performance.now();

    // Don't optimize too frequently
    if (now - this.performanceMetrics.lastOptimization < 5000) return;
    this.performanceMetrics.lastOptimization = now;

    // Reduce particle count
    const targetReduction = Math.floor(this.particles.length * 0.2);
    for (let i = 0; i < targetReduction; i++) {
      const particle =
        this.particles[Math.floor(Math.random() * this.particles.length)];
      if (particle) {
        this.returnParticleToPool(particle);
      }
    }

    // Reduce mouse influence radius
    this.mouseInfluenceRadius = Math.max(this.mouseInfluenceRadius * 0.8, 75);

    console.log(
      `🔧 Performance optimization: Reduced particles to ${this.particles.length}`
    );
  }

  optimizeParticleCount() {
    const difference = this.maxParticles - this.particles.length;

    if (difference > 0) {
      // Add particles
      for (let i = 0; i < difference; i++) {
        this.activateParticle();
      }
    } else if (difference < 0) {
      // Remove particles
      for (let i = 0; i < Math.abs(difference); i++) {
        const particle =
          this.particles[Math.floor(Math.random() * this.particles.length)];
        if (particle) {
          this.returnParticleToPool(particle);
        }
      }
    }
  }

  start() {
    this.isPaused = false;
    this.animate();
  }

  pause() {
    this.isPaused = true;
  }

  resume() {
    if (this.isPaused) {
      this.isPaused = false;
      this.animate();
    }
  }

  destroy() {
    this.pause();
    this.particles = [];
    this.particlePool = [];
    this.visibleParticles.clear();

    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  // Public API for performance monitoring
  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      activeParticles: this.particles.length,
      visibleParticles: this.visibleParticles.size,
      poolSize: this.particlePool.length,
      currentSection: this.currentSection,
    };
  }
}

// Module initialization
const ParticleSystemModule = {
  instance: null,

  async init() {
    try {
      this.instance = new VirtualParticleSystem();
      return this.instance;
    } catch (error) {
      console.error("Failed to initialize particle system:", error);
      return null;
    }
  },

  getInstance() {
    return this.instance;
  },

  destroy() {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  },
};

export default ParticleSystemModule;
