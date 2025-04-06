
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Loader2, UserCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Sign up successful! Please check your email for verification.');
        // You may want to redirect the user or show a different view
      }
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Signed in successfully!');
        navigate('/');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    
    // Demo credentials
    const demoEmail = 'demo@example.com';
    const demoPassword = 'demo123456';
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: demoPassword,
      });

      if (error) {
        // If the demo account doesn't exist, create it
        if (error.message.includes('Invalid login credentials')) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: demoEmail,
            password: demoPassword,
          });
          
          if (signUpError) {
            toast.error('Failed to create demo account: ' + signUpError.message);
          } else {
            // Try to sign in with the newly created account
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: demoEmail,
              password: demoPassword,
            });
            
            if (signInError) {
              toast.error('Failed to sign in with demo account');
            } else {
              toast.success('Signed in with demo account!');
              navigate('/');
            }
          }
        } else {
          toast.error('Error accessing demo account: ' + error.message);
        }
      } else {
        toast.success('Signed in with demo account!');
        navigate('/');
      }
    } catch (error) {
      console.error('Error with demo login:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-muted/50 to-muted p-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Attendance App</CardTitle>
          <CardDescription className="text-center">
            Sign in or create an account to manage attendance
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="signin">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input
                    id="email-signin"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password-signin"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                
                <div className="relative w-full my-2">
                  <Separator className="my-2" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-card text-xs text-muted-foreground">
                    OR
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="w-full" 
                  onClick={handleDemoLogin}
                  disabled={demoLoading}
                >
                  {demoLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Accessing Demo...
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Try with Demo Account
                    </>
                  )}
                </Button>
                <div className="text-center w-full mt-2">
                  <p className="text-xs text-muted-foreground">
                    No signup required. Access all features instantly!
                  </p>
                </div>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Input
                    id="email-signup"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    id="password-signup"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2">
                <Button className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
                
                <div className="relative w-full my-2">
                  <Separator className="my-2" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 px-2 bg-card text-xs text-muted-foreground">
                    OR
                  </div>
                </div>
                
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="w-full" 
                  onClick={handleDemoLogin}
                  disabled={demoLoading}
                >
                  {demoLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Accessing Demo...
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" />
                      Try with Demo Account
                    </>
                  )}
                </Button>
                <div className="text-center w-full mt-2">
                  <p className="text-xs text-muted-foreground">
                    No signup required. Access all features instantly!
                  </p>
                </div>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthPage;
