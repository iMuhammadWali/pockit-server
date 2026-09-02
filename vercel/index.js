import createApp from "../src/app.js";
import { connectToDB } from "../src/db/index.js";

const app = createApp();

export default async function handler(req, res) {
  await connectToDB();
  return app(req, res);
}
