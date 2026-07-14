import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export type PlanType = 'free' | 'pro' | 'premium' | 'trial';

export const PLAN_LIMITS = {
  free: {
    ai_credits: 10,
    ai_cooldown_hours: 8,
    citations: 10, // Not explicitly mentioned, assume 10 for free, or limit AI credits
    citations_cooldown_hours: 8,
    storage_mb: 100,
  },
  pro: {
    ai_credits: 500,
    ai_cooldown_hours: 4,
    citations: 50,
    citations_cooldown_hours: 4,
    storage_mb: 2000,
  },
  premium: {
    ai_credits: 1500,
    ai_cooldown_hours: 1,
    citations: -1, // -1 means unlimited
    citations_cooldown_hours: 0,
    storage_mb: 20000,
  },
  trial: {
    ai_credits: 10,
    ai_cooldown_hours: 8,
    citations: -1, // Hak akses penuh untuk fitur
    citations_cooldown_hours: 0,
    storage_mb: 20000,
  }
};

export async function getUserPlan(userId: string): Promise<PlanType> {
  const supabase = createAdminClient();
  const { data: sub } = await supabase
    .from('subscriptions')
    .select('plan_type, status, berlaku_sampai')
    .eq('user_id', userId)
    .single();

  if (!sub || sub.status !== 'active') return 'free';

  // Check expiration date
  if (sub.berlaku_sampai && new Date(sub.berlaku_sampai).getTime() < Date.now()) {
    // Return free if expired
    return 'free';
  }

  const plan = sub.plan_type.toLowerCase();
  if (plan === 'pro') return 'pro';
  if (plan === 'premium') return 'premium';
  if (plan === 'trial') return 'trial';
  
  return 'free';
}

export async function checkAndConsumeAICredit(userId: string) {
  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];

  const supabase = createAdminClient();
  
  // Get current limits
  let { data: userLimit } = await supabase
    .from('user_limits')
    .select('*')
    .eq('user_id', userId)
    .single();

  const now = new Date();

  if (!userLimit) {
    // Create new record
    const { data: newLimit } = await supabase
      .from('user_limits')
      .insert({ user_id: userId, ai_credits_used: 0, citations_used: 0, storage_used_bytes: 0 })
      .select()
      .single();
    userLimit = newLimit;
  }

  let currentUsed = userLimit?.ai_credits_used || 0;
  let resetAt = userLimit?.ai_limit_reset_at ? new Date(userLimit.ai_limit_reset_at) : null;

  // Check if cooldown has passed
  if (resetAt && now.getTime() >= resetAt.getTime()) {
    currentUsed = 0;
    resetAt = null;
    
    // Reset in DB
    await supabase.from('user_limits').update({
      ai_credits_used: 0,
      ai_limit_reset_at: null
    }).eq('user_id', userId);
  }

  // Check limit
  if (currentUsed >= limits.ai_credits) {
    // Reached limit, set cooldown if not set
    if (!resetAt) {
      resetAt = new Date(now.getTime() + limits.ai_cooldown_hours * 60 * 60 * 1000);
      await supabase.from('user_limits').update({
        ai_limit_reset_at: resetAt.toISOString()
      }).eq('user_id', userId);
    }
    
    return {
      allowed: false,
      reason: 'limit_reached',
      resetAt: resetAt.toISOString(),
      plan
    };
  }

  // Consume credit
  await supabase.from('user_limits').update({
    ai_credits_used: currentUsed + 1
  }).eq('user_id', userId);

  return { allowed: true, plan };
}

export async function checkAndConsumeCitation(userId: string) {
  const plan = await getUserPlan(userId);
  const limits = PLAN_LIMITS[plan];

  if (limits.citations === -1) {
    return { allowed: true, plan }; // Unlimited
  }

  const supabase = createAdminClient();
  
  let { data: userLimit } = await supabase
    .from('user_limits')
    .select('*')
    .eq('user_id', userId)
    .single();

  const now = new Date();

  if (!userLimit) {
    const { data: newLimit } = await supabase
      .from('user_limits')
      .insert({ user_id: userId, ai_credits_used: 0, citations_used: 0, storage_used_bytes: 0 })
      .select()
      .single();
    userLimit = newLimit;
  }

  let currentUsed = userLimit?.citations_used || 0;
  let resetAt = userLimit?.citations_limit_reset_at ? new Date(userLimit.citations_limit_reset_at) : null;

  if (resetAt && now.getTime() >= resetAt.getTime()) {
    currentUsed = 0;
    resetAt = null;
    await supabase.from('user_limits').update({
      citations_used: 0,
      citations_limit_reset_at: null
    }).eq('user_id', userId);
  }

  if (currentUsed >= limits.citations) {
    if (!resetAt) {
      resetAt = new Date(now.getTime() + limits.citations_cooldown_hours * 60 * 60 * 1000);
      await supabase.from('user_limits').update({
        citations_limit_reset_at: resetAt.toISOString()
      }).eq('user_id', userId);
    }
    
    return {
      allowed: false,
      reason: 'limit_reached',
      resetAt: resetAt.toISOString(),
      plan
    };
  }

  await supabase.from('user_limits').update({
    citations_used: currentUsed + 1
  }).eq('user_id', userId);

  return { allowed: true, plan };
}
