export declare class PaymentService {
    private snap;
    constructor();
    private getSupabaseAdmin;
    createTransaction(user: any, plan: string): Promise<{
        token: any;
        redirect_url: any;
    }>;
    syncStatus(userId: string, orderId: string): Promise<{
        success: boolean;
    }>;
}
