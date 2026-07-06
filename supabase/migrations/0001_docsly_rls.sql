-- 0001_docsly_rls.sql

-- Enable Row Level Security for all tables
alter table profiles enable row level security;
alter table workspaces enable row level security;
alter table documents enable row level security;
alter table document_versions enable row level security;
alter table ai_conversations enable row level security;
alter table prompt_history enable row level security;
alter table subscriptions enable row level security;
alter table usage enable row level security;
alter table settings enable row level security;
alter table attachments enable row level security;
alter table image_placeholders enable row level security;
alter table "references" enable row level security;
alter table bibliography_entries enable row level security;

-- 1. Profiles Policies
create policy "User can view their own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "User can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- 2. Workspaces Policies
create policy "User can view their own workspaces"
  on workspaces for select
  using (auth.uid() = user_id);

create policy "User can create workspaces"
  on workspaces for insert
  with check (auth.uid() = user_id);

create policy "User can update their own workspaces"
  on workspaces for update
  using (auth.uid() = user_id);

create policy "User can delete their own workspaces"
  on workspaces for delete
  using (auth.uid() = user_id);

-- 3. Documents Policies
create policy "User can view their own documents"
  on documents for select
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

create policy "User can create documents"
  on documents for insert
  with check (workspace_id in (select id from workspaces where user_id = auth.uid()));

create policy "User can update their own documents"
  on documents for update
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

create policy "User can delete their own documents"
  on documents for delete
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

-- 4. Document Versions Policies
create policy "User can view their document versions"
  on document_versions for select
  using (document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid())));

create policy "User can insert document versions"
  on document_versions for insert
  with check (document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid())));

-- 5. AI Conversations
create policy "User can view their ai conversations"
  on ai_conversations for select
  using (document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid())));

create policy "User can insert ai conversations"
  on ai_conversations for insert
  with check (document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid())));

-- 6. Prompt History
create policy "User can view their prompt history"
  on prompt_history for select
  using (conversation_id in (select id from ai_conversations where document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid()))));

create policy "User can insert prompt history"
  on prompt_history for insert
  with check (conversation_id in (select id from ai_conversations where document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid()))));

-- 7. Subscriptions Policies
create policy "User can view their own subscriptions"
  on subscriptions for select
  using (auth.uid() = user_id);

-- 8. Usage Policies
create policy "User can view their own usage"
  on usage for select
  using (auth.uid() = user_id);

-- 9. Settings Policies
create policy "User can view their own settings"
  on settings for select
  using (auth.uid() = user_id);

create policy "User can update their own settings"
  on settings for update
  using (auth.uid() = user_id);

create policy "User can insert their own settings"
  on settings for insert
  with check (auth.uid() = user_id);

-- 10. Attachments Policies
create policy "User can view their document attachments"
  on attachments for select
  using (document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid())));

create policy "User can insert document attachments"
  on attachments for insert
  with check (document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid())));

-- 11. Image Placeholders Policies
create policy "User can view their document placeholders"
  on image_placeholders for select
  using (document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid())));

create policy "User can insert document placeholders"
  on image_placeholders for insert
  with check (document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid())));

create policy "User can update document placeholders"
  on image_placeholders for update
  using (document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid())));

-- 12. References Policies
create policy "User can view their references"
  on "references" for select
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

create policy "User can insert references"
  on "references" for insert
  with check (workspace_id in (select id from workspaces where user_id = auth.uid()));

create policy "User can update references"
  on "references" for update
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

create policy "User can delete references"
  on "references" for delete
  using (workspace_id in (select id from workspaces where user_id = auth.uid()));

-- 13. Bibliography Entries Policies
create policy "User can view their bibliography entries"
  on bibliography_entries for select
  using (document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid())));

create policy "User can insert bibliography entries"
  on bibliography_entries for insert
  with check (document_id in (select id from documents where workspace_id in (select id from workspaces where user_id = auth.uid())));
