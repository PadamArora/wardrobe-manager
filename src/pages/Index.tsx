
import { useState } from "react";
import { Button } from "@/components/ui/button";
import AuthModal from "@/components/AuthModal";
import { Sparkles, Shirt, Camera } from "lucide-react";

const Index = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6">
        <div className="flex items-center space-x-2">
          <Shirt className="w-8 h-8 text-purple-600" />
          <span className="text-2xl font-bold text-gray-800">SmartWardrobe</span>
        </div>
        {isLoggedIn && (
          <Button 
            onClick={() => window.location.href = '/dashboard'} 
            variant="outline"
            className="border-purple-200 hover:bg-purple-50"
          >
            Dashboard
          </Button>
        )}
      </nav>
      
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="relative mb-8">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-300 to-blue-300 rounded-full opacity-20 blur-xl animate-pulse" />
          <div className="relative flex items-center justify-center w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full shadow-lg">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6 leading-tight">
          Smart<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Wardrobe</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl leading-relaxed">
          Your closet, but <span className="text-purple-600 font-semibold">smarter.</span>
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center">
          <Button 
            onClick={() => setShowAuthModal(true)}
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Get Started
            <Camera className="ml-2 w-5 h-5" />
          </Button>
        </div>
        
        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">AI-Powered Upload</h3>
            <p className="text-gray-600">Automatically categorize and organize your clothes with smart AI recognition.</p>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shirt className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Smart Organization</h3>
            <p className="text-gray-600">Visual grid layout with intelligent filtering by category and color.</p>
          </div>
          
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Style Assistant</h3>
            <p className="text-gray-600">Get personalized outfit recommendations based on your wardrobe.</p>
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
