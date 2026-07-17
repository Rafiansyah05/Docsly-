// export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndConsumeCitation } from '@/lib/limits';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // Check limit
    const limitCheck = await checkAndConsumeCitation(user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'limit_reached', 
          resetAt: limitCheck.resetAt, 
          plan: limitCheck.plan 
        }, 
        { status: 429 }
      );
    }

    // Forward the FormData to NestJS Citation Microservice
    const formData = await req.formData();
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const aiResponse = await fetch(`${baseUrl}/api/citation/extract-file`, {
      method: 'POST',
      body: formData,
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return NextResponse.json({ success: false, message: `Citation Engine Error: ${errText}` }, { status: aiResponse.status });
    }

    const data = await aiResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Citation Proxy Error:', error);
    return NextResponse.json({ success: false, message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
