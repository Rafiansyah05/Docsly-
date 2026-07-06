-- 0000_docsly_schema.sql

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- 1. Profiles (Data Diri Pengguna)
-- Menghubungkan auth.users Supabase dengan profil pengguna aplikasi
create table profiles (
  id uuid references auth.users(id) primary key,
  email text not null,
  nama_lengkap text,
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Workspaces
create table workspaces (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  nama_workspace text not null,
  dibuat_pada timestamptz default now()
);

-- 3. Documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) not null,
  judul text not null,
  jenis_dokumen text,
  status text default 'draft',
  konten_json_terkini jsonb,
  dibuat_pada timestamptz default now(),
  diperbarui_pada timestamptz default now()
);

-- 4. Document Versions
create table document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) not null,
  konten_json_snapshot jsonb,
  ringkasan_perubahan text,
  dibuat_oleh text,
  dibuat_pada timestamptz default now()
);

-- 5. AI Conversations
create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) not null,
  judul_percakapan text,
  dibuat_pada timestamptz default now()
);

-- 6. Prompt History
create table prompt_history (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references ai_conversations(id) not null,
  user_prompt text not null,
  ai_response text not null,
  tokens_input integer,
  tokens_output integer,
  dibuat_pada timestamptz default now()
);

-- 7. Subscriptions
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  plan_type text not null default 'free',
  status text not null default 'active',
  berlaku_sampai timestamptz,
  dibuat_pada timestamptz default now()
);

-- 8. Usage (Quota)
create table usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  bulan_tahun text not null, -- Format: YYYY-MM
  ai_requests_count integer default 0,
  ai_tokens_used integer default 0,
  documents_created integer default 0,
  diperbarui_pada timestamptz default now(),
  unique(user_id, bulan_tahun)
);

-- 9. Settings
create table settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  tema text default 'light',
  bahasa_pengantar text default 'id',
  notifikasi_email boolean default true,
  dibuat_pada timestamptz default now()
);

-- 10. Attachments
create table attachments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) not null,
  nama_file text not null,
  url_file text not null,
  tipe_file text,
  ukuran_bytes integer,
  dibuat_pada timestamptz default now()
);

-- 11. Image Placeholders
create table image_placeholders (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) not null,
  caption text,
  url_gambar_asli text,
  status text default 'pending', -- pending | uploaded
  dibuat_pada timestamptz default now()
);

-- 12. References (Sumber Referensi Manual/Zotero)
create table "references" (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references workspaces(id) not null,
  judul text not null,
  penulis text,
  tahun text,
  penerbit text,
  jenis_sumber text,
  url text,
  dibuat_pada timestamptz default now()
);

-- 13. Bibliography Entries
create table bibliography_entries (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) not null,
  reference_id uuid references "references"(id) not null,
  format_sitasi text, -- misal: 'apa', 'harvard'
  dibuat_pada timestamptz default now()
);

-- Create a trigger function to automatically create a profile for new users
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, nama_lengkap, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function after an insert on auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
