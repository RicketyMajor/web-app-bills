-- Category constraints: case-insensitive names, bounded icon.
-- Run once in Supabase Dashboard -> SQL Editor.
-- Fails if a user already has names differing only by case; rename those first:
--   select user_id, type, lower(name) from public.categories
--   group by 1, 2, 3 having count(*) > 1;

-- "Food" and "food" are the same category to a person. The client still maps
-- 23505 to "You already have a category with that name."
alter table public.categories drop constraint categories_user_id_type_name_key;
create unique index categories_user_id_type_lower_name_key
  on public.categories (user_id, type, lower(name));

-- The UI only offers single emojis; this bounds what the API accepts
-- (a ZWJ emoji sequence can reach ~10 code points).
alter table public.categories
  add constraint categories_icon_length check (char_length(icon) between 1 and 16);
