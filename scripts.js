const DEBUG = false;

class ParticleSystem {
  constructor() {
    this.backgroundLayer = document.getElementById("backgroundParticles");
    this.midgroundLayer = document.getElementById("midgroundParticles");
    this.foregroundLayer = document.getElementById("foregroundParticles");

    this.particleLayers = {
      background: {
        particles: [],
        layer: this.backgroundLayer,
        speed: 0.005,
        parallaxFactor: 0.2,
      },
      midground: {
        particles: [],
        layer: this.midgroundLayer,
        speed: 0.01,
        parallaxFactor: 0.4,
      },
      foreground: {
        particles: [],
        layer: this.foregroundLayer,
        speed: 0.015,
        parallaxFactor: 0.6,
      },
    };

    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.scrollY = 0;
    this.currentSection = "hero";
    this.lastMouseUpdate = 0;

    this.init();
    this.bindEvents();
    this.animate();
  }

  init() {
    const totalParticles = Math.floor(window.innerWidth / 25);
    const particlesPerLayer = Math.floor(totalParticles / 3);

    Object.keys(this.particleLayers).forEach((layerName, index) => {
      const particleCount =
        index === 0
          ? particlesPerLayer + (totalParticles % 3)
          : particlesPerLayer;
      for (let i = 0; i < particleCount; i++) {
        this.createParticle(layerName);
      }
    });
  }

  createParticle(layerName) {
    const layerData = this.particleLayers[layerName];
    const particle = document.createElement("div");
    particle.className = "particle";

    const sizes = ["small", "medium", "large"];
    const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
    particle.classList.add(randomSize);

    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;

    particle.style.left = x + "px";
    particle.style.top = y + "px";

    layerData.layer.appendChild(particle);

    layerData.particles.push({
      element: particle,
      baseX: x,
      baseY: y,
      currentX: x,
      currentY: y,
      speed: layerData.speed + Math.random() * 0.01,
      parallaxFactor: layerData.parallaxFactor,
    });
  }

  updateParticleTheme(section) {
    if (this.currentSection === section) return;
    this.currentSection = section;

    Object.values(this.particleLayers).forEach((layerData) => {
      layerData.particles.forEach((particle) => {
        particle.element.className = `particle ${particle.element.classList[1]} ${section}-section`;
      });
    });
  }

  bindEvents() {
    document.addEventListener("mousemove", (e) => {
      if (Date.now() - this.lastMouseUpdate > 16) {
        this.mouseX = e.clientX;
        this.mouseY = e.clientY;
        this.lastMouseUpdate = Date.now();
      }
    });

    window.addEventListener("scroll", () => {
      this.scrollY = window.scrollY;
    });

    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }

  handleResize() {
    Object.values(this.particleLayers).forEach((layerData) => {
      layerData.particles.forEach((particle) => {
        particle.element.remove();
      });
      layerData.particles = [];
    });
    this.init();
  }

  animate() {
    this.frameCount = (this.frameCount || 0) + 1;
    if (this.frameCount % 2 === 0) {
      Object.values(this.particleLayers).forEach((layerData) => {
        layerData.particles.forEach((particle) => {
          const dx = this.mouseX - particle.baseX;
          const dy = this.mouseY - particle.baseY;

          const mouseInfluence = particle.speed * particle.parallaxFactor;
          const parallaxOffset = this.scrollY * particle.parallaxFactor * 0.1;

          const targetX = particle.baseX + dx * mouseInfluence;
          const targetY = particle.baseY + dy * mouseInfluence + parallaxOffset;

          particle.currentX += (targetX - particle.currentX) * 0.05;
          particle.currentY += (targetY - particle.currentY) * 0.05;

          const translateX = particle.currentX - particle.baseX;
          const translateY = particle.currentY - particle.baseY;

          particle.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
        });
      });
    }
    requestAnimationFrame(() => this.animate());
  }
}

class ScrollThemeManager {
  constructor(particleSystem) {
    this.particleSystem = particleSystem;
    this.sections = [
      { element: document.querySelector(".hero"), name: "hero" },
      { element: document.querySelector(".services"), name: "services" },
      { element: document.querySelector(".portfolio"), name: "projects" },
      { element: document.querySelector(".contact"), name: "contact" },
    ];
    this.init();
  }

  init() {
    window.addEventListener("scroll", () => {
      this.updateTheme();
    });
    this.updateTheme();
  }

  updateTheme() {
    const scrollPosition = window.scrollY + window.innerHeight / 2;

    for (let i = this.sections.length - 1; i >= 0; i--) {
      const section = this.sections[i];
      if (section.element && scrollPosition >= section.element.offsetTop) {
        this.particleSystem.updateParticleTheme(section.name);
        break;
      }
    }
  }
}

class MagneticCards {
  constructor() {
    this.cards = document.querySelectorAll("[data-tilt]");
    this.init();
  }

  init() {
    this.cards.forEach((card) => {
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

    const mouseXPercent = (x / rect.width) * 100;
    const mouseYPercent = (y / rect.height) * 100;
    card.style.setProperty("--mouse-x", `${mouseXPercent}%`);
    card.style.setProperty("--mouse-y", `${mouseYPercent}%`);
  }

  handleMouseLeave(e, card) {
    card.style.transform =
      "perspective(1000px) rotateX(0deg) rotateY(0deg) translateX(0px) translateY(0px) translateZ(0px)";
  }
}

class ServiceCardEffects {
  constructor() {
    this.serviceCards = document.querySelectorAll(".service-card");
    this.init();
  }

  init() {
    this.serviceCards.forEach((card) => {
      card.addEventListener("mouseenter", (e) => this.handleHover(e, card));
    });
  }

  handleHover(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        this.createPulseParticle(e.clientX, e.clientY);
      }, i * 50);
    }
  }

  createPulseParticle(x, y) {
    const particle = document.createElement("div");
    particle.className = "pulse-particle";

    const size = 3 + Math.random() * 5;
    particle.style.width = size + "px";
    particle.style.height = size + "px";
    particle.style.left = x + "px";
    particle.style.top = y + "px";

    const randomX = (Math.random() - 0.5) * 100;
    const randomY = (Math.random() - 0.5) * 100;
    particle.style.setProperty("--random-x", randomX + "px");
    particle.style.setProperty("--random-y", randomY + "px");

    document.body.appendChild(particle);

    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, 1000);
  }
}

class CustomCursor {
  constructor() {
    this.cursor = document.getElementById("customCursor");
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

    this.cursor.style.display = "block";
  }
}

class ParticleTrail {
  constructor() {
    this.container = document.getElementById("particleTrail");
    this.particles = [];
    this.lastEmitTime = 0;
    this.init();
  }

  init() {
    document.addEventListener("mousemove", (e) => {
      this.createTrailParticle(e.clientX, e.clientY);
    });
  }

  createTrailParticle(x, y) {
    const now = Date.now();
    if (now - this.lastEmitTime < 30) return;
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

      if (particle.classList.contains("shard")) {
        particle.style.transform = `rotate(${Math.random() * 360}deg)`;
      }

      this.container.appendChild(particle);

      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1200);
    }
  }
}

class FloatAnimation {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll(".portfolio-card").forEach((card, i) => {
      card.classList.add("float-card");
      card.style.animationDuration = `${5 + Math.random() * 3}s`;
      card.style.animationDelay = `${Math.random() * 2}s`;
    });

    document.querySelectorAll(".service-card").forEach((card, i) => {
      card.classList.add("float-card");
      card.style.animationDuration = `${6 + Math.random() * 2}s`;
      card.style.animationDelay = `${Math.random() * 1.5}s`;
    });

    document.querySelectorAll(".value-card").forEach((card, i) => {
      card.classList.add("float-card");
      card.style.animationDuration = `${6 + Math.random() * 2}s`;
      card.style.animationDelay = `${Math.random() * 1.5}s`;
    });
  }
}

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

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const particleSystem = new ParticleSystem();
    new ScrollThemeManager(particleSystem);
    new MagneticCards();
    new ServiceCardEffects();
    new CustomCursor();
    new ParticleTrail();
    new FloatAnimation();

    if (DEBUG) {
      console.log("All systems initialized");
    }
  }, 100);
});

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

if (DEBUG) {
  window.addEventListener("load", () => {
    console.log("Page fully loaded");
    console.log("Performance timing:", performance.timing);
  });
}

console.log("CrystalCode Enhanced Scripts loaded successfully! 🚀");
