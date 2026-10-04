const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage for uploaded images
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Ensure data folder and json storage exist
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const CHATS_FILE = path.join(DATA_DIR, 'chats.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJSON(filePath, defaultVal = []) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultVal, null, 2));
      return defaultVal;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultVal;
  }
}

function saveJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
  }
}

// Password hashing with salt
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password, hash, salt) {
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return checkHash === hash;
}

// In-memory active tokens
const activeSessions = new Map();

function generateToken(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, { userId, createdAt: Date.now() });
  return token;
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session) {
    // If server restarted, allow fallback verification if user exists
    return res.status(401).json({ error: 'Session expired. Please log in again.' });
  }
  req.userId = session.userId;
  next();
}

// Optional Auth (for guest / demo access)
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = activeSessions.get(token);
    if (session) {
      req.userId = session.userId;
    }
  }
  next();
}

// Seed default demo user if empty
const initialUsers = loadJSON(USERS_FILE, []);
if (initialUsers.length === 0) {
  const { hash, salt } = hashPassword('bhaiuuu123');
  initialUsers.push({
    id: 'user_demo_1',
    fullName: 'Sourabh Dabhde',
    email: 'sourabh@bhaiuuu.ai',
    username: 'sourabh',
    passwordHash: hash,
    salt,
    createdAt: new Date().toISOString()
  });
  saveJSON(USERS_FILE, initialUsers);
}

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================

// Register
app.post('/api/auth/register', (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Please provide fullName, email, and password.' });
    }

    const users = loadJSON(USERS_FILE, []);
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const { hash, salt } = hashPassword(password);
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
    const newUser = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      fullName,
      email: email.toLowerCase(),
      username,
      passwordHash: hash,
      salt,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveJSON(USERS_FILE, users);

    const token = generateToken(newUser.id);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser.id,
        fullName: newUser.fullName,
        email: newUser.email,
        username: newUser.username
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Username/Email and Password are required.' });
    }

    const users = loadJSON(USERS_FILE, []);
    const user = users.find(
      u => u.email.toLowerCase() === identifier.toLowerCase() ||
           u.username.toLowerCase() === identifier.toLowerCase()
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email/username or password.' });
    }

    const token = generateToken(user.id);
    return res.json({
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        username: user.username
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authMiddleware, (req, res) => {
  const users = loadJSON(USERS_FILE, []);
  const user = users.find(u => u.id === req.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      username: user.username,
      createdAt: user.createdAt
    }
  });
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  return res.json({ success: true, message: 'Logged out successfully.' });
});

// ==========================================
// CHAT CONVERSATIONS ROUTES
// ==========================================

// Get user chats
app.get('/api/chats', optionalAuth, (req, res) => {
  const userId = req.userId || 'guest';
  const allChats = loadJSON(CHATS_FILE, []);
  const userChats = allChats
    .filter(c => c.userId === userId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return res.json({ chats: userChats });
});

// Create new chat
app.post('/api/chats', optionalAuth, (req, res) => {
  const userId = req.userId || 'guest';
  const { title = 'New Conversation', model = 'gemini-2.5-flash' } = req.body;
  const allChats = loadJSON(CHATS_FILE, []);

  const newChat = {
    id: 'chat_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    userId,
    title,
    model,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: []
  };

  allChats.unshift(newChat);
  saveJSON(CHATS_FILE, allChats);

  return res.status(201).json({ chat: newChat });
});

// Get single chat
app.get('/api/chats/:id', optionalAuth, (req, res) => {
  const { id } = req.params;
  const allChats = loadJSON(CHATS_FILE, []);
  const chat = allChats.find(c => c.id === id);

  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }
  return res.json({ chat });
});

// Update chat (e.g. rename or save messages)
app.put('/api/chats/:id', optionalAuth, (req, res) => {
  const { id } = req.params;
  const { title, messages } = req.body;
  const allChats = loadJSON(CHATS_FILE, []);
  const chat = allChats.find(c => c.id === id);

  if (!chat) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  if (title) chat.title = title;
  if (messages) chat.messages = messages;
  chat.updatedAt = new Date().toISOString();

  saveJSON(CHATS_FILE, allChats);
  return res.json({ chat });
});

// Delete chat
app.delete('/api/chats/:id', optionalAuth, (req, res) => {
  const { id } = req.params;
  let allChats = loadJSON(CHATS_FILE, []);
  const initialLength = allChats.length;
  allChats = allChats.filter(c => c.id !== id);

  if (allChats.length === initialLength) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  saveJSON(CHATS_FILE, allChats);
  return res.json({ success: true, message: 'Chat deleted' });
});

// ==========================================
// GEMINI AI INTEGRATION
// ==========================================

// Get available models
app.get('/api/models', (req, res) => {
  const models = [
    {
      id: 'gemini-3.8-flash',
      name: 'Gemini 3.8 Flash',
      description: 'Super-fast, cutting-edge intelligence for chat, multimodal reasoning & code',
      badge: 'RECOMMENDED',
      speed: 'Instant & Smart',
      multimodal: true
    },
    {
      id: 'gemini-3.7-flash',
      name: 'Gemini 3.7 Flash',
      description: 'Advanced hybrid reasoning, deep mathematical logic and system design',
      badge: 'HYBRID REASONING',
      speed: 'Deep Thinking',
      multimodal: true
    },
    {
      id: 'gemini-3.6-flash',
      name: 'Gemini 3.6 Flash',
      description: 'Next-gen low latency multimodal foundation model with high precision',
      badge: 'STABLE',
      speed: 'Ultra Fast',
      multimodal: true
    },
    {
      id: 'gemini-3.5-flash',
      name: 'Gemini 3.5 Flash',
      description: 'High-throughput balanced model for complex contextual queries',
      badge: 'BALANCED',
      speed: 'Fast',
      multimodal: true
    },
    {
      id: 'gemini-3.1-flash-lite',
      name: 'Gemini 3.1 Flash Lite',
      description: 'Ultra-lightweight engine optimized for rapid response times',
      badge: 'LIGHTWEIGHT',
      speed: 'Blazing Fast',
      multimodal: true
    }
  ];
  return res.json({ models, defaultModel: 'gemini-3.8-flash' });
});

// Config status
app.get('/api/config', (req, res) => {
  res.json({
    hasApiKey: !!(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''),
    defaultModel: process.env.DEFAULT_MODEL || 'gemini-3.8-flash',
    version: '2.0.0'
  });
});

// Multimodal file upload helper
app.post('/api/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const base64Data = req.file.buffer.toString('base64');
  const mimeType = req.file.mimetype;

  return res.json({
    success: true,
    mimeType,
    data: base64Data,
    fileName: req.file.originalname,
    size: req.file.size
  });
});

/**
 * Core Gemini Chat API Endpoint
 * Supports:
 * - Text prompts & Conversation History
 * - Multimodal Images (inlineData base64)
 * - Google Web Search Grounding Tool
 * - System Instructions
 * - Client-supplied or Server-configured API Key
 */
app.post('/api/chat', async (req, res) => {
  try {
    const {
      prompt,
      conversationHistory = [],
      model = process.env.DEFAULT_MODEL || 'gemini-3.8-flash',
      systemPrompt,
      images = [],
      enableSearch = false,
      apiKey: userApiKey,
      chatId
    } = req.body;

    const keyToUse = userApiKey || GEMINI_API_KEY;

    if (!keyToUse) {
      return res.status(400).json({
        error: 'Gemini API Key is missing. Please configure GEMINI_API_KEY in .env or provide it in settings.'
      });
    }

    if (!prompt && (!images || images.length === 0)) {
      return res.status(400).json({ error: 'Please provide a message or image to continue.' });
    }

    // Format Gemini contents payload
    const contents = [];

    // Add prior conversation turns if any
    for (const msg of conversationHistory) {
      const role = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
      const parts = [];

      if (msg.images && Array.isArray(msg.images)) {
        for (const img of msg.images) {
          if (img.data && img.mimeType) {
            parts.push({
              inlineData: {
                mimeType: img.mimeType,
                data: img.data
              }
            });
          }
        }
      }

      if (msg.content) {
        parts.push({ text: msg.content });
      }

      if (parts.length > 0) {
        contents.push({ role, parts });
      }
    }

    // Add current user prompt
    const currentParts = [];
    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (img.data && img.mimeType) {
          currentParts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.data
            }
          });
        }
      }
    }

    if (prompt) {
      currentParts.push({ text: prompt });
    }

    contents.push({
      role: 'user',
      parts: currentParts
    });

    // Default System Instruction
    const defaultInstruction = "You are Bhaiuuu 3D AI, an ultra-advanced, helpful, and creative AI assistant crafted with high precision for Sourabh Dabhde (Bhaiuuu). You provide clear, well-structured, modern explanations with markdown, code snippets, and insightful thoughts. Maintain an encouraging, intelligent, and visionary tone.";

    const systemInstruction = {
      parts: [{ text: systemPrompt || defaultInstruction }]
    };

    // Tools payload (Google Search Grounding)
    const tools = [];
    if (enableSearch) {
      tools.push({ google_search: {} });
    }

    const payload = {
      contents,
      systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192
      }
    };

    if (tools.length > 0) {
      payload.tools = tools;
    }

    // Multi-model fallback list if primary model experiences 503 high demand or 429 spike
    const fallbackModels = [
      model,
      'gemini-3.8-flash',
      'gemini-3.7-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash',
      'gemini-3.1-flash-lite'
    ].filter((m, idx, arr) => arr.indexOf(m) === idx);

    let geminiRes = null;
    let data = null;
    let successfulModel = model;

    for (const tryModel of fallbackModels) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${tryModel}:generateContent?key=${keyToUse}`;
      try {
        geminiRes = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        data = await geminiRes.json();

        if (geminiRes.ok) {
          successfulModel = tryModel;
          break;
        }

        // If error is 503 (high demand) or 404 (model not found) or 429, try next model
        if (geminiRes.status === 503 || geminiRes.status === 404 || geminiRes.status === 429) {
          console.warn(`Model ${tryModel} returned status ${geminiRes.status}. Attempting fallback model...`);
          continue;
        } else {
          break;
        }
      } catch (fetchErr) {
        console.warn(`Fetch error with ${tryModel}:`, fetchErr.message);
      }
    }

    if (!geminiRes || !geminiRes.ok) {
      console.error('Gemini API Error Response:', data);
      const errMsg = data?.error?.message || 'Error occurred while contacting Gemini API.';
      return res.status(geminiRes ? geminiRes.status : 500).json({
        error: errMsg,
        details: data?.error
      });
    }

    // Extract response text
    let replyText = '';
    const candidate = data.candidates && data.candidates[0];

    if (candidate && candidate.content && candidate.content.parts) {
      replyText = candidate.content.parts.map(p => p.text || '').join('');
    }

    // Extract search grounding metadata if present
    const groundingMetadata = candidate?.groundingMetadata || null;

    // Persist to chat file if chatId is provided
    if (chatId) {
      const allChats = loadJSON(CHATS_FILE, []);
      const currentChat = allChats.find(c => c.id === chatId);
      if (currentChat) {
        currentChat.messages.push({
          role: 'user',
          content: prompt,
          images: images || [],
          timestamp: new Date().toISOString()
        });
        currentChat.messages.push({
          role: 'model',
          content: replyText,
          model: successfulModel,
          groundingMetadata,
          timestamp: new Date().toISOString()
        });
        currentChat.updatedAt = new Date().toISOString();
        if (currentChat.messages.length === 2 && currentChat.title === 'New Conversation') {
          currentChat.title = prompt.slice(0, 35) + (prompt.length > 35 ? '...' : '');
        }
        saveJSON(CHATS_FILE, allChats);
      }
    }

    return res.json({
      success: true,
      model: successfulModel,
      reply: replyText,
      groundingMetadata,
      usageMetadata: data.usageMetadata
    });

  } catch (err) {
    console.error('Chat endpoint error:', err);
    return res.status(500).json({
      error: 'Server error: ' + (err.message || 'Unknown error occurred.')
    });
  }
});

// Serve frontend static files
app.use(express.static(__dirname));

// Route aliases
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Bhaiuuu 3D Portal & Gemini AI System Running`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`✨ Login Portal: http://localhost:${PORT}/index.html`);
  console.log(`🤖 Gemini 3D Chatbot: http://localhost:${PORT}/chat.html`);
  console.log(`🔑 Gemini API Key configured: ${GEMINI_API_KEY ? 'YES ✅' : 'NO ❌'}`);
  console.log(`===============================================`);
});
