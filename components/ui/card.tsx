import { ReactNode } from "react";
import { cn } from "@/lib/utils";

function Card({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white/90 text-slate-950 shadow-sm",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CardHeader({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-4", className)} {...props}>
      {children}
    </div>
  );
}

function CardTitle({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

function CardDescription({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <p className={cn("text-sm text-slate-600", className)} {...props}>
      {children}
    </p>
  );
}

function CardContent({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <div className={cn("p-4 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

function CardFooter({ className, children, ...props }: { className?: string; children: ReactNode; [key: string]: unknown }) {
  return (
    <div className={cn("flex items-center p-4 pt-0", className)} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
