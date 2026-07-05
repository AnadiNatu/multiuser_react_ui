import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function AdminSection({
  title,
  subtitle,
  children,
}: Props) {
  return (
    <section className="mb-8">

      <div className="mb-4">

        <h2 className="text-xl font-semibold text-white">

          {title}

        </h2>

        {subtitle && (

          <p className="text-slate-400 text-sm mt-1">

            {subtitle}

          </p>

        )}

      </div>

      {children}

    </section>
  );
}