-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Helper trigger for updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Site settings (single row)
CREATE TABLE public.site_settings (
  id int PRIMARY KEY DEFAULT 1,
  site_name text NOT NULL DEFAULT 'DONUTOO',
  tagline text DEFAULT 'Home of the Original Messy Donuts',
  logo_url text,
  footer_logo_url text,
  favicon_url text,
  email text DEFAULT 'info@donutoo.com',
  phone_primary text DEFAULT '+20 122 422 0070',
  phone_secondary text,
  address_main text DEFAULT 'Donutoo Billy Plaza, Heliopolis, Cairo, Egypt',
  address_branch text,
  hours text DEFAULT 'Daily: 10:00 AM - 12:00 AM',
  facebook_url text DEFAULT 'https://facebook.com/donutoo',
  instagram_url text DEFAULT 'https://instagram.com/donutoo',
  tiktok_url text,
  whatsapp_number text,
  google_maps_embed text,
  contact_info_heading text DEFAULT 'CONTACT INFO',
  timing_heading text DEFAULT 'BRANCH INFO',
  get_in_touch_heading text DEFAULT 'GET IN TOUCH',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (id = 1)
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read site_settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admins write site_settings" ON public.site_settings FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER touch_site_settings BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Navigation
CREATE TABLE public.navigation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL DEFAULT 'header',  -- 'header' | 'footer'
  label text NOT NULL,
  href text NOT NULL,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read navigation" ON public.navigation FOR SELECT USING (true);
CREATE POLICY "admins write navigation" ON public.navigation FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Slider
CREATE TABLE public.slider (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  description text,
  image_url text,
  cta_label text DEFAULT 'Our Menu',
  cta_href text DEFAULT '/menu',
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.slider ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read slider" ON public.slider FOR SELECT USING (true);
CREATE POLICY "admins write slider" ON public.slider FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Page content (key-value blocks)
CREATE TABLE public.page_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key text NOT NULL,         -- e.g. 'home', 'about', 'franchise', 'contact'
  block_key text NOT NULL,        -- e.g. 'who_we_are', 'difference', 'hero', 'intro'
  heading text,
  subheading text,
  body text,
  image_url text,
  extra jsonb DEFAULT '{}'::jsonb,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_key, block_key)
);
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read page_content" ON public.page_content FOR SELECT USING (true);
CREATE POLICY "admins write page_content" ON public.page_content FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER touch_page_content BEFORE UPDATE ON public.page_content FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Menu
CREATE TABLE public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read menu_categories" ON public.menu_categories FOR SELECT USING (true);
CREATE POLICY "admins write menu_categories" ON public.menu_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.menu_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  price numeric(10,2),
  currency text DEFAULT 'EGP',
  image_url text,
  badge text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read menu_items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "admins write menu_items" ON public.menu_items FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Blog
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  excerpt text,
  content text,
  image_url text,
  published_at timestamptz DEFAULT now(),
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read published posts" ON public.blog_posts FOR SELECT USING (is_published OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins write blog_posts" ON public.blog_posts FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER touch_blog_posts BEFORE UPDATE ON public.blog_posts FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Testimonials
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  quote text NOT NULL,
  image_url text,
  rating int DEFAULT 5,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read testimonials" ON public.testimonials FOR SELECT USING (true);
CREATE POLICY "admins write testimonials" ON public.testimonials FOR ALL
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Forms
CREATE TABLE public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public submit contact" ON public.contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read contact" ON public.contact_submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete contact" ON public.contact_submissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.franchise_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  country text,
  city text,
  investment_capacity text,
  message text,
  data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.franchise_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public submit franchise" ON public.franchise_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read franchise" ON public.franchise_submissions FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete franchise" ON public.franchise_submissions FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public subscribe" ON public.subscribers FOR INSERT WITH CHECK (true);
CREATE POLICY "admins read subscribers" ON public.subscribers FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete subscribers" ON public.subscribers FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Auto-grant 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed initial content
INSERT INTO public.site_settings (id) VALUES (1);

INSERT INTO public.navigation (location, label, href, sort_order) VALUES
  ('header','Home','/',1),('header','About','/about',2),('header','Menu','/menu',3),
  ('header','Franchise','/franchise',4),('header','Blog','/blog',5),('header','Contact','/contact',6);

INSERT INTO public.slider (title, subtitle, description, image_url, sort_order) VALUES
  ('Now available in', 'EGYPT!', 'Experience our freshly baked donuts now in Heliopolis, Cairo.', '/uploads/slider/2054190686.webp', 1),
  ('Home of the Original', 'Messy Donuts', 'More than 50 toppings to customize your perfect bite.', '/uploads/slider/1685220076.webp', 2),
  ('Freshly Baked', 'Never Fried', 'Healthier, lighter, and bursting with flavor.', '/uploads/slider/1086177597.webp', 3);

INSERT INTO public.page_content (page_key, block_key, heading, subheading, body, image_url, sort_order) VALUES
  ('home','intro','FRESHLY BAKED','Customize Your Bite','Experience our FRESHLY BAKED donuts with more than 50 topping options to customize and make it your own.','/site-img/1.webp',1),
  ('home','cat_sweet','SWEET',null,'Baked, fluffy donuts that can be customized with sweet sauces or fruit purées that suit your taste.','/site-img/donutsweet.png',2),
  ('home','cat_savory','SAVORY',null,'Baked, fluffy donuts that can be customized with cheese and various toppings that suit your taste.','/site-img/donutsandwich.png',3),
  ('home','cat_vegan','VEGAN',null,'Baked, fluffy donuts that are lactose-free and can be customized with sauces and purées that suit your taste.','/site-img/donutvegan.png',4),
  ('home','who_we_are','WHO WE ARE','The Donutoo Story','The idea of DONUTOO® came to the founder when his love for donuts prevented him from enjoying his favorites due to it being fried, with too many calories, and not being an ON-THE-GO product.

The goal was to create a variety of baked donuts that were less oily, nutritious, and bite-sized. Something not only sweet but also savory. Something that would both satiate your hunger and keep you from feeling stuffed.

Thus, was born DONUTOO®, the home of the original messy donuts® which could satisfy your sweet and savory craving minus the guilt-tripping.','/uploads/about/1779542627.webp',5),
  ('home','difference','What Makes Us Different?',null,'Unlike most donut shops we do not make the donuts early morning and put them on display — we are FRESHLY BAKED. We prepare orders as customers order them. Our Donuts are baked, not fried, so they are a healthier option. We support the local economy by sourcing from local manufacturers. Because they''re bite-size, they can be eaten On the Go. Our focus is on excellence in quality, quickness of service, consistency, and total customer satisfaction.','/uploads/about/2065729736.webp',6),
  ('home','franchise','FRANCHISE','Join the Donutoo family','We are looking for ambitious, hardworking, and dedicated entrepreneurs to join the Donutoo family and bring our irresistible donuts to Egypt and beyond! As a Donutoo franchise partner, you will be part of a fast-growing brand committed to quality, innovation, and customer satisfaction.','/uploads/about/1414162176.webp',7),
  ('about','intro','Our Story','From a sweet idea to a beloved brand','In 2021, the founder of DONUTOO® came up with the idea when his love for donuts prevented him from enjoying his favorites due to it being fried, with too many calories, and not being an ON-THE-GO product.

Now, DONUTOO® is a household brand known for our freshly baked sweet and savory doughnuts that are best served hot, as well as our lines of concocted drinks and coffee.

We value hard work and quality ingredients and strive to bring our customers superb tasting doughnuts they can indulge in without the guilt.','/uploads/about/1779542627.webp',1),
  ('about','value_quality','Quality First',null,'Premium ingredients sourced locally for unmatched freshness in every bite.','/site-img/services_1.png',2),
  ('about','value_baked','Baked Not Fried',null,'A healthier indulgence — fluffy texture, less oil, and full of flavor.','/site-img/services_2.png',3),
  ('about','value_fresh','Made to Order',null,'We bake when you order — never sitting on display.','/site-img/services_3.png',4),
  ('franchise','intro','Become a Franchisee','Own a piece of the messy-donut magic','Join one of the fastest-growing donut brands in the region. We provide full operational support, training, marketing assistance, and a proven business model.','/uploads/about/1414162176.webp',1),
  ('contact','intro','Get in Touch','We''d love to hear from you','Questions, feedback, or partnerships — drop us a line.','/site-img/cta_img_1.png',1);

INSERT INTO public.menu_categories (name, description, image_url, sort_order) VALUES
  ('Sweet Donuts','Indulgent baked donuts with sweet sauces and toppings','/uploads/category/1122685357.webp',1),
  ('Savory Donuts','Cheese, herbs, and rich toppings on baked donut bases','/uploads/category/1362031283.png',2),
  ('Vegan Donuts','Lactose-free baked donuts with delicious purées','/uploads/category/925884526.png',3),
  ('Beverages','Signature drinks, coffee and shakes','/uploads/category/1735506302.png',4),
  ('Ice Cream','Soft, creamy ice cream desserts','/uploads/category/789675300.png',5),
  ('Combos','Bundle donuts and drinks for the perfect treat','/uploads/category/1464273811.png',6);

WITH cats AS (SELECT id, name FROM public.menu_categories)
INSERT INTO public.menu_items (category_id, name, description, price, image_url, sort_order)
SELECT cats.id, items.name, items.description, items.price, items.image, items.so FROM cats
JOIN (VALUES
  ('Sweet Donuts','Nutella Bliss','Warm Nutella drizzle, chocolate chips, powdered sugar', 75.00, '/site-img/donutsweet.png', 1),
  ('Sweet Donuts','Strawberry Cream','Fresh strawberry purée, vanilla cream, sprinkles', 70.00, '/site-img/donutsweet.png', 2),
  ('Sweet Donuts','Caramel Crunch','Salted caramel, crushed nuts, sea salt flake', 75.00, '/site-img/donutsweet.png', 3),
  ('Sweet Donuts','Lotus Dream','Lotus spread, biscuit crumble, white chocolate', 80.00, '/site-img/donutsweet.png', 4),
  ('Savory Donuts','Cheese Lover','Triple cheese melt, oregano, chili flakes', 85.00, '/site-img/donutsandwich.png', 1),
  ('Savory Donuts','Zaatar Mix','Olive oil, zaatar blend, sesame', 70.00, '/site-img/donutsandwich.png', 2),
  ('Savory Donuts','Spicy Chicken','Shredded spicy chicken, ranch, jalapeños', 95.00, '/site-img/donutsandwich.png', 3),
  ('Vegan Donuts','Berry Vegan','Mixed berry purée, coconut flakes', 80.00, '/site-img/donutvegan.png', 1),
  ('Vegan Donuts','Mango Tango','Fresh mango purée, lime zest', 80.00, '/site-img/donutvegan.png', 2),
  ('Beverages','Donaccino','Our signature iced coffee blend', 65.00, '/site-img/coffee.png', 1),
  ('Beverages','Flavored Mojito','Fresh mint, lime, choice of fruit syrup', 55.00, '/site-img/coffee.png', 2),
  ('Beverages','Iced Latte','Smooth espresso over ice with creamy milk', 60.00, '/site-img/coffee.png', 3),
  ('Ice Cream','Vanilla Caramel','Soft vanilla ice cream with caramel sauce', 70.00, '/site-img/cheese.png', 1),
  ('Ice Cream','Chocolate Storm','Rich chocolate soft serve with brownie chunks', 75.00, '/site-img/cheese.png', 2),
  ('Combos','Sweet Trio + Drink','3 sweet donuts + any beverage', 180.00, '/site-img/donutsweet.png', 1),
  ('Combos','Family Box','12 mixed donuts to share', 320.00, '/site-img/donutsweet.png', 2)
) AS items(catname, name, description, price, image, so) ON cats.name = items.catname;

INSERT INTO public.testimonials (name, quote, image_url, sort_order) VALUES
  ('Ramy Hana','The donuts are fresh and delicious, and the staff is incredibly friendly and welcoming. A special shoutout to Kirollos for his warm smile and great service — he truly makes the experience even better. Highly recommend!','/uploads/admin/123806041.png',1),
  ('Elsayed Elbhiry','I loved the place style and the amazing taste of mini donuts. Baked donuts so it has less oil and calories. First time in my life trying salty donuts… I can''t explain how great it was, so rich in the cheese.',null,2),
  ('Zai Biclar','What I like most: the donuts are baked which is healthier. Their signature drink Donaccino is wow. Very good experience, suitable for families and kids. Very nice staff.',null,3),
  ('Abdullah Azab','Baked not fried delicious donuts — totally recommend. Also vanilla ice cream with caramel sauce is the bomb!!!',null,4),
  ('Omar Ghazal','Just had the most incredible experience at Donutoo and I can''t help but share the love! Their freshly baked donuts are a game-changer. The hospitality here is beyond brilliant — it feels like you''re among friends. 10/10.',null,5),
  ('Yasmin Elkafafy','Thanks to the wonderful staff, I had the chance to try Donutoo. While it''s not my first time having donuts, it was my first time at Donutoo, and I absolutely loved the taste!',null,6);

INSERT INTO public.blog_posts (slug, title, excerpt, content, image_url, published_at) VALUES
  ('introducing-our-flavored-mojito','Introducing our Flavored Mojito','Every sip of our Flavored Mojito will get you refreshed. Try it out now at DONUTOO!','Every sip of our Flavored Mojito will get you refreshed. Try it out now at DONUTOO! Now in Egypt — waiting for you at our Heliopolis branch. Choose from a range of fresh fruit syrups, hand-muddled with mint and lime over crackling ice.','/site-img/b1.webp','2022-11-17'),
  ('moments-of-happiness','Moments of Happiness','Soft Creamy Ice Cream from Donutoo… your next to-go ultimate treat.','Moments of happiness… loading. Soft Creamy Ice Cream from Donutoo… your next to-go ultimate treat. Now in Egypt. Waiting for you at Donutoo, Billy Plaza opposite of Tivoli Dome Garden, Omar Ibn El Khattab St, Heliopolis.','/site-img/b2.webp','2022-10-25'),
  ('taste-or-look','Taste or Look?','Try the mini baked donuts with all the flavors and toppings you can imagine.','Taste or look? We ourselves can''t decide. Try the mini baked donuts with all the flavors and toppings you can imagine. Send us a message and we''ll send you the menu — and we''ll wait for you at Donutoo.','/site-img/9.webp','2022-10-13');
