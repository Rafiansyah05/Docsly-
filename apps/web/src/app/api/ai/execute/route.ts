export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndConsumeAICredit } from '@/lib/limits';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the incoming body to forward it
    const body = await req.json();

    // Check limit
    const limitCheck = await checkAndConsumeAICredit(user.id);
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

    // Forward to NestJS AI Microservice
    const aiResponse = await fetch('http://localhost:3001/ai/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      return NextResponse.json({ error: `AI Engine Error: ${errText}` }, { status: aiResponse.status });
    }

    // Stream the SSE response back to the client
    return new NextResponse(aiResponse.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('AI Proxy Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
