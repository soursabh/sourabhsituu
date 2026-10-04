# Bhaiuuu - 3D Futuristic Portal & Gemini AI Workspace 🚀🤖✨

Ek ultra-advanced, production-ready Full-Stack 3D AI Portal jo **Sourabh Dabhde (Bhaiuuu)** ke liye design kiya gaya hai. Isme 3D Login Page se lekar main page par ek **Gemini-style 3D AI Chatbot** tak pura frontend aur backend system complete banaya gaya hai.

---

## 🌟 Key Highlights & System Architecture

### 1. 🔐 3D Login & Authentication System
- **Real 3D Perspective Tilt**: Mouse move karne par login card 3D space me dynamically tilt hota hai with realistic specular glass reflections.
- **Orbiting Cursor Particle Swarm**: Mouse ke sath swirling glowing micro-particles ("chote chote bindu") aur constellation lines.
- **Smooth Transition to Main Page**: Sign In ya Register karte hi futuristic quantum warp transition animation chalta hai aur user automatically **Main Chatbot Page (`chat.html`)** par enter ho jata hai.
- **Backend Authentication**: Node.js & Express API (`/api/auth/login`, `/api/auth/register`) hashed passwords aur secure session tokens ke sath.

### 2. 🤖 Gemini 3D Chatbot Main Page (`chat.html`)
- **3D Holographic AI Energy Core**:
  - Center/Top me ek living 3D Hologram Orb jo user ke har action par dynamically react karta hai:
    - 🟢 *Idle Mode*: Gentle floating rotation & pulsing nodes.
    - 🔵 *Typing / Listening*: Amplitude badhata hai aur active waveform banata hai.
    - ⚡ *Thinking Mode*: Fast hyper-rotation, particle flurry aur glowing energy rings.
    - 🔊 *Speaking Mode*: Audio-reactive wave oscillations.
- **Official Google Gemini API Integration**:
  - Aapki di gayi Gemini API Key backend `.env` file me securely configured hai.
  - Resilient **Multi-Model Auto-Fallback Engine**: Google server par high-demand ya load spike hone par automatic best available model (`gemini-3.8-flash`, `gemini-3.7-flash`, `gemini-3.6-flash`, etc.) se instant answer deta hai!
- **Gemini Intelligence Tools**:
  - 🌐 **Google Web Search Grounding**: Toggle button on karne par Gemini real-time web results verify karke source citation chips deta hai.
  - 🧠 **Deep Thinking Mode**: Architectural reasoning aur step-by-step logic explain karta hai.
  - 💻 **Code Mode**: Complete, production-ready code with syntax highlighting aur **Copy Code** button.
  - 🖼️ **Multimodal Vision (Image Upload)**: Photos, screenshots aur diagram upload karke Gemini se analyze karwaye.
  - 🎙️ **Voice Input (Speech-to-Text)**: Microphone button dabakar bol kar prompt likhein.
  - 🔊 **Voice Output (Text-to-Speech)**: Gemini ke reply ko high-tech voice me sunein.
- **Gemini-Style History Sidebar**:
  - **New Chat (+)** button (Keyboard shortcut: `Ctrl + N`).
  - Search conversation history.
  - Past chats list, title auto-naming, rename & delete controls.
  - User profile with avatar and instant Logout back to 3D portal.
- **Dynamic Theme Aura & Sound FX**:
  - 🟣 Cosmic Purple (Default) | 🔵 Cyber Cyan | 🟢 Neon Emerald | 🔴 Hyper Rose
  - Futuristic Web Audio synthesizer clicks, sends, aur receive chimes.

---

## 📁 Project Structure

```
J:\sourabh\001\bhaiuu/
├── .env                  # Port & Gemini API Key configuration
├── package.json          # Node.js dependencies (express, cors, dotenv, multer)
├── server.js             # Full-Stack Express backend API & static server
├── data/
│   ├── users.json        # Persistent user credentials & profiles
│   └── chats.json        # Persistent chat history & conversations
├── index.html            # 3D Futuristic Login & Register Portal
├── style.css             # Login page 3D styles & glassmorphism
├── script.js             # Login page particle engine & backend auth
├── chat.html             # Main Page: Gemini 3D AI Workspace
├── chat.css              # Main Page: 3D UI, Sidebar & Code Highlights
├── chat.js               # Main Page: 3D Hologram Orb & Gemini Chat Engine
└── README.md             # Complete Documentation
```

---

## 🚀 Server Kaise Start Karein

Backend server background me already active hai: **`http://localhost:3000`**

Agar kabhi manual start karna ho:
```bash
npm start
```
Browser me open karein:
- **Login Portal**: [http://localhost:3000](http://localhost:3000) ya [http://localhost:3000/index.html](http://localhost:3000/index.html)
- **Direct 3D Chatbot**: [http://localhost:3000/chat.html](http://localhost:3000/chat.html)

---

## 👤 Default Demo Credentials
- **Username**: `sourabh`
- **Password**: `bhaiuuu123`
*(Ya aap naye account ke liye "Create Account" tab se turant register kar sakte hain!)*
