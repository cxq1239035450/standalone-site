import { cn } from '@/utilities/ui'
import * as React from 'react'

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  type,
  ...props
}) => {
  return (
    <input
      data-slot="input"
      className={cn(
        'flex h-11 w-full min-w-0 rounded-lg border border-input bg-card px-3 py-2 text-base text-foreground shadow-xs placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium outline-none transition-[color,border-color,box-shadow] motion-reduce:transition-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20',
        className,
      )}
      type={type}
      {...props}
    />
  )
}

export { Input }
