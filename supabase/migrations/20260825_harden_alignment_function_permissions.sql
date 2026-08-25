-- Security hardening for Drawing Verse Supabase alignment.
-- Trigger-only SECURITY DEFINER functions should not be callable through PostgREST.

revoke all on function public.sync_post_comment_count() from public, anon, authenticated;
revoke all on function public.sync_post_like_count() from public, anon, authenticated;
revoke all on function public.sync_universe_post_count() from public, anon, authenticated;
revoke all on function public.sync_universe_subscriber_count() from public, anon, authenticated;
revoke all on function public.sync_profile_universe_count() from public, anon, authenticated;

-- Verse Talk matching is an authenticated-only RPC.
revoke all on function public.match_verse_talk(text) from public, anon;
grant execute on function public.match_verse_talk(text) to authenticated;

-- Public page views intentionally increment counters through these RPCs.
-- Remove the broad PUBLIC grant and keep only the API roles the app uses.
revoke all on function public.increment_post_view(bigint) from public;
revoke all on function public.increment_gallery_view(bigint) from public;
grant execute on function public.increment_post_view(bigint) to anon, authenticated;
grant execute on function public.increment_gallery_view(bigint) to anon, authenticated;
