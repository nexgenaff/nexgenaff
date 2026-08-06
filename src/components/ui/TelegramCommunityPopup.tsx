'use client'

import { X } from 'lucide-react'

interface TelegramCommunityPopupProps {
  onClose: () => void
}

export default function TelegramCommunityPopup({ onClose }: TelegramCommunityPopupProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex justify-center bg-black/70 px-4 pt-4 pb-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative mt-2 w-full max-w-[500px] rounded-[32px] border border-cyan-400/20 bg-[linear-gradient(145deg,#1a1a2e,#16213e)] p-8 shadow-[0_35px_100px_rgba(0,0,0,0.75)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close popup"
          className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/10 text-slate-300 transition-all hover:-rotate-90 hover:bg-white/20 hover:text-white"
        >
          <X className="h-4.5 w-4.5" />
        </button>

        <div className="mb-6 flex justify-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0088cc,#005f8a)] shadow-[0_16px_50px_rgba(0,136,204,0.45)]">
            <svg viewBox="0 0 24 24" className="h-11 w-11 fill-white">
              <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </div>
        </div>

        <h2 className="mb-3 text-center text-[28px] font-semibold tracking-[-0.3px] text-white">
          Join <span className="bg-[linear-gradient(135deg,#0088cc,#00b4ff)] bg-clip-text text-transparent">Afficixo</span> Community
        </h2>

        <p className="mb-1 text-center text-[15px] leading-7 text-slate-400">
          Get <span className="font-semibold text-slate-200">weekly reports</span>, <span className="font-semibold text-slate-200">payment updates</span> and <span className="font-semibold text-slate-200">direct support</span>
        </p>

        <div className="mt-7 grid grid-cols-2 gap-2.5">
          {[
            { icon: '📊', title: 'Weekly Reports', subtitle: 'Detailed analytics' },
            { icon: '💰', title: 'Payment Updates', subtitle: 'Earnings & payouts' },
            { icon: '💬', title: 'Direct Support', subtitle: '24/7 help & guidance' },
            { icon: '🚀', title: 'Exclusive Updates', subtitle: 'New features & offers' },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-white/10 p-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-sm">
                {item.icon}
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-200">{item.title}</div>
                <div className="text-[10px] text-slate-400">{item.subtitle}</div>
              </div>
            </div>
          ))}
        </div>

        <a
          href="https://t.me/afficixo"
          target="_blank"
          rel="noopener noreferrer"
          className="relative mt-7 flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#0088cc,#006699)] px-4 py-4 text-[15px] font-semibold text-white shadow-[0_10px_35px_rgba(0,136,204,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#0099dd,#0077aa)] hover:shadow-[0_14px_45px_rgba(0,136,204,0.45)]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
          Join Telegram Channel
          <span className="text-base">→</span>
        </a>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
