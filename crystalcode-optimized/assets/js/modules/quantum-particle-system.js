/**
 * Quantum Particle Trails System
 * Extends the existing particle system with quantum effects
 */

class QuantumParticleTrails extends VirtualParticleSystem {
  constructor() {
    super();
    this.quantumStates = ["entangled", "superposition", "collapsed"];
    this.trailHistory = [];
    this.maxTrails = 10;
    this.quantumField = new Map();
    this.entanglementPairs = new Set();
    this.coherenceField = 0;
    this.lastQuantumUpdate = 0;

    this.initQuantumMouse();
    console.log("⚛️ Quantum Particle Trails initialized");
  }

  initQuantumMouse() {
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseVelocity = 0;

    document.addEventListener(
      "mousemove",
      (e) => {
        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;
        mouseVelocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        // Create quantum trails based on mouse velocity
        if (mouseVelocity > 5 && Math.random() < 0.4) {
          this.createQuantumTrail(e.clientX, e.clientY, mouseVelocity);
        }

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
      },
      { passive: true }
    );

    // Update quantum field periodically
    setInterval(() => this.updateQuantumField(), 50);
  }

  createQuantumTrail(mouseX, mouseY, velocity = 1) {
    const trailEnergy = Math.min(velocity / 20, 1);
    const state = this.selectQuantumState(trailEnergy);

    const trail = {
      id: Date.now() + Math.random(),
      particles: [],
      state: state,
      energy: trailEnergy,
      coherence: Math.random() * trailEnergy,
      birthTime: performance.now(),
      lifetime: 2000 + Math.random() * 3000,
      centerX: mouseX,
      centerY: mouseY,
    };

    // Create quantum-entangled particle group
    const particleCount = this.getParticleCount(state, trailEnergy);

    for (let i = 0; i < particleCount; i++) {
      const particle = this.activateQuantumParticle(mouseX, mouseY, trail, i);
      if (particle) {
        trail.particles.push(particle);
      }
    }

    // Add to trail history and manage memory
    this.trailHistory.push(trail);
    if (this.trailHistory.length > this.maxTrails) {
      const oldTrail = this.trailHistory.shift();
      this.deactivateTrail(oldTrail);
    }

    this.processQuantumInteractions(trail);
    this.updateQuantumField();
  }

  selectQuantumState(energy) {
    if (energy > 0.8) return "entangled";
    if (energy > 0.4) return "superposition";
    return "collapsed";
  }

  getParticleCount(state, energy) {
    const baseCount = Math.floor(energy * 8) + 2;
    switch (state) {
      case "entangled":
        return baseCount * 2;
      case "superposition":
        return Math.floor(baseCount * 1.5);
      case "collapsed":
        return baseCount;
      default:
        return baseCount;
    }
  }

  activateQuantumParticle(mouseX, mouseY, trail, index) {
    const particle = this.getParticleFromPool();
    if (!particle) return null;

    // Position particles based on quantum state
    const offset = this.calculateQuantumOffset(
      trail.state,
      index,
      trail.energy
    );

    particle.x = mouseX + offset.x;
    particle.y = mouseY + offset.y;
    particle.baseX = particle.x;
    particle.baseY = particle.y;

    // Quantum properties
    particle.quantumState = trail.state;
    particle.entanglementIndex = index;
    particle.trailId = trail.id;
    particle.energy = trail.energy;
    particle.coherence = trail.coherence;
    particle.phase = index * ((Math.PI * 2) / trail.particles.length);

    // Visual properties based on quantum state
    this.setQuantumVisuals(particle, trail);

    // Quantum velocities
    this.setQuantumVelocity(particle, trail, index);

    return particle;
  }

  calculateQuantumOffset(state, index, energy) {
    const radius = 15 + energy * 20;

    switch (state) {
      case "entangled":
        // Particles arranged in symmetric pairs
        const pairAngle =
          (index % 2) * Math.PI + (Math.floor(index / 2) * Math.PI) / 4;
        return {
          x: Math.cos(pairAngle) * radius,
          y: Math.sin(pairAngle) * radius,
        };

      case "superposition":
        // Particles in quantum superposition (overlapping positions)
        const superAngle = Math.random() * Math.PI * 2;
        const superRadius = radius * (0.5 + Math.random() * 0.5);
        return {
          x: Math.cos(superAngle) * superRadius,
          y: Math.sin(superAngle) * superRadius,
        };

      case "collapsed":
        // Particles in definite positions
        const collapsedAngle = (index / 8) * Math.PI * 2;
        return {
          x: Math.cos(collapsedAngle) * radius * 0.7,
          y: Math.sin(collapsedAngle) * radius * 0.7,
        };

      default:
        return { x: 0, y: 0 };
    }
  }

  setQuantumVisuals(particle, trail) {
    switch (trail.state) {
      case "entangled":
        particle.color = { r: 0, g: 255, b: 247, a: 0.8 };
        particle.size = 2 + trail.energy * 2;
        particle.opacity = 0.7 + trail.energy * 0.3;
        break;

      case "superposition":
        particle.color = {
          r: Math.floor(106 + Math.random() * 149),
          g: Math.floor(141 + Math.random() * 114),
          b: 255,
          a: 0.6,
        };
        particle.size = 1.5 + Math.random() * 2;
        particle.opacity = 0.4 + Math.random() * 0.4;
        break;

      case "collapsed":
        particle.color = { r: 255, g: 179, b: 0, a: 0.7 };
        particle.size = 1 + trail.energy;
        particle.opacity = 0.8;
        break;
    }
  }

  setQuantumVelocity(particle, trail, index) {
    const baseSpeed = 0.5 + trail.energy * 0.3;

    switch (trail.state) {
      case "entangled":
        // Synchronized movement
        particle.vx = Math.cos(particle.phase) * baseSpeed;
        particle.vy = Math.sin(particle.phase) * baseSpeed;
        particle.angularVelocity = 0.02;
        break;

      case "superposition":
        // Probabilistic movement
        particle.vx = (Math.random() - 0.5) * baseSpeed * 2;
        particle.vy = (Math.random() - 0.5) * baseSpeed * 2;
        particle.uncertainty = 0.1;
        break;

      case "collapsed":
        // Definite trajectory
        const angle = (index / 8) * Math.PI * 2;
        particle.vx = Math.cos(angle) * baseSpeed * 0.7;
        particle.vy = Math.sin(angle) * baseSpeed * 0.7;
        break;
    }
  }

  processQuantumInteractions(trail) {
    const now = performance.now();

    switch (trail.state) {
      case "entangled":
        this.processEntanglement(trail, now);
        break;

      case "superposition":
        this.processSuperposition(trail, now);
        break;

      case "collapsed":
        this.processCollapse(trail, now);
        break;
    }
  }

  processEntanglement(trail, now) {
    // Create entangled pairs
    for (let i = 0; i < trail.particles.length; i += 2) {
      if (i + 1 < trail.particles.length) {
        const particle1 = trail.particles[i];
        const particle2 = trail.particles[i + 1];

        // Entangled particles mirror each other's movements
        particle1.entangledWith = particle2;
        particle2.entangledWith = particle1;

        this.entanglementPairs.add({
          p1: particle1,
          p2: particle2,
          trailId: trail.id,
        });
      }
    }
  }

  processSuperposition(trail, now) {
    // Particles exist in multiple states simultaneously
    trail.particles.forEach((particle) => {
      particle.superpositionStates = [
        {
          x: particle.x + Math.random() * 10 - 5,
          y: particle.y + Math.random() * 10 - 5,
        },
        {
          x: particle.x + Math.random() * 10 - 5,
          y: particle.y + Math.random() * 10 - 5,
        },
        {
          x: particle.x + Math.random() * 10 - 5,
          y: particle.y + Math.random() * 10 - 5,
        },
      ];
      particle.stateIndex = 0;
      particle.stateChangeTime = now + Math.random() * 100;
    });
  }

  processCollapse(trail, now) {
    // Particles move toward definite positions
    trail.particles.forEach((particle) => {
      particle.targetX = trail.centerX + (Math.random() - 0.5) * 50;
      particle.targetY = trail.centerY + (Math.random() - 0.5) * 50;
      particle.collapseSpeed = 0.05 + Math.random() * 0.05;
    });
  }

  updateQuantumField() {
    const now = performance.now();

    // Clean up expired trails
    this.trailHistory = this.trailHistory.filter((trail) => {
      const age = now - trail.birthTime;
      if (age > trail.lifetime) {
        this.deactivateTrail(trail);
        return false;
      }
      return true;
    });

    // Update quantum coherence field
    this.coherenceField = this.calculateFieldCoherence();

    // Update entangled particles
    this.updateEntangledParticles(now);

    // Update superposition particles
    this.updateSuperpositionParticles(now);

    // Update collapsed particles
    this.updateCollapsedParticles(now);
  }

  calculateFieldCoherence() {
    let totalCoherence = 0;
    let totalEnergy = 0;

    this.trailHistory.forEach((trail) => {
      totalCoherence += trail.coherence * trail.energy;
      totalEnergy += trail.energy;
    });

    return totalEnergy > 0 ? totalCoherence / totalEnergy : 0;
  }

  updateEntangledParticles(now) {
    this.entanglementPairs.forEach((pair) => {
      if (pair.p1.active && pair.p2.active) {
        // Synchronized orbital motion
        const time = now * 0.001;
        const orbitRadius = 30 + pair.p1.energy * 20;

        pair.p1.x =
          pair.p1.baseX + Math.cos(time * 2 + pair.p1.phase) * orbitRadius;
        pair.p1.y =
          pair.p1.baseY + Math.sin(time * 2 + pair.p1.phase) * orbitRadius;

        // Entangled particle mirrors the movement
        pair.p2.x =
          pair.p2.baseX +
          Math.cos(time * 2 + pair.p2.phase + Math.PI) * orbitRadius;
        pair.p2.y =
          pair.p2.baseY +
          Math.sin(time * 2 + pair.p2.phase + Math.PI) * orbitRadius;

        // Update opacity based on coherence
        const coherence = this.coherenceField;
        pair.p1.opacity = 0.3 + coherence * 0.7;
        pair.p2.opacity = 0.3 + coherence * 0.7;
      }
    });
  }

  updateSuperpositionParticles(now) {
    this.particles.forEach((particle) => {
      if (
        particle.quantumState === "superposition" &&
        particle.superpositionStates
      ) {
        // Switch between quantum states
        if (now > particle.stateChangeTime) {
          particle.stateIndex =
            (particle.stateIndex + 1) % particle.superpositionStates.length;
          particle.stateChangeTime = now + 50 + Math.random() * 100;

          const targetState = particle.superpositionStates[particle.stateIndex];
          particle.targetX = targetState.x;
          particle.targetY = targetState.y;
        }

        // Interpolate between states
        if (particle.targetX !== undefined) {
          particle.x += (particle.targetX - particle.x) * 0.1;
          particle.y += (particle.targetY - particle.y) * 0.1;
        }

        // Quantum uncertainty visualization
        particle.opacity = 0.2 + Math.sin(now * 0.01) * 0.3 + 0.3;
        particle.size = 1 + Math.sin(now * 0.008) * 0.5;
      }
    });
  }

  updateCollapsedParticles(now) {
    this.particles.forEach((particle) => {
      if (
        particle.quantumState === "collapsed" &&
        particle.targetX !== undefined
      ) {
        // Move toward collapsed state
        particle.x += (particle.targetX - particle.x) * particle.collapseSpeed;
        particle.y += (particle.targetY - particle.y) * particle.collapseSpeed;

        // Fade out as particle reaches target
        const distance = Math.sqrt(
          Math.pow(particle.targetX - particle.x, 2) +
            Math.pow(particle.targetY - particle.y, 2)
        );

        particle.opacity = Math.max(0, distance / 50);

        if (distance < 2) {
          this.returnParticleToPool(particle);
        }
      }
    });
  }

  deactivateTrail(trail) {
    // Clean up trail particles
    trail.particles.forEach((particle) => {
      this.returnParticleToPool(particle);
    });

    // Remove entanglement pairs
    this.entanglementPairs.forEach((pair) => {
      if (pair.trailId === trail.id) {
        this.entanglementPairs.delete(pair);
      }
    });
  }

  // Override parent render method to add quantum effects
  renderParticle(particle) {
    if (!particle.quantumState) {
      // Render normal particles using parent method
      super.renderParticle(particle);
      return;
    }

    const { r, g, b, a } = particle.color;

    this.ctx.save();
    this.ctx.globalAlpha = particle.opacity * a;

    // Quantum-specific rendering
    switch (particle.quantumState) {
      case "entangled":
        this.renderEntangledParticle(particle, r, g, b);
        break;

      case "superposition":
        this.renderSuperpositionParticle(particle, r, g, b);
        break;

      case "collapsed":
        this.renderCollapsedParticle(particle, r, g, b);
        break;

      default:
        super.renderParticle(particle);
        break;
    }

    this.ctx.restore();
  }

  renderEntangledParticle(particle, r, g, b) {
    // Render with quantum entanglement glow
    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
    this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.8)`;
    this.ctx.shadowBlur = particle.size * 4;

    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw entanglement connection
    if (particle.entangledWith && particle.entangledWith.active) {
      this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(particle.x, particle.y);
      this.ctx.lineTo(particle.entangledWith.x, particle.entangledWith.y);
      this.ctx.stroke();
    }
  }

  renderSuperpositionParticle(particle, r, g, b) {
    // Render multiple probability states
    if (particle.superpositionStates) {
      particle.superpositionStates.forEach((state, index) => {
        const stateOpacity = index === particle.stateIndex ? 0.8 : 0.2;
        this.ctx.globalAlpha = particle.opacity * stateOpacity;
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;

        this.ctx.beginPath();
        this.ctx.arc(state.x, state.y, particle.size * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
      });
    }

    // Main particle
    this.ctx.globalAlpha = particle.opacity;
    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
    this.ctx.filter = "blur(1px)";
    this.ctx.beginPath();
    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.filter = "none";
  }

  renderCollapsedParticle(particle, r, g, b) {
    // Render with sharp, defined edges
    this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
    this.ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.5)`;
    this.ctx.shadowBlur = particle.size;

    // Draw as a diamond shape for collapsed state
    this.ctx.save();
    this.ctx.translate(particle.x, particle.y);
    this.ctx.rotate(Math.PI / 4);
    this.ctx.fillRect(
      -particle.size,
      -particle.size,
      particle.size * 2,
      particle.size * 2
    );
    this.ctx.restore();
  }

  // Quantum field visualization
  renderQuantumField() {
    if (this.coherenceField < 0.1) return;

    this.ctx.save();
    this.ctx.globalAlpha = this.coherenceField * 0.1;
    this.ctx.fillStyle = "rgba(0, 255, 247, 0.05)";

    // Create field grid
    const gridSize = 50;
    for (let x = 0; x < this.canvas.width; x += gridSize) {
      for (let y = 0; y < this.canvas.height; y += gridSize) {
        const fieldStrength = this.calculateFieldStrength(x, y);
        if (fieldStrength > 0.1) {
          this.ctx.globalAlpha = fieldStrength * 0.2;
          this.ctx.fillRect(x, y, 2, 2);
        }
      }
    }

    this.ctx.restore();
  }

  calculateFieldStrength(x, y) {
    let strength = 0;

    this.particles.forEach((particle) => {
      if (particle.quantumState) {
        const distance = Math.sqrt(
          Math.pow(x - particle.x, 2) + Math.pow(y - particle.y, 2)
        );
        strength += particle.energy / (1 + distance * 0.01);
      }
    });

    return Math.min(strength, 1);
  }

  // Override parent animate method to include quantum rendering
  animate(currentTime = performance.now()) {
    if (!this.isVisible || this.isPaused) return;

    const deltaTime = currentTime - this.lastFrame;

    if (deltaTime < this.frameInterval) {
      requestAnimationFrame((time) => this.animate(time));
      return;
    }

    this.lastFrame = currentTime;
    this.frameCount++;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Render quantum field
    this.renderQuantumField();

    // Update quantum system
    if (this.frameCount % 3 === 0) {
      // Update quantum state every 3 frames
      this.updateQuantumField();
    }

    // Cull invisible particles
    if (this.frameCount % 30 === 0) {
      this.cullInvisibleParticles();
    }

    // Update and render particles
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

  // Debug methods
  getQuantumMetrics() {
    return {
      activeTrails: this.trailHistory.length,
      entanglementPairs: this.entanglementPairs.size,
      coherenceField: this.coherenceField,
      quantumParticles: this.particles.filter((p) => p.quantumState).length,
      stateDistribution: {
        entangled: this.particles.filter((p) => p.quantumState === "entangled")
          .length,
        superposition: this.particles.filter(
          (p) => p.quantumState === "superposition"
        ).length,
        collapsed: this.particles.filter((p) => p.quantumState === "collapsed")
          .length,
      },
    };
  }

  destroy() {
    super.destroy();
    this.trailHistory = [];
    this.entanglementPairs.clear();
    this.quantumField.clear();
  }
}

// Enhanced Particle System Module
const EnhancedParticleSystemModule = {
  instance: null,

  async init() {
    try {
      // Check if canvas exists
      const canvas = document.getElementById("particle-canvas");
      if (!canvas) {
        console.warn(
          "Particle canvas not found, skipping quantum particle system"
        );
        return null;
      }

      this.instance = new QuantumParticleTrails();

      // Add debug interface if in debug mode
      if (window.location.search.includes("debug=particles")) {
        this.addDebugInterface();
      }

      return this.instance;
    } catch (error) {
      console.error("Failed to initialize quantum particle system:", error);
      return null;
    }
  },

  addDebugInterface() {
    const debugPanel = document.createElement("div");
    debugPanel.id = "quantum-debug";
    debugPanel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: #00fff7;
        padding: 10px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 10000;
        min-width: 200px;
      `;
    document.body.appendChild(debugPanel);

    // Update debug info
    setInterval(() => {
      if (this.instance) {
        const metrics = this.instance.getQuantumMetrics();
        debugPanel.innerHTML = `
            <div><strong>Quantum Particle Debug</strong></div>
            <div>Active Trails: ${metrics.activeTrails}</div>
            <div>Entangled Pairs: ${metrics.entanglementPairs}</div>
            <div>Coherence: ${metrics.coherenceField.toFixed(3)}</div>
            <div>Quantum Particles: ${metrics.quantumParticles}</div>
            <div><strong>State Distribution:</strong></div>
            <div>Entangled: ${metrics.stateDistribution.entangled}</div>
            <div>Superposition: ${metrics.stateDistribution.superposition}</div>
            <div>Collapsed: ${metrics.stateDistribution.collapsed}</div>
          `;
      }
    }, 100);
  },

  getInstance() {
    return this.instance;
  },

  destroy() {
    if (this.instance) {
      this.instance.destroy();
      this.instance = null;
    }

    const debugPanel = document.getElementById("quantum-debug");
    if (debugPanel) {
      debugPanel.remove();
    }
  },
};

export default EnhancedParticleSystemModule;
