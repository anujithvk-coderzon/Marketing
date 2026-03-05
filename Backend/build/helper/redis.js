"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
exports.connectRedis = connectRedis;
const redis_1 = require("redis");
exports.redis = (0, redis_1.createClient)({
    url: process.env.REDIS
});
exports.redis.on('error', err => console.log('failed to connect with redis', err));
async function connectRedis() {
    if (!exports.redis.isOpen) {
        await exports.redis.connect();
    }
}
//# sourceMappingURL=redis.js.map