
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  originalImage: string;
}

interface OutfitItems {
  top?: ClothingItem;
  bottom?: ClothingItem;
  shoes?: ClothingItem;
  accessory?: ClothingItem;
}

const categories = ["top", "bottom", "shoes", "accessory"];

const StyleOutfit = () => {
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [outfitItems, setOutfitItems] = useState<OutfitItems>({});
  const [outfitName, setOutfitName] = useState<string>("");
  const [draggedItem, setDraggedItem] = useState<ClothingItem | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();
  const outfitPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();
    loadWardrobe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const loadWardrobe = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading wardrobe:', error);
        return;
      }

      const formattedItems: ClothingItem[] = data?.map(item => ({
        id: item.id,
        imageUrl: item.image_url,
        category: item.category,
        color: item.color,
        originalImage: item.original_image
      })) || [];

      setWardrobe(formattedItems);
    } catch (error) {
      console.error('Error loading wardrobe:', error);
    }
  };

  const handleDragStart = (item: ClothingItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, category: keyof OutfitItems) => {
    e.preventDefault();
    if (draggedItem && draggedItem.category === category) {
      setOutfitItems(prev => ({
        ...prev,
        [category]: draggedItem
      }));
    }
    setDraggedItem(null);
  };

  const removeFromOutfit = (category: keyof OutfitItems) => {
    setOutfitItems(prev => {
      const updated = { ...prev };
      delete updated[category];
      return updated;
    });
  };

  const saveOutfit = async () => {
    if (Object.keys(outfitItems).length === 0) {
      toast({
        title: "No items selected",
        description: "Please add items to create an outfit.",
      });
      return;
    }
  
    if (!outfitName.trim()) {
      toast({
        title: "Outfit name required",
        description: "Please enter a name for your outfit.",
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to save outfits.",
      });
      return;
    }

    try {
      // Save outfit to database
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert({
          name: outfitName,
          user_id: currentUser.id
        })
        .select()
        .single();

      if (outfitError) throw outfitError;

      // Save outfit items
      const outfitItemsToSave = Object.values(outfitItems).map(item => ({
        outfit_id: outfit.id,
        clothing_item_id: item.id
      }));

      const { error: itemsError } = await supabase
        .from('outfit_items')
        .insert(outfitItemsToSave);

      if (itemsError) throw itemsError;

      toast({
        title: "Outfit saved",
        description: "Your outfit has been saved successfully.",
      });

      // Reset form
      setOutfitName("");
      setOutfitItems({});
    } catch (error) {
      console.error('Error saving outfit:', error);
      toast({
        title: "Error saving outfit",
        description: "Please try again.",
      });
    }
  };

  const downloadOutfitImage = async () => {
    if (!outfitPreviewRef.current) return;

    try {
      const canvas = await html2canvas(outfitPreviewRef.current, {
        backgroundColor: '#f8f9fa',
        scale: 2,
        useCORS: true
      });
      
      const link = document.createElement('a');
      link.download = `${outfitName || 'outfit'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error downloading outfit image:', error);
      toast({
        title: "Error downloading image",
        description: "Please try again.",
      });
    }
  };

  const getItemsByCategory = (category: string) => {
    return wardrobe.filter(item => item.category === category);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-navy-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              variant="ghost"
              size="sm"
              className="text-navy-600 hover:bg-navy-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-navy-800">Style Your Outfit</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Label htmlFor="outfit-name" className="text-sm text-navy-600">Outfit Name:</Label>
              <input
                type="text"
                id="outfit-name"
                placeholder="Enter outfit name"
                value={outfitName}
                onChange={(e) => setOutfitName(e.target.value)}
                className="bg-white/80 border border-navy-300 rounded-md px-3 py-1 text-sm text-navy-700 focus:ring-navy-400 focus:border-navy-400 outline-none"
              />
            </div>
            <Button 
              onClick={downloadOutfitImage}
              variant="outline"
              size="sm"
              className="border-navy-300 hover:bg-navy-50 text-navy-600"
              disabled={Object.keys(outfitItems).length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wardrobe Categories - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {categories.map(category => {
              const items = getItemsByCategory(category);
              return (
                <Card key={category} className="bg-white/80 backdrop-blur-sm border-navy-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-navy-800 capitalize">
                      {category} ({items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                      {items.map(item => (
                        <div 
                          key={item.id}
                          className="relative group cursor-grab active:cursor-grabbing"
                          draggable
                          onDragStart={() => handleDragStart(item)}
                        >
                          <img 
                            src={item.imageUrl} 
                            alt={`${item.color} ${item.category}`}
                            className="w-full h-20 object-cover rounded-md border border-navy-200 transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-navy-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs font-semibold text-center">
                              Drag to Outfit
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Outfit Preview - Right Side */}
          <div className="lg:col-span-1">
            <Card className="bg-white/80 backdrop-blur-sm border-navy-200 sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-navy-800">Outfit Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div 
                  ref={outfitPreviewRef}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 min-h-[400px] relative"
                >
                  {/* Accessory - Top Right */}
                  <div 
                    className="absolute top-4 right-4 w-16 h-16 border-2 border-dashed border-navy-300 rounded-lg flex items-center justify-center"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'accessory')}
                  >
                    {outfitItems.accessory ? (
                      <div className="relative group">
                        <img 
                          src={outfitItems.accessory.imageUrl} 
                          alt="Accessory"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          onClick={() => removeFromOutfit('accessory')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-navy-500 text-center">Accessory</span>
                    )}
                  </div>

                  {/* Top - Center */}
                  <div 
                    className="absolute top-8 left-1/2 -translate-x-1/2 w-24 h-32 border-2 border-dashed border-navy-300 rounded-lg flex items-center justify-center"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'top')}
                  >
                    {outfitItems.top ? (
                      <div className="relative group">
                        <img 
                          src={outfitItems.top.imageUrl} 
                          alt="Top"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          onClick={() => removeFromOutfit('top')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-navy-500 text-center">Top</span>
                    )}
                  </div>

                  {/* Bottom - Center Lower */}
                  <div 
                    className="absolute top-48 left-1/2 -translate-x-1/2 w-24 h-32 border-2 border-dashed border-navy-300 rounded-lg flex items-center justify-center"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'bottom')}
                  >
                    {outfitItems.bottom ? (
                      <div className="relative group">
                        <img 
                          src={outfitItems.bottom.imageUrl} 
                          alt="Bottom"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          onClick={() => removeFromOutfit('bottom')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-navy-500 text-center">Bottom</span>
                    )}
                  </div>

                  {/* Shoes - Bottom Left */}
                  <div 
                    className="absolute bottom-4 left-4 w-16 h-12 border-2 border-dashed border-navy-300 rounded-lg flex items-center justify-center"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'shoes')}
                  >
                    {outfitItems.shoes ? (
                      <div className="relative group">
                        <img 
                          src={outfitItems.shoes.imageUrl} 
                          alt="Shoes"
                          className="w-full h-full object-cover rounded-md"
                        />
                        <button
                          onClick={() => removeFromOutfit('shoes')}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-navy-500 text-center">Shoes</span>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={saveOutfit}
                  className="w-full mt-6 bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white font-semibold py-3"
                  disabled={Object.keys(outfitItems).length === 0 || !outfitName.trim()}
                >
                  Save Outfit
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StyleOutfit;
