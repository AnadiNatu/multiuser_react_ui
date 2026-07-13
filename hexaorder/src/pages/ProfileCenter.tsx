import {
  UserCircle,
  RefreshCw,
  Image,
} from 'lucide-react';

import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';

import AdminPageHeader from '@/components/ui/AdminPageHeader';
import AdminStatistics from '@/components/ui/AdminStatistics';
import AdminSection from '@/components/ui/AdminSection';
import AdminCard from '@/components/ui/AdminCard';
import ProfilePhotoCard from '@/components/ui/ProfilePhotoCard';

export default function ProfileCenter() {

  return (

    <div className="space-y-8 page-enter">

      {/* ------------------------------------------------ */}
      {/* Breadcrumb */}
      {/* ------------------------------------------------ */}

      <Breadcrumb
        items={[
          {
            label: 'Dashboard',
            href: '/dashboard',
          },
          {
            label: 'Administration',
          },
          {
            label: 'Profile Center',
          },
        ]}
      />

      {/* ------------------------------------------------ */}
      {/* Header */}
      {/* ------------------------------------------------ */}

      <AdminPageHeader
        title="Profile Center"
        subtitle="Manage your profile picture using Cloudinary."
        icon={UserCircle}
        actions={
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        }
      />

      {/* ------------------------------------------------ */}
      {/* Statistics */}
      {/* ------------------------------------------------ */}

      <AdminStatistics
        stats={[
          {
            title: 'Profile Photo',
            value: 'Ready',
            color: 'text-emerald-400',
          },
          {
            title: 'Cloudinary',
            value: 'Connected',
            color: 'text-blue-400',
          },
          {
            title: 'Operations',
            value: 3,
            color: 'text-brand-green',
          },
          {
            title: 'Authentication',
            value: 'Secured',
            color: 'text-amber-400',
          },
        ]}
      />

      {/* ------------------------------------------------ */}
      {/* Profile Photo */}
      {/* ------------------------------------------------ */}

      <AdminSection
        title="Profile Photo"
        subtitle="Upload, preview and remove your profile picture."
      >

        <ProfilePhotoCard>

          <div className="flex flex-col items-center py-12">

            <Image className="w-16 h-16 text-brand-green mb-6" />

            <h3 className="text-xl font-bold text-white">

              Profile Photo

            </h3>

            <p className="text-slate-400 mt-3 text-center max-w-md">

              Upload a new profile picture or remove your existing one.
              Cloudinary is used for secure image storage.

            </p>

          </div>

        </ProfilePhotoCard>

      </AdminSection>

    </div>

  );

}