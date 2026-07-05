import AdminCard from './AdminCard';

interface Stat {

  title: string;

  value: number | string;

  color?: string;
}

interface Props {

  stats: Stat[];
}

export default function AdminStatistics({

  stats,

}: Props) {

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">

      {stats.map((stat) => (

        <AdminCard key={stat.title}>

          <p className="text-xs uppercase tracking-wider text-slate-400">

            {stat.title}

          </p>

          <h2
            className={`
              mt-3
              text-3xl
              font-bold
              ${stat.color ?? 'text-white'}
            `}
          >

            {stat.value}

          </h2>

        </AdminCard>

      ))}

    </div>

  );

}