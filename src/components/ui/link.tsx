import Link from 'next/link'
import { AnchorHTMLAttributes, forwardRef } from 'react'
import { cn } from 'src/utils/cn'

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'default' | 'outline'
  size?: 'sm' | 'md'
  href: string
}

export const CustomLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant = 'default', size = 'md', href, ...props }, ref) => {
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
      <Link
        href={href}
        className={cn(base, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    )
  }
)

CustomLink.displayName = 'CustomLink'