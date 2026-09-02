import { getHealthHTML } from "../views/health.view.js";

export async function getHealth(req, res) {
  try {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const timestamp = new Date().toISOString();

    const { format, time } = req.query;

    // Fast JSON response if ?time or ?format=json or Accept: application/json
    if (time !== undefined || format === "json" || req.headers.accept?.includes("application/json")) {
      return res.status(200).json({
        status: "Running",
        timestamp,
        uptime: {
          hours,
          minutes,
          seconds,
          totalSeconds: Math.floor(uptime),
        },
      });
    }

    const html = getHealthHTML(hours, minutes, seconds, timestamp);
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send("An error occurred while checking health status.");
  }
}
