'use client'

import Image from 'next/image'
import { Sparkles, Zap } from 'lucide-react'
import { cn } from '@/lib/utils/helpers'
import { useState, useEffect } from 'react'

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
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
        {showAnimation && mounted && (
          <>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-xl animate-pulseGlow" />
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 blur-2xl animate-pulseGlow delay-300" />
          </>
        )}
        
        <div
          className={cn(
            'relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/30',
            showAnimation && 'group-hover:scale-105 transition-transform duration-300',
            sizes.iconContainer
          )}
        >
          <Image
            src="/favicon.png"
            alt="NexGen Affiliates logo"
            width={logoDimensions[size]}
            height={logoDimensions[size]}
            className={cn(
              'h-full w-full object-cover',
              showAnimation && mounted && 'animate-float'
            )}
            priority
          />
        </div>

        {showAnimation && mounted && (
          <>
            <Sparkles className={cn(
              'absolute -top-1 -right-1 text-yellow-400',
              'animate-pulse',
              size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
            )} />
            <Zap className={cn(
              'absolute -bottom-1 -left-1 text-cyan-400',
              'animate-pulse delay-300',
              size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
            )} />
          </>
        )}
      </div>

      {(variant === 'full' || variant === 'compact') && (
        <div className="flex flex-col leading-tight">
          <span
            className={cn(
              'font-bold gradient-text tracking-tight',
              sizes.text,
              showAnimation && 'group-hover:scale-105 transition-transform duration-300'
            )}
          >
            NexGen Affiliates
          </span>
          {variant === 'full' && (
            <span className={cn(
              'text-white/40 font-medium tracking-wider uppercase',
              sizes.subtext
            )}>
              Smart Tracking • Geo Redirect
            </span>
          )}
        </div>
      )}
    </div>
  )
}