import { createClient } from 'redis';

const redisClient = createClient({
  username: 'default',
  password: 'LpxTuxfLZvucRaTaOqLUwiVBRoHnC6Jg', 
  socket: {
    host: 'redis-16214.c262.us-east-1-3.ec2.redns.redis-cloud.com',
    port: Number('16214'),
  },
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('🚀 Conectado ao Redis Cloud!');
  }
}

export default redisClient;
