import { ReactNode, useMemo, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Alert } from '../ui/Alert';
import { Table } from '../ui/Table';
import { div } from 'framer-motion/client';
import { T } from 'node_modules/vitest/dist/chunks/traces.d.402V_yFI';
import ActionToolbar from './ActionToolBar';

export interface PendingTableItem {

  id: number;

  name: string;

  email: string;

  role: string;

  emailVerified: boolean;

  createdByAdmin: string;
}

interface Props<T extends PendingTableItem> {

  title?: string;

  data: T[];

  columns: any[];

  onApprove?:(user:T)=>void;

onResetPassword?:(user:T)=>void;

  loading?: boolean;

  error?: string;

  emptyMessage: string;

  keyExtractor: (item: T) => string;

  onRefresh?: () => void;

  refreshLoading?: boolean;

  onBulkApprove?: (ids: number[]) => void;
}

export default function PendingUsersTable<T extends PendingTableItem>({
  data,
  columns,
  loading = false,
  error,
  emptyMessage,
  keyExtractor,
  onRefresh,
  refreshLoading = false,
}: Props<T>) {

  const [search, setSearch] = useState('');

const [selected, setSelected] = useState<number[]>([]);

  const filtered = useMemo(() => {

    const query = search.toLowerCase().trim();   

    if (!query) return data;

    return data.filter((user) => {

      return (

        user.name.toLowerCase().includes(query)

        ||

        user.email.toLowerCase().includes(query)

        ||

        user.role.toLowerCase().includes(query)

      );

    });

  }, [data, search]);

  const exportCsv = () => {
  const rows = [
    ['Name', 'Email', 'Role'],
    ...filtered.map((u) => [
      u.name,
      u.email,
      u.role,
    ]),
  ];

  const csv = rows.map((r) => r.join(',')).join('\n');

  const blob = new Blob([csv], {
    type: 'text/csv',
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;
  a.download = 'pending-users.csv';

  a.click();

  URL.revokeObjectURL(url);
};

  const allSelected =
    filtered.length > 0 &&
    filtered.every(u => selected.includes(u.id));

const toggleAll = () => {

    if (allSelected){

        setSelected([]);

    }else{

        setSelected(filtered.map(u=>u.id));

    }

};

const toggleOne = (id:number)=>{

    setSelected(prev=>{

        if(prev.includes(id)){

            return prev.filter(x=>x!==id);

        }

        return [...prev,id];

    });

};

    function onBulkApprove(arg0: undefined[]): void {
        throw new Error('Function not implemented.');
    }

  return (

    <div className="space-y-5">

      <ActionToolbar
  left={
    <Input
      placeholder="Search by name, email or role..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      leftIcon={<Search className="w-4 h-4" />}
    />
  }
  right={
    <div className="flex flex-wrap gap-3">

      <Button
        variant="outline"
        onClick={exportCsv}
      >
        Export CSV
      </Button>

      {onRefresh && (
        <Button
          variant="outline"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={onRefresh}
          isLoading={refreshLoading}
        >
          Refresh
        </Button>
      )}

      {onBulkApprove && (
        <Button
          onClick={() => onBulkApprove([])}
        >
          Bulk Approve
        </Button>
      )}

    </div>
  }
/>
        <Input
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />

        {onRefresh && (

          <Button
            variant="outline"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={onRefresh}
            isLoading={refreshLoading}
          >

            Refresh

          </Button>

        )}
      {error && (

        <Alert variant="error">

          {error}

        </Alert>

      )}

      <Table<T>

        data={filtered}

        columns={columns}

        keyExtractor={keyExtractor}

        emptyMessage={emptyMessage}

        hoverable

        loading={loading}

      />

    </div>

  );

}