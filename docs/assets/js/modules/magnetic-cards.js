/**
 * Enhanced Magnetic Cards with Advanced Morphing Effects
 * Extends the existing magnetic-cards.js module
 */

class MorphingGlassCards {
  constructor() {
    this.morphTimelines = new Map();
    this.isGSAPLoaded = typeof gsap !== "undefined";
    this._cardListeners = new Map(); // Track event listeners for cleanup
    this.init();
  }

  // Helper to add and track event listeners
  _addCardListener(card, type, handler) {
    card.addEventListener(type, handler);
    if (!this._cardListeners.has(card)) {
      this._cardListeners.set(card, []);
    }
    this._cardListeners.get(card).push({ type, handler });
  }

  init() {
    if (this.isGSAPLoaded) {
      this.initAdvancedMorphing();
    } else {
      this.initBasicMorphing();
    }
  }

  initAdvancedMorphing() {
    gsap.utils.toArray(".service-card").forEach((card, index) => {
      const morphTl = gsap.timeline({ paused: true });

      // Create complex morphing sequence
      morphTl
        .to(card, {
          borderRadius: "50px",
          scale: 1.05,
          rotationY: 5,
          z: 20,
          duration: 0.3,
          ease: "elastic.out(1, 0.3)",
        })
        .to(
          card.querySelector(".service-icon"),
          {
            rotation: 360,
            scale: 1.2,
            z: 30,
            duration: 0.5,
            ease: "back.out(1.7)",
          },
          0
        )
        .to(
          card.querySelector("h3"),
          {
            y: -5,
            scale: 1.1,
            color: "#00fff7",
            textShadow: "0 0 20px rgba(0, 255, 247, 0.5)",
            duration: 0.3,
            ease: "power2.out",
          },
          0.1
        )
        .to(
          card.querySelector("p"),
          {
            y: -3,
            opacity: 0.9,
            duration: 0.2,
          },
          0.15
        );

      this.morphTimelines.set(card, morphTl);

      // Enhanced event listeners (use named handlers)
      const mouseEnterHandler = () => {
        morphTl.play();
        card.classList.add("morphing");
        this.createMorphingParticles(card);
      };
      const mouseLeaveHandler = () => {
        morphTl.reverse();
        card.classList.remove("morphing");
      };
      this._addCardListener(card, "mouseenter", mouseEnterHandler);
      this._addCardListener(card, "mouseleave", mouseLeaveHandler);
    });

    // Initialize portfolio card morphing
    this.initPortfolioMorphing();
  }

  initBasicMorphing() {
    // Fallback for when GSAP is not loaded
    document.querySelectorAll(".service-card").forEach((card) => {
      const mouseEnterHandler = () => {
        card.classList.add("morphing");
        this.createMorphingParticles(card);
      };
      const mouseLeaveHandler = () => {
        card.classList.remove("morphing");
      };
      this._addCardListener(card, "mouseenter", mouseEnterHandler);
      this._addCardListener(card, "mouseleave", mouseLeaveHandler);
    });
  }

  initPortfolioMorphing() {
    if (!this.isGSAPLoaded) return;

    gsap.utils.toArray(".portfolio-card").forEach((card) => {
      const image = card.querySelector(".card-image img");
      const content = card.querySelector(".card-content");

      const portfolioTl = gsap.timeline({ paused: true });

      portfolioTl
        .to(card, {
          y: -15,
          rotationX: 8,
          rotationY: 8,
          scale: 1.02,
          duration: 0.4,
          ease: "power2.out",
        })
        .to(
          image,
          {
            scale: 1.1,
            rotation: 2,
            filter: "brightness(1.1) contrast(1.1) saturate(1.2)",
            duration: 0.3,
          },
          0
        )
        .to(
          content,
          {
            y: -5,
            duration: 0.3,
          },
          0.1
        );

      const mouseEnterHandler = () => {
        portfolioTl.play();
        card.classList.add("morphing");
      };
      const mouseLeaveHandler = () => {
        portfolioTl.reverse();
        card.classList.remove("morphing");
      };
      this._addCardListener(card, "mouseenter", mouseEnterHandler);
      this._addCardListener(card, "mouseleave", mouseLeaveHandler);
    });
  }

  createMorphingParticles(card) {
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const particleCount = 8;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "morph-particle";
      particle.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: radial-gradient(circle, #00fff7, transparent);
        border-radius: 50%;
        pointer-events: none;
        z-index: 999;
        left: ${rect.left + rect.width * Math.random()}px;
        top: ${rect.top + rect.height * Math.random()}px;
        opacity: 1;
        transform: scale(0);
      `;

      document.body.appendChild(particle);

      // Animate particle
      if (this.isGSAPLoaded) {
        gsap.to(particle, {
          scale: Math.random() * 2 + 1,
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100,
          opacity: 0,
          duration: 1 + Math.random(),
          ease: "power2.out",
          onComplete: () => particle.remove(),
        });
      } else {
        // CSS fallback animation
        particle.style.animation = "morphParticleFade 1s ease-out forwards";
        setTimeout(() => particle.remove(), 1000);
      }
    }
  }

  destroy() {
    // Remove all tracked event listeners
    this._cardListeners.forEach((listeners, card) => {
      listeners.forEach(({ type, handler }) => {
        card.removeEventListener(type, handler);
      });
    });
    this._cardListeners.clear();
    this.morphTimelines.forEach((timeline) => timeline.kill());
    this.morphTimelines.clear();
  }
}

// Enhanced MagneticCards class that extends the original
class EnhancedMagneticCards {
  constructor() {
    this.morphingCards = new MorphingGlassCards();
    this.quantumEffects = new QuantumMagneticField();
  }

  handleMouseMove(e, card) {
    // Add quantum field effect
    this.quantumEffects.updateField(e, card);
  }

  destroy() {
    this.morphingCards.destroy();
    this.quantumEffects.destroy();
  }
}

// Quantum magnetic field effects
class QuantumMagneticField {
  constructor() {
    this.fieldStrength = 0;
    this.resonance = 0;
    this.lastUpdate = performance.now();
    this.fieldParticles = [];
    this.originalFilters = new Map(); // Store original filter values for each card
  }

  updateField(e, card) {
    const now = performance.now();
    const deltaTime = now - this.lastUpdate;
    this.lastUpdate = now;

    // Calculate field strength based on mouse proximity
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
    );

    this.fieldStrength = Math.max(0, 1 - distance / 200);
    this.resonance += deltaTime * 0.001 * this.fieldStrength;

    // Create field visualization
    if (this.fieldStrength > 0.3 && Math.random() < 0.3) {
      this.createFieldParticle(e.clientX, e.clientY, card);
    }

    // Apply quantum field effects to card
    this.applyFieldEffects(card);
  }

  createFieldParticle(x, y, card) {
    const particle = document.createElement("div");
    particle.className = "quantum-field-particle";
    particle.style.cssText = `
      position: fixed;
      width: 2px;
      height: 2px;
      background: radial-gradient(circle, rgba(0, 255, 247, 0.8), transparent);
      border-radius: 50%;
      pointer-events: none;
      z-index: 998;
      left: ${x}px;
      top: ${y}px;
      transform: translate(-50%, -50%);
    `;

    document.body.appendChild(particle);

    // Add particle to tracking array
    this.fieldParticles.push(particle);

    // Animate field particle
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 100;
    const duration = 0.8 + Math.random() * 0.4;

    if (typeof gsap !== "undefined") {
      gsap.to(particle, {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        scale: 0,
        opacity: 0,
        duration: duration,
        ease: "power2.out",
        onComplete: () => {
          particle.remove();
          // Remove from tracking array when animation completes
          const index = this.fieldParticles.indexOf(particle);
          if (index > -1) {
            this.fieldParticles.splice(index, 1);
          }
        },
      });
    } else {
      particle.style.animation = `fieldParticleMove ${duration}s ease-out forwards`;
      setTimeout(() => {
        particle.remove();
        // Remove from tracking array when animation completes
        const index = this.fieldParticles.indexOf(particle);
        if (index > -1) {
          this.fieldParticles.splice(index, 1);
        }
      }, duration * 1000);
    }
  }

  applyFieldEffects(card) {
    // Store original filter if not already stored
    if (!this.originalFilters.has(card)) {
      this.originalFilters.set(card, card.style.filter || "");
    }

    if (this.fieldStrength > 0.5) {
      const oscillation = Math.sin(this.resonance * 4) * 2;
      const quantumFilter = `
        brightness(${1 + this.fieldStrength * 0.1}) 
        hue-rotate(${oscillation}deg)
        drop-shadow(0 0 ${this.fieldStrength * 20}px rgba(0, 255, 247, 0.3))
      `;

      // Combine original filter with quantum effects
      const originalFilter = this.originalFilters.get(card);
      card.style.filter = originalFilter
        ? `${originalFilter} ${quantumFilter}`
        : quantumFilter;
    } else {
      // Restore original filter
      card.style.filter = this.originalFilters.get(card);
    }
  }

  destroy() {
    // Restore original filters for all cards
    this.originalFilters.forEach((originalFilter, card) => {
      card.style.filter = originalFilter;
    });
    this.originalFilters.clear();

    this.fieldParticles.forEach((particle) => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    });
    this.fieldParticles = [];
  }
}

// CSS animations for fallback
const fallbackStyles = `
  @keyframes morphParticleFade {
    0% { opacity: 1; transform: scale(0); }
    50% { opacity: 0.8; transform: scale(2); }
    100% { opacity: 0; transform: scale(0.5) translate(50px, -50px); }
  }

  @keyframes fieldParticleMove {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(0) translate(100px, 100px); }
  }
`;

// Inject fallback styles
if (!document.getElementById("morphing-fallback-styles")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "morphing-fallback-styles";
  styleSheet.textContent = fallbackStyles;
  document.head.appendChild(styleSheet);
}

// Export the enhanced module
export default {
  async init() {
    // Initialize enhanced magnetic cards
    new EnhancedMagneticCards();
    console.log("🔮 Enhanced Magnetic Cards with morphing effects initialized");
  },
};
