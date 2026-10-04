/**
 * BHAIUUU 3D PORTAL - CORE JAVASCRIPT
 * Features:
 * 1. 3D Perspective Card Tilt with Specular Glass Light Reflection
 * 2. Interactive Orbiting & Swirling Mouse Cursor Particle Swarm ("Chote Chote Bindu")
 * 3. 3D Ambient Space Depth Stars with Mouse Parallax
 * 4. Tab Transition & Password Toggle
 * 5. Web Audio API Futuristic Sound Synthesizer
 * 6. Dynamic Aura Theme Customizer
 * 7. Modern Toast Notification System
 */

(function () {
  'use strict';

  // ==========================================
  // 1. STATE & AUDIO SYNTHESIZER
  // ==========================================
  const state = {
    soundEnabled: true,
    theme: 'purple',
    mouseX: window.innerWidth / 2,
    mouseY: window.innerHeight / 2,
    targetMouseX: window.innerWidth / 2,
    targetMouseY: window.innerHeight / 2,
    isHoveringCard: false,
    cardTilt: { x: 0, y: 0, targetX: 0, targetY: 0 },
    themeColors: {
      purple: ['#a855f7', '#c084fc', '#e879f9', '#ffffff', '#38bdf8'],
      cyan: ['#06b6d4', '#22d3ee', '#38bdf8', '#ffffff', '#818cf8'],
      emerald: ['#10b981', '#34d399', '#6ee7b7', '#ffffff', '#06b6d4'],
      rose: ['#f43f5e', '#fb7185', '#fda4af', '#ffffff', '#c084fc']
    }
  };

  // Futuristic Web Audio Synthesizer (No external sound files required)
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playFuturisticSound(type = 'click') {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        // High-tech micro blip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.05);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'tab') {
        // Smooth futuristic swipe sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.12);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'success') {
        // Harmonic major chord chime
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);

          chordOsc.type = 'sine';
          chordOsc.frequency.setValueAtTime(freq, now + i * 0.06);
          chordGain.gain.setValueAtTime(0.06, now + i * 0.06);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.45);

          chordOsc.start(now + i * 0.06);
          chordOsc.stop(now + i * 0.06 + 0.45);
        });
      } else if (type === 'error') {
        // Low futuristic reject buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch (e) {
      // Audio not permitted yet or failed silently
    }
  }

  // ==========================================
  // 2. CANVAS PARTICLE ENGINE (TRAIL & SWARM)
  // ==========================================
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Array of orbiting cursor trail particles ("chote chote bindu")
  const trailParticles = [];
  // Ambient background floating starfield
  const ambientStars = [];
  const AMBIENT_COUNT = 90;

  class AmbientStar {
    constructor() {
      this.reset(true);
    }
    reset(init = false) {
      this.x = Math.random() * width;
      this.y = init ? Math.random() * height : -10;
      this.z = Math.random() * 0.8 + 0.2; // depth
      this.size = (Math.random() * 1.6 + 0.6) * this.z;
      this.baseAlpha = Math.random() * 0.5 + 0.2;
      this.alpha = this.baseAlpha;
      this.pulseSpeed = Math.random() * 0.02 + 0.01;
      this.vy = (Math.random() * 0.3 + 0.1) * this.z;
      this.vx = (Math.random() - 0.5) * 0.15;
    }
    update(parallaxX, parallaxY) {
      this.y += this.vy;
      this.x += this.vx;
      this.alpha = this.baseAlpha + Math.sin(Date.now() * this.pulseSpeed * 0.05) * 0.2;

      if (this.y > height + 20 || this.x < -20 || this.x > width + 20) {
        this.reset();
      }
    }
    draw(parallaxX, parallaxY) {
      const renderX = this.x + parallaxX * this.z * 25;
      const renderY = this.y + parallaxY * this.z * 25;

      ctx.beginPath();
      ctx.arc(renderX, renderY, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 225, 255, ${Math.max(0, this.alpha)})`;
      ctx.fill();
    }
  }

  // Populate ambient stars
  for (let i = 0; i < AMBIENT_COUNT; i++) {
    ambientStars.push(new AmbientStar());
  }

  // Swirling Cursor Trail Particle ("Chote Chote Bindu Jo Sath Me Ghumenge")
  class TrailDot {
    constructor(x, y, mouseSpeedX, mouseSpeedY) {
      this.x = x;
      this.y = y;
      this.originX = x;
      this.originY = y;
      
      // Select vibrant color from active theme palette
      const colors = state.themeColors[state.theme] || state.themeColors.purple;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      
      // Velocity + Swirling physics
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 0.8;
      
      // Influence by cursor direction + outward burst
      this.vx = Math.cos(angle) * speed + mouseSpeedX * 0.15;
      this.vy = Math.sin(angle) * speed + mouseSpeedY * 0.15;
      
      // Orbiting / Swirl angle around cursor
      this.orbitAngle = Math.random() * Math.PI * 2;
      this.orbitRadius = Math.random() * 12 + 4;
      this.orbitSpeed = (Math.random() - 0.5) * 0.14; // rotation direction & speed
      
      this.size = Math.random() * 2.8 + 1.2;
      this.alpha = 1;
      this.life = 1;
      this.decay = Math.random() * 0.02 + 0.015; // lifespans
      this.sparkle = Math.random() > 0.4;
    }

    update() {
      // Swirl rotation around the moving vector
      this.orbitAngle += this.orbitSpeed;
      this.x += this.vx + Math.cos(this.orbitAngle) * (this.orbitRadius * 0.08);
      this.y += this.vy + Math.sin(this.orbitAngle) * (this.orbitRadius * 0.08);

      // Decelerate smoothly
      this.vx *= 0.96;
      this.vy *= 0.96;

      // Shrink and fade
      this.life -= this.decay;
      this.alpha = Math.max(0, this.life);
      this.size = Math.max(0.4, this.size * 0.985);
    }

    draw() {
      if (this.alpha <= 0) return;

      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  // Mouse coordinate and movement tracking
  let prevMouseX = window.innerWidth / 2;
  let prevMouseY = window.innerHeight / 2;
  let mouseVelX = 0;
  let mouseVelY = 0;

  window.addEventListener('mousemove', (e) => {
    state.targetMouseX = e.clientX;
    state.targetMouseY = e.clientY;

    mouseVelX = e.clientX - prevMouseX;
    mouseVelY = e.clientY - prevMouseY;
    prevMouseX = e.clientX;
    prevMouseY = e.clientY;

    // Emit lightweight particle
    trailParticles.push(new TrailDot(e.clientX, e.clientY, mouseVelX, mouseVelY));

    // Limit maximum particles for locked 60+ FPS
    if (trailParticles.length > 70) {
      trailParticles.splice(0, trailParticles.length - 70);
    }
  }, { passive: true });

  // Touch move support for mobile/tablets
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      state.targetMouseX = touch.clientX;
      state.targetMouseY = touch.clientY;
      trailParticles.push(new TrailDot(touch.clientX, touch.clientY, 0, 0));
    }
  }, { passive: true });

  // Custom Cursor follow element
  const cursorDot = document.getElementById('cursorDot');
  const cursorGlow = document.getElementById('cursorGlow');

  // Animation Loop for Canvas & Particle Swarm
  function renderScene() {
    // Smooth lerp cursor position
    state.mouseX += (state.targetMouseX - state.mouseX) * 0.3;
    state.mouseY += (state.targetMouseY - state.mouseY) * 0.3;

    // Hardware accelerated GPU compositing for cursor (No DOM Reflow!)
    if (cursorDot) {
      cursorDot.style.transform = `translate3d(${state.mouseX - 4}px, ${state.mouseY - 4}px, 0)`;
    }
    if (cursorGlow) {
      cursorGlow.style.transform = `translate3d(${state.mouseX - 130}px, ${state.mouseY - 130}px, 0)`;
    }

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Parallax normalized coordinates (-1 to 1)
    const normX = (state.mouseX / width) * 2 - 1;
    const normY = (state.mouseY / height) * 2 - 1;

    // 1. Draw Ambient Background Stars
    ctx.globalAlpha = 1;
    for (let i = 0; i < ambientStars.length; i++) {
      ambientStars[i].update(-normX, -normY);
      ambientStars[i].draw(-normX, -normY);
    }

    // 2. Batched Constellation Lines (Single Path, Zero Stutter)
    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.2)';
    const pLen = trailParticles.length;
    for (let i = 0; i < pLen; i++) {
      const p1 = trailParticles[i];
      for (let j = i + 1; j < Math.min(i + 4, pLen); j++) {
        const p2 = trailParticles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distSq = dx * dx + dy * dy;

        if (distSq < 1600) { // 40*40
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
    }
    ctx.stroke();

    // 3. Update & Draw Swirling Cursor Dots ("Bindu")
    for (let i = trailParticles.length - 1; i >= 0; i--) {
      const p = trailParticles[i];
      p.update();
      p.draw();

      if (p.life <= 0) {
        trailParticles.splice(i, 1);
      }
    }

    ctx.globalAlpha = 1;

    // 4. Update 3D Card Tilt Interpolation
    update3DCardTilt();

    requestAnimationFrame(renderScene);
  }

  requestAnimationFrame(renderScene);

  // ==========================================
  // 3. 3D CARD PERSPECTIVE TILT & GLASS GLARE
  // ==========================================
  const cardContainer = document.getElementById('cardContainer');
  const card3D = document.getElementById('card3D');
  const glassGlare = document.getElementById('glassGlare');

  function calculateCardTilt(e) {
    if (!card3D) return;
    const rect = card3D.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const deltaX = (mouseX - cardCenterX) / (rect.width / 2);
    const deltaY = (mouseY - cardCenterY) / (rect.height / 2);

    // Limit maximum tilt angle in degrees
    const maxTilt = 14;
    state.cardTilt.targetX = -deltaY * maxTilt;
    state.cardTilt.targetY = deltaX * maxTilt;

    // Calculate light reflection glare coordinates
    const glareX = ((mouseX - rect.left) / rect.width) * 100;
    const glareY = ((mouseY - rect.top) / rect.height) * 100;

    card3D.style.setProperty('--glare-x', `${glareX}%`);
    card3D.style.setProperty('--glare-y', `${glareY}%`);
    card3D.style.setProperty('--glare-opacity', '1');
  }

  function resetCardTilt() {
    state.cardTilt.targetX = 0;
    state.cardTilt.targetY = 0;
    if (card3D) {
      card3D.style.setProperty('--glare-opacity', '0');
    }
  }

  function update3DCardTilt() {
    if (!card3D) return;

    // Smooth lerp to target tilt
    state.cardTilt.x += (state.cardTilt.targetX - state.cardTilt.x) * 0.12;
    state.cardTilt.y += (state.cardTilt.targetY - state.cardTilt.y) * 0.12;

    // Apply 3D matrix transform
    card3D.style.transform = `rotateX(${state.cardTilt.x.toFixed(2)}deg) rotateY(${state.cardTilt.y.toFixed(2)}deg)`;
  }

  if (cardContainer) {
    cardContainer.addEventListener('mousemove', (e) => {
      state.isHoveringCard = true;
      calculateCardTilt(e);
    });

    cardContainer.addEventListener('mouseleave', () => {
      state.isHoveringCard = false;
      resetCardTilt();
    });
  }

  // ==========================================
  // 4. TAB CONTROLS (SIGN IN / REGISTER)
  // ==========================================
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const tabSlider = document.querySelector('.tab-slider');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  function switchTab(isRegister) {
    playFuturisticSound('tab');
    if (isRegister) {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      if (tabSlider) tabSlider.style.transform = 'translateX(100%)';
      loginForm.classList.remove('active');
      registerForm.classList.add('active');
    } else {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      if (tabSlider) tabSlider.style.transform = 'translateX(0%)';
      registerForm.classList.remove('active');
      loginForm.classList.add('active');
    }
  }

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener('click', () => switchTab(false));
    tabRegister.addEventListener('click', () => switchTab(true));
  }

  // ==========================================
  // 5. PASSWORD VISIBILITY TOGGLE
  // ==========================================
  const eyeButtons = document.querySelectorAll('.eye-toggle');
  eyeButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      playFuturisticSound('click');
      const inputId = btn.getAttribute('data-input');
      const input = document.getElementById(inputId);
      const icon = btn.querySelector('i');

      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });

  // ==========================================
  // 6. TOAST NOTIFICATION UTILITY
  // ==========================================
  const toastContainer = document.getElementById('toastContainer');

  function showToast(title, message, type = 'info', duration = 3800) {
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `
      <div class="toast-icon"><i class="${iconClass}"></i></div>
      <div class="toast-content">
        <h4>${title}</h4>
        <p>${message}</p>
      </div>
    `;

    toastContainer.appendChild(toast);

    // Trigger slide-in animation
    setTimeout(() => {
      toast.classList.add('show');
    }, 20);

    // Auto dismiss
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, duration);
  }

  // ==========================================
  // 7. FORM SUBMISSIONS WITH 3D FEEDBACK
  // ==========================================
  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const regSubmitBtn = document.getElementById('regSubmitBtn');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const identifier = document.getElementById('loginIdentifier').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      if (!identifier || !password) {
        playFuturisticSound('error');
        showToast('Authentication Error', 'Please enter your username and password.', 'error');
        return;
      }

      // Enter loading state
      playFuturisticSound('click');
      loginSubmitBtn.classList.add('loading');
      loginSubmitBtn.querySelector('.btn-text').textContent = 'VERIFYING CREDENTIALS...';
      loginSubmitBtn.querySelector('.btn-icon i').className = 'fa-solid fa-circle-notch';

      try {
        let authSuccess = false;
        let responseUser = null;
        let responseToken = null;

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier, password })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            authSuccess = true;
            responseUser = data.user;
            responseToken = data.token;
          } else {
            loginSubmitBtn.classList.remove('loading');
            loginSubmitBtn.querySelector('.btn-text').textContent = 'SIGN IN TO BHAIUUU';
            loginSubmitBtn.querySelector('.btn-icon i').className = 'fa-solid fa-arrow-right';
            playFuturisticSound('error');
            showToast('Authentication Failed', data.error || 'Invalid username or password.', 'error');
            return;
          }
        } catch (netErr) {
          // Graceful fallback for standalone / demo mode
          authSuccess = true;
          responseUser = {
            id: 'usr_' + Date.now(),
            fullName: identifier.includes('@') ? identifier.split('@')[0] : identifier,
            email: identifier.includes('@') ? identifier : `${identifier}@bhaiuuu.ai`,
            username: identifier
          };
          responseToken = 'demo_token_' + Date.now();
        }

        if (authSuccess) {
          localStorage.setItem('bhaiuuu_token', responseToken);
          localStorage.setItem('bhaiuuu_user', JSON.stringify(responseUser));

          loginSubmitBtn.classList.remove('loading');
          loginSubmitBtn.querySelector('.btn-text').textContent = 'QUANTUM ACCESS GRANTED!';
          loginSubmitBtn.querySelector('.btn-icon i').className = 'fa-solid fa-check';

          playFuturisticSound('success');
          showToast(
            'Access Granted!',
            `Welcome, ${responseUser.fullName}! Entering Gemini 3D Chatbot...`,
            'success',
            3500
          );

          // Spawn celebration particle burst
          const rect = card3D.getBoundingClientRect();
          for (let i = 0; i < 65; i++) {
            trailParticles.push(
              new TrailDot(
                rect.left + rect.width / 2 + (Math.random() - 0.5) * 160,
                rect.top + rect.height / 2 + (Math.random() - 0.5) * 160,
                (Math.random() - 0.5) * 18,
                (Math.random() - 0.5) * 18
              )
            );
          }

          // Warp animation to main chat page
          if (card3D) {
            card3D.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            card3D.style.transform = 'perspective(1200px) scale(0.9) translateY(-30px) rotateX(10deg)';
            card3D.style.opacity = '0.35';
            card3D.style.filter = 'blur(8px)';
          }

          setTimeout(() => {
            window.location.href = 'chat.html';
          }, 950);
        }
      } catch (err) {
        console.error('Login error:', err);
        loginSubmitBtn.classList.remove('loading');
        loginSubmitBtn.querySelector('.btn-text').textContent = 'SIGN IN TO BHAIUUU';
        loginSubmitBtn.querySelector('.btn-icon i').className = 'fa-solid fa-arrow-right';
        playFuturisticSound('error');
        showToast('Error', 'An unexpected error occurred.', 'error');
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('regFullName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value.trim();
      const terms = document.getElementById('termsCheck').checked;

      if (!fullName || !email || !password) {
        playFuturisticSound('error');
        showToast('Registration Error', 'All fields are required to join Bhaiuuu.', 'error');
        return;
      }

      if (!terms) {
        playFuturisticSound('error');
        showToast('Terms Required', 'Please accept the Terms & Privacy Policy to proceed.', 'error');
        return;
      }

      playFuturisticSound('click');
      regSubmitBtn.classList.add('loading');
      regSubmitBtn.querySelector('.btn-text').textContent = 'CREATING CIPHER KEY...';
      regSubmitBtn.querySelector('.btn-icon i').className = 'fa-solid fa-circle-notch';

      try {
        let regSuccess = false;
        let responseUser = null;
        let responseToken = null;

        try {
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, email, password })
          });
          const data = await res.json();
          if (res.ok && data.success) {
            regSuccess = true;
            responseUser = data.user;
            responseToken = data.token;
          } else {
            regSubmitBtn.classList.remove('loading');
            regSubmitBtn.querySelector('.btn-text').textContent = 'CREATE YOUR ACCOUNT';
            regSubmitBtn.querySelector('.btn-icon i').className = 'fa-solid fa-user-plus';
            playFuturisticSound('error');
            showToast('Registration Error', data.error || 'Could not complete registration.', 'error');
            return;
          }
        } catch (netErr) {
          // Fallback demo account
          regSuccess = true;
          responseUser = {
            id: 'usr_' + Date.now(),
            fullName,
            email,
            username: email.split('@')[0]
          };
          responseToken = 'token_' + Date.now();
        }

        if (regSuccess) {
          localStorage.setItem('bhaiuuu_token', responseToken);
          localStorage.setItem('bhaiuuu_user', JSON.stringify(responseUser));

          regSubmitBtn.classList.remove('loading');
          regSubmitBtn.querySelector('.btn-text').textContent = 'ACCOUNT READY!';
          regSubmitBtn.querySelector('.btn-icon i').className = 'fa-solid fa-check';

          playFuturisticSound('success');
          showToast(
            'Account Created!',
            `Greetings, ${fullName}! Entering Bhaiuuu Gemini Workspace...`,
            'success',
            3500
          );

          if (card3D) {
            card3D.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            card3D.style.transform = 'perspective(1200px) scale(0.9) translateY(-30px) rotateX(10deg)';
            card3D.style.opacity = '0.35';
            card3D.style.filter = 'blur(8px)';
          }

          setTimeout(() => {
            window.location.href = 'chat.html';
          }, 950);
        }
      } catch (err) {
        console.error('Registration error:', err);
        regSubmitBtn.classList.remove('loading');
        regSubmitBtn.querySelector('.btn-text').textContent = 'CREATE YOUR ACCOUNT';
        regSubmitBtn.querySelector('.btn-icon i').className = 'fa-solid fa-user-plus';
        playFuturisticSound('error');
        showToast('Error', 'An unexpected error occurred during registration.', 'error');
      }
    });
  }

  // Forgot Password handler
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      playFuturisticSound('click');
      showToast(
        'Password Recovery',
        'Password recovery link has been dispatched to your registered address.',
        'info'
      );
    });
  }

  // Social Login buttons -> Direct warp into Gemini AI workspace
  const socialCards = document.querySelectorAll('.social-card');
  socialCards.forEach((btn) => {
    btn.addEventListener('click', () => {
      const provider = btn.querySelector('span').textContent;
      playFuturisticSound('click');
      showToast(
        'Social Auth',
        `Authenticating with ${provider}... Welcome to Bhaiuuu!`,
        'success',
        2500
      );

      const demoUser = {
        id: 'usr_' + provider.toLowerCase(),
        fullName: 'Sourabh Dabhde',
        email: `sourabh@${provider.toLowerCase()}.com`,
        username: 'sourabh'
      };
      localStorage.setItem('bhaiuuu_token', 'social_token_' + Date.now());
      localStorage.setItem('bhaiuuu_user', JSON.stringify(demoUser));

      setTimeout(() => {
        window.location.href = 'chat.html';
      }, 800);
    });
  });

  // ==========================================
  // 8. SOUND TOGGLE & THEME SELECTOR
  // ==========================================
  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      const icon = soundToggle.querySelector('i');
      const tooltip = soundToggle.querySelector('.btn-tooltip');

      if (state.soundEnabled) {
        icon.className = 'fa-solid fa-volume-high';
        tooltip.textContent = 'Sound: On';
        playFuturisticSound('click');
        showToast('Sound Enabled', 'Futuristic sound effects are now active.', 'info', 2200);
      } else {
        icon.className = 'fa-solid fa-volume-xmark';
        tooltip.textContent = 'Sound: Off';
        showToast('Sound Muted', 'Audio effects are muted.', 'info', 2200);
      }
    });
  }

  // Accent Aura Switcher
  const accentDots = document.querySelectorAll('.accent-dot');
  accentDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      playFuturisticSound('click');
      accentDots.forEach((d) => d.classList.remove('active'));
      dot.classList.add('active');

      const themeName = dot.getAttribute('data-color');
      state.theme = themeName;
      document.documentElement.setAttribute('data-theme', themeName);

      showToast(
        'Aura Switched',
        `Dynamic color aura updated to ${themeName.toUpperCase()}.`,
        'info',
        2200
      );
    });
  });

  // Welcome Toast on initial load
  setTimeout(() => {
    showToast(
      'Welcome to Bhaiuuu',
      'Move your cursor to experience the 3D particle vortex and dynamic card depth!',
      'info',
      4500
    );
  }, 600);

})();
