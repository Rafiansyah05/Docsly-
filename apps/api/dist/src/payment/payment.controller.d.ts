import type { Request } from 'express';
import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
    private verifyAuth;
    createTransaction(req: Request, body: any): Promise<{
        token: any;
        redirect_url: any;
    }>;
    syncStatus(req: Request, body: any): Promise<{
        success: boolean;
    }>;
}
