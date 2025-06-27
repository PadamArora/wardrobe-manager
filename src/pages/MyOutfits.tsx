
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
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

const MyOutfits = () => {
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const outfits = JSON.parse(localStorage.getItem('saved_outfits') || '[]');
    setSavedOutfits(outfits);
  }, []);

  const deleteOutfit = (outfitId: string) => {
    const updatedOutfits = savedOutfits.filter(outfit => outfit.id !== outfitId);
    setSavedOutfits(updatedOutfits);
    localStorage.setItem('saved_outfits', JSON.stringify(updatedOutfits));
    
    toast({
      title: "Outfit deleted",
      description: "The outfit has been removed from your collection.",
    });
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
            <h1 className="text-2xl font-bold text-navy-800">My Saved Outfits</h1>
          </div>
          
          <div className="text-sm text-navy-600">
            {savedOutfits.length} outfits saved
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {savedOutfits.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-navy-200">
            <CardContent className="p-12 text-center">
              <Heart className="w-16 h-16 text-navy-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-navy-700 mb-2">No saved outfits yet</h3>
              <p className="text-navy-600 mb-6">Create and save your first outfit to see it here!</p>
              <Button 
                onClick={() => window.location.href = '/style-outfit'}
                className="bg-navy-600 hover:bg-navy-700 text-white"
              >
                Style an Outfit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedOutfits.map((outfit) => (
              <Card key={outfit.id} className="bg-white/80 backdrop-blur-sm border-navy-200 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-navy-800">{outfit.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteOutfit(outfit.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    {outfit.items.map((item, index) => (
                      <div key={item.id} className="flex items-center space-x-3">
                        <img 
                          src={item.imageUrl} 
                          alt={`${item.color} ${item.category}`}
                          className="w-16 h-16 object-cover rounded-lg border border-navy-200"
                        />
                        <div>
                          <p className="text-sm font-medium text-navy-800 capitalize">
                            {item.category}
                          </p>
                          <p className="text-xs text-navy-600 capitalize">
                            {item.color}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <p className="text-xs text-navy-600">
                    Created: {new Date(outfit.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOutfits;
