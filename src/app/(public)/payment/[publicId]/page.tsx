'use client'

import { use, useEffect, type FormEvent, useState } from 'react'
import { ArrowLeft, Banknote, LockKeyhole, ShieldCheck } from 'lucide-react'

interface PaymentProfile {
  accountName: string
  payoutMethod: string
  payoutAccount: string
  qualifiedClicks: number
  clickRate: number
  totalEarning: number
  invoices?: Array<{
    invoiceNumber: string
    totalEarning: number
    payoutMethod: string | null
    payoutAccount: string | null
    paymentReference: string | null
    isPaid: boolean
    createdAt: string
    paidAt: string | null
  }>
}

export default function PaymentPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params)
  const [password, setPassword] = useState('')
  const [profile, setProfile] = useState<PaymentProfile | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [payoutMethod, setPayoutMethod] = useState('BKASH')
  const [payoutAccount, setPayoutAccount] = useState('')
  const [saved, setSaved] = useState('')
  const [setupRequired, setSetupRequired] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadPaymentStatus = async () => {
      try {
        const response = await fetch(`/api/payment/${publicId}`)
        const data = await response.json().catch(() => ({}))
        if (!active) return
        if (!response.ok) {
          throw new Error(data.error || 'Unable to check payment profile')
        }
        setSetupRequired(Boolean(data.setupRequired))
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Unable to check payment profile')
      } finally {
        if (active) setStatusLoading(false)
      }
    }
    loadPaymentStatus()
    return () => {
      active = false
    }
  }, [publicId])

  const unlockProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`/api/payment/${publicId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setupRequired ? { password, payoutMethod, payoutAccount } : { password }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('This public payment profile does not exist yet. Create a public link first.')
        }
        if (response.status === 409) {
          setSetupRequired(true)
          throw new Error('This payment profile is not configured yet. Set your asset password and add your payment method to continue.')
        }
        if (response.status === 401) {
          throw new Error('Incorrect payment access password. Please try again.')
        }
        throw new Error(data.error || 'Unable to unlock payment profile')
      }
      setProfile(data)
      setPayoutMethod(data.payoutMethod || 'BKASH')
      setPayoutAccount(data.payoutAccount || '')
      setSaved(setupRequired ? 'Payment details saved successfully.' : '')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to unlock payment profile')
    } finally {
      setLoading(false)
    }
  }

  const savePaymentMethod = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSaved('')
    try {
      const response = await fetch(`/api/payment/${publicId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, payoutMethod, payoutAccount }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('This public payment profile does not exist yet. Create a public link first.')
        }
        if (response.status === 401) {
          throw new Error('Incorrect payment access password. Please try again.')
        }
        throw new Error(data.error || 'Unable to save payment method')
      }
      setProfile(data)
      setSaved('Payment method updated successfully.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save payment method')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-white sm:px-6">
      <div className="mx-auto max-w-xl">
        <a href={`/stats/${publicId}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to public stats
        </a>
        <section className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-2xl">
          <div className="border-b border-white/10 bg-white/[0.03] px-6 py-5 sm:px-8 sm:py-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"><Banknote className="h-5 w-5" /></div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-300/70">Payout settings</p>
                <h1 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{profile ? 'Edit payment method' : setupRequired ? 'Set up payment details' : 'Payment details'}</h1>
                <p className="mt-1.5 text-sm leading-5 text-slate-400">{profile ? 'Update where your earnings are sent.' : setupRequired ? 'Choose a payment method and secure it with an asset password.' : 'Verify your asset password to manage payment details.'}</p>
              </div>
            </div>
          </div>

          {statusLoading ? (
            <div className="p-6 text-sm text-slate-400 sm:p-8">Checking payment settings...</div>
          ) : !profile ? (
            <form onSubmit={unlockProfile} className="p-6 sm:p-8">
              {setupRequired && <div className="space-y-3">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Select payment method</label>
                    <select value={payoutMethod} onChange={(event) => setPayoutMethod(event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white"><option value="BKASH">bKash</option><option value="BINANCE">Binance</option></select>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">Payment account</label>
                    <input value={payoutAccount} onChange={(event) => setPayoutAccount(event.target.value)} required placeholder={payoutMethod === 'BINANCE' ? 'Enter your Binance ID' : 'Enter your bKash number'} className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white placeholder:text-slate-600" />
                  </div>
                </div>}
              <label htmlFor="payment-password" className="mb-2 block text-sm font-medium text-slate-300">{setupRequired ? 'Set asset password' : 'Enter your asset password'}</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input id="payment-password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder={setupRequired ? 'Create an asset password' : 'Enter your asset password'} className="w-full rounded-lg border border-white/10 bg-slate-950/70 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50" />
              </div>
              {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
              <button type="submit" disabled={loading} className="mt-5 w-full rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60">{loading ? 'Verifying...' : setupRequired ? 'Save' : 'Continue'}</button>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="h-3.5 w-3.5" /> Payment changes are protected by your asset password.</p>
            </form>
          ) : (
            <form onSubmit={savePaymentMethod} className="p-6 sm:p-8">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{profile.accountName}</p>
              <div className="mt-5 space-y-4">
                <div><label htmlFor="payment-method" className="mb-2 block text-sm font-medium text-slate-300">Select payment method</label><select id="payment-method" value={payoutMethod} onChange={(event) => setPayoutMethod(event.target.value)} className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none focus:border-emerald-400/50"><option value="BKASH">bKash</option><option value="BINANCE">Binance</option></select></div>
                <div><label htmlFor="payment-account" className="mb-2 block text-sm font-medium text-slate-300">Payment account</label><input id="payment-account" value={payoutAccount} onChange={(event) => setPayoutAccount(event.target.value)} required placeholder={payoutMethod === 'BINANCE' ? 'Enter your Binance ID' : 'Enter your bKash number'} className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-emerald-400/50" /></div>
              </div>
              {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
              {saved && <p className="mt-3 text-sm text-emerald-300">{saved}</p>}
              <button type="submit" disabled={loading} className="mt-5 w-full rounded-lg bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60">{loading ? 'Saving...' : 'Save'}</button>
              <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500"><ShieldCheck className="h-3.5 w-3.5" /> Your asset password protects these changes.</p>
              {profile.invoices?.length ? (
                <div className="mt-8 border-t border-white/10 pt-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-slate-200">Payment history</h2>
                    <span className="text-xs text-slate-500">{profile.invoices.length} records</span>
                  </div>
                  <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                    {profile.invoices.map((invoice) => (
                      <div key={invoice.invoiceNumber} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="truncate font-mono text-[10px] text-slate-400">{invoice.invoiceNumber}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                          <p className="mt-1 truncate text-[11px] text-slate-400">
                            {invoice.payoutMethod === 'BKASH' ? 'bKash' : invoice.payoutMethod === 'BINANCE' ? 'Binance' : 'Payment method not recorded'}
                            {invoice.payoutAccount ? ` · ${invoice.payoutAccount}` : ''}
                          </p>
                          {invoice.isPaid && invoice.paymentReference && (
                            <p className="mt-1 truncate text-[11px] text-emerald-300/80">
                              {invoice.payoutMethod === 'BKASH' ? 'bKash transaction ID' : 'Binance order ID'}: {invoice.paymentReference}
                            </p>
                          )}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-sm font-bold text-emerald-300">${Number(invoice.totalEarning || 0).toFixed(2)}</p>
                          <p className={`mt-1 text-[10px] font-medium ${invoice.isPaid ? 'text-slate-500' : 'text-amber-300'}`}>{invoice.isPaid ? 'Paid' : 'Unpaid'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
