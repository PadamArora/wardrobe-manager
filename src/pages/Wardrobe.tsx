
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Filter, Shirt, Edit2, Check, X, Trash2, ChevronRight, ChevronLeft, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  originalImage: string;
  user_id: string;
}

const Wardrobe = () => {
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterColor, setFilterColor] = useState<string>("all");
  const [isUploading, setIsUploading] = useState(false);
  const [pendingItem, setPendingItem] = useState<{
    imageUrl: string;
    originalImage: string;
    category?: string;
  } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [pairWithCategory, setPairWithCategory] = useState<string>("");
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [outfitName, setOutfitName] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = ["hat", "shortsleeve", "longsleeve", "outerwear", "pants", "shorts", "shoes"];
  const colors = ["black", "white", "red", "blue", "green", "yellow", "purple", "pink", "orange", "brown", "gray", "beige"];

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUser(session.user);
      loadItems(session.user.id);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
        loadItems(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadItems = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading items:', error);
        toast({
          title: "Error loading items",
          description: "Failed to load your wardrobe items.",
          variant: "destructive",
        });
        return;
      }

      const formattedItems = data.map(item => ({
        id: item.id,
        imageUrl: item.image_url,
        category: item.category,
        color: item.color,
        originalImage: item.original_image,
        user_id: item.user_id
      }));

      setItems(formattedItems);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      toast({
        title: "Processing image...",
        description: "Sending to backend for background removal and category prediction",
      });

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("http://localhost:8000/process-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Backend error");

      const result = await response.json();
      console.log("result", result);

      const processedImageUrl = `http://localhost:8000${result.image_path}`;

      setPendingItem({
        imageUrl: processedImageUrl,
        originalImage: URL.createObjectURL(file),
        category: result.category || "shortsleeve",
      });

      toast({
        title: "Image processed!",
        description: "Please select the color and confirm the category.",
      });
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Processing failed",
        description: "There was an error processing your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveItem = async () => {
    if (!pendingItem || !selectedColor || !user) {
      toast({
        title: "Missing information",
        description: "Please select a color for the item.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('clothing_items')
        .insert({
          user_id: user.id,
          image_url: pendingItem.imageUrl,
          original_image: pendingItem.originalImage,
          category: pendingItem.category || 'shortsleeve',
          color: selectedColor
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving item:', error);
        toast({
          title: "Save failed",
          description: "Failed to save the item to your wardrobe.",
          variant: "destructive",
        });
        return;
      }

      const newItem: ClothingItem = {
        id: data.id,
        imageUrl: data.image_url,
        originalImage: data.original_image,
        category: data.category,
        color: data.color,
        user_id: data.user_id
      };

      setItems(prev => [newItem, ...prev]);
      setPendingItem(null);
      setSelectedColor("");

      toast({
        title: "Item added!",
        description: "Your clothing item has been added to your wardrobe.",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Save failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleCategoryEdit = (itemId: string, category: string) => {
    setEditingCategory(itemId);
    setNewCategory(category);
  };

  const saveCategoryEdit = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('clothing_items')
        .update({ category: newCategory })
        .eq('id', itemId);

      if (error) {
        console.error('Error updating category:', error);
        toast({
          title: "Update failed",
          description: "Failed to update the category.",
          variant: "destructive",
        });
        return;
      }

      setItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, category: newCategory } : item
      ));
      setEditingCategory(null);
      setNewCategory("");
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setNewCategory("");
  };

  const deleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('clothing_items')
        .delete()
        .eq('id', itemId);

      if (error) {
        console.error('Error deleting item:', error);
        toast({
          title: "Delete failed",
          description: "Failed to delete the item.",
          variant: "destructive",
        });
        return;
      }

      setItems(prev => prev.filter(item => item.id !== itemId));
      toast({
        title: "Item deleted",
        description: "Item has been removed from your wardrobe.",
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleItemClick = (item: ClothingItem) => {
    setSelectedItem(item);
    setPairWithCategory("");
    setCurrentOutfitIndex(0);
    setOutfitName("");
  };

  const getPairableCategories = (currentCategory: string) => {
    return categories.filter(cat => cat !== currentCategory);
  };

  const getPairableItems = (category: string) => {
    return items.filter(item => item.category === category);
  };

  const closeItemView = () => {
    setSelectedItem(null);
    setPairWithCategory("");
    setCurrentOutfitIndex(0);
    setOutfitName("");
  };

  const saveOutfit = async () => {
    if (!selectedItem || !pairWithCategory || !outfitName.trim() || !user) {
      toast({
        title: "Missing information",
        description: "Please provide an outfit name and select items to pair.",
        variant: "destructive",
      });
      return;
    }

    const pairableItems = getPairableItems(pairWithCategory);
    if (pairableItems.length === 0) return;

    const pairedItem = pairableItems[currentOutfitIndex];

    try {
      // Create the outfit
      const { data: outfit, error: outfitError } = await supabase
        .from('outfits')
        .insert({
          user_id: user.id,
          name: outfitName.trim()
        })
        .select()
        .single();

      if (outfitError) {
        console.error('Error creating outfit:', outfitError);
        toast({
          title: "Save failed",
          description: "Failed to save the outfit.",
          variant: "destructive",
        });
        return;
      }

      // Add items to the outfit
      const { error: itemsError } = await supabase
        .from('outfit_items')
        .insert([
          { outfit_id: outfit.id, clothing_item_id: selectedItem.id },
          { outfit_id: outfit.id, clothing_item_id: pairedItem.id }
        ]);

      if (itemsError) {
        console.error('Error adding items to outfit:', itemsError);
        toast({
          title: "Save failed",
          description: "Failed to save the outfit items.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Outfit saved!",
        description: `"${outfitName}" has been saved to your collection.`,
      });

      setOutfitName("");
      closeItemView();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Save failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter(item => {
    const categoryMatch = filterCategory === "all" || item.category === filterCategory;
    const colorMatch = filterColor === "all" || item.color === filterColor;
    return categoryMatch && colorMatch;
  });

  const pairableItems = pairWithCategory ? getPairableItems(pairWithCategory) : [];

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
            <div className="flex items-center space-x-2">
              <Shirt className="w-6 h-6 text-navy-600" />
              <h1 className="text-2xl font-bold text-navy-800">My Wardrobe</h1>
            </div>
          </div>
          
          <div className="text-sm text-navy-600">
            {items.length} items total
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Left Sidebar - Upload Section */}
          <div className="w-80 flex-shrink-0">
            <Card className="bg-white/80 backdrop-blur-sm border-navy-200 sticky top-6">
              <CardContent className="p-6">
                <Label htmlFor="image-upload" className="text-lg font-semibold text-navy-700 mb-4 block">
                  Add New Item
                </Label>
                <div className="border-2 border-dashed border-navy-300 rounded-lg p-6 text-center hover:border-navy-400 transition-colors mb-6">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-navy-600 mx-auto mb-3" />
                    <p className="text-sm text-navy-600">
                      {isUploading ? "Processing..." : "Upload Image"}
                    </p>
                  </Label>
                </div>

                {pendingItem && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-navy-700">Confirm Details:</h3>
                    <img 
                      src={pendingItem.imageUrl} 
                      alt="Processed item" 
                      className="w-full h-40 object-contain rounded-lg border"
                    />
                    
                    <div className="space-y-3">
                      <div>
                        <Label className="text-navy-700 text-sm">Category:</Label>
                        <Select value={pendingItem.category} onValueChange={(value) => setPendingItem({...pendingItem, category: value})}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(category => (
                              <SelectItem key={category} value={category}>
                                <span className="capitalize">{category}</span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-navy-700 text-sm">Color:</Label>
                        <Select value={selectedColor} onValueChange={setSelectedColor}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Choose color" />
                          </SelectTrigger>
                          <SelectContent>
                            {colors.map(color => (
                              <SelectItem key={color} value={color}>
                                <div className="flex items-center space-x-2">
                                  <div 
                                    className={`w-3 h-3 rounded-full border`}
                                    style={{ backgroundColor: color === 'white' ? '#ffffff' : color }}
                                  />
                                  <span className="capitalize">{color}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <Button onClick={handleSaveItem} className="w-full bg-navy-600 hover:bg-navy-700 text-sm py-2">
                        Add to Wardrobe
                      </Button>
                    </div>
                  </div>
                )}

                {/* Filters */}
                <div className="mt-8 space-y-4">
                  <h3 className="font-semibold text-navy-700">Filters</h3>
                  
                  <div>
                    <Label className="text-navy-700 text-sm">Category:</Label>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            <span className="capitalize">{category}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label className="text-navy-700 text-sm">Color:</Label>
                    <Select value={filterColor} onValueChange={setFilterColor}>
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Colors</SelectItem>
                        {colors.map(color => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center space-x-2">
                              <div 
                                className={`w-3 h-3 rounded-full border`}
                                style={{ backgroundColor: color === 'white' ? '#ffffff' : color }}
                              />
                              <span className="capitalize">{color}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Items Grid */}
          <div className="flex-1">
            {filteredItems.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-navy-200">
                <CardContent className="p-12 text-center">
                  <Shirt className="w-16 h-16 text-navy-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-navy-700 mb-2">No items found</h3>
                  <p className="text-navy-600">Upload your first clothing item to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-5 gap-4">
                {filteredItems.map(item => (
                  <Card 
                    key={item.id}
                    className="group overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 transform cursor-pointer bg-white/80 backdrop-blur-sm border-navy-200"
                    onClick={() => handleItemClick(item)}
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        <img 
                          src={item.imageUrl} 
                          alt={`${item.color} ${item.category}`}
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteItem(item.id);
                            }}
                            className="p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-50 bg-white/80"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1">
                            <div 
                              className="w-2 h-2 rounded-full border"
                              style={{ backgroundColor: item.color === 'white' ? '#ffffff' : item.color }}
                            />
                            <span className="text-xs text-navy-600 capitalize truncate">{item.color}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryEdit(item.id, item.category);
                            }}
                            className="p-0.5 h-auto text-navy-600 hover:text-navy-800"
                          >
                            <Edit2 className="w-2 h-2" />
                          </Button>
                        </div>
                        
                        {editingCategory === item.id ? (
                          <div className="space-y-1">
                            <Select value={newCategory} onValueChange={setNewCategory}>
                              <SelectTrigger className="h-6 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map(cat => (
                                  <SelectItem key={cat} value={cat}>
                                    <span className="capitalize">{cat}</span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  saveCategoryEdit(item.id);
                                }}
                                className="p-0.5 h-auto text-green-500 hover:text-green-600"
                              >
                                <Check className="w-2 h-2" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  cancelCategoryEdit();
                                }}
                                className="p-0.5 h-auto text-red-500 hover:text-red-600"
                              >
                                <X className="w-2 h-2" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-navy-600 capitalize truncate">{item.category}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Item Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-navy-800">Item Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeItemView}
                className="text-navy-600 hover:text-navy-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left: Item Details */}
              <div className="space-y-4">
                <img 
                  src={selectedItem.imageUrl} 
                  alt={`${selectedItem.color} ${selectedItem.category}`}
                  className="w-full h-80 object-cover rounded-lg shadow-lg"
                />
                <div className="space-y-3">
                  <p className="text-xl font-semibold text-navy-700 capitalize">{selectedItem.category}</p>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: selectedItem.color === 'white' ? '#ffffff' : selectedItem.color }}
                    />
                    <span className="text-navy-600 capitalize">{selectedItem.color}</span>
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-navy-700 font-semibold">Pair it with:</Label>
                    <Select value={pairWithCategory} onValueChange={setPairWithCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose category to pair with" />
                      </SelectTrigger>
                      <SelectContent>
                        {getPairableCategories(selectedItem.category).map(category => (
                          <SelectItem key={category} value={category}>
                            <span className="capitalize">{category}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Right: Outfit Combinations */}
              {pairWithCategory && pairableItems.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-navy-800">Outfit Combinations</h3>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentOutfitIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentOutfitIndex === 0}
                        className="border-navy-300 hover:bg-navy-50"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="text-sm text-navy-600">
                        {currentOutfitIndex + 1} / {pairableItems.length}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentOutfitIndex(prev => Math.min(pairableItems.length - 1, prev + 1))}
                        disabled={currentOutfitIndex === pairableItems.length - 1}
                        className="border-navy-300 hover:bg-navy-50"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {/* Top Item */}
                    <div className="text-center">
                      <img 
                        src={['hat', 'shortsleeve', 'longsleeve', 'outerwear'].includes(selectedItem.category) 
                          ? selectedItem.imageUrl 
                          : pairableItems[currentOutfitIndex]?.imageUrl
                        } 
                        alt="Top item"
                        className="w-40 h-32 object-cover rounded-lg mb-2 mx-auto shadow-md"
                      />
                      <p className="text-sm text-navy-600 capitalize">
                        {['hat', 'shortsleeve', 'longsleeve', 'outerwear'].includes(selectedItem.category) 
                          ? selectedItem.category 
                          : pairableItems[currentOutfitIndex]?.category
                        }
                      </p>
                    </div>
                    
                    {/* Bottom Item */}
                    <div className="text-center">
                      <img 
                        src={['pants', 'shorts', 'shoes'].includes(selectedItem.category) 
                          ? selectedItem.imageUrl 
                          : pairableItems[currentOutfitIndex]?.imageUrl
                        } 
                        alt="Bottom item"
                        className="w-40 h-32 object-cover rounded-lg mb-2 mx-auto shadow-md"
                      />
                      <p className="text-sm text-navy-600 capitalize">
                        {['pants', 'shorts', 'shoes'].includes(selectedItem.category) 
                          ? selectedItem.category 
                          : pairableItems[currentOutfitIndex]?.category
                        }  
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <Input
                        placeholder="Enter outfit name"
                        value={outfitName}
                        onChange={(e) => setOutfitName(e.target.value)}
                        className="w-full"
                      />
                      <Button 
                        onClick={saveOutfit}
                        className="w-full bg-navy-600 hover:bg-navy-700"
                        disabled={!outfitName.trim()}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save This Outfit
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wardrobe;
