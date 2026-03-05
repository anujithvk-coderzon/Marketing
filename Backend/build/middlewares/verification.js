"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refresh_Token = exports.verify = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../errors/errors");
const redis_1 = require("../helper/redis");
const verify = async function (req, res, next) {
    try {
        const head = req.headers.authorization;
        const token = head?.split(' ')[1];
        if (!token)
            throw new errors_1.UnauthorizedError("No token provided");
        jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
            if (err) {
                return res.status(401).json({ message: "Please login" });
            }
            ;
            req.user = data;
            next();
        });
    }
    catch (error) {
        res.status(500).json({ message: "Unexpected error occured", error: error.message });
    }
};
exports.verify = verify;
const refresh_Token = async function (req, res) {
    try {
        const r_token = req.cookies.refresh_token;
        if (!r_token) {
            return res.status(401).json({ message: "Please login" });
        }
        const payload = jsonwebtoken_1.default.verify(r_token, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis_1.redis.get(`refresh:${payload.id}`);
        if (!storedToken) {
            return res.status(401).json({ message: "Session expired" });
        }
        if (r_token !== storedToken) {
            return res.status(401).json({ message: "Invalid token" });
        }
        const new_accesstoken = jsonwebtoken_1.default.sign({ id: payload.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        return res.status(200).json({ token: new_accesstoken });
    }
    catch (error) {
        return res.status(500).json({ message: "Unexpected error occured", error: error.message });
    }
};
exports.refresh_Token = refresh_Token;
//# sourceMappingURL=verification.js.map