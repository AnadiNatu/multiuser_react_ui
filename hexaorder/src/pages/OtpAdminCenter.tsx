import { ShieldCheck, Mail, Smartphone, Phone } from 'lucide-react';

import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Button } from '../components/ui/Button';

import AdminPageHeader from '../components/ui/AdminPageHeader'; 
import AdminStatistics from  '../components/ui/AdminStatistics';
import AdminSection from  '../components/ui/AdminSection';
import AdminCard from  '../components/ui/AdminCard';

export default function OtpAdminCenter() {

  return (

    <div className="space-y-8 page-enter">

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
            label: 'OTP Center',
          },
        ]}
      />

      <AdminPageHeader
        title="OTP Administration Center"
        subtitle="Manage Email, SMS and Phone authentication services."
        icon={ShieldCheck}
        actions={
          <Button variant="outline">

            Refresh

          </Button>
        }
      />

      <AdminStatistics
        stats={[
          {
            title: 'Email OTP',
            value: 'Ready',
            color: 'text-emerald-400',
          },
          {
            title: 'SMS OTP',
            value: 'Ready',
            color: 'text-blue-400',
          },
          {
            title: 'Phone Login',
            value: 'Ready',
            color: 'text-amber-400',
          },
          {
            title: 'Available Services',
            value: 3,
            color: 'text-brand-green',
          },
        ]}
      />

      <AdminSection
        title="OTP Services"
        subtitle="Select an authentication service below."
      >

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          <AdminCard>

            <div className="flex flex-col items-center text-center py-10">

              <Mail className="w-12 h-12 text-brand-green mb-5" />

              <h3 className="text-xl font-bold text-white">

                Email OTP

              </h3>

              <p className="mt-3 text-slate-400">

                Send and verify email one-time passwords.

              </p>

            </div>

          </AdminCard>

          <AdminCard>

            <div className="flex flex-col items-center text-center py-10">

              <Smartphone className="w-12 h-12 text-brand-green mb-5" />

              <h3 className="text-xl font-bold text-white">

                SMS OTP

              </h3>

              <p className="mt-3 text-slate-400">

                Send and verify SMS one-time passwords.

              </p>

            </div>

          </AdminCard>

          <AdminCard>

            <div className="flex flex-col items-center text-center py-10">

              <Phone className="w-12 h-12 text-brand-green mb-5" />

              <h3 className="text-xl font-bold text-white">

                Phone Authentication

              </h3>

              <p className="mt-3 text-slate-400">

                Test phone login authentication.

              </p>

            </div>

          </AdminCard>

        </div>

      </AdminSection>

    </div>

  );

}