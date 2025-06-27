import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Filter, Shirt, Edit2, Check, X, Trash2, ChevronRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  originalImage: string;
}

const Wardrobe = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [showColorFilters, setShowColorFilters] = useState(false);
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
  const { toast } = useToast();

  const categories = ["hat", "shortsleeve", "longsleeve", "outerwear", "pants", "shorts", "shoes"];
  const colors = ["black", "white", "red", "blue", "green", "yellow", "purple", "pink", "orange", "brown", "gray", "beige"];
  
  const toStatic = (url: string) => url.replace("http://localhost:8000", "");

  useEffect(() => {
    const savedItems = localStorage.getItem('wardrobe_items');
    if (savedItems) {
      const parsedItems = JSON.parse(savedItems);
      setItems(parsedItems);
    }
  }, []);

  const saveItems = (newItems: ClothingItem[]) => {
    localStorage.setItem('wardrobe_items', JSON.stringify(newItems));
    setItems(newItems);
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
      console.log("result", result); // log this to verify

      const processedImageUrl = `http://localhost:8000${result.image_path}`;

      setPendingItem({
        imageUrl: processedImageUrl,
        originalImage: URL.createObjectURL(file),
        category: result.category?.toLowerCase() ?? "shortsleeve",
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

  const handleSaveOutfit = async () => {
    // Where is the “top” vs “bottom” coming from?
    // → Whichever side the *selected* item belongs to.
    if (!selectedItem || pairableItems.length === 0) return;
  
    const outfitName = prompt("Enter a name for this outfit:");
    if (!outfitName) return;
  
    // Decide which image is the top and which the bottom
    const topCategories = ["shortsleeve", "longsleeve", "outerwear", "hat"];
    const isSelectedTop = topCategories.includes(selectedItem.category);
  
    const topImagePath = isSelectedTop
      ? selectedItem.imageUrl
      : pairableItems[currentOutfitIndex].imageUrl;
  
    const bottomImagePath = isSelectedTop
      ? pairableItems[currentOutfitIndex].imageUrl
      : selectedItem.imageUrl;
  
    try {
      setIsSaving(true);
  
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? "http://localhost:8000"}/save-outfit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            outfit_name: outfitName.trim(),
            top_image_path: toStatic(topImagePath),
            bottom_image_path: toStatic(bottomImagePath),
          }),
        }
      );
  
      if (!res.ok) {
        const { error } = await res.json();
        throw new Error(error || "Server error");
      }
  
      toast({
        title: "Outfit saved!",
        description: `“${outfitName}” added to Saved Outfits.`,
      });
    } catch (err: any) {
      toast({
        title: "Could not save outfit",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveItem = () => {
    if (!pendingItem || !selectedColor) {
      toast({
        title: "Missing information",
        description: "Please select a color for the item.",
        variant: "destructive",
      });
      return;
    }

    const newItem: ClothingItem = {
      id: Date.now().toString(),
      imageUrl: pendingItem.imageUrl,
      originalImage: pendingItem.originalImage,
      category: pendingItem.category || 'shortsleeve',
      color: selectedColor
    };

    const updatedItems = [...items, newItem];
    saveItems(updatedItems);

    setPendingItem(null);
    setSelectedColor("");

    toast({
      title: "Item added!",
      description: "Your clothing item has been added to your wardrobe.",
    });
  };

  const handleCategoryEdit = (itemId: string, category: string) => {
    setEditingCategory(itemId);
    setNewCategory(category);
  };

  const saveCategoryEdit = (itemId: string) => {
    const updatedItems = items.map(item => 
      item.id === itemId ? { ...item, category: newCategory } : item
    );
    saveItems(updatedItems);
    setEditingCategory(null);
    setNewCategory("");
  };

  const cancelCategoryEdit = () => {
    setEditingCategory(null);
    setNewCategory("");
  };

  const deleteItem = async (itemId: string) => {
    const itemToDelete = items.find(item => item.id === itemId);
    if (!itemToDelete) return;
  
    try {
      // 1. Request backend to delete the file
      const response = await fetch("http://localhost:8000/delete-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_path: itemToDelete.imageUrl.replace("http://localhost:8000", "") })
      });
  
      if (!response.ok) {
        throw new Error("Failed to delete image from backend");
      }
  
      // 2. Remove from frontend state/localStorage
      const updatedItems = items.filter(item => item.id !== itemId);
      saveItems(updatedItems);
  
      toast({
        title: "Item deleted",
        description: "Item has been removed from your wardrobe.",
      });
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: "Delete failed",
        description: "Could not delete item from server.",
        variant: "destructive",
      });
    }
  };
  

  const handleItemClick = (item: ClothingItem) => {
    setSelectedItem(item);
    setPairWithCategory("");
    setCurrentOutfitIndex(0);
  };

  const getPairableCategories = (currentCategory: string) => {
    if (["shortsleeve", "longsleeve"].includes(currentCategory)) {
      return ["pants", "outerwear"];
    } else if (currentCategory === "pants") {
      return ["shortsleeve", "longsleeve", "outerwear"];
    }
    return categories.filter(cat => cat !== currentCategory);
  };  

  const getPairableItems = (category: string) => {
    return items.filter(item => item.category === category);
  };

  const closeItemView = () => {
    setSelectedItem(null);
    setPairWithCategory("");
    setCurrentOutfitIndex(0);
  };

  const filteredItems = items.filter(item => {
    const categoryMatch = filterCategory === "all" || item.category === filterCategory;
    const colorMatch = filterColor === "all" || item.color === filterColor;
    return categoryMatch && colorMatch;
  });

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = filteredItems.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, ClothingItem[]>);

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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6 relative">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              {["all", ...categories].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                    filterCategory === cat
                      ? "bg-navy-600 text-white border-navy-600"
                      : "bg-white text-navy-600 border-navy-300 hover:bg-navy-50"
                  }`}
                >
                  {cat === "all" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}

              {/* Color Filter Toggle Button */}
              <div className="relative">
                <button
                  onClick={() => setShowColorFilters(!showColorFilters)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                    filterColor !== "all"
                      ? "bg-navy-600 text-white border-navy-600"
                      : "bg-white text-navy-600 border-navy-300 hover:bg-navy-50"
                  }`}
                >
                  Color
                </button>

                {/* Color Filter Pills */}
                {showColorFilters && (
                  <div className="absolute left-0 mt-2 z-10 bg-white p-3 rounded-lg shadow-lg border w-[280px] flex flex-wrap gap-2">
                    {["all", ...colors].map(color => (
                      <button
                        key={color}
                        onClick={() => {
                          setFilterColor(color);
                          setShowColorFilters(false);
                        }}
                        className={`px-3 py-1 rounded-full text-sm capitalize border ${
                          filterColor === color
                            ? "bg-navy-600 text-white border-navy-600"
                            : "bg-white text-navy-600 border-navy-300 hover:bg-navy-50"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>


            {/* Items Grid */}
            {filteredItems.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-navy-200">
                <CardContent className="p-12 text-center">
                  <Shirt className="w-16 h-16 text-navy-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-navy-700 mb-2">No items found</h3>
                  <p className="text-navy-600">Upload your first clothing item to get started!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredItems.length === 0 ? (
                  <Card className="bg-white/80 backdrop-blur-sm border-navy-200">
                    <CardContent className="p-12 text-center">
                      <Shirt className="w-16 h-16 text-navy-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-navy-700 mb-2">No items found</h3>
                      <p className="text-navy-600">Try uploading or changing the filter.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-5 gap-6">
                    {filteredItems.map((item, index) => (
                      <Card
                        key={item.id}
                        className="hover:shadow-lg transition duration-300 cursor-pointer overflow-hidden"
                        onClick={() => handleItemClick(item)}
                      >
                        <CardContent className="p-0">
                        <img
                          src={item.imageUrl}
                          alt={`${item.color} ${item.category}`}
                          className="w-full h-56 object-contain"
                        />

                          <div className="p-2">
                          <p className="text-sm font-semibold text-navy-800 capitalize">{item.category}</p>
                          <p className="text-xs text-navy-600 capitalize">{item.color}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

              </div>
            )}

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
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        deleteItem(selectedItem.id);
                        closeItemView();
                      }}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete Item
                    </Button>

                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Item Details */}
                    <div className="space-y-4">
                      <img 
                        src={selectedItem.imageUrl} 
                        alt={`${selectedItem.color} ${selectedItem.category}`}
                        className="w-full h-80 object-contain rounded-lg shadow-lg bg-white"
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
                      <div className="space-y-3">
                        {/* title – nudged up a bit */}
                        <h3 className="-mt-2 text-xl font-bold text-navy-800">
                          Outfit Combinations
                        </h3>

                        {/* arrow + preview + arrow in one row */}
                        <div className="flex items-center justify-center space-x-2">
                          {/* ← prev */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setCurrentOutfitIndex((prev) => Math.max(0, prev - 1))
                            }
                            disabled={currentOutfitIndex === 0}
                          >
                            <ChevronLeft className="w-5 h-5 text-indigo-600" />
                          </Button>

                          {/* outfit card */}
                          <div className="flex flex-col items-center bg-white rounded-lg shadow-md w-60 py-1 px-1">
                            {/* top garment */}
                            <img
                              src={
                                ["shortsleeve", "longsleeve", "outerwear"].includes(
                                  selectedItem.category
                                )
                                  ? selectedItem.imageUrl
                                  : pairableItems[currentOutfitIndex]?.imageUrl
                              }
                              alt="Top"
                              className="w-full h-56 object-contain"
                            />
                            {/* bottom garment */}
                            <img
                              src={
                                ["pants"].includes(selectedItem.category)
                                  ? selectedItem.imageUrl
                                  : pairableItems[currentOutfitIndex]?.imageUrl
                              }
                              alt="Bottom"
                              className="w-full h-64 object-contain -mt-5"
                            />
                          </div>

                          {/* → next */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setCurrentOutfitIndex((prev) =>
                                Math.min(pairableItems.length - 1, prev + 1)
                              )
                            }
                            disabled={currentOutfitIndex === pairableItems.length - 1}
                          >
                            <ChevronRight className="w-5 h-5 text-indigo-600" />
                          </Button>
                        </div>

                        {/* save button – slightly closer to card */}
                        <Button
                          variant="secondary"
                          size="default"
                          onClick={handleSaveOutfit}
                          disabled={isSaving}
                          className="ml-36 text-base"
                        >
                          {isSaving ? "Saving…" : "Save Outfit"}
                        </Button>
                      </div>
                    )}

                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload Section - Right Sidebar */}
          {!selectedItem && (
            <div className="lg:col-span-1">
              <Card className="bg-white/80 backdrop-blur-sm border-navy-200 sticky top-6 w-[360px] max-w-full ml-auto">
                <CardContent className="p-4">
                  <Label htmlFor="image-upload" className="text-lg font-semibold text-navy-700 mb-3 block">
                    Add Item
                  </Label>
                  <div className="border-2 border-dashed border-navy-300 rounded-lg p-4 text-center hover:border-navy-400 transition-colors mb-4">
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    <Label htmlFor="image-upload" className="cursor-pointer">
                      <Upload className="w-6 h-6 text-navy-600 mx-auto mb-2" />
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
                        className="w-full h-[300px] object-contain rounded-lg border"
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
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Wardrobe;
