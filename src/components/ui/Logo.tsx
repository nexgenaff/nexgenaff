'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils/helpers'

interface LogoProps {
  variant?: 'full' | 'icon' | 'compact'
  className?: string
  showAnimation?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onClick?: () => void
}

export function Logo({
  variant = 'full',
  className,
  showAnimation = true,
  size = 'md',
  onClick,
}: LogoProps) {
  const sizeClasses = {
    sm: {
      container: 'gap-1.5',
      iconContainer: 'w-8 h-8',
      icon: 'w-4 h-4',
      badge: 'w-2 h-2',
      text: 'text-sm',
      subtext: 'text-[8px]',
    },
    md: {
      container: 'gap-2',
      iconContainer: 'w-10 h-10',
      icon: 'w-5 h-5',
      badge: 'w-2.5 h-2.5',
      text: 'text-base',
      subtext: 'text-[10px]',
    },
    lg: {
      container: 'gap-2.5',
      iconContainer: 'w-12 h-12',
      icon: 'w-6 h-6',
      badge: 'w-3 h-3',
      text: 'text-xl',
      subtext: 'text-xs',
    },
    xl: {
      container: 'gap-3',
      iconContainer: 'w-16 h-16',
      icon: 'w-8 h-8',
      badge: 'w-3.5 h-3.5',
      text: 'text-3xl',
      subtext: 'text-sm',
    },
  }

  const sizes = sizeClasses[size]
  const logoDimensions = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  }

  return (
    <div
      className={cn(
        'flex items-center cursor-pointer select-none group',
        sizes.container,
        className
      )}
      onClick={onClick}
    >
      <div className="relative flex-shrink-0">
        <div
          className={cn(
            'relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30',
            sizes.iconContainer
          )}
        >
          <Image
            src="/favicon.png"
            alt="NexGen Affiliates logo"
            width={logoDimensions[size]}
            height={logoDimensions[size]}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </div>

      {(variant === 'full' || variant === 'compact') && (
        <div className="flex flex-col leading-tight">
          <span className={cn('font-bold gradient-text tracking-tight', sizes.text)}>
            NexGen Affiliates
          </span>
          {variant === 'full' && (
            <span className={cn('text-white/40 font-medium tracking-wider uppercase', sizes.subtext)}>
              Smart Tracking • Geo Redirect
            </span>
          )}
        </div>
      )}
    </div>
  )
}