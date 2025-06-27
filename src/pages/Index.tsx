import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Shirt, Camera, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial auth state
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };
    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <Shirt className="w-8 h-8 text-navy-600" />
          <span className="text-2xl font-bold text-navy-800">SmartWardrobe</span>
        </div>
        {isLoggedIn ? (
          <Button 
            onClick={() => navigate('/dashboard')} 
            variant="outline"
            className="border-navy-200 hover:bg-navy-50 text-navy-600"
          >
            Dashboard
          </Button>
        ) : (
          <Button 
            onClick={() => navigate('/auth')} 
            variant="outline"
            className="border-navy-200 hover:bg-navy-50 text-navy-600"
          >
            Sign In
          </Button>
        )}
      </nav>
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-navy-200 to-blue-200 rounded-full opacity-30 blur-xl animate-pulse" />
          <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-r from-navy-600 to-blue-600 rounded-full shadow-lg">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-navy-800 mb-6 leading-tight">
          Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Wardrobe</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-navy-600 mb-12 max-w-2xl leading-relaxed">
          Your closet, but <span className="text-blue-600 font-semibold">smarter.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <Button 
            onClick={() => navigate('/auth')}
            size="lg"
            className="bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started
            <Camera className="ml-2 w-5 h-5" />
          </Button>
        </div>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-navy-100">
            <div className="w-12 h-12 bg-navy-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-navy-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-800 mb-2">AI-Powered Upload</h3>
            <p className="text-navy-600">Automatically categorize and organize your clothes with smart AI recognition.</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-navy-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shirt className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-800 mb-2">Smart Organization</h3>
            <p className="text-navy-600">Visual grid layout with intelligent filtering by category and color.</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105 border border-navy-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-800 mb-2">Style Assistant</h3>
            <p className="text-navy-600">Get personalized outfit recommendations based on your wardrobe.</p>
          </div>
        </div>
      </div>

      {/* Demo Video Section */}
      <div className="py-20 px-6 bg-white/60 backdrop-blur-sm border-t border-navy-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-navy-800 mb-6">See SmartWardrobe in Action</h2>
          <p className="text-xl text-navy-600 mb-12">Watch how easy it is to organize and style your wardrobe</p>
          
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-r from-navy-50 to-blue-50 p-8 border border-navy-200">
            <div className="aspect-video bg-navy-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-navy-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <p className="text-navy-700 font-semibold">Demo Video Coming Soon</p>
                <p className="text-navy-600 text-sm mt-2">Experience the magic of AI-powered wardrobe organization</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
