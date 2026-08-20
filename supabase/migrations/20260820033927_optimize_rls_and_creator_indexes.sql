create index if not exists posts_user_id_idx on public.posts(user_id);
create index if not exists gallery_user_id_created_at_idx on public.gallery(user_id, created_at desc);
create index if not exists post_stars_user_id_idx on public.post_stars(user_id);
create index if not exists universe_subscriptions_user_id_idx on public.universe_subscriptions(user_id);

alter policy "authenticated can create own posts"
on public.posts
with check ((select auth.uid()) = user_id);

alter policy "users can update own posts"
on public.posts
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

alter policy "users can delete own posts"
on public.posts
using ((select auth.uid()) = user_id);

alter policy "authenticated can create own gallery items"
on public.gallery
with check ((select auth.uid()) = user_id);

alter policy "users can update own gallery items"
on public.gallery
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

alter policy "users can delete own gallery items"
on public.gallery
using ((select auth.uid()) = user_id);

alter policy "authenticated can read stars"
on public.post_stars
using ((select auth.uid()) = user_id);

alter policy "authenticated can add own stars"
on public.post_stars
with check ((select auth.uid()) = user_id);

alter policy "authenticated can remove own stars"
on public.post_stars
using ((select auth.uid()) = user_id);

alter policy "authenticated can read subscriptions"
on public.universe_subscriptions
using ((select auth.uid()) = user_id);

alter policy "authenticated can subscribe"
on public.universe_subscriptions
with check ((select auth.uid()) = user_id);

alter policy "authenticated can unsubscribe"
on public.universe_subscriptions
using ((select auth.uid()) = user_id);

alter policy "profiles_insert_self"
on public.profiles
with check ((select auth.uid()) = id);

alter policy "profiles_update_self"
on public.profiles
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

alter policy "follows_insert_self"
on public.follows
with check ((select auth.uid()) = follower_id);

alter policy "follows_delete_self"
on public.follows
using ((select auth.uid()) = follower_id);
