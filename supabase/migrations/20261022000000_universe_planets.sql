-- A universe may orbit one parent universe as its planet.
ALTER TABLE public.universes
  ADD COLUMN IF NOT EXISTS parent_slug text REFERENCES public.universes(slug) ON UPDATE CASCADE ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS universes_parent_slug_idx ON public.universes(parent_slug);
ALTER TABLE public.universes
  ADD CONSTRAINT universes_parent_not_self CHECK (parent_slug IS NULL OR parent_slug <> slug);
-- Enforce parent ownership and prevent multi-level nesting even for direct database writes.
CREATE OR REPLACE FUNCTION public.validate_universe_planet()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
DECLARE parent_owner uuid; grandparent text;
BEGIN
  IF NEW.parent_slug IS NULL THEN RETURN NEW; END IF;
  SELECT owner_id, parent_slug INTO parent_owner, grandparent
    FROM public.universes WHERE slug = NEW.parent_slug;
  IF NOT FOUND OR parent_owner IS DISTINCT FROM NEW.owner_id THEN
    RAISE EXCEPTION 'Planet and parent must have the same owner';
  END IF;
  IF grandparent IS NOT NULL THEN
    RAISE EXCEPTION 'Only one planet nesting level is supported';
  END IF;
  IF EXISTS (SELECT 1 FROM public.universes WHERE parent_slug = NEW.slug) THEN
    RAISE EXCEPTION 'A universe with planets cannot become a planet';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS validate_universe_planet_trigger ON public.universes;
CREATE TRIGGER validate_universe_planet_trigger BEFORE INSERT OR UPDATE OF parent_slug, owner_id
ON public.universes FOR EACH ROW EXECUTE FUNCTION public.validate_universe_planet();
