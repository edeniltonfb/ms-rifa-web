import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from 'src/utils/cn'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const base = 'rounded px-4 py-2 font-semibold transition-colors focus:outline-none'
    const variants = {
      default: 'bg-blue-600 text-white hover:bg-blue-700',
      outline: 'border border-gray-300 text-gray-700 hover:bg-gray-100 dark:text-white dark:border-gray-600 dark:hover:bg-gray-800',
    }
    const sizes = {
      sm: 'text-sm',
      md: 'text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
