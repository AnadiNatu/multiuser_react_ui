import { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { updateUser } from '../features/auth/authSlice';
import { Widget } from '../components/ui/Widget';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { apiService, API_ENDPOINTS } from '../services/apiService';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Camera,
  Trash2,
  Lock,
  Loader2,
} from 'lucide-react';
import { formatDate } from '../utils/helpers';
import { useToast } from '../components/ui/Toast';

export default function Profile() {
  const dispatch = useAppDispatch();
  const { success, error: toastError } = useToast();
  const user = useAppSelector((state) => state.auth.user);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Profile edit ────────────────────────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phoneNumber || '',
    address: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // ── Photo ────────────────────────────────────────────────────────────────
  const [photoUrl, setPhotoUrl] = useState(user?.avatarUrl || user?.profilePicture || '');
  const [photoLoading, setPhotoLoading] = useState(false);

  // Fetch current photo on mount
  useEffect(() => {
    apiService
      .get<{ photoUrl: string }>(API_ENDPOINTS.PROFILE_PHOTO)
      .then((res) => {
        if (res.photoUrl) {
          setPhotoUrl(res.photoUrl);
          dispatch(updateUser({ avatarUrl: res.photoUrl, profilePicture: res.photoUrl }));
        }
      })
      .catch(() => {
        // Silently ignore — photo may not exist yet
      });
  }, [dispatch]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await apiService.upload<{ photoUrl: string; message: string }>(
        API_ENDPOINTS.PROFILE_PHOTO,
        fd,
        'POST'
      );
      setPhotoUrl(res.photoUrl);
      dispatch(updateUser({ avatarUrl: res.photoUrl, profilePicture: res.photoUrl }));
      success('Profile photo updated!');
    } catch (err: any) {
      toastError(err.message || 'Failed to upload photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  const handlePhotoRemove = async () => {
    setPhotoLoading(true);
    try {
      await apiService.delete(API_ENDPOINTS.PROFILE_PHOTO);
      setPhotoUrl('');
      dispatch(updateUser({ avatarUrl: '', profilePicture: '' }));
      success('Profile photo removed');
    } catch (err: any) {
      toastError(err.message || 'Failed to remove photo');
    } finally {
      setPhotoLoading(false);
    }
  };

  // ── Change password modal ────────────────────────────────────────────────
  const [pwModalOpen, setPwModalOpen] = useState(false);
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }

    setPwLoading(true);
    try {
      await apiService.postQuery(API_ENDPOINTS.PASSWORD_CHANGE, {
        email: user!.email,
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      success('Password changed successfully!');
      setPwModalOpen(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPwError(err.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Profile save (local state only — no dedicated update endpoint yet) ──
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 600));
      dispatch(updateUser({ name: formData.name }));
      success('Profile updated!');
      setIsEditing(false);
    } catch {
      toastError('Failed to save profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phoneNumber || '',
      address: '',
    });
    setIsEditing(false);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Profile' }]} />

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Settings</h1>
        <p className="text-slate-500">Manage your account information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left: Overview + Photo ─────────────────────────────────────── */}
        <Widget className="lg:col-span-1">
          {/* Photo */}
          <div className="text-center">
            <div className="relative inline-block mb-4">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-brand-green to-brand-blue rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}

              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photoLoading}
                className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
              >
                {photoLoading ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1">{user.name}</h2>
            <p className="text-slate-500 text-sm mb-3">{user.email}</p>

            <Badge
              variant={user.role === 'ADMIN' ? 'primary' : 'success'}
              leftIcon={<Shield className="w-3 h-3" />}
              className="mb-1"
            >
              {user.rawRole || user.role}
            </Badge>

            {/* Photo actions */}
            <div className="flex gap-2 justify-center mt-4">
              <Button
                size="sm"
                variant="outline"
                leftIcon={<Camera className="w-3 h-3" />}
                onClick={() => fileInputRef.current?.click()}
                isLoading={photoLoading}
              >
                Change
              </Button>
              {photoUrl && (
                <Button
                  size="sm"
                  variant="ghost"
                  leftIcon={<Trash2 className="w-3 h-3" />}
                  className="text-red-500 hover:bg-red-50"
                  onClick={handlePhotoRemove}
                  isLoading={photoLoading}
                >
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Meta info */}
          <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600">
                Joined {formatDate(user.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600 truncate">ID: {user.id}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="text-slate-600">
                {user.userType === 'TYPE1' ? 'Admin Account' : 'User Account'}
              </span>
            </div>
          </div>
        </Widget>

        {/* ── Right: Form ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          <Widget title="Personal Information">
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  leftIcon={<User className="w-4 h-4" />}
                  disabled={!isEditing}
                  required
                />
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  leftIcon={<Mail className="w-4 h-4" />}
                  disabled={!isEditing}
                  required
                />
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  leftIcon={<Phone className="w-4 h-4" />}
                  placeholder="+91 9876543210"
                  disabled={!isEditing}
                />
                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  leftIcon={<MapPin className="w-4 h-4" />}
                  placeholder="City, State"
                  disabled={!isEditing}
                />
              </div>

              <div className="flex gap-3 pt-2">
                {!isEditing ? (
                  <Button type="button" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button type="submit" isLoading={saveLoading}>
                      Save Changes
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </form>
          </Widget>

          {/* ── Security ──────────────────────────────────────────────── */}
          <Widget title="Security">
            <div className="space-y-5">
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">Password</h3>
                <p className="text-sm text-slate-500 mb-3">
                  Keep your account secure with a strong password.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Lock className="w-4 h-4" />}
                  onClick={() => setPwModalOpen(true)}
                >
                  Change Password
                </Button>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-1">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-slate-500 mb-3">
                  Add an extra layer of security to your account.
                </p>
                <Badge variant="warning">Not Enabled</Badge>
              </div>
            </div>
          </Widget>
        </div>
      </div>

      {/* ── Change Password Modal ──────────────────────────────────────── */}
      <Modal
        isOpen={pwModalOpen}
        onClose={() => {
          setPwModalOpen(false);
          setPwError('');
          setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        }}
        title="Change Password"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setPwModalOpen(false)}
              disabled={pwLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePasswordChange as any}
              isLoading={pwLoading}
            >
              Update Password
            </Button>
          </>
        }
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {pwError && <Alert variant="error">{pwError}</Alert>}
          <Input
            label="Current Password"
            type="password"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="Min 8 characters"
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={pwForm.confirmPassword}
            onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />
        </form>
      </Modal>
    </div>
  );
}
