import { cn } from '@/utilities/ui'
import * as React from 'react'

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className,
  ...props
}) => {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'flex field-sizing-content min-h-28 w-full rounded-lg border border-input bg-card px-3 py-2 text-base leading-relaxed text-foreground shadow-xs placeholder:text-muted-foreground outline-none transition-[color,border-color,box-shadow] motion-reduce:transition-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/20',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
