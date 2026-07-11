import mongoose from 'mongoose';
import config from './config.js';

export async function connectToDB(){
    try{
        await mongoose.connect(config.MONGO_URI);
        console.log("Connected to Database.");
    }
    catch (e){
        console.log("Could not connect to Database.");

    }
}