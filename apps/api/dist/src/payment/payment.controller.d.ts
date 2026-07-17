import type { Request } from 'express';
import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    private verifyAuth;
    createTransaction(req: Request, body: any): Promise<{
        order_id: string;
        payment_type: string;
        transaction_status: any;
        va_numbers: any;
        bill_key: any;
        biller_code: any;
        actions: any;
    }>;
    syncStatus(req: Request, body: any): Promise<{
        success: boolean;
        status: string;
    }>;
    webhook(body: any): Promise<{
        success: boolean;
        status: string;
    } | {
        success: boolean;
        message: string;
    }>;
}
