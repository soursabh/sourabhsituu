/**
 * BHAIUUU AI - 3D GEMINI QUANTUM WORKSPACE CLIENT
 * Features:
 * 1. 3D Holographic AI Energy Core Canvas (Dynamic State Reactive)
 * 2. Background Starfield & Cursor Particle Swarm
 * 3. Gemini API Chat with Multimodal Vision & Google Search Grounding
 * 4. Model Selector (Gemini 2.5 Flash, 2.5 Pro, 2.0 Flash, 1.5 Pro)
 * 5. Web Speech API (Voice-to-Text & Text-to-Speech)
 * 6. Code Syntax Highlighting & Copy Buttons
 * 7. Conversation History Persistence & User Sessions
 * 8. Web Audio API Sound Synthesizer
 */

(function () {
  'use strict';

  // ==========================================
  // 1. STATE MANAGEMENT
  // ==========================================
  const state = {
    theme: 'purple',
    soundEnabled: true,
    user: null,
    token: null,
    currentChatId: null,
    currentModel: 'gemini-3.8-flash',
    enableSearch: false,
    enableThinking: false,
    codeMode: false,
    attachedImage: null, // { data: base64, mimeType, name }
    isGenerating: false,
    activeCoreStatus: 'idle', // 'idle' | 'typing' | 'thinking' | 'speaking'
    serverHasKey: true,
    customApiKey: '',
    systemPrompt: '',
    temperature: 0.7,
    themeColors: {
      purple: ['#a855f7', '#c084fc', '#e879f9', '#ffffff', '#38bdf8'],
      cyan: ['#06b6d4', '#22d3ee', '#38bdf8', '#ffffff', '#818cf8'],
      emerald: ['#10b981', '#34d399', '#6ee7b7', '#ffffff', '#06b6d4'],
      rose: ['#f43f5e', '#fb7185', '#fda4af', '#ffffff', '#c084fc']
    }
  };

  // Load stored state
  try {
    const storedUser = localStorage.getItem('bhaiuuu_user');
    const storedToken = localStorage.getItem('bhaiuuu_token');
    const storedKey = localStorage.getItem('bhaiuuu_custom_key');
    const storedSystem = localStorage.getItem('bhaiuuu_system_prompt');
    const storedTemp = localStorage.getItem('bhaiuuu_temp');

    if (storedUser) state.user = JSON.parse(storedUser);
    if (storedToken) state.token = storedToken;
    if (storedKey) state.customApiKey = storedKey;
    if (storedSystem) state.systemPrompt = storedSystem;
    if (storedTemp) state.temperature = parseFloat(storedTemp);
  } catch (e) {
    console.warn('Storage read warning:', e);
  }

  // ==========================================
  // 2. AUDIO SYNTHESIZER (WEB AUDIO API)
  // ==========================================
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) audioCtx = new AudioClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type = 'click') {
    if (!state.soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'click') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.04);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'send') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'receive') {
        [587.33, 880, 1174.66].forEach((f, i) => {
          const chordOsc = ctx.createOscillator();
          const chordGain = ctx.createGain();
          chordOsc.connect(chordGain);
          chordGain.connect(ctx.destination);
          chordOsc.type = 'sine';
          chordOsc.frequency.setValueAtTime(f, now + i * 0.05);
          chordGain.gain.setValueAtTime(0.04, now + i * 0.05);
          chordGain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.05 + 0.3);
          chordOsc.start(now + i * 0.05);
          chordOsc.stop(now + i * 0.05 + 0.3);
        });
      }
    } catch (e) {
      // Audio autoplay restrictions
    }
  }

  // ==========================================
  // 3. BACKGROUND CANVAS (STARS & PARTICLES)
  // ==========================================
  const bgCanvas = document.getElementById('particleCanvas');
  const bgCtx = bgCanvas.getContext('2d');
  let bgW = (bgCanvas.width = window.innerWidth);
  let bgH = (bgCanvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    bgW = bgCanvas.width = window.innerWidth;
    bgH = bgCanvas.height = window.innerHeight;
  });

  const ambientStars = [];
  const trailParticles = [];
  for (let i = 0; i < 75; i++) {
    ambientStars.push({
      x: Math.random() * bgW,
      y: Math.random() * bgH,
      z: Math.random() * 0.7 + 0.3,
      size: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2,
      vy: Math.random() * 0.2 + 0.05
    });
  }

  let mouseX = bgW / 2;
  let mouseY = bgH / 2;
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    const glow = document.getElementById('cursorGlow');
    const dot = document.getElementById('cursorDot');
    if (glow) {
      glow.style.left = mouseX + 'px';
      glow.style.top = mouseY + 'px';
    }
    if (dot) {
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    }

    if (Math.random() < 0.25) {
      const colors = state.themeColors[state.theme] || state.themeColors.purple;
      trailParticles.push({
        x: mouseX,
        y: mouseY,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        size: Math.random() * 2 + 1,
        alpha: 1,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  });

  function renderBackground() {
    bgCtx.clearRect(0, 0, bgW, bgH);

    // Render stars
    for (let s of ambientStars) {
      s.y += s.vy * s.z;
      if (s.y > bgH) s.y = 0;
      bgCtx.beginPath();
      bgCtx.arc(s.x, s.y, s.size * s.z, 0, Math.PI * 2);
      bgCtx.fillStyle = `rgba(220, 235, 255, ${s.alpha})`;
      bgCtx.fill();
    }

    // Render cursor trail
    for (let i = trailParticles.length - 1; i >= 0; i--) {
      const p = trailParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      if (p.alpha <= 0) {
        trailParticles.splice(i, 1);
        continue;
      }
      bgCtx.beginPath();
      bgCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      bgCtx.fillStyle = p.color;
      bgCtx.globalAlpha = p.alpha;
      bgCtx.fill();
      bgCtx.globalAlpha = 1;
    }

    requestAnimationFrame(renderBackground);
  }
  requestAnimationFrame(renderBackground);

  // ==========================================
  // 4. 3D HOLOGRAPHIC AI ENERGY CORE (CANVAS)
  // ==========================================
  const coreCanvas = document.getElementById('coreCanvas');
  const coreCtx = coreCanvas.getContext('2d');
  const coreWidth = coreCanvas.width;
  const coreHeight = coreCanvas.height;

  // Generate 3D sphere points (Fibonacci Sphere algorithm)
  const POINT_COUNT = 90;
  const corePoints = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden ratio angle

  for (let i = 0; i < POINT_COUNT; i++) {
    const y = 1 - (i / (POINT_COUNT - 1)) * 2; // -1 to 1
    const radiusAtY = Math.sqrt(1 - y * y);
    const theta = phi * i;
    const x = Math.cos(theta) * radiusAtY;
    const z = Math.sin(theta) * radiusAtY;
    corePoints.push({ x, y, z, baseRadius: 65 });
  }

  let coreAngleX = 0;
  let coreAngleY = 0;

  function updateCoreStatus(status, text) {
    state.activeCoreStatus = status;
    const label = document.getElementById('coreStatusText');
    if (label) {
      label.textContent = text || `BHAIUUU QUANTUM CORE // ${status.toUpperCase()}`;
    }
  }

  function render3DCore() {
    coreCtx.clearRect(0, 0, coreWidth, coreHeight);
    const cx = coreWidth / 2;
    const cy = coreHeight / 2;

    // Adjust rotation speeds based on status
    let rotSpeedX = 0.008;
    let rotSpeedY = 0.012;
    let pulseScale = 1;

    if (state.activeCoreStatus === 'typing') {
      rotSpeedX = 0.02;
      rotSpeedY = 0.025;
      pulseScale = 1 + Math.sin(Date.now() * 0.008) * 0.08;
    } else if (state.activeCoreStatus === 'thinking') {
      rotSpeedX = 0.045;
      rotSpeedY = 0.055;
      pulseScale = 1 + Math.sin(Date.now() * 0.015) * 0.15;
    } else if (state.activeCoreStatus === 'speaking') {
      rotSpeedX = 0.015;
      rotSpeedY = 0.02;
      pulseScale = 1 + Math.sin(Date.now() * 0.02) * 0.18;
    }

    coreAngleX += rotSpeedX;
    coreAngleY += rotSpeedY;

    // Projected 2D points with depth sorting
    const projected = [];
    const sphereRadius = 72 * pulseScale;

    const cosY = Math.cos(coreAngleY);
    const sinY = Math.sin(coreAngleY);
    const cosX = Math.cos(coreAngleX);
    const sinX = Math.sin(coreAngleX);

    for (let p of corePoints) {
      // Y rotation
      let x1 = p.x * cosY + p.z * sinY;
      let y1 = p.y;
      let z1 = -p.x * sinY + p.z * cosY;

      // X rotation
      let x2 = x1;
      let y2 = y1 * cosX - z1 * sinX;
      let z2 = y1 * sinX + z1 * cosX;

      // Perspective projection
      const fov = 220;
      const scale = fov / (fov + z2 * sphereRadius);
      const projX = cx + x2 * sphereRadius * scale;
      const projY = cy + y2 * sphereRadius * scale;

      projected.push({
        x: projX,
        y: projY,
        z: z2,
        scale,
        alpha: Math.max(0.15, (z2 + 1) / 2)
      });
    }

    // Sort by depth (back to front)
    projected.sort((a, b) => a.z - b.z);

    // Draw connecting constellation lines between close nodes
    coreCtx.lineWidth = 0.8;
    for (let i = 0; i < projected.length; i++) {
      for (let j = i + 1; j < projected.length; j++) {
        const dx = projected[i].x - projected[j].x;
        const dy = projected[i].y - projected[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 38) {
          const lineAlpha = (1 - dist / 38) * 0.28 * Math.min(projected[i].alpha, projected[j].alpha);
          coreCtx.strokeStyle = `rgba(168, 85, 247, ${lineAlpha})`;
          coreCtx.beginPath();
          coreCtx.moveTo(projected[i].x, projected[i].y);
          coreCtx.lineTo(projected[j].x, projected[j].y);
          coreCtx.stroke();
        }
      }
    }

    // Draw glowing node points
    for (let p of projected) {
      const radius = Math.max(1, 2.5 * p.scale);
      coreCtx.beginPath();
      coreCtx.arc(p.x, p.y, radius, 0, Math.PI * 2);

      if (state.activeCoreStatus === 'thinking') {
        coreCtx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
      } else {
        coreCtx.fillStyle = `rgba(168, 85, 247, ${p.alpha})`;
      }
      coreCtx.fill();
    }

    requestAnimationFrame(render3DCore);
  }
  requestAnimationFrame(render3DCore);

  // ==========================================
  // 5. TOAST SYSTEM
  // ==========================================
  function showToast(title, desc, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'fa-solid fa-circle-info';
    if (type === 'success') icon = 'fa-solid fa-circle-check';
    if (type === 'error') icon = 'fa-solid fa-circle-exclamation';

    toast.innerHTML = `
      <i class="${icon} toast-icon"></i>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-desc">${desc}</div>
      </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('hide');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, duration);
  }

  // ==========================================
  // 6. USER PROFILE & AUTH CHECK
  // ==========================================
  function setupUserProfile() {
    const nameEl = document.getElementById('userDisplayName');
    const heroNameEl = document.getElementById('heroUserName');
    const emailEl = document.getElementById('userDisplayEmail');
    const avatarEl = document.getElementById('userAvatar');

    if (state.user) {
      const displayName = state.user.fullName || state.user.username || 'Sourabh Dabhde';
      if (nameEl) nameEl.textContent = displayName;
      if (heroNameEl) heroNameEl.textContent = displayName.split(' ')[0];
      if (emailEl) emailEl.textContent = state.user.email || 'Bhaiuuu Member';
      if (avatarEl) {
        avatarEl.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=6366f1`;
      }
    } else {
      // Guest or default demo identity
      if (nameEl) nameEl.textContent = 'Sourabh Dabhde';
      if (heroNameEl) heroNameEl.textContent = 'Sourabh';
      if (emailEl) emailEl.textContent = 'Bhaiuuu Portal Guest';
    }

    // Logout Button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        playSound('click');
        try {
          fetch('/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${state.token}`
            }
          });
        } catch (e) {}

        localStorage.removeItem('bhaiuuu_token');
        localStorage.removeItem('bhaiuuu_user');
        showToast('Signed Out', 'Returning to Bhaiuuu 3D Portal...', 'info', 1500);
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
      });
    }
  }

  // ==========================================
  // 7. CHAT CONVERSATIONS & HISTORY
  // ==========================================
  let conversations = [];

  async function loadConversations() {
    const listEl = document.getElementById('threadsList');
    if (!listEl) return;

    try {
      const headers = {};
      if (state.token) headers['Authorization'] = `Bearer ${state.token}`;

      const res = await fetch('/api/chats', { headers });
      if (res.ok) {
        const data = await res.json();
        conversations = data.chats || [];
      } else {
        // Fallback local storage
        const local = localStorage.getItem('bhaiuuu_local_chats');
        if (local) conversations = JSON.parse(local);
      }
    } catch (e) {
      console.warn('Could not fetch remote chats, loading local:', e);
      const local = localStorage.getItem('bhaiuuu_local_chats');
      if (local) conversations = JSON.parse(local);
    }

    renderThreadsList();
  }

  function renderThreadsList(filterQuery = '') {
    const listEl = document.getElementById('threadsList');
    if (!listEl) return;
    listEl.innerHTML = '';

    const filtered = conversations.filter(c =>
      c.title.toLowerCase().includes(filterQuery.toLowerCase())
    );

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="font-size: 0.78rem; color: var(--text-muted); padding: 12px 10px; text-align: center;">
          ${filterQuery ? 'No matching chats found' : 'No prior chats yet. Start one!'}
        </div>
      `;
      return;
    }

    filtered.forEach(chat => {
      const item = document.createElement('div');
      item.className = `thread-item ${chat.id === state.currentChatId ? 'active' : ''}`;
      item.innerHTML = `
        <div class="thread-info">
          <i class="fa-regular fa-message"></i>
          <span class="thread-title">${escapeHtml(chat.title)}</span>
        </div>
        <div class="thread-actions">
          <button class="delete-chat-btn" title="Delete conversation">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;

      item.addEventListener('click', (e) => {
        if (e.target.closest('.delete-chat-btn')) {
          e.stopPropagation();
          deleteChat(chat.id);
          return;
        }
        selectChat(chat.id);
      });

      listEl.appendChild(item);
    });
  }

  async function createNewChat() {
    playSound('click');
    const newChatObj = {
      id: 'chat_' + Date.now(),
      title: 'New Conversation',
      model: state.currentModel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers,
        body: JSON.stringify({ title: 'New Conversation', model: state.currentModel })
      });
      if (res.ok) {
        const data = await res.json();
        state.currentChatId = data.chat.id;
        conversations.unshift(data.chat);
      } else {
        state.currentChatId = newChatObj.id;
        conversations.unshift(newChatObj);
      }
    } catch (e) {
      state.currentChatId = newChatObj.id;
      conversations.unshift(newChatObj);
    }

    saveLocalChats();
    renderThreadsList();
    clearChatView();
  }

  function selectChat(chatId) {
    playSound('click');
    state.currentChatId = chatId;
    renderThreadsList();

    const chat = conversations.find(c => c.id === chatId);
    if (!chat) return;

    const feed = document.getElementById('messagesFeed');
    const hero = document.getElementById('welcomeHero');
    feed.innerHTML = '';

    if (!chat.messages || chat.messages.length === 0) {
      hero.style.display = 'flex';
      return;
    }

    hero.style.display = 'none';
    chat.messages.forEach(msg => {
      appendMessageToUI(msg.role, msg.content, msg.images, msg.groundingMetadata, false);
    });

    scrollToBottom();
  }

  async function deleteChat(chatId) {
    playSound('click');
    conversations = conversations.filter(c => c.id !== chatId);
    saveLocalChats();

    try {
      const headers = {};
      if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
      await fetch(`/api/chats/${chatId}`, { method: 'DELETE', headers });
    } catch (e) {}

    if (state.currentChatId === chatId) {
      state.currentChatId = null;
      clearChatView();
    }
    renderThreadsList();
    showToast('Chat Deleted', 'Conversation has been removed.', 'info', 2000);
  }

  function saveLocalChats() {
    try {
      localStorage.setItem('bhaiuuu_local_chats', JSON.stringify(conversations));
    } catch (e) {}
  }

  function clearChatView() {
    const feed = document.getElementById('messagesFeed');
    const hero = document.getElementById('welcomeHero');
    if (feed) feed.innerHTML = '';
    if (hero) hero.style.display = 'flex';
  }

  // ==========================================
  // 8. GEMINI CHAT INTERACTION
  // ==========================================
  const chatForm = document.getElementById('chatForm');
  const promptInput = document.getElementById('promptInput');
  const sendBtn = document.getElementById('sendBtn');
  const messagesFeed = document.getElementById('messagesFeed');
  const welcomeHero = document.getElementById('welcomeHero');

  // Auto-resize textarea
  if (promptInput) {
    promptInput.addEventListener('input', () => {
      promptInput.style.height = 'auto';
      promptInput.style.height = Math.min(promptInput.scrollHeight, 180) + 'px';
      updateCoreStatus('typing', 'BHAIUUU QUANTUM CORE // USER INPUT DETECTED');
    });

    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
      }
    });

    promptInput.addEventListener('blur', () => {
      if (!state.isGenerating) {
        updateCoreStatus('idle', 'BHAIUUU QUANTUM CORE // IDLE');
      }
    });
  }

  if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const text = promptInput.value.trim();
      const hasImage = state.attachedImage !== null;

      if (!text && !hasImage) return;
      if (state.isGenerating) return;

      const userText = text;
      const imagesToSend = state.attachedImage ? [state.attachedImage] : [];

      // Reset input UI
      promptInput.value = '';
      promptInput.style.height = '38px';
      clearAttachedImage();

      // Ensure we have an active chat session
      if (!state.currentChatId) {
        await createNewChat();
      }

      // Hide Hero
      if (welcomeHero) welcomeHero.style.display = 'none';

      // Append User message
      appendMessageToUI('user', userText, imagesToSend);
      playSound('send');

      // Update Core to thinking state
      state.isGenerating = true;
      sendBtn.disabled = true;
      updateCoreStatus('thinking', `BHAIUUU QUANTUM CORE // REASONING VIA ${state.currentModel.toUpperCase()}`);

      // Append temporary typing indicator
      const typingRow = showTypingIndicator();
      scrollToBottom();

      try {
        // Collect conversation context
        const currentChat = conversations.find(c => c.id === state.currentChatId);
        const historyPayload = currentChat && currentChat.messages ? currentChat.messages.slice(-8) : [];

        let effectiveSystemPrompt = state.systemPrompt;
        if (state.codeMode) {
          effectiveSystemPrompt += " Always provide complete, production-ready, clean code with syntax highlighting, modular architecture, and explanatory comments.";
        }
        if (state.enableThinking) {
          effectiveSystemPrompt += " Think methodically, detail your step-by-step reasoning chain, and synthesize deep architectural insights.";
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(state.token ? { 'Authorization': `Bearer ${state.token}` } : {})
          },
          body: JSON.stringify({
            prompt: userText,
            conversationHistory: historyPayload,
            model: state.currentModel,
            systemPrompt: effectiveSystemPrompt,
            images: imagesToSend,
            enableSearch: state.enableSearch,
            apiKey: state.customApiKey,
            chatId: state.currentChatId
          })
        });

        const data = await res.json();
        removeTypingIndicator(typingRow);

        if (!res.ok) {
          const errMsg = data.error || 'Gemini API Error occurred.';
          appendMessageToUI('model', `⚠️ **Error communicating with Gemini:**\n\n${errMsg}\n\n*Tip: Check your API Key in Settings (⚙️) or verify quota on Google AI Studio.*`);
          showToast('API Notice', errMsg, 'error', 4500);
          return;
        }

        const reply = data.reply || 'No response returned from model.';
        appendMessageToUI('model', reply, [], data.groundingMetadata);
        playSound('receive');

        // Update local session
        if (currentChat) {
          currentChat.messages.push({
            role: 'user',
            content: userText,
            images: imagesToSend,
            timestamp: new Date().toISOString()
          });
          currentChat.messages.push({
            role: 'model',
            content: reply,
            groundingMetadata: data.groundingMetadata,
            timestamp: new Date().toISOString()
          });
          if (currentChat.messages.length === 2 && currentChat.title === 'New Conversation') {
            currentChat.title = userText.slice(0, 32) + (userText.length > 32 ? '...' : '');
            renderThreadsList();
          }
          saveLocalChats();
        }

      } catch (err) {
        console.error('Chat submit error:', err);
        removeTypingIndicator(typingRow);
        appendMessageToUI('model', `🚨 **Network or System Error:** ${err.message}\n\nPlease verify that your Node server is running on http://localhost:3000.`);
        showToast('Error', err.message, 'error');
      } finally {
        state.isGenerating = false;
        sendBtn.disabled = false;
        updateCoreStatus('idle', 'BHAIUUU QUANTUM CORE // IDLE');
        scrollToBottom();
      }
    });
  }

  // Typing indicator
  function showTypingIndicator() {
    const row = document.createElement('div');
    row.className = 'message-row model typing-row';
    row.innerHTML = `
      <div class="message-avatar">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
      </div>
      <div class="message-content-wrapper">
        <div class="message-header">
          <span>Gemini Intelligence Synthesizing</span>
        </div>
        <div class="message-bubble typing-indicator">
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
          <div class="typing-dot"></div>
        </div>
      </div>
    `;
    messagesFeed.appendChild(row);
    return row;
  }

  function removeTypingIndicator(row) {
    if (row && row.parentNode) {
      row.parentNode.removeChild(row);
    }
  }

  // Render message bubble into feed
  function appendMessageToUI(role, content, images = [], grounding = null, animate = true) {
    const row = document.createElement('div');
    row.className = `message-row ${role}`;
    if (!animate) row.style.animation = 'none';

    const isUser = role === 'user';
    const avatarHtml = isUser
      ? `<div class="message-avatar"><i class="fa-solid fa-user"></i></div>`
      : `<div class="message-avatar"><i class="fa-solid fa-wand-magic-sparkles"></i></div>`;

    const senderTitle = isUser
      ? (state.user ? state.user.fullName : 'Sourabh Dabhde')
      : `Bhaiuuu Gemini (${state.currentModel})`;

    // Process attached images
    let imagesHtml = '';
    if (images && images.length > 0) {
      imagesHtml = '<div class="message-attachments">';
      images.forEach(img => {
        imagesHtml += `<img src="data:${img.mimeType};base64,${img.data}" class="message-attachment-img" alt="Attached file" />`;
      });
      imagesHtml += '</div>';
    }

    // Markdown content parsing
    let parsedContent = '';
    if (window.marked && typeof marked.parse === 'function') {
      try {
        parsedContent = marked.parse(content);
      } catch (e) {
        parsedContent = `<p>${escapeHtml(content)}</p>`;
      }
    } else {
      parsedContent = `<p>${escapeHtml(content).replace(/\n/g, '<br>')}</p>`;
    }

    // Grounding Web Search Sources Chips
    let groundingHtml = '';
    if (grounding && grounding.webSearchQueries) {
      groundingHtml = `
        <div class="grounding-box">
          <div class="grounding-title"><i class="fa-solid fa-globe"></i> Google Web Grounding Verified</div>
          <div class="grounding-sources">
            ${grounding.webSearchQueries.map(q => `<span class="grounding-chip"><i class="fa-solid fa-magnifying-glass"></i> ${escapeHtml(q)}</span>`).join('')}
          </div>
        </div>
      `;
    }

    // Model action buttons (Copy, Read Aloud, Regenerate)
    let actionsHtml = '';
    if (!isUser) {
      actionsHtml = `
        <div class="message-actions">
          <button class="msg-action-btn copy-msg-btn" title="Copy response">
            <i class="fa-regular fa-copy"></i>
          </button>
          <button class="msg-action-btn speak-msg-btn" title="Read response aloud">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        </div>
      `;
    }

    row.innerHTML = `
      ${avatarHtml}
      <div class="message-content-wrapper">
        <div class="message-header">
          <span>${senderTitle}</span>
        </div>
        <div class="message-bubble">
          ${imagesHtml}
          <div class="markdown-body">${parsedContent}</div>
          ${groundingHtml}
        </div>
        ${actionsHtml}
      </div>
    `;

    // Wrap Code Blocks with Header & Copy Button
    const preBlocks = row.querySelectorAll('pre');
    preBlocks.forEach((pre) => {
      const code = pre.querySelector('code');
      const langClass = code ? Array.from(code.classList).find(c => c.startsWith('language-')) : '';
      const lang = langClass ? langClass.replace('language-', '') : 'code';

      const container = document.createElement('div');
      container.className = 'code-block-container';

      const header = document.createElement('div');
      header.className = 'code-block-header';
      header.innerHTML = `
        <span class="code-lang"><i class="fa-solid fa-code"></i> ${lang}</span>
        <button class="copy-code-btn" type="button">
          <i class="fa-regular fa-copy"></i>
          <span>Copy</span>
        </button>
      `;

      pre.parentNode.insertBefore(container, pre);
      container.appendChild(header);
      container.appendChild(pre);

      const copyBtn = header.querySelector('.copy-code-btn');
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(code ? code.innerText : pre.innerText).then(() => {
          copyBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Copied!</span>`;
          playSound('click');
          setTimeout(() => {
            copyBtn.innerHTML = `<i class="fa-regular fa-copy"></i> <span>Copy</span>`;
          }, 2000);
        });
      });
    });

    // Highlight code blocks
    if (window.hljs) {
      row.querySelectorAll('pre code').forEach((el) => {
        hljs.highlightElement(el);
      });
    }

    // Wire up Action Buttons
    const copyMsgBtn = row.querySelector('.copy-msg-btn');
    if (copyMsgBtn) {
      copyMsgBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(content).then(() => {
          showToast('Copied', 'Message text copied to clipboard.', 'info', 1800);
          playSound('click');
        });
      });
    }

    const speakMsgBtn = row.querySelector('.speak-msg-btn');
    if (speakMsgBtn) {
      speakMsgBtn.addEventListener('click', () => {
        speakText(content);
      });
    }

    messagesFeed.appendChild(row);
    scrollToBottom();
  }

  function scrollToBottom() {
    const viewport = document.getElementById('chatViewport');
    if (viewport) {
      viewport.scrollTop = viewport.scrollHeight;
    }
  }

  // ==========================================
  // 9. GEMINI TOOLS: SPEECH, VISION, SEARCH
  // ==========================================

  // Text-To-Speech
  function speakText(text) {
    if (!('speechSynthesis' in window)) {
      showToast('Unavailable', 'Speech synthesis is not supported in this browser.', 'error');
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      updateCoreStatus('idle');
      return;
    }

    // Clean markdown before speaking
    const cleanText = text.replace(/[`*#_\[\]()]/g, '').slice(0, 1500);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      updateCoreStatus('speaking', 'BHAIUUU QUANTUM CORE // SPEECH SYNTHESIS ACTIVE');
    };
    utterance.onend = () => {
      updateCoreStatus('idle', 'BHAIUUU QUANTUM CORE // IDLE');
    };
    utterance.onerror = () => {
      updateCoreStatus('idle');
    };

    window.speechSynthesis.speak(utterance);
  }

  // Voice Recognition (Mic)
  const voiceInputBtn = document.getElementById('voiceInputBtn');
  let recognition = null;

  if (voiceInputBtn && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRec();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let isListening = false;

    voiceInputBtn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
        return;
      }

      try {
        recognition.start();
        isListening = true;
        voiceInputBtn.classList.add('listening');
        playSound('click');
        showToast('Listening...', 'Speak your question or prompt.', 'info', 2000);
        updateCoreStatus('typing', 'BHAIUUU QUANTUM CORE // AUDIO RECOGNITION ACTIVE');
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    });

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      promptInput.value = transcript;
      promptInput.style.height = 'auto';
      promptInput.style.height = promptInput.scrollHeight + 'px';
    };

    recognition.onend = () => {
      isListening = false;
      voiceInputBtn.classList.remove('listening');
      updateCoreStatus('idle');
    };

    recognition.onerror = (e) => {
      isListening = false;
      voiceInputBtn.classList.remove('listening');
      updateCoreStatus('idle');
      showToast('Microphone Error', e.error || 'Voice recognition stopped.', 'error');
    };
  } else if (voiceInputBtn) {
    voiceInputBtn.style.opacity = '0.5';
    voiceInputBtn.title = 'Speech recognition requires Chrome or Edge';
  }

  // Multimodal Image Attachment
  const attachImageBtn = document.getElementById('attachImageBtn');
  const imageFileInput = document.getElementById('imageFileInput');
  const attachmentBar = document.getElementById('attachmentPreviewBar');
  const attachmentThumb = document.getElementById('attachmentThumbnail');
  const attachmentName = document.getElementById('attachmentName');
  const removeAttachmentBtn = document.getElementById('removeAttachmentBtn');

  if (attachImageBtn && imageFileInput) {
    attachImageBtn.addEventListener('click', () => {
      imageFileInput.click();
    });

    imageFileInput.addEventListener('change', () => {
      const file = imageFileInput.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Invalid File', 'Please upload a PNG, JPEG, or WEBP image file.', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const fullBase64 = e.target.result;
        const base64Data = fullBase64.split(',')[1];
        state.attachedImage = {
          data: base64Data,
          mimeType: file.type,
          name: file.name
        };

        if (attachmentThumb) attachmentThumb.src = fullBase64;
        if (attachmentName) attachmentName.textContent = file.name;
        if (attachmentBar) attachmentBar.style.display = 'flex';

        playSound('click');
        showToast('Image Attached', `${file.name} is ready for Gemini Vision Multimodal analysis.`, 'success', 2500);
      };
      reader.readAsDataURL(file);
    });

    if (removeAttachmentBtn) {
      removeAttachmentBtn.addEventListener('click', clearAttachedImage);
    }
  }

  function clearAttachedImage() {
    state.attachedImage = null;
    if (imageFileInput) imageFileInput.value = '';
    if (attachmentBar) attachmentBar.style.display = 'none';
  }

  // Tools Toggles (Web Search, Thinking, Code Mode)
  const toolSearchToggle = document.getElementById('toolSearchToggle');
  const toolThinkingToggle = document.getElementById('toolThinkingToggle');
  const toolCodeModeToggle = document.getElementById('toolCodeModeToggle');

  if (toolSearchToggle) {
    toolSearchToggle.addEventListener('click', () => {
      state.enableSearch = !state.enableSearch;
      toolSearchToggle.classList.toggle('active', state.enableSearch);
      playSound('click');
      showToast(
        'Google Web Search',
        state.enableSearch ? 'Grounding enabled. Gemini will verify with real-time web results.' : 'Web search disabled.',
        'info',
        2200
      );
    });
  }

  if (toolThinkingToggle) {
    toolThinkingToggle.addEventListener('click', () => {
      state.enableThinking = !state.enableThinking;
      toolThinkingToggle.classList.toggle('active', state.enableThinking);
      playSound('click');
      showToast(
        'Deep Thinking Mode',
        state.enableThinking ? 'Activated deep reasoning and architectural synthesis.' : 'Deep thinking mode disabled.',
        'info',
        2200
      );
    });
  }

  if (toolCodeModeToggle) {
    toolCodeModeToggle.addEventListener('click', () => {
      state.codeMode = !state.codeMode;
      toolCodeModeToggle.classList.toggle('active', state.codeMode);
      playSound('click');
      showToast(
        'Code Execution Mode',
        state.codeMode ? 'Bhaiuuu AI is primed for production code generation.' : 'Standard conversation mode.',
        'info',
        2200
      );
    });
  }

  // Starter Cards Quick Fill
  const starterCards = document.querySelectorAll('.starter-card');
  starterCards.forEach((card) => {
    card.addEventListener('click', () => {
      const prompt = card.getAttribute('data-prompt');
      if (prompt && promptInput) {
        promptInput.value = prompt;
        promptInput.focus();
        promptInput.style.height = 'auto';
        promptInput.style.height = promptInput.scrollHeight + 'px';
        playSound('click');
      }
    });
  });

  // ==========================================
  // 10. MODEL SELECTOR
  // ==========================================
  const modelSelectBtn = document.getElementById('modelSelectBtn');
  const modelDropdownWrapper = document.querySelector('.model-selector-wrapper');
  const currentModelName = document.getElementById('currentModelName');
  const currentModelBadge = document.getElementById('currentModelBadge');
  const dockModelLabel = document.getElementById('dockModelLabel');
  const modelOptions = document.querySelectorAll('.model-option');

  if (modelSelectBtn && modelDropdownWrapper) {
    modelSelectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      playSound('click');
      modelDropdownWrapper.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!modelDropdownWrapper.contains(e.target)) {
        modelDropdownWrapper.classList.remove('open');
      }
    });

    modelOptions.forEach((opt) => {
      opt.addEventListener('click', () => {
        modelOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');

        const modelId = opt.getAttribute('data-model');
        const name = opt.querySelector('.option-name').textContent;
        const badge = opt.querySelector('.pill') ? opt.querySelector('.pill').textContent.toUpperCase() : 'AI';

        state.currentModel = modelId;
        if (currentModelName) currentModelName.textContent = name;
        if (currentModelBadge) currentModelBadge.textContent = badge;
        if (dockModelLabel) dockModelLabel.textContent = name;

        modelDropdownWrapper.classList.remove('open');
        playSound('click');
        showToast('Engine Switched', `Active model set to ${name}.`, 'info', 2200);
      });
    });
  }

  // ==========================================
  // 11. SIDEBAR CONTROLS & NEW CHAT
  // ==========================================
  const sidebar = document.getElementById('sidebar');
  const sidebarCollapseBtn = document.getElementById('sidebarCollapseBtn');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const newChatBtn = document.getElementById('newChatBtn');
  const searchHistoryInput = document.getElementById('searchHistoryInput');

  if (sidebarCollapseBtn && sidebar) {
    sidebarCollapseBtn.addEventListener('click', () => {
      playSound('click');
      sidebar.classList.toggle('collapsed');
    });
  }

  if (mobileMenuBtn && sidebar) {
    mobileMenuBtn.addEventListener('click', () => {
      playSound('click');
      sidebar.classList.toggle('mobile-open');
    });
  }

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      createNewChat();
    });
  }

  // Keyboard shortcut Ctrl + N for new chat
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
      e.preventDefault();
      createNewChat();
    }
  });

  if (searchHistoryInput) {
    searchHistoryInput.addEventListener('input', (e) => {
      renderThreadsList(e.target.value.trim());
    });
  }

  // ==========================================
  // 12. TOP BAR CONTROLS (3D CORE, AUDIO, THEME)
  // ==========================================
  const toggle3DCoreBtn = document.getElementById('toggle3DCoreBtn');
  const aiCoreSection = document.getElementById('aiCoreSection');

  if (toggle3DCoreBtn && aiCoreSection) {
    toggle3DCoreBtn.addEventListener('click', () => {
      playSound('click');
      const isHidden = aiCoreSection.classList.toggle('hidden');
      toggle3DCoreBtn.classList.toggle('active', !isHidden);
    });
  }

  const soundToggle = document.getElementById('soundToggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      state.soundEnabled = !state.soundEnabled;
      const icon = soundToggle.querySelector('i');
      if (state.soundEnabled) {
        icon.className = 'fa-solid fa-volume-high';
        playSound('click');
        showToast('Sound On', 'Futuristic audio cues are active.', 'info', 1800);
      } else {
        icon.className = 'fa-solid fa-volume-xmark';
        showToast('Sound Muted', 'Audio cues disabled.', 'info', 1800);
      }
    });
  }

  // Dynamic Theme Aura Switcher
  const accentDots = document.querySelectorAll('.accent-dot');
  accentDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      playSound('click');
      accentDots.forEach(d => d.classList.remove('active'));
      dot.classList.add('active');

      const color = dot.getAttribute('data-color');
      state.theme = color;
      document.body.setAttribute('data-theme', color);
      showToast('Aura Updated', `Theme aura transitioned to ${color.toUpperCase()}.`, 'info', 1800);
    });
  });

  // ==========================================
  // 13. SETTINGS MODAL
  // ==========================================
  const settingsModal = document.getElementById('settingsModal');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const resetSettingsBtn = document.getElementById('resetSettingsBtn');
  const customApiKeyInput = document.getElementById('customApiKeyInput');
  const systemPromptInput = document.getElementById('systemPromptInput');
  const temperatureSlider = document.getElementById('temperatureSlider');
  const tempValDisplay = document.getElementById('tempValDisplay');
  const apiKeyVisibilityBtn = document.getElementById('apiKeyVisibilityBtn');

  if (openSettingsBtn && settingsModal) {
    openSettingsBtn.addEventListener('click', () => {
      playSound('click');
      if (customApiKeyInput) customApiKeyInput.value = state.customApiKey;
      if (systemPromptInput) systemPromptInput.value = state.systemPrompt;
      if (temperatureSlider) temperatureSlider.value = state.temperature;
      if (tempValDisplay) tempValDisplay.textContent = state.temperature;
      settingsModal.style.display = 'flex';
    });

    closeSettingsBtn.addEventListener('click', () => {
      playSound('click');
      settingsModal.style.display = 'none';
    });

    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        settingsModal.style.display = 'none';
      }
    });

    if (temperatureSlider && tempValDisplay) {
      temperatureSlider.addEventListener('input', (e) => {
        tempValDisplay.textContent = e.target.value;
      });
    }

    if (apiKeyVisibilityBtn && customApiKeyInput) {
      apiKeyVisibilityBtn.addEventListener('click', () => {
        const isPass = customApiKeyInput.type === 'password';
        customApiKeyInput.type = isPass ? 'text' : 'password';
        apiKeyVisibilityBtn.querySelector('i').className = isPass ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
      });
    }

    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        playSound('click');
        state.customApiKey = customApiKeyInput ? customApiKeyInput.value.trim() : '';
        state.systemPrompt = systemPromptInput ? systemPromptInput.value.trim() : '';
        state.temperature = temperatureSlider ? parseFloat(temperatureSlider.value) : 0.7;

        localStorage.setItem('bhaiuuu_custom_key', state.customApiKey);
        localStorage.setItem('bhaiuuu_system_prompt', state.systemPrompt);
        localStorage.setItem('bhaiuuu_temp', state.temperature.toString());

        settingsModal.style.display = 'none';
        showToast('Settings Saved', 'Your Gemini preferences have been updated.', 'success', 2500);
      });
    }

    if (resetSettingsBtn) {
      resetSettingsBtn.addEventListener('click', () => {
        playSound('click');
        state.customApiKey = '';
        state.systemPrompt = '';
        state.temperature = 0.7;
        localStorage.removeItem('bhaiuuu_custom_key');
        localStorage.removeItem('bhaiuuu_system_prompt');
        localStorage.removeItem('bhaiuuu_temp');
        if (customApiKeyInput) customApiKeyInput.value = '';
        if (systemPromptInput) systemPromptInput.value = '';
        if (temperatureSlider) temperatureSlider.value = 0.7;
        if (tempValDisplay) tempValDisplay.textContent = '0.7';
        showToast('Reset Complete', 'Default settings restored.', 'info', 2000);
      });
    }
  }

  // Escape HTML helper
  function escapeHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================
  // 14. INITIALIZATION
  // ==========================================
  setupUserProfile();
  loadConversations();

  // Welcome Toast
  setTimeout(() => {
    showToast(
      'Quantum Workspace Online',
      'Powered by Google Gemini. Multimodal vision, search grounding & 3D Core active.',
      'info',
      4000
    );
  }, 700);

})();
