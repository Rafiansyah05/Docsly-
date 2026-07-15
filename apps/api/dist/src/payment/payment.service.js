"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const supabase_js_1 = require("@supabase/supabase-js");
const midtransClient = require('midtrans-client');
let PaymentService = class PaymentService {
    snap;
    constructor() {
        this.snap = new midtransClient.Snap({
            isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
            serverKey: process.env.MIDTRANS_SERVER_KEY || '',
            clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ''
        });
    }
    getSupabaseAdmin() {
        return (0, supabase_js_1.createClient)(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    }
    async createTransaction(user, plan) {
        if (plan !== 'Pro' && plan !== 'Premium') {
            throw new Error('Invalid plan selected');
        }
        const grossAmount = plan === 'Pro' ? 39000 : 89000;
        const random = crypto.randomUUID().replace(/-/g, '').substring(0, 8).toUpperCase();
        const planPrefix = plan.substring(0, 3).toUpperCase();
        const orderId = `DOC-${planPrefix}-${random}`;
        const adminSupabase = this.getSupabaseAdmin();
        const { error: insertError } = await adminSupabase.from('payments').insert({
            user_id: user.id,
            order_id: orderId,
            plan_type: plan.toLowerCase(),
            amount: grossAmount,
            status: 'pending'
        });
        if (insertError) {
            console.error('Error inserting payment record:', insertError);
            throw new Error('Failed to create payment record');
        }
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: grossAmount
            },
            customer_details: {
                email: user.email,
                first_name: user.user_metadata?.full_name || 'Docsly User'
            },
            item_details: [
                {
                    id: `DOCSLY-${plan.toUpperCase()}`,
                    price: grossAmount,
                    quantity: 1,
                    name: `Docsly ${plan} Plan (1 Month)`
                }
            ]
        };
        const transaction = await this.snap.createTransaction(parameter);
        return {
            token: transaction.token,
            redirect_url: transaction.redirect_url
        };
    }
    async syncStatus(userId, orderId) {
        const adminSupabase = this.getSupabaseAdmin();
        const { data: orderInfo } = await this.snap.transaction.status(orderId).catch(() => ({ data: null }));
        if (orderInfo) {
            const transactionStatus = orderInfo.transaction_status;
            const fraudStatus = orderInfo.fraud_status;
            let paymentStatus = 'pending';
            if (transactionStatus === 'capture') {
                paymentStatus = fraudStatus === 'challenge' ? 'challenge' : 'success';
            }
            else if (transactionStatus === 'settlement') {
                paymentStatus = 'success';
            }
            else if (transactionStatus === 'cancel' || transactionStatus === 'deny' || transactionStatus === 'expire') {
                paymentStatus = 'failed';
            }
            if (paymentStatus === 'success') {
                const { data: paymentRecord } = await adminSupabase
                    .from('payments')
                    .select('*')
                    .eq('order_id', orderId)
                    .single();
                if (paymentRecord && paymentRecord.status !== 'success') {
                    await adminSupabase
                        .from('payments')
                        .update({ status: 'success', payment_method: orderInfo.payment_type })
                        .eq('order_id', orderId);
                    const planType = paymentRecord.plan_type === 'pro' ? 'Pro Plan' : 'Premium Plan';
                    await adminSupabase.from('profiles').update({ subscription_plan: planType }).eq('id', userId);
                }
            }
        }
        return { success: true };
    }
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PaymentService);
//# sourceMappingURL=payment.service.js.map