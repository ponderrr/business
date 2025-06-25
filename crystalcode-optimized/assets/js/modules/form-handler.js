const FORM_NOTIFICATION_TIMEOUT = 3500;

class EnhancedFormHandler {
  constructor() {
    this.form = document.getElementById("contactForm");
    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener("submit", this.handleSubmit.bind(this));
    this.setupRippleEffect();
  }

  setupRippleEffect() {
    const btn = this.form.querySelector(".send-btn");
    if (!btn) return;

    btn.addEventListener("click", (e) => {
      this.createRipple(e, btn);
    });
  }

  createRipple(e, button) {
    let ripple = button.querySelector(".ripple");
    if (ripple) ripple.remove();

    ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ripple.style.setProperty("--ripple-x", x + "px");
    ripple.style.setProperty("--ripple-y", y + "px");
    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 700);
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const btn = this.form.querySelector(".send-btn");
    const checkmark = btn.querySelector(".checkmark-icon");
    const sentMsg = btn.querySelector(".sent-message");
    const btnText = btn.querySelector(".btn-text");
    const success = this.form.querySelector("#formSuccess");

    try {
      btn.classList.add("particle-burst");
      btnText.style.display = "none";
      checkmark.style.display = "inline-flex";
      sentMsg.style.display = "inline";

      const response = await fetch(this.form.action, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        success.classList.add("active");
        success.classList.remove("error");
        success.querySelector(".success-text").textContent =
          "Transmission Sent!";
        setTimeout(() => {
          this.form.reset();
          success.classList.remove("active");
          btn.classList.remove("particle-burst");
          btnText.style.display = "inline";
          checkmark.style.display = "none";
          sentMsg.style.display = "none";
        }, FORM_NOTIFICATION_TIMEOUT);
      } else {
        throw new Error("Network response was not ok");
      }
    } catch (error) {
      success.classList.add("active", "error");
      success.querySelector(".success-text").textContent =
        "⚠️ Something went wrong. Please try again.";
      btn.classList.remove("particle-burst");
      btnText.style.display = "inline";
      checkmark.style.display = "none";
      sentMsg.style.display = "none";
      setTimeout(() => {
        success.classList.remove("active", "error");
        success.querySelector(".success-text").textContent =
          "Transmission Sent!";
      }, FORM_NOTIFICATION_TIMEOUT);
    }
  }
}

export default {
  async init() {
    new EnhancedFormHandler();
  },
};
