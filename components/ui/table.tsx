import { ReactNode } from "react";
import { cn } from "@/lib/utils";

function Table({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <div className="relative w-full overflow-auto">
      <table
        className={cn("w-full text-sm text-left text-slate-700", className)}
        {...props}
      >
        {children}
      </table>
    </div>
  );
}

function TableHeader({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <thead className={cn("text-xs text-slate-600 uppercase border-b", className)} {...props}>
      {children}
    </thead>
  );
}

function TableBody({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <tbody className={cn("divide-y", className)} {...props}>
      {children}
    </tbody>
  );
}

function TableRow({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <tr className={cn("hover:bg-slate-50", className)} {...props}>
      {children}
    </tr>
  );
}

function TableHead({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <th className={cn("px-3 py-2 text-left align-top", className)} {...props}>
      {children}
    </th>
  );
}

function TableCell({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <td className={cn("px-3 py-2 align-top", className)} {...props}>
      {children}
    </td>
  );
}

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
