"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const platform_express_1 = require("@nestjs/platform-express");
const express_1 = __importDefault(require("express"));
let cachedApp;
async function bootstrap() {
    if (!cachedApp) {
        cachedApp = (0, express_1.default)();
        const nestApp = await core_1.NestFactory.create(app_module_1.AppModule, new platform_express_1.ExpressAdapter(cachedApp));
        nestApp.enableCors();
        await nestApp.init();
    }
    return cachedApp;
}
async function handler(req, res) {
    const app = await bootstrap();
    return app(req, res);
}
//# sourceMappingURL=index.js.map