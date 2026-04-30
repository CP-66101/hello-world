
ALTER TABLE public.menu_categories
  ADD COLUMN IF NOT EXISTS name_ar text;

ALTER TABLE public.menu_items
  ADD COLUMN IF NOT EXISTS name_ar text,
  ADD COLUMN IF NOT EXISTS price_secondary numeric,
  ADD COLUMN IF NOT EXISTS size_label text,
  ADD COLUMN IF NOT EXISTS size_label_secondary text;
