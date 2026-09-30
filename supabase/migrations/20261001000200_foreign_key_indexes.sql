-- Index sur les clés étrangères signalées par l'advisor de performance Supabase.
create index if not exists deliveries_order_idx on public.deliveries (order_id);
create index if not exists invoices_establishment_idx on public.invoices (establishment_id);
create index if not exists menu_days_meal_idx on public.menu_days (meal_id);
create index if not exists menu_days_dessert_idx on public.menu_days (dessert_id);
create index if not exists menu_days_original_meal_idx on public.menu_days (original_meal_id);
create index if not exists monthly_menus_confirmed_by_idx on public.monthly_menus (confirmed_by);
create index if not exists order_items_meal_idx on public.order_items (meal_id);
create index if not exists orders_created_by_idx on public.orders (created_by);
