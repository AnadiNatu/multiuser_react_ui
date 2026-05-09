import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { authService, mapLoginResponseToUser } from '../features/auth/authService';
import { loginSuccess } from '../features/auth/authSlice';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Package, AlertTriangle } from 'lucide-react';

export default function OAuth2Callback() {
  const navigate        = useNavigate();
  const dispatch        = useAppDispatch();
  const [searchParams]  = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token    = searchParams.get('token');
    const email    = searchParams.get('email');
    const name     = searchParams.get('name');
    const urlError = searchParams.get('error');

    if (urlError) { setError(`OAuth2 login failed: ${urlError}`); return; }
    if (!token || !email) { setError('Invalid OAuth2 callback — missing token or email.'); return; }

    authService.storeToken(token);

    const user = mapLoginResponseToUser({
      token,
      username: email,
      userType: 'TYPE2',
      role: 'USER',
      message: 'OAuth2 login',
    });

    const mergedUser = { ...user, name: name ? decodeURIComponent(name) : email };
    authService.storeUser(mergedUser);
    dispatch(loginSuccess(mergedUser));
    navigate('/dashboard', { replace: true });
  }, [searchParams, dispatch, navigate]);

  const bgStyle = { background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={bgStyle}>
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center" style={{ animation: 'modalIn 0.3s ease' }}>
          <style>{`@keyframes modalIn { from { opacity:0; transform:translateY(-12px) } to { opacity:1; transform:translateY(0) } }`}</style>
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-50 rounded-2xl mb-4">
            <AlertTriangle className="w-7 h-7 text-red-600" />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900 mb-2 tracking-tight">OAuth2 Error</h2>
          <p className="text-sm text-slate-500 mb-5 leading-relaxed">{error}</p>
          <Button onClick={() => navigate('/login')} fullWidth>
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={bgStyle}>
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-2xl shadow-2xl shadow-brand-green/30 mb-5">
          <Package className="text-white w-8 h-8" />
        </div>
        <LoadingSpinner size="md" text="Completing sign in..." className="text-white" />
      </div>
    </div>
  );
}