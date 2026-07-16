import express from "express";
import authRouter from "./routes/auth.route.js";

const app = express();
app.use(express.json());

app.get("/health", async (req, res) => {
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const minutes = Math.floor((uptime % 3600) / 60);
  const seconds = Math.floor(uptime % 60);

  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Server Health</title>
<style>
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: linear-gradient(135deg, #0f172a, #1e293b);
  }
  .card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 16px;
    padding: 2.5rem 3rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    text-align: center;
    color: #e5e7eb;
    min-width: 320px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #22c55e;
    display: inline-block;
    margin-right: 8px;
    box-shadow: 0 0 12px #22c55e;
  }
  h1 {
    font-size: 1.4rem;
    margin: 0 0 1.25rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .status {
    font-size: 2rem;
    font-weight: 700;
    color: #22c55e;
    margin-bottom: 1.5rem;
  }
  .row {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    border-top: 1px solid #1f2937;
    font-size: 0.9rem;
  }
  .label { color: #9ca3af; }
  .value { color: #e5e7eb; font-weight: 600; }
</style>
</head>
<body>
  <div class="card">
    <h1><span class="dot"></span>Server Status</h1>
    <div class="status">Running</div>
    <div class="row"><span class="label">Uptime</span><span class="value">${hours}h ${minutes}m ${seconds}s</span></div>
    <div class="row"><span class="label">Timestamp</span><span class="value">${new Date().toISOString()}</span></div>
  </div>
</body>
</html>`);
});

app.use("/api/auth", authRouter);

export default app;