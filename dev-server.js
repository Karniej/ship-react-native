#!/usr/bin/env node
/**
 * Local dev server for API routes
 *
 * Usage:
 *   node dev-server.js
 *
 * This serves your Expo API routes locally for testing on iOS/Android simulators.
 * Expo API routes only work when deployed via EAS — this bridges the gap for local dev.
 *
 * Setup:
 *   1. Create .env with your API keys (OPENAI_API_KEY, etc.)
 *   2. npm install dotenv (if not installed)
 *   3. node dev-server.js
 *   4. Set EXPO_PUBLIC_API_URL=http://YOUR_IP:8082 in .env
 *   5. Restart Metro: npx expo start --clear
 */

const http = require("http");
const PORT = 8082;
require("dotenv").config();

// Import your API route handlers here
// Customize this for your app's specific routes

async function handleRequest(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  const path = url.pathname;
  console.log(`[${req.method}] ${path}`);

  // Health check
  if (path === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  // TODO: Add your app's API routes here
  // Example for an AI feature route:
  //
  // if (path === "/api/your-feature" && req.method === "POST") {
  //   const body = await getBody(req);
  //   const { inputText } = JSON.parse(body);
  //
  //   const response = await fetch("https://api.openai.com/v1/chat/completions", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  //     },
  //     body: JSON.stringify({
  //       model: "gpt-4o-mini",
  //       messages: [
  //         { role: "system", content: "Your system prompt here" },
  //         { role: "user", content: inputText },
  //       ],
  //     }),
  //   });
  //
  //   const data = await response.json();
  //   res.writeHead(200, { "Content-Type": "application/json" });
  //   res.end(JSON.stringify({ result: data.choices[0].message.content }));
  //   return;
  // }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
}

function getBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
  });
}

const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`\n🚀 API dev server running on http://localhost:${PORT}`);
  console.log(`   OPENAI_API_KEY: ${process.env.OPENAI_API_KEY ? "✓ set" : "✗ missing"}`);
  console.log(`   ANTHROPIC_API_KEY: ${process.env.ANTHROPIC_API_KEY ? "✓ set" : "✗ missing"}`);
  console.log(`\n   Add EXPO_PUBLIC_API_URL=http://YOUR_IP:${PORT} to .env`);
  console.log(`   Then restart Metro: npx expo start --clear\n`);
});
