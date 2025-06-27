
-- Create clothing_items table to store user's wardrobe items
CREATE TABLE public.clothing_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  original_image TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outfits table to store user's saved outfits
CREATE TABLE public.outfits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create outfit_items table to store which items belong to which outfit
CREATE TABLE public.outfit_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  outfit_id UUID REFERENCES public.outfits(id) ON DELETE CASCADE NOT NULL,
  clothing_item_id UUID REFERENCES public.clothing_items(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(outfit_id, clothing_item_id)
);

-- Enable Row Level Security for all tables
ALTER TABLE public.clothing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfit_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for clothing_items
CREATE POLICY "Users can view their own clothing items" 
  ON public.clothing_items 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own clothing items" 
  ON public.clothing_items 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own clothing items" 
  ON public.clothing_items 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own clothing items" 
  ON public.clothing_items 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for outfits
CREATE POLICY "Users can view their own outfits" 
  ON public.outfits 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own outfits" 
  ON public.outfits 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own outfits" 
  ON public.outfits 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own outfits" 
  ON public.outfits 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for outfit_items (users can only access outfit items for their own outfits)
CREATE POLICY "Users can view outfit items for their own outfits" 
  ON public.outfit_items 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.outfits 
    WHERE outfits.id = outfit_items.outfit_id 
    AND outfits.user_id = auth.uid()
  ));

CREATE POLICY "Users can create outfit items for their own outfits" 
  ON public.outfit_items 
  FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.outfits 
    WHERE outfits.id = outfit_items.outfit_id 
    AND outfits.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete outfit items for their own outfits" 
  ON public.outfit_items 
  FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.outfits 
    WHERE outfits.id = outfit_items.outfit_id 
    AND outfits.user_id = auth.uid()
  ));
