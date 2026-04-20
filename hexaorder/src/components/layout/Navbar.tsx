import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authSlice';
import { Button } from '../ui/Button';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  LogOut, 
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../../utils/helpers';

export function Navbar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Orders', path: '/orders', icon: ShoppingCart },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
                <Package className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                HexaOrder
              </span>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => cn(
                    "inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive 
                      ? "text-brand-green bg-brand-green/10" 
                      : "text-slate-600 hover:text-brand-green hover:bg-slate-50"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/profile" 
              className="flex items-center space-x-3 pr-4 border-r border-slate-200 group hover:bg-slate-50 p-1.5 rounded-xl transition-all"
            >
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 group-hover:text-brand-green transition-colors">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
              <img 
                src={user?.avatarUrl || user?.avatar} 
                alt={user?.name} 
                className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                referrerPolicy="no-referrer"
              />
            </Link>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              leftIcon={<LogOut className="w-4 h-4" />}
            >
              Logout
            </Button>
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-slate-900 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 py-2">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) => cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  isActive 
                    ? "text-brand-green bg-brand-green/10" 
                    : "text-slate-600 hover:text-brand-green hover:bg-slate-50"
                )}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </div>
              </NavLink>
            ))}
            <div className="pt-4 pb-3 border-t border-slate-200">
              <Link 
                to="/profile" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center px-3 hover:bg-slate-50 p-2 rounded-lg transition-colors"
              >
                <img 
                  src={user?.avatarUrl || user?.avatar} 
                  alt={user?.name} 
                  className="w-10 h-10 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="ml-3">
                  <p className="text-base font-medium text-slate-800">{user?.name}</p>
                  <p className="text-sm font-medium text-slate-500">{user?.email}</p>
                </div>
              </Link>
              <div className="mt-3 px-2">
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  <div className="flex items-center">
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}