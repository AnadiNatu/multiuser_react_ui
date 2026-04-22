import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '../app/hooks';
import { authService, mapLoginResponseToUser } from '../features/auth/authService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Alert } from '../components/ui/Alert';
import { Widget } from '../components/ui/Widget';
import { UserRole, RawRole, UserType } from '@/types';

export default function OAuth2Callback() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    const name = searchParams.get('name');
    const urlError = searchParams.get('error');

    if (urlError) {
      setError(`OAuth2 login failed: ${urlError}`);
      return;
    }

    if (!token || !email) {
      setError('Invalid OAuth2 callback — missing token or email.');
      return;
    }

    // Store raw token
    authService.storeToken(token);

    // Build minimal user from URL params
    const user = mapLoginResponseToUser({
      token,
      username: email,
      userType: 'TYPE2',
      role: 'USER',
      message: 'OAuth2 login',
    });

    // Override name if provided
    const mergedUser = {
      ...user,
      name: name ? decodeURIComponent(name) : email,
    };

    authService.storeUser(mergedUser);
    dispatch(setUser(mergedUser));

    // Try to enrich with full profile
    dispatch(fetchCurrentUser());

    navigate('/dashboard', { replace: true });
  }, [searchParams, dispatch, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Widget className="max-w-md w-full shadow-xl">
          <Alert variant="error" title="OAuth2 Error">
            {error}
          </Alert>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 w-full text-sm text-brand-green font-medium hover:underline"
          >
            Back to Login
          </button>
        </Widget>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <LoadingSpinner size="lg" text="Completing sign in..." />
    </div>
  );
}
function setUser(mergedUser: { name: string; id: string; email: string; role: UserRole; rawRole: RawRole; userType: UserType; avatarUrl: string; avatar: string; token?: string; createdAt: string; updatedAt: string; phoneNumber?: string; profilePicture?: string; }): any {
    throw new Error('Function not implemented.');
}

function fetchCurrentUser(): any {
    throw new Error('Function not implemented.');
}

