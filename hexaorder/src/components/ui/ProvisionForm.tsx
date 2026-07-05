import { Mail, UserPlus } from 'lucide-react';

import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export interface RoleOption {
  value: string;
  label: string;
}

interface Props {

  form: any;

  setForm: React.Dispatch<React.SetStateAction<any>>;

  creating: boolean;

  createMsg:
    | {
        type: 'success' | 'error';
        text: string;
      }
    | null;

  clearMessage: () => void;

  roleOptions: RoleOption[];

  submitLabel?: string;

  onSubmit: (e: React.FormEvent) => void;
}

export default function ProvisionForm({

  form,

  setForm,

  creating,

  createMsg,

  clearMessage,

  roleOptions,

  submitLabel = 'Create & Invite',

  onSubmit,

}: Props) {

  return (

    <form
      onSubmit={onSubmit}
      className="space-y-6"
    >

      {createMsg && (

        <Alert
          variant={createMsg.type}
          dismissible
          onDismiss={clearMessage}
        >

          {createMsg.text}

        </Alert>

      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <Input
          label="First Name"
          value={form.fname}
          onChange={(e) =>
            setForm({
              ...form,
              fname: e.target.value,
            })
          }
          required
        />

        <Input
          label="Last Name"
          value={form.lname}
          onChange={(e) =>
            setForm({
              ...form,
              lname: e.target.value,
            })
          }
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm({
              ...form,
              email: e.target.value,
            })
          }
          leftIcon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Temporary Password"
          type="password"
          value={form.password}
          onChange={(e) =>
            setForm({
              ...form,
              password: e.target.value,
            })
          }
          required
        />

        <Input
          label="Phone Number"
          value={form.phoneNumber}
          onChange={(e) =>
            setForm({
              ...form,
              phoneNumber: e.target.value,
            })
          }
        />

        <div>

          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">

            Role

          </label>

          <select

            value={form.role}

            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }

            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm"

          >

            {roleOptions.map((role) => (

              <option
                key={role.value}
                value={role.value}
              >

                {role.label}

              </option>

            ))}

          </select>

        </div>

      </div>

      <div className="flex justify-end">

        <Button
          type="submit"
          leftIcon={<UserPlus className="w-4 h-4" />}
          isLoading={creating}
        >

          {submitLabel}

        </Button>

      </div>

    </form>

  );

}