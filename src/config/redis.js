const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-11331.c9.us-east-1-2.ec2.cloud.redislabs.com',
        port: 11331
    }
});

module.exports = redisClient;
