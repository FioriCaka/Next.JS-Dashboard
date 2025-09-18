'use client';
type Column<T> = {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
};

type Props<T> = { columns: Column<T>[]; rows: T[] };

export default function DataTable<T extends { id?: string | number }>({ columns, rows }: Props<T>) {
  return (
    <div className="card overflow-hidden">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-slate-600 border-b">
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)} className="px-3 py-2 font-medium">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, idx) => (
            <tr key={(row as any).id ?? idx} className="hover:bg-slate-50">
              {columns.map((c) => (
                <td key={String(c.key)} className="px-3 py-2">
                  {c.render ? c.render(row) : String(row[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
