/**
 * Generates the HTML markup for the server health status page.
 * 
 * @param {number} hours - Server uptime hours
 * @param {number} minutes - Server uptime minutes
 * @param {number} seconds - Server uptime seconds
 * @param {string} timestamp - ISO timestamp of the status check
 * @returns {string} The formatted HTML string
 */
export const getHealthHTML = (hours, minutes, seconds, timestamp) => {
  return `<!DOCTYPE html>
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
    background: linear-gradient(135deg, #fffbf7, #fdf7f0);
  }
  .card {
    background: #ffffff;
    border: 1px solid #f7e3e5;
    border-radius: 16px;
    padding: 2.5rem 3rem;
    box-shadow: 0 20px 40px rgba(192, 64, 74, 0.12);
    text-align: center;
    color: #c0404a;
    min-width: 320px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ff9999;
    display: inline-block;
    margin-right: 8px;
    box-shadow: 0 0 12px #ff9999;
  }
  h1 {
    font-size: 1.4rem;
    margin: 0 0 1.25rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #c0404a;
  }
  .status {
    font-size: 2rem;
    font-weight: 700;
    color: #ff9999;
    margin-bottom: 1.5rem;
  }
  .row {
    display: flex;
    justify-content: space-between;
    padding: 0.4rem 0;
    border-top: 1px solid #f7e3e5;
    font-size: 0.9rem;
  }
  .label { color: #e8909a; }
  .value { color: #c0404a; font-weight: 600; }
</style>
</head>
<body>
  <div class="card">
    <h1><span class="dot"></span>Server Status</h1>
    <div class="status">Running</div>
    <div class="row"><span class="label">Uptime</span><span class="value">${hours}h ${minutes}m ${seconds}s</span></div>
    <div class="row"><span class="label">Timestamp</span><span class="value">${timestamp}</span></div>
  </div>
</body>
</html>`;
};
