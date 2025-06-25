
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shirt, Sparkles, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('smartwardrobe_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = '/';
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('smartwardrobe_user');
    window.location.href = '/';
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-rose-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shirt className="w-8 h-8 text-rose-400" />
            <div>
              <h1 className="text-2xl font-bold text-rose-600">SmartWardrobe</h1>
              <p className="text-sm text-rose-400">Welcome back, {user.username}!</p>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="border-rose-200 text-rose-500 hover:bg-rose-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-rose-600 mb-4">
            Your Fashion Command Center
          </h2>
          <p className="text-xl text-rose-400">
            Organize your wardrobe and create amazing outfits with AI assistance
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* My Wardrobe Card */}
          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/60 backdrop-blur-sm border-rose-100">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-rose-300 to-purple-300 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Shirt className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-rose-600 group-hover:text-purple-500 transition-colors">
                My Wardrobe
              </CardTitle>
              <CardDescription className="text-rose-400 text-sm">
                Upload, organize, and manage your clothing items
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => window.location.href = '/wardrobe'}
                className="w-full bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white font-semibold py-3"
              >
                Open Wardrobe
              </Button>
            </CardContent>
          </Card>

          {/* Style an Outfit Card */}
          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/60 backdrop-blur-sm border-rose-100">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-300 to-pink-300 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-rose-600 group-hover:text-purple-500 transition-colors">
                Style an Outfit
              </CardTitle>
              <CardDescription className="text-rose-400 text-sm">
                Get AI-powered outfit recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => window.location.href = '/style-outfit'}
                className="w-full bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3"
              >
                Style Outfits
              </Button>
            </CardContent>
          </Card>

          {/* My Outfits Card */}
          <Card className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 bg-white/60 backdrop-blur-sm border-rose-100">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-300 to-rose-300 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-rose-600 group-hover:text-purple-500 transition-colors">
                My Outfits
              </CardTitle>
              <CardDescription className="text-rose-400 text-sm">
                View and manage your saved outfits
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button 
                onClick={() => window.location.href = '/my-outfits'}
                className="w-full bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white font-semibold py-3"
              >
                View Outfits
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
