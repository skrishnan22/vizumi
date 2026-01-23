import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = 'button';

    const variants = {
      primary:
        'bg-accent text-white shadow-[0_0_20px_-5px_var(--color-accent)] hover:bg-accent/90 hover:shadow-[0_0_25px_-5px_var(--color-accent)] border border-transparent',
      secondary: 'border border-ink/20 text-ink bg-transparent hover:bg-ink/5',
      ghost: 'text-ink/60 hover:text-ink hover:bg-ink/5',
    };

    const sizes = {
      sm: 'h-8 px-4 text-sm',
      md: 'h-12 px-6 text-base',
      lg: 'h-14 px-8 text-lg',
    };

    return (
      <Comp
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
