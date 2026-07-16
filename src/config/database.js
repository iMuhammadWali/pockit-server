import mongoose from 'mongoose';
import config from './config.js';

// const dns = require("dns");
import dns from 'dns' 
dns.setServers(["1.1.1.1", "8.8.8.8"]); 

export async function connectToDB(){
    try{
        await mongoose.connect(config.MONGO_URI);
        console.log("Connected to Database.");
    }
    catch (e){
        console.log("Could not connect to Database.", e);
    }
}