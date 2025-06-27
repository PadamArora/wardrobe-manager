
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Lock, UserPlus, Shirt, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ 
    username: "", 
    email: "", 
    password: "", 
    gender: "" 
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Login failed",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "Successfully logged in to SmartWardrobe.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupForm.username || !signupForm.email || !signupForm.password || !signupForm.gender) {
      toast({
        title: "Signup failed",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: signupForm.username,
            gender: signupForm.gender,
          }
        }
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center space-x-2">
          <Shirt className="w-8 h-8 text-navy-600" />
          <span className="text-2xl font-bold text-navy-800">SmartWardrobe</span>
        </div>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="sm"
          className="border-navy-200 text-navy-600 hover:bg-navy-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>

      {/* Auth Form */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-6">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-navy-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-navy-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to SmartWardrobe
            </CardTitle>
            <CardDescription className="text-center text-navy-600">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent>
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
                    <Label htmlFor="login-email" className="text-navy-700">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="Enter your email"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="border-navy-200 focus:border-navy-400 text-navy-800"
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-navy-600 to-blue-600 hover:from-navy-700 hover:to-blue-700 text-white"
                    disabled={loading}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {loading ? "Signing in..." : "Login"}
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
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-navy-700">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      className="border-navy-200 focus:border-navy-400 text-navy-800"
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Label className="text-navy-700">Gender</Label>
                    <RadioGroup
                      value={signupForm.gender}
                      onValueChange={(value) => setSignupForm({ ...signupForm, gender: value })}
                      className="flex space-x-6"
                      disabled={loading}
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
                    disabled={loading}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {loading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
