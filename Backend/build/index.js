"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)({ quiet: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const errorHandler_1 = require("./middlewares/errorHandler");
const rotue_1 = __importDefault(require("./routes/rotue"));
const redis_1 = require("./helper/redis");
require("./helper/campaignWorker");
const app = (0, express_1.default)();
const port = process.env.PORT || 4000;
app.use((0, cors_1.default)({
    origin: 'http://localhost:3001',
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use('/', rotue_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(port, async () => {
    console.log(`server listening at http://localhost:${port}`);
    await (0, redis_1.connectRedis)();
    console.log('redis connected');
});
//# sourceMappingURL=index.js.map