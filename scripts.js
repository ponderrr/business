// Debug flag
const DEBUG = true;

// Enhanced Particle System
class ParticleSystem {
  constructor() {
    this.container = document.getElementById("particles");
    this.particles = [];
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    console.log("ParticleSystem initialized");
    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    const particleCount = Math.floor(window.innerWidth / 15);
    console.log("Creating", particleCount, "particles");
    for (let i = 0; i < particleCount; i++) {
      this.createParticle();
    }
  }

  createParticle() {
    const particle = document.createElement("div");
    particle.className = "particle";

    const sizes = ["small", "medium", "large"];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    particle.classList.add(randomSize);

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    particle.style.left = x + "px";
    particle.style.top = y + "px";

    this.container.appendChild(particle);

    this.particles.push({
      element: particle,
      baseX: x,
      baseY: y,
      currentX: x,
      currentY: y,
      speed: 0.02 + Math.random() * 0.03,
    });
  }

  bindEvents() {
    document.addEventListener("mousemove", (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });

    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }

  handleResize() {
    this.particles.forEach((particle) => {
      particle.element.remove();
    });
    this.particles = [];
    this.init();
  }

  animate() {
    this.particles.forEach((particle) => {
      const dx = this.mouseX - particle.baseX;
      const dy = this.mouseY - particle.baseY;

      const targetX = particle.baseX + dx * particle.speed;
      const targetY = particle.baseY + dy * particle.speed;

      particle.currentX += (targetX - particle.currentX) * 0.1;
      particle.currentY += (targetY - particle.currentY) * 0.1;

      particle.element.style.transform = `translate(${
        particle.currentX - particle.baseX
      }px, ${particle.currentY - particle.baseY}px)`;
    });

    requestAnimationFrame(() => this.animate());
  }
}

// Magnetic Glass Card System
class MagneticCards {
  constructor() {
    this.cards = document.querySelectorAll("[data-tilt]");
    console.log("MagneticCards found", this.cards.length, "cards");
    this.init();
  }

  init() {
    this.cards.forEach((card, index) => {
      console.log("Setting up card", index);
      card.addEventListener("mousemove", (e) => this.handleMouseMove(e, card));
      card.addEventListener("mouseleave", (e) =>
        this.handleMouseLeave(e, card)
      );
    });
  }

  handleMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // More subtle magnetic effect
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;

    const translateX = ((x - centerX) / centerX) * 3;
    const translateY = ((y - centerY) / centerY) * 3;

    card.style.transform = `
      perspective(1000px) 
      rotateX(${rotateX}deg) 
      rotateY(${rotateY}deg) 
      translateX(${translateX}px) 
      translateY(${translateY}px)
      translateZ(8px)
    `;

    // Update shine effect position
    const mouseXPercent = (x / rect.width) * 100;
    const mouseYPercent = (y / rect.height) * 100;
    card.style.setProperty("--mouse-x", `${mouseXPercent}%`);
    card.style.setProperty("--mouse-y", `${mouseYPercent}%`);

    if (DEBUG) {
      console.log("Card tilt:", rotateX, rotateY);
    }
  }

  handleMouseLeave(e, card) {
    card.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) translateZ(0px)";
  }
}

// Custom Cursor System
class CustomCursor {
  constructor() {
    this.cursor = document.getElementById("customCursor");
    console.log("CustomCursor initialized");
    this.init();
  }

  init() {
    document.addEventListener("mousemove", (e) => {
      this.cursor.style.left = e.clientX + "px";
      this.cursor.style.top = e.clientY + "px";
    });

    document.addEventListener("mousedown", () => {
      this.cursor.classList.add("clicking");
    });

    document.addEventListener("mouseup", () => {
      this.cursor.classList.remove("clicking");
    });

    // Make cursor visible
    this.cursor.style.display = "block";
  }
}

// Particle Trail System
class ParticleTrail {
  constructor() {
    this.container = document.getElementById("particleTrail");
    this.particles = [];
    this.lastEmitTime = 0;
    console.log("ParticleTrail initialized");
    this.init();
  }

  init() {
    document.addEventListener("mousemove", (e) => {
      this.createTrailParticle(e.clientX, e.clientY);
    });
  }

  createTrailParticle(x, y) {
    const now = Date.now();
    if (now - this.lastEmitTime < 30) return; // Faster particle creation
    this.lastEmitTime = now;

    const particleCount = Math.random() < 0.7 ? 1 : 2;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className =
        Math.random() < 0.3 ? "trail-particle shard" : "trail-particle";

      const size = 2 + Math.random() * 6;
      const offsetX = (Math.random() - 0.5) * 15;
      const offsetY = (Math.random() - 0.5) * 15;

      particle.style.width = size + "px";
      particle.style.height = size + "px";
      particle.style.left = x + offsetX + "px";
      particle.style.top = y + offsetY + "px";

      // Add some random rotation for shards
      if (particle.classList.contains("shard")) {
        particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      }

      this.container.appendChild(particle);

      if (DEBUG && Math.random() < 0.1) {
        console.log("Created trail particle at", x, y);
      }

      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1200);
    }
  }
}

// Float Animation System
class FloatAnimation {
  constructor() {
    console.log("FloatAnimation initialized");
    this.init();
  }

  init() {
    // Add float animation to portfolio cards
    document.querySelectorAll(".portfolio-card").forEach((card, i) => {
      card.classList.add("float-card");
      card.style.animationDuration = `${5 + Math.random() * 3}s`; // 5–8s float
      card.style.animationDelay = `${Math.random() * 2}s`; // staggered entry
    });

    // Add float animation to value cards too
    document.querySelectorAll(".value-card").forEach((card, i) => {
      card.classList.add("float-card");
      card.style.animationDuration = `${6 + Math.random() * 2}s`;
      card.style.animationDelay = `${Math.random() * 1.5}s`;
    });
  }
}

// Initialize all systems when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded, initializing systems...");

  // Small delay to ensure everything is rendered
  setTimeout(() => {
    new ParticleSystem();
    new MagneticCards();
    new CustomCursor();
    new ParticleTrail();
    new FloatAnimation();
    console.log("All systems initialized");
  }, 100);
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Additional utility functions
class Utils {
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
}

// Performance monitoring
if (DEBUG) {
  window.addEventListener("load", () => {
    console.log("Page fully loaded");
    console.log("Performance timing:", performance.timing);
  });
}

console.log("AIGlass Scripts loaded successfully! 🚀");
