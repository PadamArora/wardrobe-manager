
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ArrowRight, ArrowUp, Heart, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  originalImage: string;
}

interface Outfit {
  id: string;
  items: ClothingItem[];
  name: string;
  createdAt: string;
}

const categories = ["hat", "shortsleeve", "longsleeve", "outerwear", "pants", "shorts", "shoes"];

const StyleOutfit = () => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [pairWith, setPairWith] = useState<string>("");
  const [outfits, setOutfits] = useState<ClothingItem[][]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [showWardrobeSelection, setShowWardrobeSelection] = useState(true);
  const [showPairSelection, setShowPairSelection] = useState(false);
  const [showOutfits, setShowOutfits] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedItems = localStorage.getItem('wardrobe_items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []);

  const handleItemSelect = (item: ClothingItem) => {
    setSelectedItem(item);
    setShowWardrobeSelection(false);
    setShowPairSelection(true);
  };

  const handlePairWithSelect = (category: string) => {
    setPairWith(category);
    generateOutfits(selectedItem!, category);
  };

  const generateOutfits = (baseItem: ClothingItem, pairCategory: string) => {
    const pairItems = items.filter(item => item.category === pairCategory);
    const generatedOutfits = pairItems.map(pairItem => [baseItem, pairItem]);
    setOutfits(generatedOutfits);
    setShowPairSelection(false);
    setShowOutfits(true);
  };

  const nextOutfit = () => {
    setCurrentOutfitIndex((prev) => (prev + 1) % outfits.length);
  };

  const prevOutfit = () => {
    setCurrentOutfitIndex((prev) => (prev - 1 + outfits.length) % outfits.length);
  };

  const saveOutfit = () => {
    if (outfits.length === 0) return;

    const currentOutfit = outfits[currentOutfitIndex];
    const savedOutfits = JSON.parse(localStorage.getItem('saved_outfits') || '[]');
    
    const newOutfit: Outfit = {
      id: Date.now().toString(),
      items: currentOutfit,
      name: `Outfit ${savedOutfits.length + 1}`,
      createdAt: new Date().toISOString()
    };

    savedOutfits.push(newOutfit);
    localStorage.setItem('saved_outfits', JSON.stringify(savedOutfits));

    toast({
      title: "Outfit saved!",
      description: "Your outfit has been saved to My Outfits.",
    });
  };

  const resetFlow = () => {
    setSelectedItem(null);
    setPairWith("");
    setOutfits([]);
    setCurrentOutfitIndex(0);
    setShowWardrobeSelection(true);
    setShowPairSelection(false);
    setShowOutfits(false);
  };

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = items.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, ClothingItem[]>);

  const availablePairCategories = categories.filter(cat => cat !== selectedItem?.category);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-rose-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              variant="ghost"
              size="sm"
              className="text-rose-500 hover:bg-rose-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-rose-600">Style an Outfit</h1>
          </div>
          
          {!showWardrobeSelection && (
            <Button
              onClick={resetFlow}
              variant="outline"
              size="sm"
              className="border-rose-200 text-rose-500 hover:bg-rose-50"
            >
              Start Over
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Step 1: Select Item from Wardrobe */}
        {showWardrobeSelection && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-rose-600 mb-2">Choose an item to style</h2>
              <p className="text-rose-400">Select any item from your wardrobe to start creating an outfit</p>
            </div>

            {items.length === 0 ? (
              <Card className="bg-white/60 backdrop-blur-sm border-rose-100">
                <CardContent className="p-12 text-center">
                  <p className="text-rose-500">No items in your wardrobe yet. Add some items first!</p>
                  <Button 
                    onClick={() => window.location.href = '/wardrobe'}
                    className="mt-4 bg-rose-400 hover:bg-rose-500"
                  >
                    Go to Wardrobe
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {categories.map(category => (
                  groupedItems[category].length > 0 && (
                    <Card key={category} className="bg-white/60 backdrop-blur-sm border-rose-100">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-rose-600 mb-4 capitalize">
                          {category} ({groupedItems[category].length})
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                          {groupedItems[category].map(item => (
                            <Card 
                              key={item.id} 
                              className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 transform cursor-pointer"
                              onClick={() => handleItemSelect(item)}
                            >
                              <CardContent className="p-0">
                                <img 
                                  src={item.imageUrl} 
                                  alt={`${item.color} ${item.category}`}
                                  className="w-full h-32 object-cover hover:scale-110 transition-transform duration-300"
                                />
                                <div className="p-3">
                                  <div className="flex items-center space-x-2">
                                    <div 
                                      className="w-3 h-3 rounded-full border"
                                      style={{ backgroundColor: item.color === 'white' ? '#ffffff' : item.color }}
                                    />
                                    <span className="text-xs text-rose-500 capitalize">{item.color}</span>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select What to Pair With */}
        {showPairSelection && selectedItem && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-rose-600 mb-2">What do you want to pair it with?</h2>
              <p className="text-rose-400">Choose a category to create outfit combinations</p>
            </div>

            <div className="flex justify-center mb-8">
              <Card className="bg-white/60 backdrop-blur-sm border-rose-100">
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold text-rose-600 mb-4">Selected Item:</h3>
                  <img 
                    src={selectedItem.imageUrl} 
                    alt={`${selectedItem.color} ${selectedItem.category}`}
                    className="w-32 h-32 object-cover rounded-lg mx-auto"
                  />
                  <p className="text-rose-500 capitalize mt-2 text-center">
                    {selectedItem.color} {selectedItem.category}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/60 backdrop-blur-sm border-rose-100 max-w-md mx-auto">
              <CardContent className="p-6">
                <Label htmlFor="pair-select" className="text-rose-600 font-semibold">Pair with:</Label>
                <Select value={pairWith} onValueChange={handlePairWithSelect}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Choose category to pair with" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePairCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        <span className="capitalize">{category}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Step 3: Show Generated Outfits */}
        {showOutfits && outfits.length > 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-rose-600 mb-2">Your Outfit Combinations</h2>
              <p className="text-rose-400">Scroll through your personalized outfits</p>
            </div>

            <div className="flex items-center justify-center space-x-8">
              <Button
                onClick={prevOutfit}
                variant="outline"
                size="lg"
                disabled={outfits.length <= 1}
                className="border-rose-200 text-rose-500 hover:bg-rose-50"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>

              {/* Outfit Display */}
              <Card className="bg-white/60 backdrop-blur-sm border-rose-100">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-rose-600">
                      Outfit {currentOutfitIndex + 1} of {outfits.length}
                    </h3>
                  </div>
                  
                  <div className="flex flex-col items-center space-y-4">
                    {outfits[currentOutfitIndex].map((item, index) => (
                      <div key={item.id} className="text-center">
                        <img 
                          src={item.imageUrl} 
                          alt={`${item.color} ${item.category}`}
                          className="w-32 h-32 object-cover rounded-lg shadow-md"
                        />
                        <p className="text-rose-500 capitalize mt-2 text-sm">
                          {item.color} {item.category}
                        </p>
                        {index === 0 && outfits[currentOutfitIndex].length > 1 && (
                          <ArrowUp className="w-4 h-4 text-rose-400 mx-auto mt-2" />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 text-center">
                    <Button
                      onClick={saveOutfit}
                      className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white"
                    >
                      <Heart className="w-4 h-4 mr-2" />
                      Save This Outfit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={nextOutfit}
                variant="outline"
                size="lg"
                disabled={outfits.length <= 1}
                className="border-rose-200 text-rose-500 hover:bg-rose-50"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {showOutfits && outfits.length === 0 && (
          <Card className="bg-white/60 backdrop-blur-sm border-rose-100">
            <CardContent className="p-12 text-center">
              <p className="text-rose-500">No items found to pair with. Try adding more items to your wardrobe!</p>
              <Button 
                onClick={() => window.location.href = '/wardrobe'}
                className="mt-4 bg-rose-400 hover:bg-rose-500"
              >
                Go to Wardrobe
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StyleOutfit;
