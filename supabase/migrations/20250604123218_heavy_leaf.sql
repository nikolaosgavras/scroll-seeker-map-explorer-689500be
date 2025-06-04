/*
  # Create treasures table

  1. New Tables
    - `treasures`
      - `id` (uuid, primary key)
      - `name` (text, required)
      - `clue` (text, required)
      - `description` (text, required)
      - `x` (integer, required)
      - `y` (integer, required)
      - `created_at` (timestamp with time zone)
      - `picture_url` (text, optional)

  2. Security
    - Enable RLS on `treasures` table
    - Add policy for public read access
*/

create table if not exists treasures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  clue text not null,
  description text not null,
  x integer not null,
  y integer not null,
  created_at timestamptz default now(),
  picture_url text
);

alter table treasures enable row level security;

create policy "Anyone can view treasures"
  on treasures
  for select
  to public
  using (true);

-- Insert initial data
insert into treasures (name, clue, description, x, y) values
  ('Golden Chalice', 'Where ancient stones meet the morning sun', 'A magnificent golden chalice embedded with emeralds', 300, 200),
  ('Silver Compass', 'Beneath the weeping willow''s shade', 'An ornate silver compass that always points to treasure', 150, 350),
  ('Ruby Ring', 'Where the river bends twice under moonlight', 'A ruby ring said to grant the wearer good fortune', 450, 280),
  ('Ancient Scroll', 'In the shadow of the tallest peak', 'An ancient scroll containing forgotten magic spells', 200, 100),
  ('Emerald Necklace', 'Where wildflowers dance in summer breeze', 'A stunning emerald necklace from a lost civilization', 380, 400),
  ('Dragon''s Eye', 'Deep in the cavern where echoes dwell', 'A mystical gem that glows with inner fire', 100, 180);