export declare class PaymentService {
    private snap;
    private coreApi;
    constructor();
    private getSupabaseAdmin;
    createTransaction(user: any, plan: string, paymentMethod?: string): Promise<{
        order_id: string;
        payment_type: string;
        transaction_status: any;
        va_numbers: any;
        bill_key: any;
        biller_code: any;
        actions: any;
    }>;
    syncStatus(userId: string, orderId: string): Promise<{
        success: boolean;
        status: string;
    }>;
}
