import { Controller, Post, Body, Req, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { PaymentService } from './payment.service';
import { createClient } from '@supabase/supabase-js';

@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  private async verifyAuth(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedException('Missing Authorization header');
    
    const token = authHeader.split(' ')[1];
    if (!token) throw new UnauthorizedException('Invalid token format');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase environment variables missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }
    
    return user;
  }

  @Post('create')
  async createTransaction(@Req() req: Request, @Body() body: any) {
    const user = await this.verifyAuth(req);
    const { plan } = body;
    if (!plan) throw new BadRequestException('Plan is required');

    return this.paymentService.createTransaction(user, plan);
  }

  @Post('sync-status')
  async syncStatus(@Req() req: Request, @Body() body: any) {
    const user = await this.verifyAuth(req);
    const { order_id } = body;
    if (!order_id) throw new BadRequestException('Order ID is required');

    return this.paymentService.syncStatus(user.id, order_id);
  }
}
