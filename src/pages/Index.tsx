
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { Sparkles, Shirt, Camera, Play } from "lucide-react";

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <Shirt className="w-8 h-8 text-rose-400" />
          <span className="text-2xl font-bold text-rose-600">SmartWardrobe</span>
        </div>
        {isLoggedIn && (
          <Button 
            onClick={() => window.location.href = '/dashboard'} 
            variant="outline"
            className="border-rose-200 hover:bg-rose-50 text-rose-600"
          >
            Dashboard
          </Button>
        )}
      </nav>
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-rose-200 to-purple-200 rounded-full opacity-30 blur-xl animate-pulse" />
          <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-r from-rose-300 to-purple-300 rounded-full shadow-lg">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-rose-600 mb-6 leading-tight">
          Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Wardrobe</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-rose-500 mb-12 max-w-2xl leading-relaxed">
          Your closet, but <span className="text-purple-500 font-semibold">smarter.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <Button 
            onClick={() => setShowAuthModal(true)}
            size="lg"
            className="bg-gradient-to-r from-rose-400 to-purple-400 hover:from-rose-500 hover:to-purple-500 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started
            <Camera className="ml-2 w-5 h-5" />
          </Button>
        </div>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-lg font-semibold text-rose-600 mb-2">AI-Powered Upload</h3>
            <p className="text-rose-400">Automatically categorize and organize your clothes with smart AI recognition.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Shirt className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-rose-600 mb-2">Smart Organization</h3>
            <p className="text-rose-400">Visual grid layout with intelligent filtering by category and color.</p>
          </div>
          
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-rose-600 mb-2">Style Assistant</h3>
            <p className="text-rose-400">Get personalized outfit recommendations based on your wardrobe.</p>
          </div>
        </div>
      </div>

      {/* Demo Video Section */}
      <div className="py-20 px-6 bg-white/40 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-rose-600 mb-6">See SmartWardrobe in Action</h2>
          <p className="text-xl text-rose-400 mb-12">Watch how easy it is to organize and style your wardrobe</p>
          
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-r from-rose-100 to-purple-100 p-8">
            <div className="aspect-video bg-rose-200/50 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-rose-300 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
                <p className="text-rose-500 font-semibold">Demo Video Coming Soon</p>
                <p className="text-rose-400 text-sm mt-2">Experience the magic of AI-powered wardrobe organization</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setShowAuthModal(false);
          window.location.href = '/dashboard';
        }}
      />
    </div>
  );
};

export default Index;
