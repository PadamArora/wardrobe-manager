
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AuthModal = ({ isOpen, onClose, onLoginSuccess }: AuthModalProps) => {
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({ username: "", password: "", gender: "" });
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.username && loginForm.password) {
      // Store user data in localStorage (in real app, this would be handled by backend)
      localStorage.setItem('smartwardrobe_user', JSON.stringify({
        username: loginForm.username,
        isLoggedIn: true
      }));
      toast({
        title: "Welcome back!",
        description: "Successfully logged in to SmartWardrobe.",
      });
      onLoginSuccess();
    } else {
      toast({
        title: "Login failed",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupForm.username && signupForm.password && signupForm.gender) {
      // Store user data in localStorage
      localStorage.setItem('smartwardrobe_user', JSON.stringify({
        username: signupForm.username,
        gender: signupForm.gender,
        isLoggedIn: true
      }));
      toast({
        title: "Account created!",
        description: "Welcome to SmartWardrobe. Let's get started!",
      });
      onLoginSuccess();
    } else {
      toast({
        title: "Signup failed",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white/95 backdrop-blur-sm border-navy-200">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold bg-gradient-to-r from-navy-600 to-blue-600 bg-clip-text text-transparent">
            Join SmartWardrobe
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-navy-50">
            <TabsTrigger value="login" className="flex items-center gap-2 text-navy-600 data-[state=active]:bg-navy-600 data-[state=active]:text-white">
              <User className="w-4 h-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="signup" className="flex items-center gap-2 text-navy-600 data-[state=active]:bg-navy-600 data-[state=active]:text-white">
              <UserPlus className="w-4 h-4" />
              Sign Up
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4 mt-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="text-navy-700">Username</Label>
                <Input
                  id="login-username"
                  type="text"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  className="border-navy-200 focus:border-navy-400 text-navy-800"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-navy-700">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="border-navy-200 focus:border-navy-400 text-navy-800"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white"
              >
                <Lock className="w-4 h-4 mr-2" />
                Login
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="signup" className="space-y-4 mt-6">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-username" className="text-navy-700">Username</Label>
                <Input
                  id="signup-username"
                  type="text"
                  placeholder="Choose a username"
                  value={signupForm.username}
                  onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                  className="border-navy-200 focus:border-navy-400 text-navy-800"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-navy-700">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  className="border-navy-200 focus:border-navy-400 text-navy-800"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-navy-700">Gender</Label>
                <RadioGroup
                  value={signupForm.gender}
                  onValueChange={(value) => setSignupForm({ ...signupForm, gender: value })}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" className="border-navy-300 text-navy-600" />
                    <Label htmlFor="male" className="text-navy-700">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" className="border-navy-300 text-navy-600" />
                    <Label htmlFor="female" className="text-navy-700">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" className="border-navy-300 text-navy-600" />
                    <Label htmlFor="other" className="text-navy-700">Other</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
