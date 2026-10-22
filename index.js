"use strict";
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ── আপনার Pterodactyl প্যানেলের মূল লিংক ──
const PTERO_BASE_URL = "http://169.58.175.210:3170";

// ── স্ট্যাটিক ফাইল (লোগো ও ভিডিও) সার্ভ করা ──
app.use("/utils", express.static(path.join(__dirname, "utils")));

// ── Proxy API Routes (প্যানেলে রিকোয়েস্ট ফরওয়ার্ড করা) ──
app.use("/api", async (req, res) => {
  try {
    const response = await axios({
      method: req.method,
      url: `${PTERO_BASE_URL}/api${req.url}`,
      data: req.body,
      headers: { "Content-Type": "application/json" },
      timeout: 30000
    });
    res.json(response.data);
  } catch (error) {
    console.error("[Proxy Error]", error.message);
    res.status(error.response?.status || 500).json(
      error.response?.data || { ok: false, error: error.message }
    );
  }
});

// ── FRONTEND UI (আপনার web.js থেকে হুবহু নেওয়া) ──
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TANVIR-XMD | Premium Pair Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg-color: #f0f4f8;
      --card-bg: #ffffff;
      --text-main: #0f172a;
      --text-muted: #64748b;
      --accent: #1a73e8;
      --accent-hover: #1557b0;
      --border-color: #e2e8f0;
      --success: #10b981;
      --danger: #ef4444;
      --font: 'Inter', sans-serif;
      --scroll-color: #1a73e8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-color);
      background-image: radial-gradient(#cbd5e1 1px, transparent 1px);
      background-size: 24px 24px;
      color: var(--text-main);
      font-family: var(--font);
      display: flex;
      justify-content: center;
      min-height: 100vh;
      position: relative;
      padding: 20px 20px 60px;
      transition: background 0.3s ease;
    }

    #loader-overlay {
      position: fixed; inset: 0; background: #f0f4f8; z-index: 99999;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      transition: opacity 0.5s ease;
    }
    .loader-logo { 
      width: 100px; height: 100px; border-radius: 24px; object-fit: cover; 
      box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 20px; 
      animation: pulse-logo 2s infinite ease-in-out;
    }
    @keyframes pulse-logo { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .loader-title { font-size: 32px; font-weight: 800; letter-spacing: 2px; color: #0f172a; margin-bottom: 8px; }
    .loader-title span { color: #1a73e8; }
    .loader-subtitle { font-size: 13px; color: #64748b; font-weight: 600; letter-spacing: 1.5px; margin-bottom: 25px; text-transform: uppercase; }
    .loader-dots { display: flex; gap: 10px; }
    .loader-dots span { width: 12px; height: 12px; border-radius: 50%; background: #cbd5e1; animation: pulse-dot 1.4s infinite ease-in-out both; }
    .loader-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loader-dots span:nth-child(2) { animation-delay: -0.16s; }
    .loader-dots span:nth-child(3) { background: #1a73e8; }
    @keyframes pulse-dot { 0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }

    .scroll-bar {
      position: fixed; top: 0; left: 0; height: 4px; width: 100%;
      background: var(--scroll-color); z-index: 9999;
      transition: background 0.3s ease; box-shadow: 0 0 10px var(--scroll-color);
    }

    .container { width: 100%; max-width: 480px; display: flex; flex-direction: column; gap: 20px; z-index: 10; }
    .page { display: none; flex-direction: column; gap: 20px; animation: fadeIn 0.4s ease; }
    .page.active { display: flex; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .header { display: flex; justify-content: space-between; align-items: center; background: #fff; padding: 12px 16px; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .logo { width: 40px; height: 40px; border-radius: 12px; object-fit: cover; }
    .header-title { font-size: 18px; font-weight: 800; color: var(--accent); }
    .header-subtitle { font-size: 10px; color: var(--text-muted); font-weight: 600; letter-spacing: 1px; }
    .badge-live { background: #ecfdf5; color: var(--success); padding: 6px 12px; border-radius: 50px; font-size: 11px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
    .dot-live { width: 8px; height: 8px; background: var(--success); border-radius: 50%; animation: pulse 1.5s infinite; }
    @keyframes pulse { 0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); } 70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); } 100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }

    .hero-title { text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 2px; margin: 10px 0; }
    .hero-title span { color: var(--accent); }
    .hero-subtitle { text-align: center; color: var(--text-muted); font-size: 14px; margin-bottom: 10px; line-height: 1.5; }

    .welcome-card { background: linear-gradient(135deg, #1a73e8, #1557b0); border-radius: 24px; padding: 24px; color: #fff; position: relative; overflow: hidden; }
    .welcome-card::after { content: ""; position: absolute; right: -20px; bottom: -20px; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; }
    .welcome-title { font-size: 22px; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
    .welcome-text { font-size: 13px; opacity: 0.9; line-height: 1.4; max-width: 70%; }
    .welcome-img { position: absolute; right: 20px; top: 50%; transform: translateY(-50%); width: 70px; height: 70px; border-radius: 16px; border: 2px solid #fff; object-fit: cover; }

    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .stat-card { background: #fff; padding: 16px; border-radius: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
    .stat-icon { width: 36px; height: 36px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; color: var(--accent); }
    .stat-value { font-size: 18px; font-weight: 800; color: var(--accent); margin-bottom: 4px; }
    .stat-label { font-size: 10px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

    .system-status { background: #fff; border-radius: 20px; padding: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
    .status-title { font-size: 12px; font-weight: 700; color: var(--text-muted); margin-bottom: 16px; letter-spacing: 1px; }
    .status-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .status-row:last-child { margin-bottom: 0; }
    .status-name { font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
    .status-dot { width: 8px; height: 8px; background: var(--success); border-radius: 50%; }
    .status-badge { background: #ecfdf5; color: var(--success); font-size: 10px; font-weight: 700; padding: 4px 10px; border-radius: 50px; }

    .btn-connect { width: 100%; padding: 18px; background: var(--accent); border: none; border-radius: 16px; color: #fff; font-size: 16px; font-weight: 800; letter-spacing: 1px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; box-shadow: 0 8px 20px rgba(26, 115, 232, 0.3); }
    .btn-connect:hover { background: var(--accent-hover); transform: translateY(-2px); }
    .btn-dev { width: 100%; padding: 16px; background: transparent; border: 2px solid var(--border-color); border-radius: 16px; color: var(--accent); font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: 0.3s; text-decoration: none; }
    .btn-dev:hover { background: #f8fafc; border-color: var(--accent); }

    .live-users-card { background: var(--accent); border-radius: 24px; padding: 24px; text-align: center; color: #fff; box-shadow: 0 8px 20px rgba(26, 115, 232, 0.2); }
    .live-users-title { font-size: 12px; font-weight: 700; letter-spacing: 1px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .live-users-count { font-size: 48px; font-weight: 800; line-height: 1; margin-bottom: 5px; }
    .live-users-sub { font-size: 12px; opacity: 0.8; }

    .stats-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .stat-card-2 { background: #fff; padding: 20px; border-radius: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
    .stat-value-2 { font-size: 22px; font-weight: 800; color: var(--accent); margin-bottom: 4px; }
    .stat-label-2 { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }

    .graph-card { background: #fff; border-radius: 24px; padding: 24px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); }
    .graph-header { text-align: center; margin-bottom: 20px; }
    .graph-title { font-size: 16px; font-weight: 800; color: var(--accent); margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .graph-subtitle { font-size: 13px; color: var(--text-muted); }

    .join-banner { background: var(--accent); border-radius: 20px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; color: #fff; cursor: pointer; text-decoration: none; }
    .join-banner-left { display: flex; align-items: center; gap: 12px; }
    .join-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .join-title { font-size: 15px; font-weight: 700; margin-bottom: 2px; }
    .join-sub { font-size: 11px; opacity: 0.8; }
    .join-btn { background: #fff; color: var(--accent); padding: 8px 16px; border-radius: 50px; font-size: 12px; font-weight: 800; }

    .features-title { text-align: center; font-size: 24px; font-weight: 800; margin: 20px 0 10px; }
    .features-title span { color: var(--accent); }
    .features-sub { text-align: center; color: var(--text-muted); font-size: 13px; margin-bottom: 20px; }
    
    .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .feature-card { background: #fff; border-radius: 20px; padding: 20px; text-align: center; box-shadow: 0 4px 15px rgba(0,0,0,0.03); display: flex; flex-direction: column; align-items: center; }
    .feature-icon { width: 44px; height: 44px; background: #eff6ff; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: var(--accent); margin-bottom: 12px; }
    .feature-title { font-size: 14px; font-weight: 800; margin-bottom: 8px; }
    .feature-desc { font-size: 11px; color: var(--text-muted); line-height: 1.4; }

    .faq-section { margin-top: 20px; }
    .faq-title { text-align: center; font-size: 22px; font-weight: 800; margin-bottom: 20px; }
    .faq-item { background: #fff; border-radius: 16px; margin-bottom: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
    .faq-item summary { padding: 18px; font-weight: 700; font-size: 14px; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; color: var(--text-main); }
    .faq-item summary::-webkit-details-marker { display: none; }
    .faq-icon { width: 24px; height: 24px; background: #eff6ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--accent); transition: 0.3s; }
    .faq-item[open] .faq-icon { transform: rotate(180deg); }
    .faq-content { padding: 0 18px 18px; font-size: 13px; color: var(--text-muted); line-height: 1.6; }

    .footer { text-align: center; padding: 20px 0; margin-top: 20px; border-top: 1px solid var(--border-color); }
    .footer-text { font-size: 12px; font-weight: 600; color: var(--text-muted); letter-spacing: 1px; margin-bottom: 15px; }
    .footer-dev { display: inline-flex; align-items: center; gap: 8px; background: #fff; border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 50px; text-decoration: none; color: var(--accent); font-weight: 700; font-size: 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
    .footer-dev-badge { background: var(--accent); color: #fff; padding: 2px 8px; border-radius: 10px; font-size: 10px; }

    .back-btn { display: inline-flex; align-items: center; gap: 6px; background: #fff; padding: 10px 16px; border-radius: 50px; text-decoration: none; color: var(--accent); font-weight: 700; font-size: 13px; width: max-content; box-shadow: 0 4px 10px rgba(0,0,0,0.05); border: none; cursor: pointer; }
    .pair-header { text-align: center; margin-bottom: 10px; }
    .pair-header h1 { font-size: 28px; font-weight: 800; letter-spacing: 2px; color: var(--text-main); }
    .pair-header h1 span { color: var(--accent); }
    .pair-header p { color: var(--text-muted); font-size: 14px; margin-top: 5px; }

    .media-card { background: #fff; border-radius: 24px; padding: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); position: relative; overflow: hidden; }
    .media-img { width: 100%; height: 180px; border-radius: 16px; object-fit: cover; }
    .media-mute { position: absolute; top: 25px; right: 25px; background: rgba(0,0,0,0.5); width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; backdrop-filter: blur(4px); cursor: pointer; z-index: 10; }

    .tabs { display: flex; gap: 10px; margin-top: 15px; }
    .tab-btn { flex: 1; padding: 14px; background: transparent; border: 2px solid var(--border-color); border-radius: 16px; font-size: 13px; font-weight: 800; color: var(--text-muted); cursor: pointer; transition: 0.3s; }
    .tab-btn.active { border-color: var(--accent); color: var(--accent); background: #eff6ff; box-shadow: 0 4px 10px rgba(26, 115, 232, 0.1); }

    .input-group { margin-top: 20px; }
    .input-label { font-size: 11px; font-weight: 700; color: var(--text-muted); margin-bottom: 8px; letter-spacing: 1px; display: block; }
    .input-field { width: 100%; padding: 18px; background: #f8fafc; border: 2px solid var(--border-color); border-radius: 16px; color: var(--text-main); font-size: 16px; font-weight: 600; outline: none; transition: 0.3s; }
    .input-field:focus { border-color: var(--accent); background: #fff; box-shadow: 0 0 0 4px rgba(26, 115, 232, 0.1); }
    
    .btn-get-code { width: 100%; padding: 18px; background: var(--accent); border: none; border-radius: 16px; color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; margin-top: 20px; transition: 0.3s; letter-spacing: 1px; box-shadow: 0 8px 20px rgba(26, 115, 232, 0.3); display: flex; justify-content: center; align-items: center; }
    .btn-get-code:hover { background: var(--accent-hover); transform: translateY(-2px); }
    .btn-get-code:disabled { background: #94a3b8; cursor: not-allowed; box-shadow: none; transform: none; }

    .code-result { margin-top: 20px; padding: 24px; background: #f0fdf4; border: 2px dashed #86efac; border-radius: 16px; text-align: center; display: none; }
    .code-result .code-text { font-size: 32px; font-weight: 800; color: var(--success); letter-spacing: 4px; font-family: monospace; margin-bottom: 10px; }
    .btn-copy-small { background: var(--success); color: #fff; border: none; padding: 8px 16px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; }

    .how-to-use { background: #fff; border-radius: 16px; margin-top: 20px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.02); }
    .how-to-use summary { padding: 18px; font-weight: 700; font-size: 14px; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; color: var(--accent); }
    .how-to-use summary::-webkit-details-marker { display: none; }
    .how-to-use summary::after { content: "▼"; font-size: 10px; color: var(--accent); }
    .how-to-use[open] summary::after { content: "▲"; }
    .how-to-content { padding: 0 18px 18px; font-size: 13px; color: var(--text-muted); line-height: 1.8; }
    .how-to-content ol { padding-left: 20px; }

    .features-grid-small { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 20px; }
    .feature-card-small { background: #fff; border-radius: 20px; padding: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.03); border: 1px solid #f1f5f9; }
    .feature-icon-small { width: 32px; height: 32px; background: #eff6ff; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: var(--accent); margin-bottom: 10px; }
    .feature-title-small { font-size: 13px; font-weight: 800; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; }
    .feature-desc-small { font-size: 11px; color: var(--text-muted); line-height: 1.4; }

    .premium-banner { background: linear-gradient(90deg, #0f172a, #1e3a8a); border-radius: 20px; padding: 16px; display: flex; align-items: center; justify-content: space-between; margin-top: 20px; color: #fff; }
    .premium-left { display: flex; align-items: center; gap: 12px; }
    .premium-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .premium-title { font-size: 15px; font-weight: 800; margin-bottom: 2px; }
    .premium-sub { font-size: 11px; opacity: 0.7; }
    .premium-badge { background: #fff; color: #0f172a; padding: 6px 12px; border-radius: 50px; font-size: 11px; font-weight: 800; }

    .chart-container { width: 100%; height: 150px; position: relative; margin-top: 20px; }
    .chart-svg { width: 100%; height: 100%; overflow: visible; }
    .chart-line { fill: none; stroke: var(--accent); stroke-width: 3; stroke-linejoin: round; stroke-linecap: round; }
    .chart-area { fill: url(#chart-gradient); opacity: 0.2; }
    .chart-point { fill: var(--accent); }
    .chart-grid { stroke: #e2e8f0; stroke-width: 1; stroke-dasharray: 4; }
    .chart-text { font-size: 10px; fill: var(--text-muted); font-weight: 600; }
  </style>
</head>
<body>
  <div id="loader-overlay">
    <img src="/utils/logo.jpg" alt="TANVIR XMD" class="loader-logo" onerror="this.src='https://i.ibb.co/RGGkkRVp/bot-8801760234907-1792170204786.jpg'">
    <h1 class="loader-title">TANVIR <span>XMD</span></h1>
    <p class="loader-subtitle">PREMIUM PAIR PORTAL</p>
    <div class="loader-dots">
      <span></span><span></span><span></span>
    </div>
  </div>

  <div class="scroll-bar" id="scrollBar"></div>

  <div class="container">
    <div id="landing-page" class="page active">
      <div class="header">
        <div class="header-left">
          <img src="/utils/logo.jpg" alt="Logo" class="logo" onerror="this.src='https://i.ibb.co/RGGkkRVp/bot-8801760234907-1792170204786.jpg'">
          <div>
            <div class="header-title">TANVIR - XMD</div>
            <div class="header-subtitle">WHATSAPP AUTOMATION</div>
          </div>
        </div>
        <div class="badge-live"><div class="dot-live"></div> LIVE</div>
      </div>

      <div class="hero-title">PAIRING <span>WEB</span></div>
      <div class="hero-subtitle">Link your WhatsApp number with a pairing code or QR in about a minute.</div>

      <div class="welcome-card">
        <div class="welcome-title">WELCOME <br>TANVIR - XMD ✓</div>
        <div class="welcome-text">We are here to provide you with the best multi-session bot experience.</div>
        <img src="/utils/logo.jpg" alt="Bot" class="welcome-img" onerror="this.src='https://i.ibb.co/RGGkkRVp/bot-8801760234907-1792170204786.jpg'">
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
          <div class="stat-value" id="botPing">--ms</div>
          <div class="stat-label">BOT PING</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <div class="stat-value" id="totalSessions">--</div>
          <div class="stat-label">TOTAL SESSIONS</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
          <div class="stat-value">2</div>
          <div class="stat-label">PAIR METHOD</div>
        </div>
      </div>

      <div class="system-status">
        <div class="status-title">SYSTEM STATUS</div>
        <div class="status-row">
          <div class="status-name"><div class="status-dot"></div> Pairing API</div>
          <div class="status-badge">ONLINE</div>
        </div>
        <div class="status-row">
          <div class="status-name"><div class="status-dot"></div> Multi-Device</div>
          <div class="status-badge">ACTIVE</div>
        </div>
        <div class="status-row">
          <div class="status-name"><div class="status-dot"></div> Cloud Nodes</div>
          <div class="status-badge">HEALTHY</div>
        </div>
      </div>

      <button class="btn-connect" onclick="showPage('pair-page')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
        CONNECT BOT
      </button>
      <a href="https://t.me/MOHAMMADTANVIR1" target="_blank" class="btn-dev">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        DEVELOPER
      </a>

      <div class="live-users-card">
        <div class="live-users-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          LIVE USERS ONLINE
        </div>
        <div class="live-users-count" id="liveCount">--</div>
        <div class="live-users-sub">Updated in real-time</div>
      </div>

      <div class="stats-grid-2">
        <div class="stat-card-2">
          <div class="stat-value-2" id="msgHandled">--</div>
          <div class="stat-label-2">MESSAGES HANDLED</div>
        </div>
        <div class="stat-card-2">
          <div class="stat-value-2" id="cmdsRun">--</div>
          <div class="stat-label-2">COMMANDS RUN</div>
        </div>
        <div class="stat-card-2">
          <div class="stat-value-2" id="uptimeVal">--</div>
          <div class="stat-label-2">UPTIME</div>
        </div>
        <div class="stat-card-2">
          <div class="stat-value-2" id="botsConnected" style="color: #10b981;">--</div>
          <div class="stat-label-2">BOTS CONNECTED</div>
        </div>
      </div>

      <div class="graph-card">
        <div class="graph-header">
          <div class="graph-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            BOT GROWTH (30 DAYS)
          </div>
          <div class="graph-subtitle">Messages handled per day</div>
        </div>
        <div class="chart-container">
          <svg class="chart-svg" viewBox="0 0 300 150" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#1a73e8" />
                <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
              </linearGradient>
            </defs>
            <line x1="0" y1="20" x2="300" y2="20" class="chart-grid" />
            <line x1="0" y1="60" x2="300" y2="60" class="chart-grid" />
            <line x1="0" y1="100" x2="300" y2="100" class="chart-grid" />
            <line x1="0" y1="140" x2="300" y2="140" class="chart-grid" />
            
            <text x="5" y="15" class="chart-text" id="y-label-1">300K</text>
            <text x="5" y="55" class="chart-text" id="y-label-2">200K</text>
            <text x="5" y="95" class="chart-text" id="y-label-3">100K</text>
            <text x="5" y="135" class="chart-text">0</text>

            <path class="chart-area" d="M0,140 L200,140 L220,110 L235,80 L245,20 L255,60 L270,70 L290,140 L300,140 Z" />
            <path class="chart-line" d="M0,140 L200,140 L220,110 L235,80 L245,20 L255,60 L270,70 L290,140" />
            <circle cx="290" cy="140" r="4" class="chart-point" />
            
            <text x="10" y="155" class="chart-text">Sep 22</text>
            <text x="260" y="155" class="chart-text">Oct 21</text>
          </svg>
        </div>
      </div>

      <a href="https://t.me/Dxtanvir_bot" target="_blank" class="join-banner">
        <div class="join-banner-left">
          <div class="join-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </div>
          <div>
            <div class="join-title">Join Official Channel</div>
            <div class="join-sub">Updates · pairing tips · exclusive drops</div>
          </div>
        </div>
        <div class="join-btn">JOIN</div>
      </a>

      <div class="features-title">Powerful <span>Features</span></div>
      <div class="features-sub">Everything you need in one smart bot</div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></div>
          <div class="feature-title">AI Powered</div>
          <div class="feature-desc">Smart AI to understand and reply like a human.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>
          <div class="feature-title">Auto Reply</div>
          <div class="feature-desc">Instant auto responses to keep your chats engaged.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div class="feature-title">Schedule Messages</div>
          <div class="feature-desc">Schedule messages and tasks at any time automatically.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg></div>
          <div class="feature-title">298 Commands</div>
          <div class="feature-desc">Powerful commands to do amazing things.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          <div class="feature-title">Group Management</div>
          <div class="feature-desc">Tag, welcome, kick and protect your groups with ease.</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></div>
          <div class="feature-title">Secure & Safe</div>
          <div class="feature-desc">Official multi-device pairing. Fully private.</div>
        </div>
      </div>

      <div class="faq-section">
        <div class="faq-title">Questions people ask</div>
        <details class="faq-item" open>
          <summary>Is it free to pair? <div class="faq-icon">▼</div></summary>
          <div class="faq-content">Pairing itself is just a number and a code. If you have questions about plans or limits, message us through Developer.</div>
        </details>
        <details class="faq-item">
          <summary>My code does not work. What should I do? <div class="faq-icon">▼</div></summary>
          <div class="faq-content">Make sure you entered the code within 60 seconds. If it expired, simply generate a new one.</div>
        </details>
        <details class="faq-item">
          <summary>Which countries are supported? <div class="faq-icon">▼</div></summary>
          <div class="faq-content">All countries are supported as long as you include the correct country code.</div>
        </details>
        <details class="faq-item">
          <summary>How do I disconnect the bot? <div class="faq-icon">▼</div></summary>
          <div class="faq-content">Go to WhatsApp → Linked Devices, select the bot session, and tap Log Out. You can also use the /logout command in the Telegram bot.</div>
        </details>
        <details class="faq-item">
          <summary>Should I use the code or the QR? <div class="faq-icon">▼</div></summary>
          <div class="faq-content">Both work perfectly. The pairing code is usually faster and easier if your phone's camera isn't nearby.</div>
        </details>
      </div>

      <div class="footer">
        <div class="footer-text">© 2026 TANVIR XMD · ALL RIGHTS RESERVED</div>
        <a href="https://t.me/MOHAMMADTANVIR1" target="_blank" class="footer-dev">
          CREATED BY TANVIR <span class="footer-dev-badge">DEV</span>
        </a>
      </div>
    </div>

    <div id="pair-page" class="page">
      <button class="back-btn" onclick="showPage('landing-page')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Back to home
      </button>

      <div class="pair-header">
        <h1>TANVIR <span>XMD</span></h1>
        <p>Get your pairing code</p>
      </div>

      <div class="media-card">
        <video id="pairVideo" class="media-img" src="/utils/My-dream-carvideo.mp4" autoplay loop muted playsinline></video>
        <div class="media-mute" id="muteBtn" onclick="toggleMute()">
          <svg id="muteIcon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
        </div>
      </div>

      <div class="tabs">
        <button class="tab-btn active" onclick="switchTab('code')" id="tab-code">PAIRING CODE</button>
        <button class="tab-btn" onclick="switchTab('qr')" id="tab-qr">QR SCANNER</button>
      </div>

      <div id="section-code" style="margin-top: 10px;">
        <div class="input-group">
          <label class="input-label">WHATSAPP NUMBER</label>
          <input type="text" id="phone" class="input-field" placeholder="8801714427775" autocomplete="off">
        </div>
        <button id="generateBtn" class="btn-get-code">GET PAIRING CODE</button>
        
        <div id="codeResult" class="code-result">
          <div style="font-size: 12px; font-weight: 700; color: #166534; margin-bottom: 5px; text-transform: uppercase;">YOUR PAIRING CODE</div>
          <div id="codeText" class="code-text">----</div>
          <button id="copyBtn" class="btn-copy-small">COPY CODE</button>
        </div>
      </div>

      <div id="section-qr" style="display: none; margin-top: 10px; text-align: center; padding: 40px 20px; background: #fff; border-radius: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.03);">
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" stroke-width="1.5" style="margin-bottom: 15px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><rect x="7" y="7" width="10" height="10"/></svg>
        <h3 style="margin-bottom: 10px;">QR Scanner</h3>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">QR pairing requires live socket connection. Please use the Pairing Code method above for the best experience.</p>
      </div>

      <details class="how-to-use">
        <summary>How to use this code</summary>
        <div class="how-to-content">
          <ol>
            <li>Open WhatsApp → Linked devices</li>
            <li>Tap Link a device</li>
            <li>Choose Link with phone number instead</li>
            <li>Enter the 8-character code shown above</li>
          </ol>
        </div>
      </details>

      <div class="features-grid-small">
        <div class="feature-card-small">
          <div class="feature-icon-small"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
          <div class="feature-title-small">LIGHT WEIGHT</div>
          <div class="feature-desc-small">Fast pairing with low resource load on your device.</div>
        </div>
        <div class="feature-card-small">
          <div class="feature-icon-small"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg></div>
          <div class="feature-title-small">MULTI DEVICE</div>
          <div class="feature-desc-small">Official WhatsApp multi-device link, no password shared.</div>
        </div>
        <div class="feature-card-small">
          <div class="feature-icon-small"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          <div class="feature-title-small">24/7 ONLINE</div>
          <div class="feature-desc-small">Cloud sessions stay online even when your phone is off.</div>
        </div>
        <div class="feature-card-small">
          <div class="feature-icon-small"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
          <div class="feature-title-small">SECURE PAIR</div>
          <div class="feature-desc-small">Encrypted handshake. Remove the bot anytime from Linked Devices.</div>
        </div>
      </div>

      <div class="premium-banner">
        <div class="premium-left">
          <div class="premium-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <div>
            <div class="premium-title">TANVIR - XMD Premium</div>
            <div class="premium-sub">Fast pair · multi-device · 24/7 online</div>
          </div>
        </div>
        <div class="premium-badge">DEV</div>
      </div>

      <div class="footer">
        <div class="footer-text">© 2026 TANVIR XMD · ALL RIGHTS RESERVED</div>
        <a href="https://t.me/MOHAMMADTANVIR1" target="_blank" class="footer-dev">
          CREATED BY TANVIR <span class="footer-dev-badge">DEV</span>
        </a>
      </div>
    </div>
  </div>

  <script>
    window.addEventListener('load', () => {
      const loader = document.getElementById('loader-overlay');
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => { loader.style.display = 'none'; }, 500);
      }, 2500);
    });

    function toggleMute() {
      const v = document.getElementById('pairVideo');
      const icon = document.getElementById('muteIcon');
      v.muted = !v.muted;
      if (v.muted) {
        icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';
      } else {
        icon.innerHTML = '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
      }
    }

    function showPage(pageId) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.getElementById(pageId).classList.add('active');
      window.scrollTo(0, 0);
    }

    function switchTab(tab) {
      const tabCode = document.getElementById('tab-code');
      const tabQr = document.getElementById('tab-qr');
      const secCode = document.getElementById('section-code');
      const secQr = document.getElementById('section-qr');

      if (tab === 'code') {
        tabCode.classList.add('active');
        tabQr.classList.remove('active');
        secCode.style.display = 'block';
        secQr.style.display = 'none';
      } else {
        tabQr.classList.add('active');
        tabCode.classList.remove('active');
        secQr.style.display = 'block';
        secCode.style.display = 'none';
      }
    }

    let lastScrollTop = 0;
    const scrollBar = document.getElementById('scrollBar');
    window.addEventListener('scroll', () => {
      let st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > lastScrollTop) {
        scrollBar.style.background = '#ef4444';
        scrollBar.style.boxShadow = '0 0 10px #ef4444';
      } else {
        scrollBar.style.background = '#1a73e8';
        scrollBar.style.boxShadow = '0 0 10px #1a73e8';
      }
      lastScrollTop = st <= 0 ? 0 : st;
    });

    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        
        if (data.ok) {
          if (document.getElementById('botPing')) document.getElementById('botPing').innerText = data.ping + 'ms';
          if (document.getElementById('totalSessions')) document.getElementById('totalSessions').innerText = data.totalSessions;
          if (document.getElementById('botsConnected')) document.getElementById('botsConnected').innerText = data.activeBots;
          if (document.getElementById('liveCount')) document.getElementById('liveCount').innerText = Math.max(1, data.activeBots + Math.floor(Math.random() * 5));
          if (document.getElementById('msgHandled')) document.getElementById('msgHandled').innerText = data.msgHandled;
          if (document.getElementById('cmdsRun')) document.getElementById('cmdsRun').innerText = data.cmdsRun;
          if (document.getElementById('uptimeVal')) document.getElementById('uptimeVal').innerText = data.uptime;

          const rawMsg = data.rawMsgHandled || 0;
          const dailyMax = Math.floor(rawMsg / 30);
          
          if (document.getElementById('y-label-1')) document.getElementById('y-label-1').textContent = Math.floor(dailyMax).toLocaleString();
          if (document.getElementById('y-label-2')) document.getElementById('y-label-2').textContent = Math.floor(dailyMax * 0.6).toLocaleString();
          if (document.getElementById('y-label-3')) document.getElementById('y-label-3').textContent = Math.floor(dailyMax * 0.3).toLocaleString();
        }
      } catch (e) {
        console.error("Failed to fetch stats", e);
      }
    }

    fetchStats();
    setInterval(fetchStats, 5000);

    const phoneInput = document.getElementById('phone');
    const generateBtn = document.getElementById('generateBtn');
    const codeResult = document.getElementById('codeResult');
    const codeText = document.getElementById('codeText');
    const copyBtn = document.getElementById('copyBtn');
    let currentCode = '';
    let cooldownTimer = null;

    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/[^0-9+]/g, '');
    });

    function startCooldown(seconds) {
      let timeLeft = seconds;
      generateBtn.disabled = true;
      generateBtn.innerHTML = '⏳ Wait ' + timeLeft + 's';
      if (cooldownTimer) clearInterval(cooldownTimer);
      cooldownTimer = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
          clearInterval(cooldownTimer);
          generateBtn.disabled = false;
          generateBtn.innerHTML = 'GET PAIRING CODE';
        } else {
          generateBtn.innerHTML = '⏳ Wait ' + timeLeft + 's';
        }
      }, 1000);
    }

    generateBtn.addEventListener('click', async () => {
      const phone = phoneInput.value.trim();
      if (!phone) {
        alert('Please enter your WhatsApp number with country code.');
        return;
      }
      
      generateBtn.disabled = true;
      generateBtn.innerHTML = '⏳ Connecting...';
      codeResult.style.display = 'none';

      try {
        const response = await fetch('/api/pair', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone })
        });
        const data = await response.json();
        
        if (!data.ok) throw new Error(data.error || 'Failed to generate code');
        if (!data.code) throw new Error('Server returned an empty code. Please try again.');

        currentCode = data.code;
        codeText.textContent = currentCode;
        codeResult.style.display = 'block';

        startCooldown(60);
      } catch (err) {
        alert('❌ ' + err.message);
        generateBtn.disabled = false;
        generateBtn.innerHTML = 'GET PAIRING CODE';
      }
    });

    copyBtn.addEventListener('click', () => {
      if (!currentCode) return;
      
      const copyToClipboard = (text) => {
        if (navigator.clipboard && window.isSecureContext) {
          return navigator.clipboard.writeText(text);
        } else {
          let textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          return new Promise((res, rej) => {
            document.execCommand('copy') ? res() : rej();
            textArea.remove();
          });
        }
      };

      copyToClipboard(currentCode).then(() => {
        copyBtn.innerText = '✅ COPIED!';
        setTimeout(() => { copyBtn.innerText = 'COPY CODE'; }, 2000);
      }).catch(() => {
        alert('Copy this code manually: ' + currentCode);
      });
    });
  </script>
</body>
</html>
`;

app.get("/", (req, res) => {
  res.send(HTML_TEMPLATE);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy Server running on port ${PORT}`));
