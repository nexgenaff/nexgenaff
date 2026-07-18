'use client'

import Image from 'next/image'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Plus,
  Edit,
  Trash2,
  Check,
  X,
  Power,
  PowerOff,
  Sparkles,
  ShieldCheck,
  MapPinned,
  Flag,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react'
import { coerceArray } from '@/lib/utils/array-response'

interface Offer {
  id: string
  country: string
  groupName: string | null
  offerUrl: string
  isActive: boolean
  isGlobal: boolean
  priority: number
  rotationMode: 'PRIORITY' | 'RANDOM'
}

interface ConfirmDialogState {
  title: string
  message: string
  confirmLabel: string
  tone: 'danger' | 'warning'
  onConfirm: () => Promise<void> | void
}

const getFlagImageUrl = (code: string) => {
  if (!code || code === 'GLOBAL') return 'https://flagcdn.com/w40/gb.png'

  const normalized = code.toUpperCase()
  if (normalized.length !== 2) return 'https://flagcdn.com/w40/gb.png'

  return `https://flagcdn.com/w40/${normalized.toLowerCase()}.png`
}

const normalizeGroupName = (value?: string | null) => value?.trim() ?? ''
const normalizeCountryCode = (value?: string | null) => value?.trim().toUpperCase() ?? ''
const buildGroupKey = (offer: Offer) => {
  const groupName = normalizeGroupName(offer.groupName)
  if (groupName) return groupName
  if (offer.isGlobal) return 'GLOBAL'
  return normalizeCountryCode(offer.country)
}
const getPoolLabel = (groupKey: string, groupOffers: Offer[]) => {
  const namedPool = normalizeGroupName(groupOffers[0]?.groupName)
  if (namedPool) return namedPool
  return groupKey === 'GLOBAL' ? 'Global Smart Link' : groupKey
}
const getPoolCountries = (groupOffers: Offer[]) =>
  Array.from(
    new Set(
      groupOffers.map((offer) => (offer.isGlobal ? 'GLOBAL SMART LINK' : normalizeCountryCode(offer.country)))
    )
  ).sort((a, b) => a.localeCompare(b))

const countryOptions = [
  { code: 'GLOBAL', name: 'Global Smart Link (Fallback for all countries)' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia and Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'Congo (DRC)' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CI', name: 'Côte d’Ivoire' },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GR', name: 'Greece' },
  { code: 'GL', name: 'Greenland' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KP', name: 'North Korea' },
  { code: 'KR', name: 'South Korea' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'São Tomé and Príncipe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
]

const rotationModeOptions = [
  { value: 'PRIORITY', label: 'Priority winner' },
  { value: 'RANDOM', label: 'Random rotation' },
]

const DRAFT_GROUP_STORAGE_KEY = 'offer-vault-draft-groups'

export default function OffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    country: '',
    groupName: '',
    offerUrl: '',
    isGlobal: false,
    priority: 100,
    rotationMode: 'PRIORITY' as 'PRIORITY' | 'RANDOM',
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [isGroupCreatorOpen, setIsGroupCreatorOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [isQuickGroupOpen, setIsQuickGroupOpen] = useState(false)
  const [quickGroupName, setQuickGroupName] = useState('')
  const [draftGroupNames, setDraftGroupNames] = useState<string[]>([])
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)
  const countryPickerRef = useRef<HTMLDivElement | null>(null)

  const fetchOffers = useCallback(async () => {
    try {
      const response = await fetch('/api/offers', { credentials: 'include' })
      if (response.status === 401) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setOffers(coerceArray<Offer>(data))
    } catch (error) {
      console.error('Failed to fetch offers:', error)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void fetchOffers()
  }, [fetchOffers])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const savedDraftGroups = window.localStorage.getItem(DRAFT_GROUP_STORAGE_KEY)
    if (!savedDraftGroups) return

    try {
      const parsed = JSON.parse(savedDraftGroups) as string[]
      if (Array.isArray(parsed)) {
        setDraftGroupNames(parsed.filter((value): value is string => Boolean(value.trim())))
      }
    } catch (error) {
      console.error('Failed to load draft group names:', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    window.localStorage.setItem(DRAFT_GROUP_STORAGE_KEY, JSON.stringify(draftGroupNames))
  }, [draftGroupNames])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryPickerRef.current && !countryPickerRef.current.contains(event.target as Node)) {
        setIsCountryMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const activeOffers = offers.filter((offer) => offer.isActive).length
  const globalOffers = offers.filter((offer) => offer.isGlobal).length
  const regionalOffers = offers.length - globalOffers
  const vaultScore = Math.min(100, Math.round((activeOffers / Math.max(offers.length, 1)) * 100))

  const groupedOffers = Array.from(
    offers.reduce((groups, offer) => {
      const key = buildGroupKey(offer)
      const current = groups.get(key) ?? []
      current.push(offer)
      groups.set(key, current)
      return groups
    }, new Map<string, Offer[]>())
  ).sort((a, b) => {
    const aIsGlobal = a[0] === 'GLOBAL'
    const bIsGlobal = b[0] === 'GLOBAL'

    if (aIsGlobal !== bIsGlobal) return aIsGlobal ? -1 : 1
    return getPoolLabel(a[0], a[1]).localeCompare(getPoolLabel(b[0], b[1]))
  })

  const availableGroupNames = Array.from(
    new Set([
      ...offers
        .map((offer) => normalizeGroupName(offer.groupName))
        .filter((value): value is string => Boolean(value)),
      ...draftGroupNames,
    ])
  ).sort((a, b) => a.localeCompare(b))

  const groupSummaries = availableGroupNames.map((groupName) => {
    const groupOffers = offers.filter((offer) => normalizeGroupName(offer.groupName) === groupName)

    return {
      groupName,
      groupOffers,
      poolCountries: getPoolCountries(groupOffers),
    }
  })

  const geoPoolCount = groupSummaries.length
  const activeGroupName = normalizeGroupName(formData.groupName)
  const selectedGroupOffers = activeGroupName
    ? offers.filter((offer) => normalizeGroupName(offer.groupName) === activeGroupName)
    : []
  const selectedGroupCountries = Array.from(
    new Set(
      selectedGroupOffers.map((offer) =>
        offer.isGlobal ? 'GLOBAL' : normalizeCountryCode(offer.country)
      )
    )
  )

  const selectedCountry = countryOptions.find((country) => country.code === formData.country)
  const normalizedCountrySearch = countrySearch.trim().toLowerCase()
  const filteredCountryOptions = countryOptions.filter((country) => {
    if (!normalizedCountrySearch) return true

    const haystack = `${country.code} ${country.name}`.toLowerCase()
    return haystack.includes(normalizedCountrySearch)
  })

  const handleCountrySelect = (countryCode: string) => {
    setFormData((current) => ({
      ...current,
      country: countryCode,
      isGlobal: countryCode === 'GLOBAL',
    }))
    setCountrySearch('')
    setIsCountryMenuOpen(false)
  }

  const openOfferForm = (groupName = '') => {
    setShowForm(true)
    setEditingId(null)
    setFormError('')
    setIsGroupCreatorOpen(false)
    setNewGroupName('')
    setFormData({
      country: '',
      groupName,
      offerUrl: '',
      isGlobal: false,
      priority: 100,
      rotationMode: 'PRIORITY',
    })
  }

  const selectGroup = (groupName: string) => {
    setFormData((current) => ({
      ...current,
      groupName,
    }))
    setIsGroupCreatorOpen(false)
    setNewGroupName('')
  }

  const createGroup = () => {
    const trimmedGroup = newGroupName.trim()
    if (!trimmedGroup) return

    setDraftGroupNames((current) => Array.from(new Set([...current, trimmedGroup])))
    selectGroup(trimmedGroup)
  }

  const createQuickGroup = () => {
    const trimmedGroup = quickGroupName.trim()
    if (!trimmedGroup) return

    setDraftGroupNames((current) => {
      const nextGroups = Array.from(new Set([...current, trimmedGroup]))
      return nextGroups
    })
    setQuickGroupName('')
    setIsQuickGroupOpen(false)
    setEditingId(null)
    setFormError('')
    setShowForm(false)
  }

  const applyGroupNameToOffers = async (groupName: string, nextGroupName: string | null) => {
    const affectedOffers = offers.filter((offer) => normalizeGroupName(offer.groupName) === groupName)

    await Promise.all(
      affectedOffers.map(async (offer) => {
        const response = await fetch(`/api/offers/${offer.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: offer.country,
            groupName: nextGroupName ?? '',
            offerUrl: offer.offerUrl,
            isActive: offer.isActive,
            isGlobal: offer.isGlobal,
            priority: offer.priority ?? 100,
            rotationMode: offer.rotationMode ?? 'PRIORITY',
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to update group membership')
        }
      })
    )

    await fetchOffers()
  }

  const renameGroup = async (currentGroupName: string) => {
    const nextGroupName = window.prompt('Rename group', currentGroupName)?.trim()
    if (!nextGroupName || nextGroupName === currentGroupName) return

    try {
      await applyGroupNameToOffers(currentGroupName, nextGroupName)
      setDraftGroupNames((current) => {
        const nextGroups = current.filter((name) => name !== currentGroupName)
        return Array.from(new Set([...nextGroups, nextGroupName]))
      })
    } catch (error) {
      console.error('Failed to rename group:', error)
    }
  }

  const deleteGroup = async (groupName: string) => {
    setConfirmDialog({
      title: 'Remove this offer pool?',
      message: `This will detach all offers currently assigned to “${groupName}” and clear the group association.`,
      confirmLabel: 'Remove pool',
      tone: 'warning',
      onConfirm: async () => {
        try {
          await applyGroupNameToOffers(groupName, null)
          setDraftGroupNames((current) => current.filter((name) => name !== groupName))
        } catch (error) {
          console.error('Failed to delete group:', error)
        }
      },
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    try {
      const url = editingId ? `/api/offers/${editingId}` : '/api/offers'
      const method = editingId ? 'PUT' : 'POST'

      const priorityValue = Number(formData.priority)
      const payload = {
        country: formData.isGlobal ? 'GLOBAL' : formData.country,
        groupName: formData.groupName.trim(),
        offerUrl: formData.offerUrl.trim(),
        isGlobal: formData.isGlobal,
        priority: Number.isFinite(priorityValue) ? Math.max(1, Math.min(999, priorityValue)) : 100,
        rotationMode: formData.rotationMode === 'RANDOM' ? 'RANDOM' : 'PRIORITY',
      }

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to save offer')
      }

      setShowForm(false)
      setEditingId(null)
      setIsGroupCreatorOpen(false)
      setNewGroupName('')
      setFormData({ country: '', groupName: '', offerUrl: '', isGlobal: false, priority: 100, rotationMode: 'PRIORITY' })
      await fetchOffers()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setConfirmDialog({
      title: 'Delete this offer?',
      message: 'This will remove the offer from the routing system and its current targeting configuration.',
      confirmLabel: 'Delete offer',
      tone: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/offers/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          })

          if (!response.ok) {
            throw new Error('Failed to delete offer')
          }

          await fetchOffers()
        } catch (error) {
          console.error('Error deleting offer:', error)
        }
      },
    })
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle offer')
      }

      await fetchOffers()
    } catch (error) {
      console.error('Error toggling offer:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="mt-4 animate-pulse text-white/40">Loading offers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {confirmDialog && (
        <div
          className="fixed inset-0 z-[120] bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.2),transparent_35%),rgba(2,6,23,0.94)] backdrop-blur-2xl"
          onClick={() => setConfirmDialog(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="fixed left-1/2 top-1/2 z-[121] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(140deg,rgba(15,23,42,0.98),rgba(2,6,23,0.98))] shadow-[0_40px_110px_rgba(0,0,0,0.7)] ring-1 ring-white/5"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_36%)]" />
            <div className="relative border-b border-white/10 bg-white/[0.06] px-5 py-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${confirmDialog.tone === 'danger' ? 'border-rose-400/30 bg-rose-500/15 text-rose-300 shadow-[0_0_24px_rgba(244,63,94,0.18)]' : 'border-amber-400/30 bg-amber-500/15 text-amber-300 shadow-[0_0_24px_rgba(245,158,11,0.16)]'}`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] ${confirmDialog.tone === 'danger' ? 'border-rose-400/25 bg-rose-500/10 text-rose-200' : 'border-amber-400/25 bg-amber-500/10 text-amber-200'}`}>
                      Secure action
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{confirmDialog.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Please confirm before this change is applied.</p>
                </div>
              </div>
            </div>
            <div className="relative p-5">
              <div className={`rounded-[24px] border p-4 text-sm leading-7 shadow-[0_10px_30px_rgba(0,0,0,0.16)] ${confirmDialog.tone === 'danger' ? 'border-rose-400/20 bg-rose-500/10 text-rose-100/90' : 'border-amber-400/20 bg-amber-500/10 text-amber-100/90'}`}>
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Confirmation
                </div>
                <p>{confirmDialog.message}</p>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setConfirmDialog(null)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white shadow-[0_6px_18px_rgba(0,0,0,0.16)]">
                  Cancel
                </button>
                <button type="button" onClick={() => {
                  setConfirmDialog(null)
                  void confirmDialog.onConfirm()
                }} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(0,0,0,0.3)] transition hover:brightness-110 ${confirmDialog.tone === 'danger' ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-600' : 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600'}`}>
                  {confirmDialog.confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.2),transparent_40%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 backdrop-blur-xl sm:p-7"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" />
              Offer Vault
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Premium geo offer routing</h1>
            <p className="mt-1 text-sm text-white/35">Build smart fallback offers, manage country targeting, and keep your campaigns live without friction.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                setEditingId(null)
                setIsGroupCreatorOpen(false)
                setNewGroupName('')
                setFormError('')
                setIsQuickGroupOpen((current) => !current)
                setQuickGroupName('')
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/15"
            >
              <Plus className="h-4 w-4" />
              Add Group
            </button>
            <button
              onClick={() => {
                if (showForm) {
                  setShowForm(false)
                  setEditingId(null)
                  setIsGroupCreatorOpen(false)
                  setNewGroupName('')
                  setFormData({ country: '', groupName: '', offerUrl: '', isGlobal: false, priority: 100, rotationMode: 'PRIORITY' })
                  setFormError('')
                } else {
                  openOfferForm()
                }
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_40px_rgba(99,102,241,0.35)]"
            >
              {showForm ? (
                <>
                  <X className="h-4 w-4" />
                  Cancel
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Offer
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Active offers</div>
            <div className="mt-2 text-2xl font-semibold text-white">{activeOffers}</div>
            <div className="text-xs text-white/40">Campaigns currently active</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Routing pools</div>
            <div className="mt-2 text-2xl font-semibold text-white">{geoPoolCount}</div>
            <div className="text-xs text-white/40">Named smart-routing groups</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Global fallback</div>
            <div className="mt-2 text-2xl font-semibold text-white">{globalOffers}</div>
            <div className="text-xs text-white/40">Smart-link fallback coverage</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Vault score</div>
            <div className="mt-2 text-2xl font-semibold text-white">{vaultScore}%</div>
            <div className="text-xs text-white/40">Healthy offer coverage</div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence initial={false}>
        {isQuickGroupOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="rounded-3xl border border-cyan-400/20 bg-cyan-500/10 p-5 backdrop-blur-xl"
          >
            <div className="mb-3 flex items-center gap-2 text-cyan-100">
              <Sparkles className="h-4 w-4" />
              <h2 className="text-lg font-semibold text-white">Create group</h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="text"
                value={quickGroupName}
                onChange={(e) => setQuickGroupName(e.target.value)}
                className="form-input flex-1"
                placeholder="Enter a new group name"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={createQuickGroup}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                >
                  <Plus className="h-4 w-4" />
                  Save group
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsQuickGroupOpen(false)
                    setQuickGroupName('')
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-cyan-100/80">Create the group name and keep it available for geo-based offers in the vault.</p>
          </motion.div>
        )}

        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-7"
          >
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit offer' : 'Create offer'}</h2>
            </div>

            <div className="mb-4 grid gap-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-100">
                1. Select or create geo pool
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75">
                2. Choose country or global route
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75">
                3. Save offer URL and priority
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              {formError && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {formError}
                </div>
              )}

              <div>
                <label className="form-label">Country / Smart Link Route</label>
                <div ref={countryPickerRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setCountrySearch('')
                      setIsCountryMenuOpen((current) => !current)
                    }}
                    className="form-select flex items-center justify-between gap-3 text-left"
                    disabled={formLoading}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      {selectedCountry ? (
                        <>
                          <Image
                            src={selectedCountry.code === 'GLOBAL' ? 'https://flagcdn.com/w40/gb.png' : getFlagImageUrl(selectedCountry.code)}
                            alt={`${selectedCountry.code} flag`}
                            width={28}
                            height={20}
                            className="rounded-sm object-cover"
                          />
                          <span className="truncate text-sm font-medium text-white">{selectedCountry.code}</span>
                          <span className="truncate text-xs text-white/45">{selectedCountry.name}</span>
                        </>
                      ) : (
                        <span className="text-sm text-white/45">Select country</span>
                      )}
                    </span>
                    <span className="text-white/50">▾</span>
                  </button>

                  {isCountryMenuOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/95 p-2 shadow-2xl shadow-slate-950/60 backdrop-blur-xl">
                      <div className="sticky top-0 z-10 mb-2 rounded-xl border border-white/10 bg-slate-900/90 p-2 backdrop-blur">
                        <input
                          type="text"
                          value={countrySearch}
                          onChange={(event) => setCountrySearch(event.target.value)}
                          placeholder="Search countries"
                          className="w-full rounded-lg border border-white/10 bg-slate-950/70 px-3 py-2 text-sm text-white outline-none ring-0 placeholder:text-white/35"
                          autoFocus
                        />
                      </div>
                      {filteredCountryOptions.length > 0 ? (
                        filteredCountryOptions.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => handleCountrySelect(country.code)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/5"
                          >
                            <Image
                              src={country.code === 'GLOBAL' ? 'https://flagcdn.com/w40/gb.png' : getFlagImageUrl(country.code)}
                              alt={`${country.code} flag`}
                              width={28}
                              height={20}
                              className="rounded-sm object-cover"
                            />
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-white">{country.code === 'GLOBAL' ? 'GLOBAL' : country.code}</div>
                              <div className="truncate text-xs text-white/45">{country.name}</div>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-white/60">
                          No countries match your search.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-3 rounded-2xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.1),rgba(15,23,42,0.65))] p-3 shadow-[0_12px_40px_rgba(34,211,238,0.08)]">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="form-label mb-0">Routing Pool</label>
                    <button
                      type="button"
                      onClick={() => setIsGroupCreatorOpen((current) => !current)}
                      className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create pool
                    </button>
                  </div>

                  <div className="mt-3 space-y-3">
                    <input
                      type="text"
                      value={formData.groupName}
                      onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                      className="form-input"
                      placeholder="Select a group or type a new one"
                      disabled={formLoading}
                    />

                    {isGroupCreatorOpen && (
                      <div className="flex flex-col gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-3 sm:flex-row">
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          className="form-input flex-1"
                          placeholder="New geo pool name"
                          disabled={formLoading}
                        />
                        <button
                          type="button"
                          onClick={createGroup}
                          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                          <Plus className="h-4 w-4" />
                          Save group
                        </button>
                      </div>
                    )}

                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Selected pool</div>
                          <div className="mt-1 text-sm font-semibold text-white">
                            {activeGroupName || 'No routing pool selected'}
                          </div>
                        </div>
                        <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-200">
                          {selectedGroupOffers.length} offer{selectedGroupOffers.length === 1 ? '' : 's'}
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-white/40">
                        {activeGroupName
                          ? 'This pool is ready to receive your next geo offer.'
                          : 'Create or choose a routing pool first, then attach your next offer to it.'}
                      </div>

                      {selectedGroupCountries.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {selectedGroupCountries.map((country) => (
                            <div key={country} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/75">
                              <Image
                                src={getFlagImageUrl(country === 'GLOBAL' ? 'GLOBAL' : country)}
                                alt={`${country} flag`}
                                width={16}
                                height={16}
                                className="rounded-sm object-cover"
                              />
                              {country === 'GLOBAL' ? 'Global Smart Link' : country}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-white/35">
                      Pick an existing routing pool or create a new one, then attach the offer to that selected smart-link group.
                    </p>

                    {availableGroupNames.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {availableGroupNames.map((groupName) => {
                          const isActive = formData.groupName.trim() === groupName

                          return (
                            <button
                              key={groupName}
                              type="button"
                              onClick={() => selectGroup(groupName)}
                              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                                isActive
                                  ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-100'
                                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                              }`}
                            >
                              {isActive && <Check className="h-3.5 w-3.5" />}
                              {groupName}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <input type="hidden" value={formData.country} required />
                <p className="mt-2 text-xs text-white/45">
                  Add several offers to the same routing pool to create a rotating smart link. Higher-priority offers win first, or the system rotates the pool randomly.
                </p>
                {formData.isGlobal && (
                  <p className="mt-2 text-xs text-cyan-300">This offer will act as the global fallback smart link.</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="form-label">Priority</label>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) || 1 })}
                    className="form-input"
                    disabled={formLoading}
                  />
                </div>

                <div>
                  <label className="form-label">Rotation mode</label>
                  <select
                    value={formData.rotationMode}
                    onChange={(e) => setFormData({ ...formData, rotationMode: e.target.value as 'PRIORITY' | 'RANDOM' })}
                    className="form-select"
                    disabled={formLoading}
                  >
                    {rotationModeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Offer URL</label>
                <input
                  type="url"
                  value={formData.offerUrl}
                  onChange={(e) => setFormData({ ...formData, offerUrl: e.target.value })}
                  className="form-input"
                  placeholder="https://affiliate.com/?s1="
                  required
                  disabled={formLoading}
                />
                <p className="mt-1 text-xs text-white/25">The slug will be automatically appended to this URL.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(79,70,229,0.3)] disabled:opacity-60"
                >
                  {formLoading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      {editingId ? 'Update Offer' : 'Add Offer'}
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setIsGroupCreatorOpen(false)
                    setNewGroupName('')
                    setFormData({ country: '', groupName: '', offerUrl: '', isGlobal: false, priority: 100, rotationMode: 'PRIORITY' })
                    setFormError('')
                  }}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  Close
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-4">
          {groupSummaries.length > 0 && (
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">Routing pools</div>
                  <div className="mt-1 text-sm text-white/55">Create one named pool, then attach geo-specific offers beneath it.</div>
                </div>
                <div className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[11px] text-white/60">
                  {groupSummaries.length} pool{groupSummaries.length === 1 ? '' : 's'}
                </div>
              </div>

              <div className="grid gap-3">
                {groupSummaries.map((group, groupIndex) => (
                  <motion.div
                    key={group.groupName || `draft-pool-${groupIndex}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.04, duration: 0.24, ease: 'easeOut' }}
                    whileHover={{ y: -2 }}
                    className="rounded-2xl border border-white/10 bg-slate-950/55 p-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-white">{group.groupName}</div>
                        <div className="mt-1 text-xs text-white/45">
                          {group.groupOffers.length} offer{group.groupOffers.length === 1 ? '' : 's'} • {group.poolCountries.length} geo target{group.poolCountries.length === 1 ? '' : 's'}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => openOfferForm(group.groupName)}
                          className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add offer to pool
                        </button>
                        <button
                          type="button"
                          onClick={() => renameGroup(group.groupName)}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
                        >
                          Edit name
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteGroup(group.groupName)}
                          className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] font-semibold text-rose-300 transition hover:bg-rose-500/15"
                        >
                          Remove pool
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {offers.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-14 text-center backdrop-blur-xl">
              <div className="mb-4 text-5xl">📦</div>
              <div className="text-xl font-semibold text-white">Your vault is empty</div>
              <p className="mt-2 text-sm text-white/35">Add your first group, then attach geo-based offers inside it.</p>
            </div>
          ) : (
            groupedOffers.map(([groupKey, groupOffers], groupIndex) => {
              const poolLabel = getPoolLabel(groupKey, groupOffers)
              const poolCountries = getPoolCountries(groupOffers)

              return (
                <motion.div
                  key={groupKey}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: groupIndex * 0.04, duration: 0.28, ease: 'easeOut' }}
                  whileHover={{ y: -2 }}
                  className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 backdrop-blur-xl sm:p-5"
                >
                  <div className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10">
                        <MapPinned className="h-4 w-4 text-cyan-300" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">
                          {poolLabel}
                        </div>
                        <div className="text-xs text-white/45">
                          {groupOffers.length} offer{groupOffers.length > 1 ? 's' : ''} • {poolCountries.length} geo target{poolCountries.length > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openOfferForm(normalizeGroupName(groupOffers[0]?.groupName))}
                        className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add offer to pool
                      </button>
                      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                        <RotateCcw className="h-3.5 w-3.5" />
                        {groupOffers.some((offer) => offer.rotationMode === 'RANDOM') ? 'Random aware' : 'Priority driven'}
                      </div>
                      {groupOffers[0]?.groupName && (
                        <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-300">
                          <Sparkles className="h-3.5 w-3.5" />
                          Routing Pool
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {poolCountries.map((country) => (
                      <div key={country} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-[11px] text-white/70">
                        <Image
                          src={getFlagImageUrl(country === 'GLOBAL SMART LINK' ? 'GLOBAL' : country)}
                          alt={`${country} flag`}
                          width={16}
                          height={16}
                          className="rounded-sm border border-white/10 object-cover"
                        />
                        {country}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3">
                  {[...groupOffers]
                    .sort((a, b) => (b.priority ?? 100) - (a.priority ?? 100))
                    .map((offer) => (
                      <div
                        key={offer.id}
                        className="rounded-2xl border border-white/10 bg-slate-950/55 p-3"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-white/80">
                                <Image
                                  src={getFlagImageUrl(offer.country)}
                                  alt={`${offer.country} flag`}
                                  width={16}
                                  height={16}
                                  className="rounded-sm border border-white/10 object-cover"
                                />
                                {offer.isGlobal ? 'Global Smart Link' : offer.country}
                              </div>
                              {offer.groupName && (
                                <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold text-violet-200">
                                  <Sparkles className="h-3.5 w-3.5" />
                                  {offer.groupName}
                                </div>
                              )}
                              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-white/80">
                                <Flag className="h-3.5 w-3.5 text-cyan-300" />
                                Priority {offer.priority ?? 100}
                              </div>
                              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[11px] font-semibold text-violet-300">
                                <RotateCcw className="h-3.5 w-3.5" />
                                {offer.rotationMode === 'RANDOM' ? 'Random rotation' : 'Priority winner'}
                              </div>
                              <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${offer.isActive ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
                                {offer.isActive ? <Power className="h-3 w-3" /> : <PowerOff className="h-3 w-3" />}
                                {offer.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            <p className="mt-3 break-all font-mono text-sm text-white/55">{offer.offerUrl}</p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleToggle(offer.id, offer.isActive)}
                              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${offer.isActive ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/15' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15'}`}
                            >
                              {offer.isActive ? <PowerOff className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
                              {offer.isActive ? 'Disable' : 'Enable'}
                            </button>

                            <button
                              onClick={() => {
                                setFormData({
                                  country: offer.country,
                                  groupName: offer.groupName ?? '',
                                  offerUrl: offer.offerUrl,
                                  isGlobal: offer.isGlobal,
                                  priority: offer.priority ?? 100,
                                  rotationMode: offer.rotationMode ?? 'PRIORITY',
                                })
                                setEditingId(offer.id)
                                setShowForm(true)
                                setIsGroupCreatorOpen(false)
                                setNewGroupName('')
                                setFormError('')
                              }}
                              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/65 transition hover:bg-white/10 hover:text-white"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(offer.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/15"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2 text-cyan-300">
              <ShieldCheck className="h-4 w-4" />
              <div className="text-xs font-semibold uppercase tracking-[0.24em]">Vault health</div>
            </div>

            <div className="space-y-3 text-sm text-white/60">
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">Smart routing keeps region-specific offers structured and easy to manage.</div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">Global fallback entries help maintain instant coverage when a country is missing.</div>
              <div className="rounded-xl border border-white/10 bg-black/20 p-3">The vault stays in a single workflow so updates can be toggled quickly.</div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.35, ease: 'easeOut' }}
            className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
          >
            <div className="mb-4 flex items-center gap-2 text-violet-300">
              <MapPinned className="h-4 w-4" />
              <div className="text-xs font-semibold uppercase tracking-[0.24em]">Vault summary</div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/70">
                <span>Regional offers</span>
                <span className="font-semibold text-white">{regionalOffers}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/70">
                <span>Fallback entries</span>
                <span className="font-semibold text-white">{globalOffers}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/70">
                <span>Geo pools</span>
                <span className="font-semibold text-white">{geoPoolCount}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-white/70">
                <span>Offer coverage</span>
                <span className="font-semibold text-white">{vaultScore}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}