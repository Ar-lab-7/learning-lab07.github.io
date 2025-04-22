
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ open, onOpenChange }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      toast.error("Please enter a username");
      return;
    }
    
    if (!password.trim()) {
      toast.error("Please enter a password");
      return;
    }
    
    const success = await signIn(username, password);
    
    if (success) {
      toast.success("Logged in successfully!");
      onOpenChange(false);
      navigate('/traffic');  // Redirect to traffic page after successful login
    } else {
      toast.error("Login failed. Try any username with any non-empty password.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] w-full border border-eduAccent/30 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-foreground">
            Developer Login
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Sign in with your developer credentials
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Username</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <User size={18} />
                </div>
                <Input 
                  id="username" 
                  placeholder="Enter any username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 bg-background text-foreground"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Demo: Any username works</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                  <Lock size={18} />
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter any password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-background text-foreground"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">Demo: Any non-empty password works</p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-eduAccent hover:bg-eduAccent/80"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
