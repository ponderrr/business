/**
 * GSAP ScrollTrigger Animations Module
 * Modern interactivity enhancements for CrystalCode
 */

"use strict";

class GSAPAnimations {
  constructor() {
    this.initScrollAnimations();
    this.initParallaxEffects();
    this.initMorphingElements();
    this.initMagneticInteractions();
  }

  initScrollAnimations() {
    // Staggered service card reveals with 3D effects
    gsap.fromTo(
      ".service-card",
      {
        y: 100,
        opacity: 0,
        rotationX: -15,
        scale: 0.9,
      },
      {
        y: 0,
        opacity: 1,
        rotationX: 0,
        scale: 1,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".services",
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      }
    );

    // Portfolio cards with magnetic hover
    gsap.utils.toArray(".portfolio-card").forEach((card) => {
      // Reveal animation
      gsap.fromTo(
        card,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );

      // 3D hover animation timeline
      let tl = gsap.timeline({ paused: true });

      tl.to(card, {
        y: -10,
        rotationX: 5,
        rotationY: 5,
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out",
      });

      card.addEventListener("mouseenter", () => tl.play());
      card.addEventListener("mouseleave", () => tl.reverse());
    });

    // Hero animations
    gsap.fromTo(
      ".hero h1",
      {
        y: 50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        delay: 0.3,
      }
    );

    gsap.fromTo(
      ".hero .subtitle",
      {
        y: 30,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        delay: 0.6,
      }
    );

    // Contact form reveal
    gsap.fromTo(
      ".contact-form",
      {
        y: 50,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".contact-form",
          start: "top 85%",
          toggleActions: "play none none reverse",
        },
      }
    );
  }

  initParallaxEffects() {
    // Scroll progress indicator
    gsap.to(".scroll-progress", {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    // Multi-layer parallax
    gsap.utils.toArray(".parallax-layer").forEach((layer) => {
      const speed = layer.dataset.speed || 0.5;
      gsap.to(layer, {
        yPercent: -50 * speed,
        ease: "none",
        scrollTrigger: {
          trigger: layer,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  }

  initMorphingElements() {
    // Morphing navigation on scroll
    ScrollTrigger.create({
      trigger: ".hero",
      start: "bottom top",
      end: "bottom top",
      onToggle: (self) => {
        gsap.to(".nav", {
          background: self.isActive
            ? "rgba(0, 0, 0, 0.95)"
            : "rgba(0, 0, 0, 0.7)",
          backdropFilter: self.isActive ? "blur(30px)" : "blur(20px)",
          duration: 0.3,
        });
      },
    });
  }

  initMagneticInteractions() {
    // Enhanced magnetic mouse interactions
    const magneticElements = document.querySelectorAll("[data-magnetic]");

    magneticElements.forEach((element) => {
      element.addEventListener("mousemove", (e) => {
        this.applyMagneticEffect(element, e);
      });

      element.addEventListener("mouseleave", () => {
        gsap.to(element, {
          x: 0,
          y: 0,
          duration: 0.5,
          ease: "elastic.out(1, 0.3)",
        });
      });
    });
  }

  applyMagneticEffect(element, e) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    const magneticRange = parseInt(element.dataset.magnetic) || 100;

    if (distance < magneticRange) {
      const strength = (magneticRange - distance) / magneticRange;
      const moveX = deltaX * strength * 0.3;
      const moveY = deltaY * strength * 0.3;

      gsap.to(element, {
        x: moveX,
        y: moveY,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }
}

// Enhanced smooth scrolling with GSAP
class SmoothScrolling {
  constructor() {
    this.initSmoothScrolling();
  }

  initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute("href"));

        // Enhanced null check to prevent runtime errors
        if (target && target !== null) {
          gsap.to(window, {
            duration: 1.5,
            scrollTo: {
              y: target,
              offsetY: 80,
            },
            ease: "power3.inOut",
          });
        } else {
          // Log warning if target element doesn't exist
          console.warn(
            `Target element not found for anchor: ${anchor.getAttribute(
              "href"
            )}`
          );
        }
      });
    });
  }
}

export default {
  async init() {
    // Wait for GSAP to load
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
      console.warn("GSAP or ScrollTrigger not loaded");
      return;
    }

    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Initialize animations
    new GSAPAnimations();
    new SmoothScrolling();

    console.log("🚀 GSAP ScrollTrigger animations initialized");
  },
};
