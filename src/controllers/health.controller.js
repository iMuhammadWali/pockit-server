import { getHealthHTML } from "../views/health.view.js";

/**
 * Controller for rendering the server health status.
 * 
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
export async function getHealth(req, res) {
  try {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const timestamp = new Date().toISOString();

    const html = getHealthHTML(hours, minutes, seconds, timestamp);
    res.status(200).send(html);
  } catch (err) {
    res.status(500).send("An error occurred while checking health status.");
  }
}
