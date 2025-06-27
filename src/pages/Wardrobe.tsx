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

  const categories = ["at", "shortsleeve", "longsleeve", "outerwear", "pants", "shorts", "shoes"];
  const colors = ["black", "white", "red", "blue", "green", "yellow", "purple", "pink", "orange", "brown", "gray", "beige"];

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

  const deleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    saveItems(updatedItems);
    toast({
      title: "Item deleted",
      description: "Item has been removed from your wardrobe.",
    });
  };

  const handleItemClick = (item: ClothingItem) => {
    setSelectedItem(item);
    setPairWithCategory("");
    setCurrentOutfitIndex(0);
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
            <Card className="bg-white/80 backdrop-blur-sm border-navy-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-navy-600" />
                    <span className="font-semibold text-navy-700">Filters:</span>
                  </div>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-40">
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
                  
                  <Select value={filterColor} onValueChange={setFilterColor}>
                    <SelectTrigger className="w-32">
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
              </CardContent>
            </Card>

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
                {categories.map(category => (
                  groupedItems[category].length > 0 && (
                    <Card key={category} className="bg-white/80 backdrop-blur-sm border-navy-200">
                      <CardContent className="p-4">
                        <h3 className="text-lg font-bold text-navy-800 mb-4 capitalize">
                          {category} ({groupedItems[category].length})
                        </h3>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                          {groupedItems[category].map(item => (
                            <div key={item.id} className="group relative">
                              <Card 
                                className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 transform cursor-pointer"
                                onClick={() => handleItemClick(item)}
                              >
                                <CardContent className="p-0">
                                  <div className="relative">
                                    <img 
                                      src={item.imageUrl} 
                                      alt={`${item.color} ${item.category}`}
                                      className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-300"
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
                                  <div className="p-2">
                                    <div className="flex items-center justify-between mb-1">
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
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                ))}
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
                              src={['shortsleeve', 'longsleeve', 'outerwear', 'hat'].includes(selectedItem.category) 
                                ? selectedItem.imageUrl 
                                : pairableItems[currentOutfitIndex]?.imageUrl
                              } 
                              alt="Top item"
                              className="w-40 h-32 object-cover rounded-lg mb-2 mx-auto shadow-md"
                            />
                            <p className="text-sm text-navy-600 capitalize">
                              {['shortsleeve', 'longsleeve', 'outerwear', 'hat'].includes(selectedItem.category) 
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
                          
                          <Button 
                            className="w-full bg-navy-600 hover:bg-navy-700 mt-4"
                            onClick={() => {
                              toast({
                                title: "Outfit saved!",
                                description: "This outfit combination has been saved to your collection.",
                              });
                            }}
                          >
                            Save This Outfit
                          </Button>
                        </div>
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
              <Card className="bg-white/80 backdrop-blur-sm border-navy-200 sticky top-6">
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
