const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
       host: 'redis-12255.c239.us-east-1-2.ec2.cloud.redislabs.com',
        port: 12255
    }
});

module.exports = redisClient;