revoke all on function public.handle_new_user_profile() from public, anon, authenticated;
revoke all on function public.refresh_followers_count(uuid) from public, anon, authenticated;
revoke all on function public.sync_followers_count_trigger() from public, anon, authenticated;
revoke all on function public.refresh_profile_content_counts(uuid) from public, anon, authenticated;
revoke all on function public.sync_profile_content_counts_trigger() from public, anon, authenticated;
