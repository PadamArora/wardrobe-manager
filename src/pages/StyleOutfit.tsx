
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Download } from "lucide-react";
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

// Random placeholder images for demonstration
const placeholderImages = {
  top: [
    "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop",
  ],
  bottom: [
    "https://images.unsplash.com/photo-1582418702059-97ebafb35ba8?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=300&h=400&fit=crop",
  ],
  shoes: [
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1595950653106-6c9eac4d6b0c?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&h=300&fit=crop",
    "https://images.unsplash.com/photo-1551107696-a4b57a0f9ff8?w=300&h=300&fit=crop",
  ],
  accessory: [
    "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=200&h=200&fit=crop",
    "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=200&h=200&fit=crop",
  ]
};

const categories = ["top", "bottom", "shoes", "accessory"];

const StyleOutfit = () => {
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [outfitItems, setOutfitItems] = useState<OutfitItems>({});
  const [outfitName, setOutfitName] = useState<string>("");
  const [draggedItem, setDraggedItem] = useState<ClothingItem | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [categoryIndices, setCategoryIndices] = useState<{[key: string]: number}>({
    top: 0,
    bottom: 0,
    shoes: 0,
    accessory: 0
  });
  const { toast } = useToast();
  const outfitPreviewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkUser();
    generateRandomWardrobe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const generateRandomWardrobe = () => {
    const items: ClothingItem[] = [];
    categories.forEach(category => {
      placeholderImages[category as keyof typeof placeholderImages].forEach((url, index) => {
        items.push({
          id: `${category}-${index}`,
          imageUrl: url,
          category,
          color: "Various",
          originalImage: url
        });
      });
    });
    setWardrobe(items);
  };

  const navigateCategory = (category: string, direction: 'prev' | 'next') => {
    const categoryItems = placeholderImages[category as keyof typeof placeholderImages];
    const currentIndex = categoryIndices[category];
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % categoryItems.length;
    } else {
      newIndex = (currentIndex - 1 + categoryItems.length) % categoryItems.length;
    }
    
    setCategoryIndices(prev => ({
      ...prev,
      [category]: newIndex
    }));
  };

  const getCurrentItem = (category: string) => {
    const categoryItems = placeholderImages[category as keyof typeof placeholderImages];
    const index = categoryIndices[category];
    return {
      id: `${category}-${index}`,
      imageUrl: categoryItems[index],
      category,
      color: "Various",
      originalImage: categoryItems[index]
    };
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

    toast({
      title: "Outfit saved",
      description: "Your outfit has been saved successfully (demo mode).",
    });

    setOutfitName("");
    setOutfitItems({});
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Category Navigation - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {categories.map(category => {
              const currentItem = getCurrentItem(category);
              return (
                <Card key={category} className="bg-white/80 backdrop-blur-sm border-navy-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-navy-800 capitalize">
                      {category}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateCategory(category, 'prev')}
                        className="p-2"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      
                      <div 
                        className="relative group cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={() => handleDragStart(currentItem)}
                      >
                        <img 
                          src={currentItem.imageUrl} 
                          alt={`${currentItem.color} ${currentItem.category}`}
                          className="w-32 h-40 object-cover rounded-md border border-navy-200 transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-navy-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-xs font-semibold text-center">
                            Drag to Outfit
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigateCategory(category, 'next')}
                        className="p-2"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Outfit Preview - Right Side */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 backdrop-blur-sm border-navy-200 sticky top-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-navy-800">Outfit Preview</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div 
                  ref={outfitPreviewRef}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 min-h-[500px] relative"
                >
                  {/* Top - Left side, larger */}
                  <div 
                    className="absolute top-8 left-8 w-40 h-48 border-2 border-dashed border-navy-300 rounded-lg flex items-center justify-center"
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

                  {/* Accessory - Right of top, smaller, positioned higher */}
                  <div 
                    className="absolute top-4 right-8 w-20 h-20 border-2 border-dashed border-navy-300 rounded-lg flex items-center justify-center"
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

                  {/* Bottom - Center right, large */}
                  <div 
                    className="absolute top-32 right-8 w-36 h-44 border-2 border-dashed border-navy-300 rounded-lg flex items-center justify-center"
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

                  {/* Shoes - Bottom left */}
                  <div 
                    className="absolute bottom-8 left-8 w-24 h-16 border-2 border-dashed border-navy-300 rounded-lg flex items-center justify-center"
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
