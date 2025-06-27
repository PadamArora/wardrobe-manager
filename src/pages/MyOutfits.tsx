
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Heart, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  originalImage: string;
}

interface Outfit {
  id: string;
  name: string;
  createdAt: string;
  items: ClothingItem[];
}

const MyOutfits = () => {
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      loadOutfits(session.user.id);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadOutfits(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadOutfits = async (userId: string) => {
    try {
      setLoading(true);
      
      // Get outfits with their items
      const { data: outfits, error: outfitsError } = await supabase
        .from('outfits')
        .select(`
          id,
          name,
          created_at,
          outfit_items (
            clothing_items (
              id,
              image_url,
              category,
              color,
              original_image
            )
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (outfitsError) {
        console.error('Error loading outfits:', outfitsError);
        toast({
          title: "Error loading outfits",
          description: "Failed to load your saved outfits.",
          variant: "destructive",
        });
        return;
      }

      const formattedOutfits = outfits.map(outfit => ({
        id: outfit.id,
        name: outfit.name,
        createdAt: outfit.created_at,
        items: outfit.outfit_items.map((item: any) => ({
          id: item.clothing_items.id,
          imageUrl: item.clothing_items.image_url,
          category: item.clothing_items.category,
          color: item.clothing_items.color,
          originalImage: item.clothing_items.original_image
        }))
      }));

      setSavedOutfits(formattedOutfits);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOutfit = async (outfitId: string) => {
    try {
      const { error } = await supabase
        .from('outfits')
        .delete()
        .eq('id', outfitId);

      if (error) {
        console.error('Error deleting outfit:', error);
        toast({
          title: "Delete failed",
          description: "Failed to delete the outfit.",
          variant: "destructive",
        });
        return;
      }

      setSavedOutfits(prev => prev.filter(outfit => outfit.id !== outfitId));
      toast({
        title: "Outfit deleted",
        description: "The outfit has been removed from your collection.",
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-12 h-12 text-navy-600 mx-auto mb-4 animate-pulse" />
          <p className="text-navy-600">Loading your outfits...</p>
        </div>
      </div>
    );
  }

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
                onClick={() => window.location.href = '/wardrobe'}
                className="bg-navy-600 hover:bg-navy-700 text-white"
              >
                Go to Wardrobe
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
