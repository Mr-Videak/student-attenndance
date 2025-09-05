import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth, DEMO_CREDENTIALS } from './AuthProvider';
import { toast } from 'sonner';
import { Eye, EyeOff, Copy, Info } from 'lucide-react';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast.error(error);
      } else {
        toast.success('Welcome! You are now signed in.');
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error('Sign in error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    navigator.clipboard.writeText(`${DEMO_CREDENTIALS.email}\n${DEMO_CREDENTIALS.password}`);
    toast.success('Credentials copied to clipboard!');
  };

  const fillDemoCredentials = () => {
    setEmail(DEMO_CREDENTIALS.email);
    setPassword(DEMO_CREDENTIALS.password);
    toast.success('Demo credentials filled!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your attendance management account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Demo Credentials Display */}
            <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
              <Info className="h-4 w-4" />
              <AlertDescription className="space-y-2">
                <div className="font-medium text-blue-800 dark:text-blue-200">Demo Credentials:</div>
                <div className="text-sm space-y-1">
                  <div className="font-mono bg-white dark:bg-gray-900 p-2 rounded border">
                    <div>Email: {DEMO_CREDENTIALS.email}</div>
                    <div>Password: {DEMO_CREDENTIALS.password}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyCredentials}
                      className="flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      Copy
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fillDemoCredentials}
                      className="flex items-center gap-1"
                    >
                      Auto Fill
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              This is a demo application with sample credentials shown above.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;