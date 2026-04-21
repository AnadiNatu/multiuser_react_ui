import { useState } from 'react';
import { useAppSelector } from '../app/hooks';
import { Widget } from '../components/ui/Widget';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { User, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function Profile() {
  const user = useAppSelector((state) => state.auth.user);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setIsEditing(false);
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
      address: '',
    });
    setIsEditing(false);
    setSaveStatus('idle');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Profile' }]} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500">Manage your account information and preferences.</p>
      </div>

      {saveStatus === 'success' && (
        <Alert variant="success">Profile updated successfully!</Alert>
      )}
      {saveStatus === 'error' && (
        <Alert variant="error">Failed to update profile. Please try again.</Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <Widget className="lg:col-span-1">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-brand-green to-brand-blue rounded-full mb-4">
              <User className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">{user.name}</h2>
            <p className="text-slate-500 mb-4">{user.email}</p>
            <Badge 
              variant={user.role === 'ADMIN' ? 'primary' : 'success'}
              leftIcon={<Shield className="w-3 h-3" />}
            >
              {user.role}
            </Badge>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">
                Joined {formatDate(user.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-slate-400" />
              <span className="text-slate-600">ID: {user.id}</span>
            </div>
          </div>
        </Widget>

        {/* Profile Form */}
        <Widget className="lg:col-span-2" title="Personal Information">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                leftIcon={<User className="w-5 h-5" />}
                disabled={!isEditing}
                required
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                leftIcon={<Mail className="w-5 h-5" />}
                disabled={!isEditing}
                required
              />

              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                leftIcon={<Phone className="w-5 h-5" />}
                placeholder="+1 (555) 000-0000"
                disabled={!isEditing}
              />

              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                leftIcon={<MapPin className="w-5 h-5" />}
                placeholder="123 Main St, City, State"
                disabled={!isEditing}
              />
            </div>

            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  variant="primary"
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button type="submit" variant="primary">
                    Save Changes
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </form>
        </Widget>
      </div>

      {/* Security Section */}
      <Widget title="Security">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Password</h3>
            <p className="text-sm text-slate-600 mb-4">
              Manage your password and security settings.
            </p>
            <Button variant="outline" size="sm">
              Change Password
            </Button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-2">Two-Factor Authentication</h3>
            <p className="text-sm text-slate-600 mb-4">
              Add an extra layer of security to your account.
            </p>
            <Badge variant="warning">Not Enabled</Badge>
          </div>
        </div>
      </Widget>
    </div>
  );
}
