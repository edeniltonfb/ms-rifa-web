import { cn } from "src/utils/cn";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                'rounded-lg border border-gray-400 dark:border-gray-800 bg-[#ddd] dark:bg-gray-900 shadow-sm dark:text-white',
                className
            )}
        >
            {children}
        </div>
    )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('p-2', className)}>{children}</div>
}
