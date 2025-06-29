import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Outfit {
  name: string;
  top_image: string;
  bottom_image: string;
}

const MyOutfits = () => {
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const { toast } = useToast();

  // ✅ Load saved outfits from backend folder
  useEffect(() => {
    const fetchOutfits = async () => {
      const res = await fetch("http://localhost:8000/get-saved-outfits");
      const data = await res.json();
      console.log("Fetched outfits:", data); // ✅ Confirm this shows your JSON
      setSavedOutfits(data.outfits || []);   // ✅ Never undefined
    };
    fetchOutfits();
  }, []);
  

  // ✅ Delete outfit: calls backend and updates state
  const deleteOutfit = async (outfitName: string) => {
    try {
      const res = await fetch("http://localhost:8000/delete-saved-outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outfit_name: outfitName }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete outfit folder on server.");
      }

      const updatedOutfits = savedOutfits.filter(outfit => outfit.name !== outfitName);
      setSavedOutfits(updatedOutfits);

      toast({
        title: "Outfit deleted",
        description: "The outfit has been removed from your saved outfits.",
      });
    } catch (error) {
      console.error("Error deleting outfit:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete outfit on server.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* ✅ Header */}
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

      {/* ✅ Content */}
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
              <Card key={outfit.name} className="bg-white/80 border shadow-sm hover:shadow-md transition relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteOutfit(outfit.name)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-4">{outfit.name}</h3>
                  <div className="space-y-4">
                    <img
                      src={`http://localhost:8000${outfit.top_image}`}
                      alt="Top"
                      className="w-full h-56 object-contain"
                    />
                    <img
                      src={`http://localhost:8000${outfit.bottom_image}`}
                      alt="Bottom"
                      className="w-full h-64 object-contain -mt-5"
                    />
                  </div>
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