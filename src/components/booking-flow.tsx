import { useEffect, useMemo, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  Award,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Globe2,
  Hotel,
  Mail,
  Plane,
  Plus,
  Search,
  Ship,
  Ticket,
  Upload,
  X,
} from 'lucide-react-native';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToast } from '@/components/toast';
import { useTabBarVisibility } from '@/components/tab-bar-visibility';

type BookingStatus = 'Awaiting supplier' | 'Approved' | 'Reversed';
type BookingCategory =
  | 'Independent hotel'
  | 'Hotel chain'
  | 'Bedbank'
  | 'Airlines'
  | 'Cruises'
  | 'Tour package'
  | 'Experience';
type BookingFilter = 'All' | 'Awaiting supplier' | 'Approved' | 'Reversed';
type Screen = 'list' | 'type' | 'details' | 'review' | 'submitted' | 'detail' | 'appeal';

type Booking = {
  id: string;
  partner: string;
  category: BookingCategory;
  supplier: string;
  reference: string;
  traveler: string;
  travelDates: string;
  bookingValue: string;
  currency: string;
  submittedDate: string;
  miles: number;
  status: BookingStatus;
  evidenceName: string;
  statusHistory: { label: string; date: string; reversed?: boolean }[];
};

type BookingDraft = {
  category: BookingCategory | null;
  supplier: string;
  reference: string;
  checkIn: string;
  checkOut: string;
  currency: string;
  value: string;
};

type PickedFile = { name: string; uri: string; size?: number };

const initialBookings: Booking[] = [
  {
    id: 'WM-48210',
    partner: 'Hilton Dubai Al Habtoor City',
    category: 'Hotel chain',
    supplier: 'Hilton Hotels & Resorts',
    reference: 'HIL-99212-AB',
    traveler: 'Daniel Reed',
    travelDates: '4 nights · 4–8 Nov 2026',
    bookingValue: 'AED 12,800 · €3,200',
    currency: 'AED',
    submittedDate: '24 Oct 2026',
    miles: 160,
    status: 'Awaiting supplier',
    evidenceName: 'hotel-confirmation.pdf',
    statusHistory: [{ label: 'Registered', date: '24 Oct, 2:40 PM' }],
  },
  {
    id: 'WM-48207',
    partner: 'MSC Seaview — Western Med',
    category: 'Cruises',
    supplier: 'MSC Cruises',
    reference: 'MSC-77710',
    traveler: 'Daniel Reed',
    travelDates: '7 nights · 14–21 Nov 2026',
    bookingValue: 'AED 27,200 · €6,800',
    currency: 'AED',
    submittedDate: '22 Oct 2026',
    miles: 340,
    status: 'Awaiting supplier',
    evidenceName: 'msc-confirmation.pdf',
    statusHistory: [{ label: 'Registered', date: '22 Oct, 10:15 AM' }],
  },
  {
    id: 'WM-48154',
    partner: 'Jumeirah Beach Hotel',
    category: 'Hotel chain',
    supplier: 'Jumeirah Hotels & Resorts',
    reference: 'JUM-88304',
    traveler: 'Daniel Reed',
    travelDates: '3 nights · see supplier confirmation',
    bookingValue: 'AED 12,800 · €3,200',
    currency: 'AED',
    submittedDate: '12 Oct 2026',
    miles: 120,
    status: 'Approved',
    evidenceName: 'supplier-confirmation.pdf',
    statusHistory: [
      { label: 'Registered', date: '12 Oct, 2:40 PM' },
      { label: 'Jumeirah confirmed the booking', date: '13 Oct, 9:12 AM' },
      { label: 'Miles credited', date: '13 Oct, 9:12 AM' },
    ],
  },
  {
    id: 'WM-47998',
    partner: 'Anantara The Palm Dubai',
    category: 'Hotel chain',
    supplier: 'Anantara Hotels & Resorts',
    reference: 'ANT-5521-KD',
    traveler: 'Daniel Reed',
    travelDates: '18–23 Nov 2026',
    bookingValue: 'AED 9,400 · €2,350',
    currency: 'AED',
    submittedDate: '24 Sep 2026',
    miles: -140,
    status: 'Reversed',
    evidenceName: 'anantara-confirmation.pdf',
    statusHistory: [
      { label: 'Registered', date: '24 Sep, 11:02 AM' },
      { label: 'Anantara confirmed the booking', date: '25 Sep, 4:30 PM' },
      { label: 'Reversed by Anantara', date: '2 Oct, 10:15 AM', reversed: true },
    ],
  },
];

const blankDraft: BookingDraft = {
  category: null,
  supplier: '',
  reference: '',
  checkIn: '',
  checkOut: '',
  currency: 'AED',
  value: '',
};

const bookingFilters: BookingFilter[] = ['All', 'Awaiting supplier', 'Approved', 'Reversed'];
const categories: { title: BookingCategory; subtitle: string; icon: typeof Hotel }[] = [
  { title: 'Independent hotel', subtitle: 'Rooms at independent properties', icon: Building2 },
  { title: 'Hotel chain', subtitle: 'Branded group properties', icon: Hotel },
  { title: 'Bedbank', subtitle: 'Accommodation wholesalers', icon: Globe2 },
  { title: 'Airlines', subtitle: 'Scheduled and charter flights', icon: Plane },
  { title: 'Cruises', subtitle: 'Cruise bookings and sailings', icon: Ship },
  { title: 'Tour package', subtitle: 'Tours and holiday packages', icon: Ticket },
  { title: 'Experience', subtitle: 'Activities and experiences', icon: Award },
];
const popularCategories: BookingCategory[] = ['Hotel chain', 'Cruises', 'Tour package', 'Experience'];
const suppliers = [
  'Hilton Hotels & Resorts',
  'Jumeirah Hotels & Resorts',
  'Anantara Hotels & Resorts',
  'Marriott Hotels',
  'MSC Cruises',
  'Emirates',
  'Other supplier',
];
const appealReasons = [
  'The booking was not cancelled',
  'Only part of it was cancelled',
  'The supplier reversed the wrong booking',
  'Something else',
];
const currencyOptions = ['AED', 'EUR', 'USD'];

const formatMiles = (miles: number) => new Intl.NumberFormat('en').format(Math.abs(miles));
const milesFromValue = (value: string) => {
  const amount = Number(value.replace(/,/g, ''));
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 0.0125) : 0;
};

function CircleAction({
  icon,
  label,
  onPress,
  filled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  filled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={`ml-2 h-10 w-10 items-center justify-center rounded-full ${filled ? 'bg-[#FFB91F]' : 'bg-white/15'}`}
    >
      {icon}
    </Pressable>
  );
}

function ListHero({
  topInset,
  onRegister,
  onFilter,
}: {
  topInset: number;
  onRegister: () => void;
  onFilter: () => void;
}) {
  return (
    <View className="relative overflow-hidden px-5 pb-6" style={{ paddingTop: topInset + 8 }}>
      <LinearGradient
        colors={['#11184F', '#29368F', '#454DC2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
      />
      <View pointerEvents="none" className="absolute -right-7 -top-9 h-48 w-48 rounded-full border border-white/10" />
      <View pointerEvents="none" className="absolute -right-1 -top-2 h-32 w-32 rounded-full border border-white/10" />
      <View className="mb-5 flex-row items-center justify-between">
        <Text className="text-[16px] font-medium text-white">Bookings</Text>
        <View className="flex-row">
          <CircleAction
            icon={<Filter color="white" size={18} />}
            label="Filter bookings"
            onPress={onFilter}
          />
          <CircleAction
            icon={<Plus color="#24233A" size={21} />}
            label="Register booking"
            onPress={onRegister}
            filled
          />
        </View>
      </View>
      <Text className="text-[11px] font-medium tracking-[0.7px] text-[#D8DAF2]">
        MILES AWAITING SUPPLIER CONFIRMATION
      </Text>
      <View className="mt-1 flex-row items-baseline">
        <Text className="text-[38px] font-bold leading-[44px] tracking-[-1px] text-white">710</Text>
        <Text className="ml-2 text-[14px] text-[#D8DAF2]">miles</Text>
      </View>
      <Text className="mt-1 text-[13px] text-[#D8DAF2]">4 awaiting supplier · 24 confirmed this year</Text>
    </View>
  );
}

function FormHeader({
  topInset,
  title,
  step,
  onBack,
  close = false,
}: {
  topInset: number;
  title: string;
  step: number;
  onBack: () => void;
  close?: boolean;
}) {
  return (
    <View className="bg-white px-5 pb-4" style={{ paddingTop: topInset + 8 }}>
      <View className="mb-3 flex-row items-center justify-between">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={close ? 'Close registration' : 'Go back'}
          onPress={onBack}
          className="h-10 w-10 items-center justify-center rounded-full border border-[#E8EAF0] bg-white"
        >
          {close ? <X color="#252B3A" size={18} /> : <ArrowLeft color="#252B3A" size={19} />}
        </Pressable>
        <Text className="text-[14px] font-semibold text-[#252B3A]">
          {step === 3 ? 'Review' : 'Register booking'}
        </Text>
        <View className="h-10 w-10" />
      </View>
      <View className="h-[2px] flex-row overflow-hidden rounded-full bg-[#E8EAF0]">
        <View className="rounded-full bg-[#4145B6]" style={{ width: `${(step / 3) * 100}%` }} />
      </View>
      <Text className="mt-3 text-[15px] font-semibold text-[#252B3A]">{title}</Text>
    </View>
  );
}

function DetailHero({
  booking,
  topInset,
  onBack,
  onMore,
}: {
  booking: Booking;
  topInset: number;
  onBack: () => void;
  onMore: () => void;
}) {
  const approved = booking.status === 'Approved';
  const reversed = booking.status === 'Reversed';
  const colors: [string, string, string] = approved
    ? ['#07533F', '#0F7554', '#18845D']
    : reversed
      ? ['#571B2D', '#8B2436', '#A52839']
      : ['#11184F', '#29368F', '#454DC2'];

  return (
    <View className="relative overflow-hidden px-5 pb-5" style={{ paddingTop: topInset + 8 }}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
      <View pointerEvents="none" className="absolute -right-8 -top-12 h-52 w-52 rounded-full border border-white/10" />
      <View className="mb-4 flex-row items-center justify-between">
        <CircleAction icon={<ArrowLeft color="white" size={19} />} label="Go back" onPress={onBack} />
        <CircleAction icon={<Text className="text-[19px] font-semibold leading-5 text-white">⋮</Text>} label="More booking options" onPress={onMore} />
      </View>
      <View className="mb-2 flex-row items-center">
        <View className="rounded-full bg-white px-2.5 py-1">
          <Text className={`text-[11px] font-semibold ${approved ? 'text-[#168052]' : reversed ? 'text-[#B62D3E]' : 'text-[#A77918]'}`}>
            {approved ? '● Approved' : reversed ? `● Reversed by ${booking.supplier.split(' ')[0]}` : '● Awaiting supplier'}
          </Text>
        </View>
        <Text className="ml-2 text-[11px] text-white/70">{booking.id}</Text>
      </View>
      <Text className="text-[23px] font-bold leading-[28px] text-white">{booking.partner}</Text>
      <View className="mt-1 flex-row items-baseline">
        <Text className="text-[21px] font-bold text-white">{booking.miles > 0 ? `+${formatMiles(booking.miles)}` : `−${formatMiles(booking.miles)}`}</Text>
        <Text className="ml-2 text-[12px] text-white/70">WowMiles</Text>
      </View>
    </View>
  );
}

function StatusPill({ status }: { status: BookingStatus }) {
  const variant = {
    'Awaiting supplier': { bg: '#FFF5DF', text: '#A77918', label: 'Awaiting supplier' },
    Approved: { bg: '#E8F6EF', text: '#168052', label: 'Approved' },
    Reversed: { bg: '#FCEDEE', text: '#B63D45', label: 'Reversed' },
  }[status];

  return (
    <View className="self-start rounded-full px-2.5 py-1" style={{ backgroundColor: variant.bg }}>
      <Text className="text-[11px] font-semibold" style={{ color: variant.text }}>{variant.label}</Text>
    </View>
  );
}

function BookingCard({ booking, onPress }: { booking: Booking; onPress: () => void }) {
  const Icon = booking.category === 'Cruises' ? Ship : booking.category === 'Airlines' ? Plane : Hotel;
  const isPending = booking.status === 'Awaiting supplier';
  const amount = `${booking.miles < 0 ? '−' : '+'}${formatMiles(booking.miles)}`;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${booking.partner}, ${booking.status}. View booking details`}
      onPress={onPress}
      className="mb-2.5 rounded-[14px] border border-[#E8EAF0] bg-white px-3.5 py-3 active:opacity-80"
    >
      <View className="flex-row items-center">
        <View className="mr-2.5 h-9 w-9 items-center justify-center rounded-[10px] bg-[#4145B6]">
          <Icon color="white" size={17} strokeWidth={2} />
        </View>
        <View className="flex-1">
          <Text numberOfLines={1} className="text-[14px] font-semibold text-[#202638]">{booking.partner}</Text>
          <Text className="mt-0.5 text-[11px] text-[#737A89]">
            {booking.category === 'Cruises' ? 'Cruise' : 'Hotel'} · {booking.travelDates.split('·')[0].trim()} · {booking.id}
          </Text>
        </View>
      </View>
      <View className="mt-2.5 flex-row items-center justify-between border-t border-[#EEF0F4] pt-2">
        <StatusPill status={booking.status} />
        <Text className={`text-[12px] font-semibold ${booking.status === 'Reversed' ? 'text-[#B63D45]' : isPending ? 'text-[#596071]' : 'text-[#C2761C]'}`}>
          {amount}{isPending ? ' pending' : ''}
        </Text>
      </View>
      {isPending ? (
        <View className="mt-1.5 flex-row items-center rounded-[7px] bg-[#F5F6F8] px-2 py-1">
          <Mail color="#8991A0" size={11} />
          <Text className="ml-1.5 text-[10px] text-[#858C99]">Reminder sent · {booking.submittedDate}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function StickyActionBar({
  caption,
  value,
  buttonLabel,
  onPress,
  bottomInset,
  secondaryLabel,
  onSecondary,
  disabled = false,
}: {
  caption: string;
  value: string;
  buttonLabel: string;
  onPress: () => void;
  bottomInset: number;
  secondaryLabel?: string;
  onSecondary?: () => void;
  disabled?: boolean;
}) {
  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-[#F8F9FB] px-3 pt-2"
      style={{ paddingBottom: Math.max(bottomInset, 10) }}
    >
      <View className="min-h-[58px] flex-row items-center rounded-full bg-[#10131D] py-1.5 pl-4 pr-1.5">
        <View className="flex-1">
          <Text className="text-[10px] text-white/55">{caption}</Text>
          <Text className="mt-0.5 text-[12px] font-medium text-white">{value}</Text>
        </View>
        {secondaryLabel && onSecondary ? (
          <Pressable onPress={onSecondary} className="mr-1 min-h-11 items-center justify-center rounded-full px-3">
            <Text className="text-[12px] font-semibold text-white">{secondaryLabel}</Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          disabled={disabled}
          onPress={onPress}
          className={`min-h-11 min-w-[92px] items-center justify-center rounded-full px-4 ${disabled ? 'bg-[#B7B8C6]' : 'bg-[#FFB91F]'}`}
        >
          <Text className="text-[13px] font-semibold text-[#171923]">{buttonLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <Text className="mb-2 text-[10px] font-semibold tracking-[0.8px] text-[#737A89]">{children}</Text>;
}

function DetailRow({ label, value, last = false }: { label: string; value: string; last?: boolean }) {
  return (
    <View className={`min-h-10 flex-row items-center justify-between py-2.5 ${last ? '' : 'border-b border-[#E9EBF0]'}`}>
      <Text className="mr-3 text-[12px] text-[#737A89]">{label}</Text>
      <Text numberOfLines={1} className="max-w-[62%] text-right text-[12px] font-medium text-[#252B3A]">{value}</Text>
    </View>
  );
}

function FileRow({ file, onRemove }: { file: PickedFile; onRemove?: () => void }) {
  return (
    <View className="min-h-[54px] flex-row items-center rounded-[11px] border border-[#E8EAF0] bg-white px-3">
      <View className="h-8 w-8 items-center justify-center rounded-[9px] bg-[#F0F1FB]">
        <FileText color="#4145B6" size={16} />
      </View>
      <View className="ml-2.5 flex-1">
        <Text numberOfLines={1} className="text-[12px] font-medium text-[#252B3A]">{file.name}</Text>
        <Text className="mt-0.5 text-[10px] text-[#858C99]">{file.size ? `${Math.max(1, Math.round(file.size / 1024))} KB` : 'Confirmation document'}</Text>
      </View>
      {onRemove ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Remove file" onPress={onRemove} hitSlop={8}>
          <X color="#858C99" size={16} />
        </Pressable>
      ) : (
        <Eye color="#737A89" size={15} />
      )}
    </View>
  );
}

export function BookingFlow() {
  const insets = useSafeAreaInsets();
  const showToast = useToast();
  const setTabBarHidden = useTabBarVisibility();
  const [screen, setScreen] = useState<Screen>('list');
  const [bookings, setBookings] = useState(initialBookings);
  const [filter, setFilter] = useState<BookingFilter>('All');
  const [filterOpen, setFilterOpen] = useState(false);
  const [draft, setDraft] = useState<BookingDraft>(blankDraft);
  const [proof, setProof] = useState<PickedFile | null>(null);
  const [appealProof, setAppealProof] = useState<PickedFile | null>(null);
  const [appealReason, setAppealReason] = useState('');
  const [appealDetails, setAppealDetails] = useState('');
  const [categorySearch, setCategorySearch] = useState('');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [submittedReference, setSubmittedReference] = useState('');
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [confirmBooking, setConfirmBooking] = useState(true);

  useEffect(() => {
    setTabBarHidden(screen !== 'list');
    return () => setTabBarHidden(false);
  }, [screen, setTabBarHidden]);

  const milesEstimate = useMemo(() => milesFromValue(draft.value), [draft.value]);
  const visibleBookings = useMemo(
    () => bookings.filter((booking) => filter === 'All' || booking.status === filter),
    [bookings, filter],
  );
  const visibleCategories = useMemo(
    () => categories.filter((category) => category.title.toLowerCase().includes(categorySearch.trim().toLowerCase())),
    [categorySearch],
  );

  const updateDraft = <K extends keyof BookingDraft>(key: K, value: BookingDraft[K]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const beginRegistration = () => {
    setDraft(blankDraft);
    setProof(null);
    setConfirmBooking(true);
    setScreen('type');
  };

  const goBack = () => {
    if (screen === 'type') setScreen('list');
    else if (screen === 'details') setScreen('type');
    else if (screen === 'review') setScreen('details');
    else if (screen === 'detail') setScreen('list');
    else if (screen === 'appeal') setScreen('detail');
    else setScreen('list');
  };

  const chooseDocument = async (onChoose: (file: PickedFile) => void) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (result.canceled || !result.assets[0]) return;
      const file = result.assets[0];
      if (file.size !== undefined && file.size > 10 * 1024 * 1024) {
        showToast('File is too large', 'Choose a PDF or image smaller than 10 MB.', 'error');
        return;
      }
      onChoose({ name: file.name, uri: file.uri, size: file.size });
    } catch (error) {
      console.error('Unable to open booking document picker', error);
      showToast('Could not open files', 'Please try selecting your booking proof again.', 'error');
    }
  };

  const continueToReview = () => {
    const required = [
      ['Supplier', draft.supplier],
      ['Supplier booking reference', draft.reference],
      ['Check-in date', draft.checkIn],
      ['Check-out date', draft.checkOut],
      ['Booking value', draft.value],
    ] as const;
    const missing = required.find(([, value]) => !value.trim());
    if (missing) {
      showToast(`${missing[0]} is required`, 'Complete the booking details to continue.', 'error');
      return;
    }
    if (!proof) {
      showToast('Add booking evidence', 'Upload the supplier confirmation before continuing.', 'error');
      return;
    }
    if (!confirmBooking) {
      showToast('Please confirm your booking', 'Confirm the booking details before submitting.', 'error');
      return;
    }
    setScreen('review');
  };

  const submitBooking = () => {
    const reference = `WM-${Math.floor(49000 + Math.random() * 900)}`;
    const category = draft.category ?? 'Hotel chain';
    const booking: Booking = {
      id: reference,
      partner: draft.supplier,
      category,
      supplier: draft.supplier,
      reference: draft.reference,
      traveler: 'Daniel Reed',
      travelDates: `${draft.checkIn}–${draft.checkOut}`,
      bookingValue: `${draft.currency} ${draft.value}`,
      currency: draft.currency,
      submittedDate: 'Just now',
      miles: milesEstimate,
      status: 'Awaiting supplier',
      evidenceName: proof?.name ?? '',
      statusHistory: [{ label: 'Registered', date: 'Just now' }],
    };
    setBookings((current) => [booking, ...current]);
    setSubmittedReference(reference);
    setSelected(booking);
    setScreen('submitted');
  };

  const openAppeal = () => {
    setAppealReason('');
    setAppealDetails('');
    setAppealProof(null);
    setScreen('appeal');
  };

  const submitAppeal = () => {
    if (!appealReason) {
      showToast('Choose a reason', 'Select why you would like the supplier to review this booking.', 'error');
      return;
    }
    if (!appealProof) {
      showToast('Attach the revised confirmation', 'Upload supporting evidence before sending your appeal.', 'error');
      return;
    }
    if (selected) {
      const updated = { ...selected, status: 'Awaiting supplier' as const };
      setBookings((current) => current.map((booking) => (booking.id === updated.id ? updated : booking)));
      setSelected(updated);
    }
    showToast('Appeal sent', 'The supplier will review your booking again.', 'success');
    setScreen('detail');
  };

  const openBooking = (booking: Booking) => {
    setSelected(booking);
    setScreen('detail');
  };

  const detailHeaderOnMore = () => {
    showToast('Booking options', 'Your booking reference is shown in the details below.', 'info');
  };

  const selectedCategory = draft.category ? categories.find((item) => item.title === draft.category) : undefined;
  const CategoryIcon = selectedCategory?.icon ?? Hotel;
  const footer = screen === 'type' ? (
    <StickyActionBar
      caption="Selected"
      value={draft.category ?? 'Choose a category'}
      buttonLabel="Continue"
      onPress={() => {
        if (!draft.category) {
          showToast('Choose a category', 'Select the type of booking you want to register.', 'error');
          return;
        }
        setScreen('details');
      }}
      bottomInset={insets.bottom}
      disabled={!draft.category}
    />
  ) : screen === 'details' ? (
    <StickyActionBar
      caption="On confirmation"
      value={`+${formatMiles(milesEstimate)} miles`}
      buttonLabel="Review"
      onPress={continueToReview}
      bottomInset={insets.bottom}
    />
  ) : screen === 'review' ? (
    <StickyActionBar
      caption="On confirmation"
      value={`+${formatMiles(milesEstimate)} miles`}
      buttonLabel="Submit"
      onPress={submitBooking}
      bottomInset={insets.bottom}
      disabled={!confirmBooking}
    />
  ) : screen === 'detail' && selected?.status === 'Approved' ? (
    <StickyActionBar
      caption="Confirmed by supplier"
      value={selected.statusHistory[selected.statusHistory.length - 1]?.date ?? selected.submittedDate}
      buttonLabel="View in miles"
      onPress={() => showToast('Miles credited', `${formatMiles(selected.miles)} miles were credited to your balance.`, 'success')}
      bottomInset={insets.bottom}
    />
  ) : screen === 'detail' && selected?.status === 'Reversed' ? (
    <StickyActionBar
      caption="Ask the supplier to review"
      value="Anantara decides the appeal"
      buttonLabel="Appeal"
      onPress={openAppeal}
      bottomInset={insets.bottom}
    />
  ) : null;

  return (
    <View className="flex-1 bg-[#F7F8FA]">
      {screen === 'list' ? (
        <ListHero topInset={insets.top} onRegister={beginRegistration} onFilter={() => setFilterOpen(true)} />
      ) : null}

      {screen === 'type' ? (
        <FormHeader topInset={insets.top} title="What are you registering?" step={1} onBack={goBack} close />
      ) : null}
      {screen === 'details' ? (
        <FormHeader topInset={insets.top} title={`${draft.category ?? 'Hotel chain'} booking details`} step={2} onBack={goBack} />
      ) : null}
      {screen === 'review' ? (
        <FormHeader topInset={insets.top} title="Check before you submit" step={3} onBack={goBack} />
      ) : null}
      {screen === 'submitted' && selected ? (
        <View className="relative overflow-hidden px-5 pb-5" style={{ paddingTop: insets.top + 10 }}>
          <LinearGradient colors={['#075E45', '#12805A', '#1C8C64']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }} />
          <View pointerEvents="none" className="absolute -right-9 -top-12 h-52 w-52 rounded-full border border-white/10" />
          <Text className="mb-5 text-[12px] text-white/80">9:41                                         ▴ ▾ ▰</Text>
          <View className="mb-3 h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-white/15">
            <CheckCircle2 color="white" size={22} />
          </View>
          <Text className="text-[23px] font-bold text-white">Booking submitted</Text>
          <Text className="mt-2 text-[13px] leading-[19px] text-[#D9F0E7]">
            Reference {submittedReference} has gone to {selected.supplier} for confirmation. We will notify you as soon as they respond.
          </Text>
        </View>
      ) : null}
      {screen === 'detail' && selected ? (
        <DetailHero booking={selected} topInset={insets.top} onBack={goBack} onMore={detailHeaderOnMore} />
      ) : null}
      {screen === 'appeal' && selected ? (
        <DetailHero booking={selected} topInset={insets.top} onBack={goBack} onMore={detailHeaderOnMore} />
      ) : null}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: screen === 'submitted' ? 20 : 16,
          paddingTop: screen === 'list' ? 14 : screen === 'detail' || screen === 'appeal' ? 15 : 14,
          paddingBottom: footer ? 94 + Math.max(insets.bottom, 10) : 110,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {screen === 'list' ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
              {bookingFilters.map((item) => {
                const active = filter === item;
                const label = item === 'Awaiting supplier' ? 'Awaiting supplier' : item;
                return (
                  <Pressable
                    key={item}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    onPress={() => setFilter(item)}
                    className={`mr-2 rounded-full border px-3 py-1.5 ${active ? 'border-[#4145B6] bg-[#F0F1FB]' : 'border-[#E6E8EE] bg-white'}`}
                  >
                    <Text className={`text-[11px] font-medium ${active ? 'text-[#4145B6]' : 'text-[#545B6A]'}`}>{label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-[11px] font-semibold tracking-[0.7px] text-[#737A89]">YOUR BOOKINGS</Text>
              <Text className="text-[10px] text-[#858C99]">{visibleBookings.length} bookings</Text>
            </View>
            {visibleBookings.length ? visibleBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} onPress={() => openBooking(booking)} />
            )) : (
              <View className="items-center rounded-[14px] border border-[#E8EAF0] bg-white px-5 py-9">
                <FileCheck2 color="#4145B6" size={26} />
                <Text className="mt-3 text-[15px] font-semibold text-[#252B3A]">No bookings found</Text>
                <Text className="mt-1 text-center text-[12px] text-[#737A89]">Try another status filter, or register your next booking.</Text>
              </View>
            )}
          </>
        ) : null}

        {screen === 'type' ? (
          <>
            <Text className="mb-1 text-[12px] leading-[18px] text-[#737A89]">
              Miles are calculated from the booking value and supplier category.
            </Text>
            <View className="mb-4 mt-3 min-h-11 flex-row items-center rounded-[11px] border border-[#E8EAF0] bg-white px-3">
              <Search color="#737A89" size={16} />
              <TextInput
                value={categorySearch}
                onChangeText={setCategorySearch}
                placeholder="Search 29 categories"
                placeholderTextColor="#858C99"
                className="ml-2 h-10 flex-1 text-[12px] text-[#252B3A]"
              />
              {categorySearch ? (
                <Pressable onPress={() => setCategorySearch('')} accessibilityLabel="Clear category search">
                  <X color="#858C99" size={15} />
                </Pressable>
              ) : null}
            </View>

            {!categorySearch ? (
              <>
                <SectionLabel>MOST USED BY YOU</SectionLabel>
                <View className="mb-4 flex-row">
                  {popularCategories.map((item, index) => {
                    const Icon = categories.find((category) => category.title === item)?.icon ?? Hotel;
                    const active = draft.category === item;
                    return (
                      <Pressable
                        key={item}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: active }}
                        onPress={() => updateDraft('category', item)}
                        className={`mr-1.5 flex-1 items-center rounded-[12px] border px-1 py-2 ${active ? 'border-[#4145B6] bg-[#F0F1FB]' : 'border-[#E8EAF0] bg-white'}`}
                      >
                        <View className={`mb-1.5 h-7 w-7 items-center justify-center rounded-[8px] ${index === 3 ? 'bg-[#F5AE23]' : 'bg-[#4145B6]'}`}>
                          <Icon color="white" size={15} />
                        </View>
                        <Text numberOfLines={1} className={`text-[9px] ${active ? 'font-semibold text-[#4145B6]' : 'text-[#737A89]'}`}>{item}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {visibleCategories.map((item, index) => {
              const Icon = item.icon;
              const active = draft.category === item.title;
              const group = index < 3 ? 'ACCOMMODATION' : index < 4 ? 'TRANSPORT' : 'TRAVEL';
              const previousGroup = index > 0
                ? (visibleCategories[index - 1].title === 'Airlines' ? 'TRANSPORT' : visibleCategories[index - 1].title === 'Experience' || visibleCategories[index - 1].title === 'Tour package' ? 'TRAVEL' : 'ACCOMMODATION')
                : '';
              return (
                <View key={item.title}>
                  {group !== previousGroup ? <SectionLabel>{group}</SectionLabel> : null}
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    onPress={() => updateDraft('category', item.title)}
                    className="min-h-[52px] flex-row items-center border-b border-[#E8EAF0] py-2"
                  >
                    <View className="mr-3 w-6 items-center"><Icon color={active ? '#4145B6' : '#697181'} size={15} /></View>
                    <View className="flex-1">
                      <Text className="text-[12px] font-medium text-[#303748]">{item.title}</Text>
                      <Text className="mt-0.5 text-[10px] text-[#858C99]">{item.subtitle}</Text>
                    </View>
                    {active ? <CheckCircle2 color="#4145B6" size={17} /> : <ChevronRight color="#8F96A4" size={16} />}
                  </Pressable>
                </View>
              );
            })}
          </>
        ) : null}

        {screen === 'details' ? (
          <>
            <Text className="mb-3 text-[12px] leading-[18px] text-[#737A89]">
              Enter them exactly as they appear on the supplier confirmation, which must show the amount paid.
            </Text>
            <SectionLabel>SUPPLIER</SectionLabel>
            <Pressable
              accessibilityRole="button"
              onPress={() => setSupplierOpen(true)}
              className="mb-3 min-h-[43px] flex-row items-center justify-between rounded-[10px] border border-[#E5E8EF] bg-white px-3"
            >
              <Text className={`text-[12px] ${draft.supplier ? 'text-[#303748]' : 'text-[#858C99]'}`}>
                {draft.supplier || (draft.category === 'Hotel chain' ? 'Select hotel chain' : 'Select supplier')}
              </Text>
              <ChevronDown color="#737A89" size={15} />
            </Pressable>

            <SectionLabel>SUPPLIER BOOKING REFERENCE</SectionLabel>
            <TextInput
              value={draft.reference}
              onChangeText={(value) => updateDraft('reference', value.toUpperCase())}
              placeholder="e.g. HIL-99212-AB"
              placeholderTextColor="#858C99"
              autoCapitalize="characters"
              className="mb-3 min-h-[43px] rounded-[10px] border border-[#4145B6] bg-white px-3 text-[12px] text-[#252B3A]"
            />

            <View className="mb-3 flex-row">
              <View className="mr-2 flex-1">
                <SectionLabel>CHECK-IN</SectionLabel>
                <View className="flex-row items-center rounded-[10px] border border-[#E5E8EF] bg-white px-2.5">
                  <TextInput value={draft.checkIn} onChangeText={(value) => updateDraft('checkIn', value)} placeholder="4 Nov 2026" placeholderTextColor="#858C99" className="h-[42px] flex-1 text-[11px] text-[#252B3A]" />
                  <CalendarDays color="#737A89" size={14} />
                </View>
              </View>
              <View className="flex-1">
                <SectionLabel>CHECK-OUT</SectionLabel>
                <View className="flex-row items-center rounded-[10px] border border-[#E5E8EF] bg-white px-2.5">
                  <TextInput value={draft.checkOut} onChangeText={(value) => updateDraft('checkOut', value)} placeholder="8 Nov 2026" placeholderTextColor="#858C99" className="h-[42px] flex-1 text-[11px] text-[#252B3A]" />
                  <CalendarDays color="#737A89" size={14} />
                </View>
              </View>
            </View>

            <View className="mb-3 flex-row">
              <View className="mr-2 w-[28%]">
                <SectionLabel>CURRENCY</SectionLabel>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    const index = currencyOptions.indexOf(draft.currency);
                    updateDraft('currency', currencyOptions[(index + 1) % currencyOptions.length]);
                  }}
                  className="h-[43px] flex-row items-center justify-center rounded-[10px] border border-[#E5E8EF] bg-white"
                >
                  <Text className="mr-2 text-[12px] text-[#303748]">{draft.currency}</Text>
                  <ChevronDown color="#737A89" size={13} />
                </Pressable>
              </View>
              <View className="flex-1">
                <SectionLabel>BOOKING VALUE</SectionLabel>
                <TextInput value={draft.value} onChangeText={(value) => updateDraft('value', value.replace(/[^\d.,]/g, ''))} placeholder="12,800" placeholderTextColor="#858C99" keyboardType="decimal-pad" className="h-[43px] rounded-[10px] border border-[#E5E8EF] bg-white px-3 text-[12px] text-[#252B3A]" />
              </View>
            </View>

            <View className="mb-3 min-h-[58px] flex-row items-center rounded-[12px] bg-[#FFF7E5] px-3">
              <View className="mr-2.5 h-9 w-9 items-center justify-center rounded-[10px] bg-[#FFB91F]">
                <Award color="#202638" size={19} />
              </View>
              <View className="flex-1">
                <Text className="text-[9px] font-semibold tracking-[0.5px] text-[#A06D12]">MILES ON CONFIRMATION</Text>
                <View className="mt-0.5 flex-row items-baseline">
                  <Text className="text-[14px] font-bold text-[#252B3A]">+{formatMiles(milesEstimate)}</Text>
                  <Text className="ml-1.5 text-[10px] text-[#737A89]">once the supplier confirms</Text>
                </View>
              </View>
            </View>

            <SectionLabel>EVIDENCE</SectionLabel>
            {proof ? (
              <FileRow file={proof} onRemove={() => setProof(null)} />
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => void chooseDocument(setProof)}
                className="mb-2 min-h-[54px] flex-row items-center rounded-[11px] border border-dashed border-[#BFC4D0] bg-white px-3"
              >
                <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-[9px] bg-[#EAF8F0]">
                  <Upload color="#168052" size={16} />
                </View>
                <View className="flex-1">
                  <Text className="text-[12px] font-medium text-[#303748]">Attach supplier confirmation</Text>
                  <Text className="mt-0.5 text-[10px] text-[#858C99]">PDF or image · max 10 MB</Text>
                </View>
                <Plus color="#4145B6" size={17} />
              </Pressable>
            )}
          </>
        ) : null}

        {screen === 'review' ? (
          <>
            <View className="mb-3 overflow-hidden rounded-[14px] border border-[#E8EAF0] bg-white">
              <LinearGradient colors={['#30377E', '#4D58C8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} className="flex-row items-center px-3 py-2.5 p-3">
                <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-[9px] bg-white/20 m-3">
                  <CategoryIcon color="white" size={16} />
                </View>
                <View className="flex-1 m-3">
                  <Text className="text-[12px] font-semibold text-white">{draft.supplier || draft.category}</Text>
                  <Text className="mt-0.5 text-[9px] text-white/75">{draft.category} · {draft.checkIn}–{draft.checkOut}</Text>
                </View>
              </LinearGradient>
              <View className="px-3">
                <DetailRow label="Supplier reference" value={draft.reference} />
                <DetailRow label="Travel dates" value={`${draft.checkIn}–${draft.checkOut}`} />
                <DetailRow label="Booking value" value={`${draft.currency} ${draft.value}`} />
                <DetailRow label="Evidence" value={proof?.name ?? ''} last />
              </View>
            </View>

            <View className="mb-3 min-h-[58px] flex-row items-center rounded-[12px] bg-[#FFF7E5] px-3">
              <View className="mr-2.5 h-9 w-9 items-center justify-center rounded-[10px] bg-[#FFB91F]">
                <Award color="#202638" size={19} />
              </View>
              <View className="flex-1">
                <Text className="text-[9px] font-semibold tracking-[0.4px] text-[#A06D12]">YOU WILL EARN ON CONFIRMATION</Text>
                <View className="mt-0.5 flex-row items-baseline">
                  <Text className="text-[14px] font-bold text-[#252B3A]">+{formatMiles(milesEstimate)}</Text>
                  <Text className="ml-1 text-[10px] text-[#737A89]">miles once the supplier confirms</Text>
                </View>
              </View>
            </View>

            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: confirmBooking }}
              onPress={() => setConfirmBooking((value) => !value)}
              className="flex-row items-start px-1 py-1"
            >
              <View className={`mr-2 mt-0.5 h-[15px] w-[15px] items-center justify-center rounded-[3px] ${confirmBooking ? 'bg-[#4145B6]' : 'border border-[#BFC4D0] bg-white'}`}>
                {confirmBooking ? <Check color="white" size={11} strokeWidth={3} /> : null}
              </View>
              <Text className="flex-1 text-[10px] leading-[15px] text-[#737A89]">
                I confirm this is a genuine customer booking made through my agency. The supplier verifies it and may reverse miles for bookings that are cancelled or cannot be matched.
              </Text>
            </Pressable>
          </>
        ) : null}

        {screen === 'submitted' && selected ? (
          <>
            <SectionLabel>WHAT HAPPENS NEXT</SectionLabel>
            <View className="mb-3">
              {[
                ['Submitted', 'Just now', CheckCircle2, '#0B9A5E'],
                [`${selected.supplier.split(' ')[0]} confirms`, 'We remind them by email and SMS', Clock3, '#D39A1F'],
                ['Miles credited', 'Credited automatically on confirmation', Award, '#798194'],
              ].map(([label, detail, Icon, color], index) => {
                const StepIcon = Icon as typeof CheckCircle2;
                return (
                  <View key={String(label)} className="flex-row items-start">
                    <View className="mr-3 items-center">
                      <StepIcon color={String(color)} size={16} />
                      {index < 2 ? <View className="my-1 h-4 w-px bg-[#DDE1E8]" /> : null}
                    </View>
                    <View className="flex-1 pb-2.5">
                      <Text className="text-[12px] font-medium text-[#252B3A]">{String(label)}</Text>
                      <Text className="mt-0.5 text-[10px] text-[#737A89]">{String(detail)}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
            <Pressable onPress={beginRegistration} className="mb-2 min-h-[44px] items-center justify-center rounded-full bg-[#4145B6]">
              <Text className="text-[12px] font-semibold text-white">Register another booking</Text>
            </Pressable>
            <Pressable onPress={() => setScreen('list')} className="min-h-[42px] items-center justify-center rounded-full border border-[#E4E7ED] bg-white">
              <Text className="text-[12px] font-semibold text-[#252B3A]">Back to my bookings</Text>
            </Pressable>
          </>
        ) : null}

        {screen === 'detail' && selected ? (
          <>
            <View className="mb-3 rounded-[12px] bg-[#F0FBF5] p-3">
              <View className="flex-row items-start">
                <CheckCircle2 color={selected.status === 'Reversed' ? '#B63D45' : '#0B9A5E'} size={15} />
                <View className="ml-2.5 flex-1">
                  <Text className={`text-[12px] font-medium ${selected.status === 'Reversed' ? 'text-[#B63D45]' : 'text-[#168052]'}`}>
                    {selected.status === 'Approved' ? `${formatMiles(selected.miles)} miles credited` : selected.status === 'Reversed' ? 'Booking reversed' : `${formatMiles(selected.miles)} miles awaiting supplier`}
                  </Text>
                  <Text className="mt-0.5 text-[10px] leading-[15px] text-[#5D806D]">
                    {selected.status === 'Approved'
                      ? `Credited automatically when ${selected.supplier.split(' ')[0]} confirmed`
                      : selected.status === 'Reversed'
                        ? `${selected.supplier.split(' ')[0]} reversed their confirmation on 2 Oct`
                        : 'We will credit your miles as soon as the supplier confirms'}
                  </Text>
                </View>
              </View>
            </View>

            <SectionLabel>STATUS HISTORY</SectionLabel>
            <View className="mb-4">
              {selected.statusHistory.map((item, index) => (
                <View key={`${item.label}-${item.date}`} className="flex-row items-start">
                  <View className="mr-2.5 items-center">
                    <View className={`h-[15px] w-[15px] items-center justify-center rounded-full ${item.reversed ? 'bg-[#FCEDEE]' : 'bg-[#E8F6EF]'}`}>
                      {item.reversed ? <X color="#B63D45" size={10} /> : <Check color="#0B9A5E" size={10} strokeWidth={3} />}
                    </View>
                    {index < selected.statusHistory.length - 1 ? <View className="my-0.5 h-3 w-px bg-[#DDE1E8]" /> : null}
                  </View>
                  <View className="flex-1 pb-1.5">
                    <Text className={`text-[11px] font-medium ${item.reversed ? 'text-[#B63D45]' : 'text-[#252B3A]'}`}>{item.label}</Text>
                    <Text className="mt-0.5 text-[9px] text-[#858C99]">{item.date}</Text>
                  </View>
                </View>
              ))}
            </View>

            <SectionLabel>BOOKING DETAILS</SectionLabel>
            <View className="mb-3">
              <DetailRow label="Supplier" value={selected.supplier} />
              <DetailRow label="Travel dates" value={selected.travelDates} />
              <DetailRow label="Booking value" value={selected.bookingValue} />
              <DetailRow label="Customer ref" value={selected.reference} />
              <DetailRow label="Registered" value={selected.submittedDate} last />
            </View>

            <SectionLabel>SUPPLIER CONFIRMATION</SectionLabel>
            <FileRow file={{ name: selected.evidenceName, uri: '' }} />
          </>
        ) : null}
      </ScrollView>

      {footer}

      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <Pressable onPress={() => setFilterOpen(false)} className="flex-1 justify-end bg-black/35">
          <Pressable onPress={(event) => event.stopPropagation()} className="rounded-t-[22px] bg-white px-5 pb-8 pt-4">
            <View className="mb-4 h-1 w-9 self-center rounded-full bg-[#D7DAE2]" />
            <View className="mb-3 flex-row items-center justify-between">
              <Text className="text-[17px] font-semibold text-[#252B3A]">Filter bookings</Text>
              <Pressable accessibilityLabel="Close filters" onPress={() => setFilterOpen(false)} hitSlop={8}>
                <X color="#737A89" size={18} />
              </Pressable>
            </View>
            {bookingFilters.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="radio"
                accessibilityState={{ checked: filter === item }}
                onPress={() => { setFilter(item); setFilterOpen(false); }}
                className="min-h-11 flex-row items-center"
              >
                <View className={`mr-3 h-[17px] w-[17px] items-center justify-center rounded-full border ${filter === item ? 'border-[#4145B6]' : 'border-[#C9CED8]'}`}>
                  {filter === item ? <View className="h-2.5 w-2.5 rounded-full bg-[#4145B6]" /> : null}
                </View>
                <Text className="text-[13px] text-[#303748]">{item}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={supplierOpen} transparent animationType="slide" onRequestClose={() => setSupplierOpen(false)}>
        <Pressable onPress={() => setSupplierOpen(false)} className="flex-1 justify-end bg-black/35">
          <Pressable onPress={(event) => event.stopPropagation()} className="rounded-t-[22px] bg-white px-5 pb-8 pt-4">
            <View className="mb-4 h-1 w-9 self-center rounded-full bg-[#D7DAE2]" />
            <Text className="mb-3 text-[17px] font-semibold text-[#252B3A]">Choose supplier</Text>
            {suppliers.map((supplier) => (
              <Pressable
                key={supplier}
                onPress={() => { updateDraft('supplier', supplier); setSupplierOpen(false); }}
                className="min-h-11 flex-row items-center justify-between border-b border-[#EEF0F4]"
              >
                <Text className="text-[13px] text-[#303748]">{supplier}</Text>
                {draft.supplier === supplier ? <CheckCircle2 color="#4145B6" size={17} /> : <ChevronRight color="#A1A7B2" size={16} />}
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={screen === 'appeal' && !!selected} transparent animationType="slide" onRequestClose={() => setScreen('detail')}>
        <View className="flex-1 justify-end bg-black/55">
          <View className="max-h-[84%] rounded-t-[22px] bg-[#F8F9FB] px-4 pb-5 pt-2">
            <View className="mb-3 h-1 w-9 self-center rounded-full bg-[#CFD3DC]" />
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <Text className="text-[16px] font-bold text-[#202638]">Ask {selected?.supplier.split(' ')[0]} to review</Text>
              <Text className="mt-1 text-[11px] leading-[16px] text-[#737A89]">
                Your appeal goes to {selected?.supplier}, who reversed the booking. One appeal per booking.
              </Text>
              <View className="my-3 flex-row items-center rounded-[12px] bg-white p-2.5">
                <View className="mr-2.5 h-8 w-8 items-center justify-center rounded-[9px] bg-[#4145B6]">
                  <Hotel color="white" size={15} />
                </View>
                <View className="flex-1">
                  <Text className="text-[11px] font-medium text-[#252B3A]">{selected?.partner}</Text>
                  <Text className="mt-0.5 text-[10px] text-[#B63D45]">{selected?.id} · −{formatMiles(selected?.miles ?? 0)} miles</Text>
                </View>
              </View>

              <SectionLabel>WHY ARE YOU APPEALING?</SectionLabel>
              {appealReasons.map((reason) => {
                const active = appealReason === reason;
                return (
                  <Pressable
                    key={reason}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    onPress={() => setAppealReason(reason)}
                    className={`mb-1.5 min-h-9 flex-row items-center rounded-[10px] border px-2.5 ${active ? 'border-[#4145B6] bg-[#F0F1FB]' : 'border-[#E6E8EE] bg-white'}`}
                  >
                    <View className={`mr-2 h-[14px] w-[14px] items-center justify-center rounded-full border ${active ? 'border-[#4145B6]' : 'border-[#C9CED8]'}`}>
                      {active ? <View className="h-2 w-2 rounded-full bg-[#4145B6]" /> : null}
                    </View>
                    <Text className="text-[11px] text-[#303748]">{reason}</Text>
                  </Pressable>
                );
              })}

              {appealReason === 'Something else' ? (
                <TextInput
                  value={appealDetails}
                  onChangeText={setAppealDetails}
                  placeholder="Tell the supplier what happened"
                  placeholderTextColor="#858C99"
                  multiline
                  textAlignVertical="top"
                  className="mb-2 min-h-[65px] rounded-[11px] border border-[#E6E8EE] bg-white px-3 py-2 text-[11px] text-[#303748]"
                />
              ) : null}

              {appealProof ? (
                <FileRow file={appealProof} onRemove={() => setAppealProof(null)} />
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void chooseDocument(setAppealProof)}
                  className="my-2 min-h-[38px] flex-row items-center rounded-[10px] border border-dashed border-[#737DE0] bg-[#F0F1FB] px-2.5"
                >
                  <Upload color="#4145B6" size={13} />
                  <Text className="ml-2 text-[10px] font-medium text-[#4145B6]">Attach the reissued confirmation</Text>
                </Pressable>
              )}
              <View className="mt-2 flex-row">
                <Pressable onPress={() => setScreen('detail')} className="mr-2 min-h-10 flex-1 items-center justify-center rounded-full border border-[#E3E6EE] bg-white">
                  <Text className="text-[12px] font-medium text-[#252B3A]">Cancel</Text>
                </Pressable>
                <Pressable onPress={submitAppeal} className="min-h-10 flex-1 items-center justify-center rounded-full bg-[#FFB91F]">
                  <Text className="text-[12px] font-semibold text-[#171923]">Send to supplier</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
