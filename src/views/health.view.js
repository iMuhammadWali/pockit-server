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
  const initialTotalSeconds = hours * 3600 + minutes * 60 + seconds;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    min-width: 340px;
  }
  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #ff4d4d;
    display: inline-block;
    margin-right: 8px;
    box-shadow: 0 0 12px #ff4d4d;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 77, 77, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(255, 77, 77, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 77, 77, 0); }
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
    color: #ff4d4d;
    margin-bottom: 1.5rem;
  }
  .row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-top: 1px solid #f7e3e5;
    font-size: 0.9rem;
  }
  .label { color: #e8909a; }
  .value { color: #c0404a; font-weight: 600; font-variant-numeric: tabular-nums; }
  .live-badge {
    margin-top: 1rem;
    font-size: 0.75rem;
    color: #48bb78;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
  }
  .live-badge::before {
    content: "";
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #48bb78;
  }
</style>
</head>
<body>
  <div class="card">
    <h1><span class="dot"></span>Server Status</h1>
    <div class="status" id="status-text">Running</div>
    <div class="row"><span class="label">Uptime</span><span class="value" id="uptime-val">${hours}h ${minutes}m ${seconds}s</span></div>
    <div class="row"><span class="label">Timestamp</span><span class="value" id="timestamp-val">${timestamp}</span></div>
    <div class="live-badge">Live auto-updating</div>
  </div>

  <script>
    let totalSecs = ${initialTotalSeconds};

    function formatUptime(secs) {
      const h = Math.floor(secs / 3600);
      const m = Math.floor((secs % 3600) / 60);
      const s = Math.floor(secs % 60);
      return h + 'h ' + m + 'm ' + s + 's';
    }

    // Local 1-second ticker
    setInterval(() => {
      totalSecs++;
      document.getElementById('uptime-val').innerText = formatUptime(totalSecs);
    }, 1000);

    // Periodic 4-second server polling to keep timestamp and server uptime in sync
    async function syncHealth() {
      try {
        const res = await fetch('/health?time=true');
        if (res.ok) {
          const data = await res.json();
          document.getElementById('timestamp-val').innerText = data.timestamp;
          if (data.uptime && typeof data.uptime.totalSeconds === 'number') {
            totalSecs = data.uptime.totalSeconds;
            document.getElementById('uptime-val').innerText = formatUptime(totalSecs);
          }
        }
      } catch (err) {
        console.warn('Sync failed:', err);
      }
    }

    setInterval(syncHealth, 4000);
  </script>
</body>
</html>`;
};
