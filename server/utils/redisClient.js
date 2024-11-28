import { createClient } from "redis";

const redisClient = createClient();

async function connectRedis() {
    try {
        await redisClient.connect();
        console.log("Connected to Redis.");
    } catch (error) {
        console.log(error);
    }
}

connectRedis(); 

export default redisClient;