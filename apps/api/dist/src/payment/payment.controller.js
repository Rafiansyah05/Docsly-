"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const common_1 = require("@nestjs/common");
const payment_service_1 = require("./payment.service");
const supabase_js_1 = require("@supabase/supabase-js");
let PaymentController = class PaymentController {
    paymentService;
    constructor(paymentService) {
        this.paymentService = paymentService;
    }
    async verifyAuth(req) {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            throw new common_1.UnauthorizedException('Missing Authorization header');
        const token = authHeader.split(' ')[1];
        if (!token)
            throw new common_1.UnauthorizedException('Invalid token format');
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!supabaseUrl || !supabaseKey) {
            throw new Error('Supabase environment variables missing');
        }
        const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (error || !user) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        return user;
    }
    async createTransaction(req, body) {
        const user = await this.verifyAuth(req);
        const { plan, paymentMethod } = body;
        if (!plan)
            throw new common_1.BadRequestException('Plan is required');
        return this.paymentService.createTransaction(user, plan, paymentMethod || 'bca_va');
    }
    async syncStatus(req, body) {
        const user = await this.verifyAuth(req);
        const { order_id } = body;
        if (!order_id)
            throw new common_1.BadRequestException('Order ID is required');
        return this.paymentService.syncStatus(user.id, order_id);
    }
    async webhook(body) {
        const { order_id } = body;
        if (!order_id)
            return { success: false, message: 'No order_id' };
        return this.paymentService.syncStatus(null, order_id);
    }
};
exports.PaymentController = PaymentController;
__decorate([
    (0, common_1.Post)('create'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Post)('sync-status'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "syncStatus", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentController.prototype, "webhook", null);
exports.PaymentController = PaymentController = __decorate([
    (0, common_1.Controller)('api/payment'),
    __metadata("design:paramtypes", [payment_service_1.PaymentService])
], PaymentController);
//# sourceMappingURL=payment.controller.js.map