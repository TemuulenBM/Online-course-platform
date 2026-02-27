'use client';

interface UsersFilterBarProps {
  roleFilter: string | undefined;
  emailVerifiedFilter: boolean | undefined;
  onRoleFilterChange: (value: string | undefined) => void;
  onEmailVerifiedFilterChange: (value: boolean | undefined) => void;
  onClearFilters: () => void;
}

const selectStyle =
  'bg-[#f6f5f8] border-none rounded-lg text-sm px-4 py-2 focus:ring-2 focus:ring-[#9c7aff]/50 outline-none';

export function UsersFilterBar({
  roleFilter,
  emailVerifiedFilter,
  onRoleFilterChange,
  onEmailVerifiedFilterChange,
  onClearFilters,
}: UsersFilterBarProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-[#9c7aff]/10 flex flex-wrap gap-4 items-center mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-500">Эрх:</span>
        <select
          value={roleFilter ?? ''}
          onChange={(e) => onRoleFilterChange(e.target.value || undefined)}
          className={selectStyle}
        >
          <option value="">Бүгд</option>
          <option value="STUDENT">STUDENT</option>
          <option value="TEACHER">TEACHER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-500">Төлөв:</span>
        <select
          value={emailVerifiedFilter === undefined ? '' : emailVerifiedFilter ? 'true' : 'false'}
          onChange={(e) => {
            const val = e.target.value;
            onEmailVerifiedFilterChange(val === '' ? undefined : val === 'true');
          }}
          className={selectStyle}
        >
          <option value="">Бүгд</option>
          <option value="true">Баталгаажсан</option>
          <option value="false">Баталгаажаагүй</option>
        </select>
      </div>

      <button
        onClick={onClearFilters}
        className="ml-auto text-[#9c7aff] text-sm font-medium hover:underline"
      >
        Шүүлтүүр цэвэрлэх
      </button>
    </div>
  );
}
