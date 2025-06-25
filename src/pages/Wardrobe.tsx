
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Filter, Shirt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { removeBackground, loadImage } from "@/utils/aiUtils";

interface ClothingItem {
  id: string;
  imageUrl: string;
  category: string;
  color: string;
  originalImage: string;
}

const categories = ["hat", "shortsleeve", "longsleeve", "outerwear", "pants", "shorts", "shoes"];
const colors = ["black", "white", "red", "blue", "green", "yellow", "purple", "pink", "orange", "brown", "gray", "beige"];

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
  const { toast } = useToast();

  useEffect(() => {
    const savedItems = localStorage.getItem('wardrobe_items');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
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
        description: "Removing background and analyzing the item.",
      });

      // Load the image
      const imageElement = await loadImage(file);
      
      // Remove background
      const backgroundRemovedBlob = await removeBackground(imageElement);
      const processedImageUrl = URL.createObjectURL(backgroundRemovedBlob);
      
      // Create original image URL for reference
      const originalImageUrl = URL.createObjectURL(file);
      
      // Simple category prediction based on aspect ratio and filename
      const predictedCategory = predictCategory(file.name);
      
      setPendingItem({
        imageUrl: processedImageUrl,
        originalImage: originalImageUrl,
        category: predictedCategory
      });

      toast({
        title: "Image processed!",
        description: "Please select the color and confirm the category.",
      });
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing failed",
        description: "There was an error processing your image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const predictCategory = (filename: string): string => {
    const name = filename.toLowerCase();
    if (name.includes('shoe') || name.includes('boot') || name.includes('sneaker')) return 'shoes';
    if (name.includes('hat') || name.includes('cap') || name.includes('beanie')) return 'hat';
    if (name.includes('pant') || name.includes('jean') || name.includes('trouser')) return 'pants';
    if (name.includes('short')) return 'shorts';
    if (name.includes('jacket') || name.includes('coat') || name.includes('hoodie')) return 'outerwear';
    if (name.includes('tshirt') || name.includes('t-shirt')) return 'shortsleeve';
    if (name.includes('longsleeve') || name.includes('sweater')) return 'longsleeve';
    return 'shortsleeve'; // default
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

  const filteredItems = items.filter(item => {
    const categoryMatch = filterCategory === "all" || item.category === filterCategory;
    const colorMatch = filterColor === "all" || item.color === filterColor;
    return categoryMatch && colorMatch;
  });

  const groupedItems = categories.reduce((acc, category) => {
    acc[category] = filteredItems.filter(item => item.category === category);
    return acc;
  }, {} as Record<string, ClothingItem[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => window.location.href = '/dashboard'}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center space-x-2">
              <Shirt className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold text-gray-800">My Wardrobe</h1>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {items.length} items total
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Upload Section */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-purple-100">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex-1">
                <Label htmlFor="image-upload" className="text-lg font-semibold text-gray-800 mb-2 block">
                  Upload Clothing Item
                </Label>
                <div className="border-2 border-dashed border-purple-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                  <Label htmlFor="image-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <p className="text-gray-600">
                      {isUploading ? "Processing..." : "Click to upload an image"}
                    </p>
                  </Label>
                </div>
              </div>

              {pendingItem && (
                <div className="flex-1 bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-4">Confirm Item Details:</h3>
                  <img 
                    src={pendingItem.imageUrl} 
                    alt="Processed item" 
                    className="w-32 h-32 object-cover rounded-lg mb-4 mx-auto"
                  />
                  
                  <div className="space-y-4">
                    <div>
                      <Label>Category: {pendingItem.category}</Label>
                    </div>
                    
                    <div>
                      <Label htmlFor="color-select">Select Color:</Label>
                      <Select value={selectedColor} onValueChange={setSelectedColor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose color" />
                        </SelectTrigger>
                        <SelectContent>
                          {colors.map(color => (
                            <SelectItem key={color} value={color}>
                              <div className="flex items-center space-x-2">
                                <div 
                                  className={`w-4 h-4 rounded-full border`}
                                  style={{ backgroundColor: color === 'white' ? '#ffffff' : color }}
                                />
                                <span className="capitalize">{color}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button onClick={handleSaveItem} className="w-full">
                      Add to Wardrobe
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-purple-100">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-purple-600" />
                <span className="font-semibold">Filters:</span>
              </div>
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
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
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Colors</SelectItem>
                  {colors.map(color => (
                    <SelectItem key={color} value={color}>
                      <div className="flex items-center space-x-2">
                        <div 
                          className={`w-4 h-4 rounded-full border`}
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
          <Card className="bg-white/80 backdrop-blur-sm border-purple-100">
            <CardContent className="p-12 text-center">
              <Shirt className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No items found</h3>
              <p className="text-gray-500">Upload your first clothing item to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
            {categories.map(category => (
              groupedItems[category].length > 0 && (
                <div key={category} className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-purple-100">
                  <h3 className="font-semibold text-gray-800 mb-4 capitalize text-center">
                    {category} ({groupedItems[category].length})
                  </h3>
                  <div className="space-y-3">
                    {groupedItems[category].map(item => (
                      <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-0">
                          <img 
                            src={item.imageUrl} 
                            alt={`${item.color} ${item.category}`}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full border"
                                style={{ backgroundColor: item.color === 'white' ? '#ffffff' : item.color }}
                              />
                              <span className="text-xs text-gray-600 capitalize">{item.color}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wardrobe;
