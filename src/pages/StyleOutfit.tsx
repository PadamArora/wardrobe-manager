
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  originalImage: string;
}

const categories = ["top", "bottom", "shoes", "accessory"];
const colors = ["black", "white", "gray", "red", "blue", "green", "yellow", "purple", "brown", "orange"];

const StyleOutfit = () => {
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<ClothingItem[]>([]);
  const [outfitName, setOutfitName] = useState<string>("");
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const storedWardrobe = localStorage.getItem('wardrobe');
    if (storedWardrobe) {
      setWardrobe(JSON.parse(storedWardrobe));
    }
  }, []);

  const addItemToOutfit = (item: ClothingItem) => {
    setSelectedItems(prevItems => {
      // Check if an item from the same category already exists in the outfit
      const categoryExists = prevItems.some(existingItem => existingItem.category === item.category);
  
      if (categoryExists) {
        // Replace the existing item with the new item
        return prevItems.map(existingItem =>
          existingItem.category === item.category ? item : existingItem
        );
      } else {
        // Add the new item to the outfit
        return [...prevItems, item];
      }
    });
  };

  const removeItemFromOutfit = (itemId: string, category: string) => {
    setSelectedItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const saveOutfit = () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No items selected",
        description: "Please select items to create an outfit.",
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
  
    const outfitId = Math.random().toString(36).substring(2, 15);
    const newOutfit = {
      id: outfitId,
      name: outfitName,
      items: selectedItems,
      createdAt: new Date().toISOString(),
    };
  
    // Retrieve existing outfits from local storage
    const storedOutfits = localStorage.getItem('saved_outfits');
    const savedOutfits = storedOutfits ? JSON.parse(storedOutfits) : [];
  
    // Add the new outfit to the existing outfits
    const updatedOutfits = [...savedOutfits, newOutfit];
  
    // Save the updated outfits back to local storage
    localStorage.setItem('saved_outfits', JSON.stringify(updatedOutfits));
  
    toast({
      title: "Outfit saved",
      description: "Your outfit has been saved successfully.",
    });
  };

  const currentCategory = categories[currentCategoryIndex];
  const filteredWardrobe = wardrobe.filter(item => item.category === currentCategory);

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
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Wardrobe Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-navy-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xl font-bold text-navy-800 capitalize">{currentCategory}</CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => setCurrentCategoryIndex(prev => (prev - 1 + categories.length) % categories.length)}
                  variant="outline"
                  size="icon"
                  className="border-navy-300 hover:bg-navy-50 text-navy-600"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button 
                  onClick={() => setCurrentCategoryIndex(prev => (prev + 1) % categories.length)}
                  variant="outline"
                  size="icon"
                  className="border-navy-300 hover:bg-navy-50 text-navy-600"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredWardrobe.map(item => (
                  <div 
                    key={item.id}
                    className="relative group cursor-pointer"
                    onClick={() => addItemToOutfit(item)}
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={`${item.color} ${item.category}`}
                      className="w-full h-32 object-cover rounded-md border border-navy-200"
                    />
                    <div className="absolute inset-0 bg-navy-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-sm font-semibold">
                        Add to Outfit
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Outfit Preview Section */}
          <Card className="bg-white/80 backdrop-blur-sm border-navy-200">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl font-bold text-navy-800">Outfit Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {selectedItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between space-x-4">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.imageUrl} 
                        alt={`${item.color} ${item.category}`}
                        className="w-20 h-20 object-cover rounded-md border border-navy-200"
                      />
                      <div>
                        <p className="text-lg font-semibold text-navy-800 capitalize">{item.category}</p>
                        <p className="text-navy-600 capitalize">{item.color}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItemFromOutfit(item.id, item.category)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {selectedItems.length === 0 && (
                  <div className="text-center text-navy-600">
                    No items selected. Add items from the wardrobe to create your outfit.
                  </div>
                )}
              </div>
              <Button 
                onClick={saveOutfit}
                className="w-full mt-6 bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white font-semibold py-3"
                disabled={selectedItems.length === 0}
              >
                Save Outfit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StyleOutfit;
