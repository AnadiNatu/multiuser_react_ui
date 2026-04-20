import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loginUser } from '../features/auth/authSlice';
import { Button } from '../components/ui/Button';
import { Widget } from '../components/ui/Widget';
import { Input } from '../components/ui/Input';
import { Alert } from '../components/ui/Alert';
import { Package, Mail, Lock } from 'lucide-react';
import { cn } from '../utils/helpers';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const error = useAppSelector((state) => state.auth.error);
  const user = useAppSelector((state) => state.auth.user);

  const [role, setRole] = useState<'ADMIN' | 'USER'>('ADMIN');
  const [email, setEmail] = useState('admin@hexaorder.com');
  const [password, setPassword] = useState('password');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleRoleSwitch = (newRole: 'ADMIN' | 'USER') => {
    setRole(newRole);
    setEmail(newRole === 'ADMIN' ? 'admin@hexaorder.com' : 'user@hexaorder.com');
    setPassword('password');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await dispatch(loginUser({ email, password }));
    
    if (loginUser.fulfilled.match(result)) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue/30 to-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-2xl shadow-lg mb-4">
            <Package className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">HexaOrder</h1>
          <p className="text-slate-600 mt-2">Product Ordering Management System</p>
        </div>

        <Widget className="shadow-2xl">
          <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
            <button
              onClick={() => handleRoleSwitch('ADMIN')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                role === 'ADMIN' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              Admin
            </button>
            <button
              onClick={() => handleRoleSwitch('USER')}
              className={cn(
                "flex-1 py-2 text-sm font-medium rounded-md transition-all",
                role === 'USER' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              User
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && <Alert variant="error">{error}</Alert>}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-5 h-5" />}
              placeholder="name@company.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-5 h-5" />}
              placeholder="••••••••"
              required
            />

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              isLoading={status === 'loading'}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Demo Credentials: <br />
              <span className="font-mono text-xs">admin@hexaorder.com / password</span>
            </p>
          </div>
        </Widget>
      </div>
    </div>
  );
}