import app from "./src/app.js";
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import config from './src/config/config.js';
import { connectToDB } from "./src/config/database.js";

const PORT = config.PORT;

connectToDB();

app.listen(PORT, function(){
    console.log(`Server is listening on PORT ${PORT}`);
})