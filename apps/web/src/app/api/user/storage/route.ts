import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndConsumeStorage } from '@/lib/limits';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const sizeBytes = Number(body.sizeBytes);

    if (isNaN(sizeBytes) || sizeBytes <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid file size' }, { status: 400 });
    }

    const limitCheck = await checkAndConsumeStorage(user.id, sizeBytes);

    if (!limitCheck.allowed) {
      return NextResponse.json({
        success: false,
        message: 'Storage limit reached',
        plan: limitCheck.plan,
        max_mb: limitCheck.max_mb
      }, { status: 429 });
    }

    return NextResponse.json({ success: true, plan: limitCheck.plan });
  } catch (error: any) {
    console.error('Storage check error:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
