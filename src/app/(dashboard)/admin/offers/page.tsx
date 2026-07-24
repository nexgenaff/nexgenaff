"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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
  Globe,
  Layers,
  ChevronDown,
  Zap,
  TrendingUp,
} from "lucide-react";
import { coerceArray } from "@/lib/utils/array-response";

interface Offer {
  id: string;
  country: string;
  groupName: string | null;
  offerUrl: string;
  isActive: boolean;
  isGlobal: boolean;
  usaSecretRedirectEnabled: boolean;
  priority: number;
  rotationMode: "PRIORITY" | "RANDOM";
}

interface ConfirmDialogState {
  title: string;
  message: string;
  confirmLabel: string;
  tone: "danger" | "warning";
  onConfirm: () => Promise<void> | void;
}

interface RenameModalState {
  isOpen: boolean;
  currentName: string;
  newName: string;
}

const getFlagImageUrl = (code: string) => {
  if (!code || code === "GLOBAL") return "https://flagcdn.com/w40/gb.png";
  const normalized = code.toUpperCase();
  if (normalized.length !== 2) return "https://flagcdn.com/w40/gb.png";
  return `https://flagcdn.com/w40/${normalized.toLowerCase()}.png`;
};

const normalizeGroupName = (value?: string | null) => value?.trim() ?? "";
const normalizeCountryCode = (value?: string | null) => value?.trim().toUpperCase() ?? "";
const buildGroupKey = (offer: Offer) => {
  const groupName = normalizeGroupName(offer.groupName);
  if (groupName) return groupName;
  if (offer.isGlobal) return "GLOBAL";
  const countryCode = normalizeCountryCode(offer.country);
  if (countryCode) return countryCode;
  return "UNASSIGNED";
};
const getPoolLabel = (groupKey: string, groupOffers: Offer[]) => {
  const namedPool = normalizeGroupName(groupOffers[0]?.groupName);
  if (namedPool) return namedPool;
  if (groupKey === "GLOBAL") return "Global Smart Link";
  if (groupKey === "UNASSIGNED") return "Unassigned";
  return groupKey;
};
const getPoolCountries = (groupOffers: Offer[]) =>
  Array.from(
    new Set(
      groupOffers.map((offer) =>
        offer.isGlobal ? "GLOBAL SMART LINK" : normalizeCountryCode(offer.country)
      )
    )
  ).sort((a, b) => a.localeCompare(b));

// Country options (full list – same as before)
const countryOptions = [
  { code: "GLOBAL", name: "Global Smart Link (Fallback for all countries)" },
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CV", name: "Cape Verde" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CG", name: "Congo" },
  { code: "CD", name: "Congo (DRC)" },
  { code: "CR", name: "Costa Rica" },
  { code: "CI", name: "Côte d’Ivoire" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GL", name: "Greenland" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "KP", name: "North Korea" },
  { code: "KR", name: "South Korea" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "MK", name: "North Macedonia" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "QA", name: "Qatar" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "São Tomé and Príncipe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

const rotationModeOptions = [
  { value: "PRIORITY", label: "Priority winner" },
  { value: "RANDOM", label: "Random rotation" },
];

const DRAFT_GROUP_STORAGE_KEY = "offer-vault-draft-groups";

// ===== ANIMATION VARIANTS =====
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 26, stiffness: 320, mass: 0.7 },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 },
  },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: "spring", damping: 30, stiffness: 400, mass: 0.7 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 20,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    country: "",
    groupName: "",
    offerUrl: "",
    isGlobal: false,
    usaSecretRedirectEnabled: false,
    priority: 100,
    rotationMode: "PRIORITY" as "PRIORITY" | "RANDOM",
  });
  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [isGroupCreatorOpen, setIsGroupCreatorOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [isQuickGroupOpen, setIsQuickGroupOpen] = useState(false);
  const [quickGroupName, setQuickGroupName] = useState("");
  const [draftGroupNames, setDraftGroupNames] = useState<string[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null);
  const [renameModal, setRenameModal] = useState<RenameModalState>({
    isOpen: false,
    currentName: "",
    newName: "",
  });
  const countryPickerRef = useRef<HTMLDivElement | null>(null);

  const fetchOffers = useCallback(async () => {
    try {
      const response = await fetch("/api/offers", { credentials: "include" });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setOffers(coerceArray<Offer>(data));
    } catch (error) {
      console.error("Failed to fetch offers:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(DRAFT_GROUP_STORAGE_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved) as string[];
      if (Array.isArray(parsed)) {
        setDraftGroupNames(parsed.filter((v): v is string => Boolean(v.trim())));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(DRAFT_GROUP_STORAGE_KEY, JSON.stringify(draftGroupNames));
  }, [draftGroupNames]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryPickerRef.current && !countryPickerRef.current.contains(event.target as Node)) {
        setIsCountryMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeOffers = offers.filter((o) => o.isActive).length;
  const globalOffers = offers.filter((o) => o.isGlobal).length;
  const regionalOffers = offers.length - globalOffers;
  const vaultScore = Math.min(100, Math.round((activeOffers / Math.max(offers.length, 1)) * 100));

  const groupedOffers = Array.from(
    offers.reduce((groups, offer) => {
      const key = buildGroupKey(offer);
      const current = groups.get(key) ?? [];
      current.push(offer);
      groups.set(key, current);
      return groups;
    }, new Map<string, Offer[]>())
  ).sort((a, b) => {
    const aIsGlobal = a[0] === "GLOBAL";
    const bIsGlobal = b[0] === "GLOBAL";
    if (aIsGlobal !== bIsGlobal) return aIsGlobal ? -1 : 1;
    return getPoolLabel(a[0], a[1]).localeCompare(getPoolLabel(b[0], b[1]));
  });

  const availableGroupNames = Array.from(
    new Set([
      ...offers.map((o) => normalizeGroupName(o.groupName)).filter((v): v is string => Boolean(v)),
      ...draftGroupNames,
    ])
  ).sort((a, b) => a.localeCompare(b));

  const groupSummaries = availableGroupNames.map((groupName) => {
    const groupOffers = offers.filter((o) => normalizeGroupName(o.groupName) === groupName);
    return {
      groupName,
      groupOffers,
      poolCountries: getPoolCountries(groupOffers),
    };
  });

  const geoPoolCount = groupSummaries.length;
  const activeGroupName = normalizeGroupName(formData.groupName);
  const selectedGroupOffers = activeGroupName
    ? offers.filter((o) => normalizeGroupName(o.groupName) === activeGroupName)
    : [];
  const selectedGroupCountries = Array.from(
    new Set(
      selectedGroupOffers.map((o) =>
        o.isGlobal ? "GLOBAL" : normalizeCountryCode(o.country)
      )
    )
  );

  const selectedCountry = countryOptions.find((c) => c.code === formData.country);
  const normalizedCountrySearch = countrySearch.trim().toLowerCase();
  const filteredCountryOptions = countryOptions.filter((c) => {
    if (!normalizedCountrySearch) return true;
    const haystack = `${c.code} ${c.name}`.toLowerCase();
    return haystack.includes(normalizedCountrySearch);
  });

  const handleCountrySelect = (countryCode: string) => {
    setFormData((prev) => ({
      ...prev,
      country: countryCode,
      isGlobal: countryCode === "GLOBAL",
    }));
    setCountrySearch("");
    setIsCountryMenuOpen(false);
  };

  const openOfferForm = (groupName = "", editOffer?: Offer) => {
    if (editOffer) {
      setEditingId(editOffer.id);
      setFormData({
        country: editOffer.country,
        groupName: editOffer.groupName ?? "",
        offerUrl: editOffer.offerUrl,
        isGlobal: editOffer.isGlobal,
        usaSecretRedirectEnabled: editOffer.usaSecretRedirectEnabled ?? false,
        priority: editOffer.priority ?? 100,
        rotationMode: editOffer.rotationMode ?? "PRIORITY",
      });
    } else {
      setEditingId(null);
      setFormData({
        country: "",
        groupName,
        offerUrl: "",
        isGlobal: false,
        usaSecretRedirectEnabled: false,
        priority: 100,
        rotationMode: "PRIORITY",
      });
    }
    setFormError("");
    setIsGroupCreatorOpen(false);
    setNewGroupName("");
    setShowFormModal(true);
  };

  const closeFormModal = () => {
    setShowFormModal(false);
    setEditingId(null);
    setFormData({
      country: "",
      groupName: "",
      offerUrl: "",
      isGlobal: false,
      usaSecretRedirectEnabled: false,
      priority: 100,
      rotationMode: "PRIORITY",
    });
    setFormError("");
  };

  const selectGroup = (groupName: string) => {
    setFormData((prev) => ({ ...prev, groupName }));
    setIsGroupCreatorOpen(false);
    setNewGroupName("");
  };

  const createGroup = () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;
    setDraftGroupNames((prev) => Array.from(new Set([...prev, trimmed])));
    selectGroup(trimmed);
  };

  const createQuickGroup = () => {
    const trimmed = quickGroupName.trim();
    if (!trimmed) return;
    setDraftGroupNames((prev) => Array.from(new Set([...prev, trimmed])));
    setQuickGroupName("");
    setIsQuickGroupOpen(false);
  };

  const applyGroupNameToOffers = async (groupName: string, nextGroupName: string | null) => {
    const affected = offers.filter((o) => normalizeGroupName(o.groupName) === groupName);
    await Promise.all(
      affected.map(async (offer) => {
        const resp = await fetch(`/api/offers/${offer.id}`, {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            country: offer.country,
            groupName: nextGroupName ?? "",
            offerUrl: offer.offerUrl,
            isActive: offer.isActive,
            isGlobal: offer.isGlobal,
            priority: offer.priority ?? 100,
            rotationMode: offer.rotationMode ?? "PRIORITY",
          }),
        });
        if (!resp.ok) throw new Error("Failed to update group membership");
      })
    );
    await fetchOffers();
  };

  const renameGroup = (currentGroupName: string) => {
    setRenameModal({
      isOpen: true,
      currentName: currentGroupName,
      newName: currentGroupName,
    });
  };

  const handleRenameConfirm = async () => {
    const { currentName, newName } = renameModal;
    const trimmed = newName.trim();
    if (!trimmed || trimmed === currentName) {
      setRenameModal({ isOpen: false, currentName: "", newName: "" });
      return;
    }
    try {
      await applyGroupNameToOffers(currentName, trimmed);
      setDraftGroupNames((prev) => {
        const filtered = prev.filter((n) => n !== currentName);
        return Array.from(new Set([...filtered, trimmed]));
      });
    } catch (error) {
      console.error("Failed to rename group:", error);
    } finally {
      setRenameModal({ isOpen: false, currentName: "", newName: "" });
    }
  };

  const deleteGroup = async (groupName: string) => {
    setConfirmDialog({
      title: "Remove this offer pool?",
      message: `This will detach all offers currently assigned to “${groupName}” and clear the group association.`,
      confirmLabel: "Remove pool",
      tone: "warning",
      onConfirm: async () => {
        try {
          await applyGroupNameToOffers(groupName, null);
          setDraftGroupNames((prev) => prev.filter((n) => n !== groupName));
        } catch (error) {
          console.error("Failed to delete group:", error);
        }
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormLoading(true);

    try {
      const url = editingId ? `/api/offers/${editingId}` : "/api/offers";
      const method = editingId ? "PUT" : "POST";
      const priorityVal = Number(formData.priority);
      const payload = {
        country: formData.isGlobal ? "GLOBAL" : formData.country,
        groupName: formData.groupName.trim(),
        offerUrl: formData.offerUrl.trim(),
        isGlobal: formData.isGlobal,
        usaSecretRedirectEnabled: Boolean(formData.usaSecretRedirectEnabled),
        priority: Number.isFinite(priorityVal) ? Math.max(1, Math.min(999, priorityVal)) : 100,
        rotationMode: formData.rotationMode === "RANDOM" ? "RANDOM" : "PRIORITY",
      };

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Failed to save offer");

      closeFormModal();
      await fetchOffers();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmDialog({
      title: "Delete this offer?",
      message: "This will remove the offer from the routing system and its current targeting configuration.",
      confirmLabel: "Delete offer",
      tone: "danger",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/offers/${id}`, {
            method: "DELETE",
            credentials: "include",
          });
          if (!response.ok) throw new Error("Failed to delete offer");
          await fetchOffers();
        } catch (error) {
          console.error("Error deleting offer:", error);
        }
      },
    });
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (!response.ok) throw new Error("Failed to toggle offer");
      await fetchOffers();
    } catch (error) {
      console.error("Error toggling offer:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="mx-auto h-12 w-12 rounded-full border-4 border-indigo-400/30 border-t-indigo-400"
          />
          <p className="mt-4 text-sm text-slate-400">Loading offers…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 md:space-y-8">
      {/* ===== CONFIRMATION MODAL ===== */}
      <AnimatePresence>
        {confirmDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmDialog(null)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d1724] p-6 shadow-2xl shadow-indigo-500/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
                    confirmDialog.tone === "danger"
                      ? "border-rose-400/30 bg-rose-500/10 text-rose-300"
                      : "border-amber-400/30 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{confirmDialog.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{confirmDialog.message}</p>
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setConfirmDialog(null);
                    void confirmDialog.onConfirm();
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold text-white transition ${
                    confirmDialog.tone === "danger"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-amber-500 hover:bg-amber-600"
                  }`}
                >
                  {confirmDialog.confirmLabel}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== RENAME MODAL ===== */}
      <AnimatePresence>
        {renameModal.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setRenameModal({ isOpen: false, currentName: "", newName: "" })}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-md rounded-xl border border-white/10 bg-[#0d1724] p-6 shadow-2xl shadow-indigo-500/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Edit className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Rename Group</h3>
                  <p className="text-sm text-slate-400">Enter a new name for the routing pool</p>
                </div>
              </div>
              <input
                type="text"
                value={renameModal.newName}
                onChange={(e) => setRenameModal((prev) => ({ ...prev, newName: e.target.value }))}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-400/30 transition"
                placeholder="New group name"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void handleRenameConfirm();
                  }
                }}
              />
              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setRenameModal({ isOpen: false, currentName: "", newName: "" })}
                  className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRenameConfirm}
                  className="px-4 py-2 rounded-lg bg-indigo-500 text-sm font-semibold text-white hover:bg-indigo-600 transition"
                >
                  Rename
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== FORM MODAL ===== */}
      <AnimatePresence>
        {showFormModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm overflow-y-auto"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeFormModal();
            }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-lg rounded-xl border border-white/10 bg-[#0d1724] p-5 shadow-2xl shadow-indigo-500/10 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/10">
                    <Sparkles className="w-5 h-5 text-indigo-300" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    {editingId ? "Edit Offer" : "Create Offer"}
                  </h2>
                </div>
                <button
                  onClick={closeFormModal}
                  className="p-2 rounded-lg hover:bg-white/5 transition text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {formError && (
                  <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                    {formError}
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Country</label>
                    <div ref={countryPickerRef} className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setCountrySearch("");
                          setIsCountryMenuOpen((prev) => !prev);
                        }}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white flex items-center justify-between hover:border-white/20 transition"
                      >
                        <span className="flex items-center gap-2.5">
                          {selectedCountry ? (
                            <>
                              <Image
                                src={getFlagImageUrl(selectedCountry.code)}
                                alt={selectedCountry.code}
                                width={24}
                                height={16}
                                className="rounded-sm"
                              />
                              <span>{selectedCountry.code}</span>
                            </>
                          ) : (
                            <span className="text-slate-400">Select country</span>
                          )}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      </button>
                      {isCountryMenuOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 z-20 max-h-60 overflow-y-auto rounded-lg border border-white/10 bg-slate-900/95 p-2 shadow-xl backdrop-blur-xl">
                          <input
                            type="text"
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            placeholder="Search countries…"
                            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-400/30"
                            autoFocus
                          />
                          <div className="mt-2 space-y-1">
                            {filteredCountryOptions.map((country) => (
                              <button
                                key={country.code}
                                type="button"
                                onClick={() => handleCountrySelect(country.code)}
                                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white hover:bg-white/5 transition"
                              >
                                <Image
                                  src={getFlagImageUrl(country.code)}
                                  alt={country.code}
                                  width={20}
                                  height={14}
                                  className="rounded-sm"
                                />
                                <span>{country.code}</span>
                                <span className="text-xs text-slate-400 truncate">{country.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Routing Pool</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.groupName}
                        onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                        placeholder="Pool name"
                        className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-400/30 transition"
                      />
                      <button
                        type="button"
                        onClick={() => setIsGroupCreatorOpen((prev) => !prev)}
                        className="px-3 py-2.5 rounded-lg border border-indigo-400/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 transition"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {isGroupCreatorOpen && (
                      <div className="mt-2 flex gap-2">
                        <input
                          type="text"
                          value={newGroupName}
                          onChange={(e) => setNewGroupName(e.target.value)}
                          placeholder="New pool name"
                          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={createGroup}
                          className="px-3 py-1.5 rounded-lg bg-indigo-500 text-sm text-white hover:bg-indigo-600 transition"
                        >
                          Save
                        </button>
                      </div>
                    )}
                    {availableGroupNames.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {availableGroupNames.slice(0, 8).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => selectGroup(g)}
                            className={`text-xs px-3 py-1 rounded-full border transition ${
                              formData.groupName === g
                                ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-200"
                                : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                        {availableGroupNames.length > 8 && (
                          <span className="text-xs text-slate-500">+{availableGroupNames.length - 8} more</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="999"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
                        className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-white min-w-[3rem] text-center">
                        {formData.priority}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Rotation</label>
                    <select
                      value={formData.rotationMode}
                      onChange={(e) =>
                        setFormData({ ...formData, rotationMode: e.target.value as "PRIORITY" | "RANDOM" })
                      }
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-400/30 transition"
                    >
                      {rotationModeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-slate-800 text-white">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Offer URL</label>
                  <input
                    type="url"
                    value={formData.offerUrl}
                    onChange={(e) => setFormData({ ...formData, offerUrl: e.target.value })}
                    placeholder="https://affiliate.com/?s1="
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-400/30 transition"
                    required
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5">
                  <input
                    type="checkbox"
                    id="usa-secret-modal"
                    checked={formData.usaSecretRedirectEnabled}
                    onChange={(e) =>
                      setFormData({ ...formData, usaSecretRedirectEnabled: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                  />
                  <label htmlFor="usa-secret-modal" className="text-sm text-slate-300 cursor-pointer">
                    USA 50% Secret Click Mode
                  </label>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-5 py-2.5 rounded-lg bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-600 transition disabled:opacity-60"
                  >
                    {formLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving…
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Check className="w-4 h-4" />
                        {editingId ? "Update" : "Add Offer"}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={closeFormModal}
                    className="px-5 py-2.5 rounded-lg border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== HEADER & STATS ===== */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 text-indigo-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em]">Offer Vault</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight mt-0.5">Premium Geo Offer Routing</h1>
            <p className="text-sm text-slate-400 mt-0.5">Build smart fallback offers with country targeting.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setIsQuickGroupOpen((prev) => !prev);
                setQuickGroupName("");
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-indigo-400/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium hover:bg-indigo-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              Add Group
            </button>
            <button
              onClick={() => openOfferForm()}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-600 transition"
            >
              <Plus className="w-4 h-4" />
              Add Offer
            </button>
          </div>
        </div>

        {/* Quick Group Creator */}
        <AnimatePresence>
          {isQuickGroupOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3 backdrop-blur-sm">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={quickGroupName}
                    onChange={(e) => setQuickGroupName(e.target.value)}
                    placeholder="Enter a new group name"
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-1 focus:ring-indigo-400/30 transition"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={createQuickGroup}
                      className="px-3 py-2 rounded-lg bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-600 transition"
                    >
                      Save Group
                    </button>
                    <button
                      onClick={() => {
                        setIsQuickGroupOpen(false);
                        setQuickGroupName("");
                      }}
                      className="px-3 py-2 rounded-lg border border-white/10 text-sm font-medium text-slate-300 hover:bg-white/5 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {[
            { 
              label: "Active", 
              value: activeOffers, 
              icon: Zap, 
              color: "border-emerald-500/20 bg-emerald-500/5" 
            },
            { 
              label: "Pools", 
              value: geoPoolCount, 
              icon: Layers, 
              color: "border-blue-500/20 bg-blue-500/5" 
            },
            { 
              label: "Global", 
              value: globalOffers, 
              icon: Globe, 
              color: "border-amber-500/20 bg-amber-500/5" 
            },
            { 
              label: "Score", 
              value: `${vaultScore}%`, 
              icon: TrendingUp, 
              color: "border-purple-500/20 bg-purple-500/5" 
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-lg border ${stat.color} p-3 md:p-4 backdrop-blur-sm`}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] md:text-xs font-medium text-slate-400">{stat.label}</p>
                <stat.icon className="w-4 h-4 text-white/50" />
              </div>
              <p className="text-lg md:text-xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        {/* Left Column */}
        <div className="space-y-4">
          {/* Groups */}
          {groupSummaries.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Routing Pools</h3>
              {groupSummaries.map((group) => (
                <motion.div
                  key={group.groupName}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="rounded-lg border border-white/5 bg-white/3 p-3 md:p-4 hover:border-white/15 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-indigo-500/10 flex-shrink-0">
                          <MapPinned className="w-4 h-4 text-indigo-300" />
                        </div>
                        <span className="text-sm md:text-base font-medium text-white truncate">{group.groupName}</span>
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {group.groupOffers.length} offers
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1 ml-8">
                        {group.poolCountries.slice(0, 5).map((c) => (
                          <span
                            key={c}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5"
                          >
                            {c}
                          </span>
                        ))}
                        {group.poolCountries.length > 5 && (
                          <span className="text-[10px] text-slate-500">+{group.poolCountries.length - 5}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => openOfferForm(group.groupName)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-indigo-400/30 text-indigo-300 hover:bg-indigo-500/10 transition"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => renameGroup(group.groupName)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteGroup(group.groupName)}
                        className="text-xs px-2.5 py-1.5 rounded-lg border border-rose-400/30 text-rose-300 hover:bg-rose-500/10 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Offers */}
          {offers.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">Offers</h3>
              {groupedOffers.map(([groupKey, groupOffers]) => (
                <div key={groupKey} className="space-y-2">
                  {groupOffers.map((offer) => (
                    <motion.div
                      key={offer.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className={`group rounded-lg border p-3 md:p-4 transition-all duration-200 ${
                        offer.isActive 
                          ? "border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40" 
                          : "border-white/5 bg-white/3 hover:border-white/15"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-white">
                              <Image
                                src={getFlagImageUrl(offer.country)}
                                alt={offer.country}
                                width={18}
                                height={12}
                                className="rounded-sm"
                              />
                              {offer.isGlobal ? "🌍 Global" : offer.country}
                            </span>
                            {offer.groupName && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                                {offer.groupName}
                              </span>
                            )}
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                              P{offer.priority ?? 100}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                              {offer.rotationMode === "RANDOM" ? "🎲" : "🎯"}
                            </span>
                            {offer.usaSecretRedirectEnabled && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                                🔒
                              </span>
                            )}
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                                offer.isActive
                                  ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                  : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                              }`}
                            >
                              {offer.isActive ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                              {offer.isActive ? "On" : "Off"}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs text-slate-500 break-all font-mono truncate max-w-full">
                            {offer.offerUrl}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleToggle(offer.id, offer.isActive)}
                            className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                              offer.isActive
                                ? "border-amber-400/30 text-amber-300 hover:bg-amber-500/10"
                                : "border-emerald-400/30 text-emerald-300 hover:bg-emerald-500/10"
                            }`}
                          >
                            {offer.isActive ? "Off" : "On"}
                          </button>
                          <button
                            onClick={() => openOfferForm("", offer)}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-white/10 text-slate-400 hover:bg-white/5 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(offer.id)}
                            className="text-xs px-2.5 py-1.5 rounded-lg border border-rose-400/30 text-rose-300 hover:bg-rose-500/10 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-white/10 bg-white/3 p-8 md:p-10 text-center">
              <div className="flex justify-center gap-4 mb-4">
                <Globe className="w-8 h-8 md:w-10 md:h-10 text-slate-600" />
                <Plus className="w-8 h-8 md:w-10 md:h-10 text-slate-600" />
                <Check className="w-8 h-8 md:w-10 md:h-10 text-slate-600" />
              </div>
              <h3 className="text-base md:text-lg font-medium text-white">Your vault is empty</h3>
              <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
                Create a routing pool, then add offers to start building your geo-smart campaign structure.
              </p>
              <button
                onClick={() => openOfferForm()}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500 text-sm font-medium text-white hover:bg-indigo-600 transition"
              >
                <Plus className="w-4 h-4" />
                Create your first offer
              </button>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="rounded-lg border border-white/5 bg-white/3 p-4">
            <div className="flex items-center gap-2 text-indigo-300 mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Vault Health</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm">
                <span className="text-slate-400">Regional</span>
                <span className="font-semibold text-white">{regionalOffers}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm">
                <span className="text-slate-400">Fallback</span>
                <span className="font-semibold text-white">{globalOffers}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-sm">
                <span className="text-slate-400">Geo pools</span>
                <span className="font-semibold text-white">{geoPoolCount}</span>
              </div>
              <div className="rounded-lg border border-white/5 bg-white/5 p-3">
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="text-slate-400">Coverage</span>
                  <span className="font-semibold text-white">{vaultScore}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${vaultScore}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      vaultScore > 70 ? "bg-emerald-400" :
                      vaultScore > 40 ? "bg-amber-400" :
                      "bg-rose-400"
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/5 bg-white/3 p-4">
            <div className="flex items-center gap-2 text-slate-400 mb-4">
              <Layers className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">How It Works</span>
            </div>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>Create a <span className="text-white">routing pool</span> for offers.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span>Add offers with <span className="text-white">country targeting</span>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span><span className="text-white">Global fallback</span> covers unmapped countries.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400 mt-0.5">•</span>
                <span><span className="text-white">Priority</span> or <span className="text-white">random</span> rotation.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}