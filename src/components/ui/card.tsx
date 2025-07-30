import { cn } from "src/utils/cn";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div
            className={cn(
                'rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm',
                className
            )}
        >
            {children}
        </div>
    )
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return <div className={cn('p-4', className)}>{children}</div>
}
