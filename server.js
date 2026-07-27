import config from "./src/config/config.js";
import { connectToDB } from "./src/db/index.js";
import createApp from "./src/app.js";

const PORT = config.PORT;
const app = createApp();

async function startServer() {
  try {
    await connectToDB();
    app.listen(PORT, () => {
      console.log(`Server is listening on PORT ${PORT}`);
    });
  } catch (err) {
    console.error("Error during server startup:", err);
    process.exit(1);
  }
}

startServer();
