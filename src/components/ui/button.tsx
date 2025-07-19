import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    let variantClass = 'bg-blue-600 text-white hover:bg-blue-700';
    if (variant === 'outline') {
      variantClass = 'border border-gray-300 bg-white hover:bg-gray-50';
    } else if (variant === 'ghost') {
      variantClass = 'hover:bg-gray-100';
    } else if (variant === 'destructive') {
      variantClass = 'bg-red-600 text-white hover:bg-red-700';
    }
    
    let sizeClass = 'h-10 px-4 py-2';
    if (size === 'sm') {
      sizeClass = 'h-9 rounded-md px-3';
    } else if (size === 'lg') {
      sizeClass = 'h-11 rounded-md px-8';
    }

    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    return (
      <button
        className={cn(
          baseClasses,
          variantClass,
          sizeClass,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
