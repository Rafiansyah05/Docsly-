-- Update the handle_new_user trigger to also grant a 7-day free trial subscription
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  -- 1. Create profile
  insert into public.profiles (id, email, nama_lengkap, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  
  -- 2. Create 7-day trial subscription
  insert into public.subscriptions (user_id, plan_type, status, berlaku_sampai)
  values (new.id, 'trial', 'active', now() + interval '7 days');
  
  return new;
end;
$$ language plpgsql security definer;
