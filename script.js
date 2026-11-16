/**
 * Project PepperVA — Antigravity Engine
 * Dual-Layer Cursor with Velocity Squash & Stretch, Zero-G Particle Physics,
 * Magnetic Attraction, and Real-time Voice Engine Simulation.
 * Built for PepperVA by Aadi.
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. ANTIGRAVITY DUAL-LAYER CURSOR & VELOCITY SQUASH-STRETCH
     ========================================================================== */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorRing = document.getElementById('cursor-ring');
  const ringRipple = document.getElementById('ring-ripple');
  const cursorLabel = document.getElementById('cursor-label');
  const particleCanvas = document.getElementById('zero-g-canvas');

  // Touch device detection
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

  if (isTouchDevice || !cursorDot || !cursorRing || !particleCanvas) {
    if (cursorDot) cursorDot.style.display = 'none';
    if (cursorRing) cursorRing.style.display = 'none';
    if (particleCanvas) particleCanvas.style.display = 'none';
    initNonCursorInteractions();
    return;
  }

  // Cursor coordinates
  let mouseX = -100, mouseY = -100;
  let ringX = -100, ringY = -100;
  let prevRingX = -100, prevRingY = -100;
  let currentAngle = 0;
  let currentStretch = 0;
  let clickPulse = 1.0;
  let isVisible = false;

  // Window bounds tracking
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isVisible) {
      isVisible = true;
      cursorDot.style.opacity = '1';
      cursorRing.style.opacity = '1';
      ringX = mouseX;
      ringY = mouseY;
      prevRingX = mouseX;
      prevRingY = mouseY;
    }

    // Zero-lag tracking for inner dot
    cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;

    // Spawn zero-G trail particles on movement
    spawnMovementParticles(mouseX, mouseY);
  });

  // Smooth lerp helper
  const lerp = (start, end, factor) => start + (end - start) * factor;

  // Animation Loop for Outer Ring with Velocity Stretch (Fixed: Transform is purely JS-driven)
  function renderCursorRing() {
    if (isVisible) {
      ringX = lerp(ringX, mouseX, 0.16);
      ringY = lerp(ringY, mouseY, 0.16);

      const vx = ringX - prevRingX;
      const vy = ringY - prevRingY;
      prevRingX = ringX;
      prevRingY = ringY;

      const speed = Math.hypot(vx, vy);

      // Velocity Squash & Stretch physics
      if (speed > 0.4) {
        currentAngle = Math.atan2(vy, vx);
        const targetStretch = Math.min(speed * 0.024, 0.45);
        currentStretch = lerp(currentStretch, targetStretch, 0.2);
      } else {
        currentStretch = lerp(currentStretch, 0, 0.15);
      }

      // Smooth decay of click pulse
      clickPulse = lerp(clickPulse, 1.0, 0.12);

      const scaleX = (1 + currentStretch) * clickPulse;
      const scaleY = (1 / (1 + currentStretch * 0.7)) * clickPulse;

      // Always maintain translation coordinates (avoids top-left jumping bug)
      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) rotate(${currentAngle}rad) scale(${scaleX}, ${scaleY})`;
    }

    requestAnimationFrame(renderCursorRing);
  }
  requestAnimationFrame(renderCursorRing);

  // Mousedown Shockwave Ripple & Particle Burst (No transform override!)
  window.addEventListener('mousedown', (e) => {
    clickPulse = 0.85;

    // Trigger inner ripple animation
    if (ringRipple) {
      ringRipple.classList.remove('active');
      void ringRipple.offsetWidth;
      ringRipple.classList.add('active');
    }

    // Emit radial burst of 14 weightless particles
    spawnClickBurst(e.clientX, e.clientY);
  });

  window.addEventListener('mouseup', () => {
    clickPulse = 1.15;
  });

  // Viewport exit / enter handling
  document.addEventListener('mouseleave', () => {
    isVisible = false;
    cursorDot.style.opacity = '0';
    cursorRing.style.opacity = '0';
  });

  document.addEventListener('mouseenter', () => {
    isVisible = true;
    cursorDot.style.opacity = '1';
    cursorRing.style.opacity = '1';
  });

  /* ==========================================================================
     2. WEIGHTLESS ZERO-G PARTICLE TRAIL (CANVAS)
     ========================================================================== */
  const pCtx = particleCanvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;
  let canvasW = (particleCanvas.width = window.innerWidth * dpr);
  let canvasH = (particleCanvas.height = window.innerHeight * dpr);
  pCtx.scale(dpr, dpr);

  window.addEventListener('resize', () => {
    dpr = window.devicePixelRatio || 1;
    canvasW = particleCanvas.width = window.innerWidth * dpr;
    canvasH = particleCanvas.height = window.innerHeight * dpr;
    pCtx.scale(dpr, dpr);
  });

  const particles = [];
  let lastSpawnPos = { x: 0, y: 0 };

  function spawnMovementParticles(x, y) {
    const dist = Math.hypot(x - lastSpawnPos.x, y - lastSpawnPos.y);
    if (dist < 10) return;
    lastSpawnPos = { x, y };

    const count = Math.random() > 0.5 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const isRed = Math.random() > 0.45;
      const shapeRand = Math.random();
      let shape = 'dot';
      if (shapeRand > 0.75) shape = 'sparkle';
      else if (shapeRand > 0.6) shape = 'ring';

      particles.push({
        x: x + (Math.random() - 0.5) * 12,
        y: y + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 0.7,
        vy: -(Math.random() * 0.75 + 0.35),
        size: Math.random() * 3 + 1.4,
        shape: shape,
        isRed: isRed,
        birth: performance.now(),
        life: Math.random() * 350 + 750,
        wobbleSpeed: Math.random() * 0.006 + 0.003,
        wobbleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  function spawnClickBurst(x, y) {
    const burstCount = 14;
    for (let i = 0; i < burstCount; i++) {
      const angle = (i / burstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 2.6 + 1.2;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        size: Math.random() * 3.5 + 1.8,
        shape: Math.random() > 0.4 ? 'sparkle' : 'dot',
        isRed: Math.random() > 0.35,
        birth: performance.now(),
        life: Math.random() * 400 + 800,
        wobbleSpeed: 0.004,
        wobbleOffset: Math.random() * Math.PI * 2
      });
    }
  }

  function renderParticles(now) {
    pCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      const age = now - p.birth;
      const progress = age / p.life;

      if (progress >= 1) {
        particles.splice(i, 1);
        continue;
      }

      p.x += p.vx + Math.sin(now * p.wobbleSpeed + p.wobbleOffset) * 0.4;
      p.y += p.vy;

      const alpha = (1 - progress) * 0.85;
      const curSize = p.size * (1 - progress * 0.4);

      pCtx.save();
      pCtx.beginPath();

      if (p.shape === 'dot') {
        pCtx.arc(p.x, p.y, Math.max(curSize, 0.5), 0, Math.PI * 2);
        pCtx.fillStyle = p.isRed ? `rgba(229, 9, 20, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.8})`;
        pCtx.shadowColor = p.isRed ? 'rgba(229, 9, 20, 0.5)' : 'rgba(255, 255, 255, 0.4)';
        pCtx.shadowBlur = 6;
        pCtx.fill();
      } else if (p.shape === 'ring') {
        pCtx.arc(p.x, p.y, Math.max(curSize * 1.3, 1), 0, Math.PI * 2);
        pCtx.strokeStyle = p.isRed ? `rgba(255, 42, 54, ${alpha})` : `rgba(255, 255, 255, ${alpha * 0.8})`;
        pCtx.lineWidth = 1;
        pCtx.stroke();
      } else if (p.shape === 'sparkle') {
        const s = Math.max(curSize * 1.5, 1);
        pCtx.moveTo(p.x - s, p.y);
        pCtx.lineTo(p.x + s, p.y);
        pCtx.moveTo(p.x, p.y - s);
        pCtx.lineTo(p.x, p.y + s);
        pCtx.strokeStyle = p.isRed ? `rgba(255, 42, 54, ${alpha})` : `rgba(255, 255, 255, ${alpha})`;
        pCtx.lineWidth = 1.2;
        pCtx.stroke();
      }

      pCtx.restore();
    }

    requestAnimationFrame(renderParticles);
  }
  requestAnimationFrame(renderParticles);

  /* ==========================================================================
     3. MAGNETIC HOVER & MICRO-LABELS
     ========================================================================== */
  const magneticTargets = document.querySelectorAll('a, button, [data-magnetic]');

  magneticTargets.forEach((target) => {
    target.addEventListener('mouseenter', () => {
      cursorRing.classList.add('hovered');

      const labelText = target.getAttribute('data-cursor-text');
      if (labelText && cursorLabel) {
        cursorLabel.textContent = labelText;
        cursorRing.classList.add('has-label');
      }
    });

    target.addEventListener('mousemove', (e) => {
      const rect = target.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const pullX = (e.clientX - centerX) * 0.22;
      const pullY = (e.clientY - centerY) * 0.22;

      target.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`;
    });

    target.addEventListener('mouseleave', () => {
      cursorRing.classList.remove('hovered');
      if (cursorLabel) {
        cursorRing.classList.remove('has-label');
        cursorLabel.textContent = '';
      }
      target.style.transform = 'translate3d(0, 0, 0)';
    });
  });

  // Spotlight card borders
  initSpotlightCards();
  initNonCursorInteractions();

  /* ==========================================================================
     4. SPOTLIGHT HOVER EFFECT
     ========================================================================== */
  function initSpotlightCards() {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  /* ==========================================================================
     5. HERO GIANT PEPPER PARALLAX FLOAT & VOICE ENGINE SIMULATION
     ========================================================================== */
  function initNonCursorInteractions() {
    // 3D Parallax floating on "PEPPER" giant text
    const heroSection = document.getElementById('hero');
    const heroGiantPepper = document.getElementById('hero-giant-pepper');

    if (heroSection && heroGiantPepper) {
      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        const normX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
        const normY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
        heroGiantPepper.style.transform = `translate3d(${normX * 16}px, ${normY * 10}px, 0) rotateZ(${normX * 0.8}deg)`;
      });

      heroSection.addEventListener('mouseleave', () => {
        heroGiantPepper.style.transform = 'translate3d(0, 0, 0) rotateZ(0deg)';
      });
    }

    // Voice Showcase interactions
    const voiceCards = document.querySelectorAll('.voice-card');
    const bannerTitle = document.getElementById('banner-voice-title');
    const bannerSub = document.getElementById('banner-voice-sub');

    const voicePresets = {
      time: {
        title: "Simulating: “Hey Pepper, what time is it”",
        sub: "Listening via local Whisper STT • System Clock Synchronized • Instant Local Audio"
      },
      apps: {
        title: "Simulating: “Hey Pepper, open Chrome & show downloads”",
        sub: "Win32 ShellExecute • Chrome launched & Downloads directory opened locally"
      },
      memory: {
        title: "Simulating: “Remember that my birthday is April 4th”",
        sub: "Stored in data\\ • Preserved on your PC • Easily copied to updates"
      },
      weather: {
        title: "Simulating: “Hey Pepper, what's the weather”",
        sub: "Minimal live weather & city lookup • Spoken response via local TTS"
      }
    };

    // Digital Equalizer Console (Replaces the 2 wave lines, exact same length)
    const eqContainer = document.getElementById('eq-bars-container');
    const barCount = 18;
    const eqBars = [];
    let eqActive = false;

    if (eqContainer) {
      eqContainer.innerHTML = '';
      for (let i = 0; i < barCount; i++) {
        const bar = document.createElement('div');
        bar.className = 'eq-bar';
        eqContainer.appendChild(bar);
        eqBars.push({
          el: bar,
          baseHeight: 5 + Math.sin((i / barCount) * Math.PI) * 12,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.08 + 0.04
        });
      }

      function animateEqualizer() {
        const mult = eqActive ? 1.6 : 0.85;
        eqBars.forEach((b) => {
          b.phase += b.speed;
          const osc = (Math.sin(b.phase) + 1) * 0.5;
          const h = Math.max(4, b.baseHeight * mult * osc + (eqActive ? 4 : 0));
          b.el.style.height = `${Math.min(h, 24)}px`;
        });
        requestAnimationFrame(animateEqualizer);
      }
      requestAnimationFrame(animateEqualizer);
    }

    function surgeEqualizer() {
      eqActive = true;
      setTimeout(() => {
        eqActive = false;
      }, 1500);
    }

    voiceCards.forEach((card) => {
      card.addEventListener('click', () => {
        voiceCards.forEach((c) => c.classList.remove('active'));
        card.classList.add('active');

        const vKey = card.getAttribute('data-voice');
        if (voicePresets[vKey] && bannerTitle && bannerSub) {
          bannerTitle.textContent = voicePresets[vKey].title;
          bannerSub.textContent = voicePresets[vKey].sub;
          surgeEqualizer();
        }
      });
    });

    /* ==========================================================================
       6. TERMINAL COPY BUTTON
       ========================================================================== */
    const copyBtn = document.getElementById('copy-cmd-btn');
    const copyBtnText = document.getElementById('copy-btn-text');
    const ollamaCmd = document.getElementById('ollama-cmd');

    if (copyBtn && ollamaCmd) {
      copyBtn.addEventListener('click', () => {
        const text = ollamaCmd.textContent.trim();
        navigator.clipboard.writeText(text).then(() => {
          if (copyBtnText) copyBtnText.textContent = 'Copied!';
          copyBtn.style.borderColor = '#10B981';

          setTimeout(() => {
            if (copyBtnText) copyBtnText.textContent = 'Copy';
            copyBtn.style.borderColor = '';
          }, 2000);
        }).catch((err) => {
          console.error('Clipboard error:', err);
        });
      });
    }

    /* ==========================================================================
       7. MOBILE NAVIGATION DRAWER
       ========================================================================== */
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobileDrawer = document.getElementById('mobile-drawer');

    if (mobileToggle && mobileDrawer) {
      mobileToggle.addEventListener('click', () => {
        const isActive = mobileDrawer.classList.toggle('active');
        mobileToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
      });

      document.querySelectorAll('.drawer-link').forEach((link) => {
        link.addEventListener('click', () => {
          mobileDrawer.classList.remove('active');
          mobileToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    /* ==========================================================================
       8. SMOOTH SCROLLSPY
       ========================================================================== */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
      let current = '';
      const scrollPosition = window.pageYOffset + 140;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
          current = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
          link.classList.add('active');
        }
      });
    });
  }

});
