import { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Tv,
  CheckCircle,
  Play,
  XCircle,
  Calendar,
  Heart,
  Star,
  TrendingUp,
  Globe,
  Trophy,
  ArrowLeft,
  X,
  ChevronRight,
  Film
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { Entry, CollectionStats } from '@/types';

/* ============================================================
   Full-Screen Modal Component
   ============================================================ */
function FullScreenModal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black flex flex-col"
          initial={{ opacity: 0, y: '100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '100%' }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        >
          {/* Modal Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-white/[0.06] flex-shrink-0">
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
            </button>
            <Icon className="w-5 h-5 text-[#E50914]" />
            <h2 className="text-white font-bold text-lg flex-1">{title}</h2>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto px-4 py-6">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============================================================
   BL Watcher Profile Summary Card
   ============================================================ */
function ProfileSummaryCard({ onViewProfile }: { onViewProfile: () => void }) {
  const { state } = useApp();

  const { title, total, watchingSince, experience } = useMemo(() => {
    const total = state.entries.length;
    const watchingSince = state.watchingSince;

    // Title progression
    let emoji = '🌱';
    let name = 'Newcomer';
    if (total >= 1000) { emoji = '🌌'; name = 'BL Legend'; }
    else if (total >= 750) { emoji = '👑'; name = 'BL Curator'; }
    else if (total >= 500) { emoji = '🎬'; name = 'BL Archivist'; }
    else if (total >= 300) { emoji = '💖'; name = 'Romance Connoisseur'; }
    else if (total >= 150) { emoji = '🎭'; name = 'Drama Enthusiast'; }
    else if (total >= 75) { emoji = '🍿'; name = 'Weekend Binger'; }
    else if (total >= 25) { emoji = '📺'; name = 'Casual Viewer'; }

    const currentYear = new Date().getFullYear();
    const experience = watchingSince ? currentYear - watchingSince : 0;

    return { title: { emoji, name }, total, watchingSince, experience };
  }, [state.entries.length, state.watchingSince]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-2xl p-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E50914]/30 to-[#E50914]/10 flex items-center justify-center text-2xl">
            {title.emoji}
          </div>
          <div>
            <p className="text-white font-bold text-sm">{title.emoji} {title.name}</p>
            <p className="text-[#888] text-xs mt-0.5">
              {total} Titles &middot; {watchingSince ? `Since ${watchingSince}` : 'Set watching year'}
              {watchingSince ? ` &middot; ${experience} Years` : ''}
            </p>
          </div>
        </div>
        <button
          onClick={onViewProfile}
          className="flex items-center gap-1 text-[#E50914] text-xs font-semibold hover:underline"
        >
          View Profile <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

/* ============================================================
   Countries Breakdown Modal Content
   ============================================================ */
function CountriesBreakdownModal() {
  const { state } = useApp();

  const countryBreakdown = useMemo(() => {
    const countryMap = new Map<string, number>();
    const knownCountries = ['Thailand', 'Japan', 'Taiwan', 'Korea', 'South Korea', 'China'];
    let othersCount = 0;

    state.entries.forEach(e => {
      const country = e.country;
      if (knownCountries.includes(country)) {
        const key = country === 'South Korea' ? 'Korea' : country;
        countryMap.set(key, (countryMap.get(key) || 0) + 1);
      } else {
        othersCount++;
      }
    });

    if (othersCount > 0) {
      countryMap.set('Others', othersCount);
    }

    return Array.from(countryMap.entries()).sort((a, b) => b[1] - a[1]);
  }, [state.entries]);

  const total = state.entries.length;

  if (countryBreakdown.length === 0) {
    return (
      <div className="text-center py-12">
        <Globe className="w-10 h-10 text-[#444] mx-auto mb-3" />
        <p className="text-[#666] text-sm">No country data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {countryBreakdown.map(([country, count]) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={country}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#B3B3B3] font-medium">{country}</span>
              <span className="text-sm text-white font-bold">{count} <span className="text-[#666] font-normal">({percentage.toFixed(1)}%)</span></span>
            </div>
            <div className="w-full h-2.5 bg-white/[0.08] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#E50914] to-[#ff2d55] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   Overview Modal Content
   ============================================================ */
function OverviewModal() {
  const { state } = useApp();

  const stats = useMemo(() => {
    const total = state.entries.length;
    const completed = state.entries.filter(e => e.status === 'COMPLETE').length;
    const ongoing = state.entries.filter(e => e.status === 'ONGOING').length;
    const dropped = state.entries.filter(e => e.status === 'DROPPED').length;
    const planned = state.entries.filter(e => e.status === 'PLANNED').length;
    const favorites = state.favorites.length;
    const top10 = state.top10Drawers.reduce((acc, d) => acc + d.entries.length, 0);
    const avgRating = state.favorites.length > 0
      ? (state.favorites.reduce((s, f) => s + f.overallRating, 0) / state.favorites.length).toFixed(1)
      : '0.0';

    return [
      { label: 'Total Entries', value: total, icon: Tv, color: 'text-white' },
      { label: 'Completed', value: completed, icon: CheckCircle, color: 'text-green-400' },
      { label: 'Ongoing', value: ongoing, icon: Play, color: 'text-blue-400' },
      { label: 'Dropped', value: dropped, icon: XCircle, color: 'text-red-400' },
      { label: 'Planned', value: planned, icon: Calendar, color: 'text-purple-400' },
      { label: 'Favorites', value: favorites, icon: Heart, color: 'text-[#E50914]' },
      { label: 'Top 10', value: top10, icon: Star, color: 'text-yellow-400' },
      { label: 'Average Rating', value: `★ ${avgRating}`, icon: TrendingUp, color: 'text-yellow-400' },
    ];
  }, [state]);

  return (
    <div className="space-y-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="flex items-center justify-between p-4 rounded-xl bg-white/[0.04] border border-white/[0.06]"
          >
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${stat.color}`} />
              <span className="text-[#B3B3B3] text-sm">{stat.label}</span>
            </div>
            <span className={`text-lg font-bold ${stat.color === 'text-white' ? 'text-white' : stat.color}`}>
              {stat.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   Highest Rated Modal Content (9.0 - 10.0 range)
   ============================================================ */
function HighestRatedModal() {
  const { state } = useApp();

  const highestRated = useMemo(() => {
    // Get favorites with ratings 9.0 - 10.0 (inclusive)
    const ratedEntries = state.favorites
      .filter(f => f.overallRating >= 9.0 && f.overallRating <= 10.0)
      .map(f => {
        const entry = state.entries.find(e => e.id === f.entryId);
        return entry ? {
          entry,
          rating: f.overallRating
        } : null;
      })
      .filter(Boolean) as { entry: Entry; rating: number }[];

    // Sort by rating descending, then by title
    return ratedEntries.sort((a, b) => {
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.entry.title.localeCompare(b.entry.title);
    });
  }, [state.favorites, state.entries]);

  if (highestRated.length === 0) {
    return (
      <div className="text-center py-12">
        <Star className="w-10 h-10 text-[#444] mx-auto mb-3" />
        <p className="text-[#666] text-sm">No entries rated 9.0+ yet</p>
        <p className="text-[#555] text-xs mt-1">Rate favorites to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {highestRated.map(({ entry, rating }) => (
        <div
          key={entry.id}
          className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]"
        >
          {/* Poster */}
          <div className="w-14 h-20 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
            {entry.poster ? (
              <img src={entry.poster} alt={entry.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film className="w-5 h-5 text-[#444]" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">{entry.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[#888] text-xs">{entry.type}</span>
              <span className="text-[#555] text-xs">&middot;</span>
              <span className="text-[#888] text-xs">{entry.year}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">{rating.toFixed(1)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   Entries Per Year Modal Content
   ============================================================ */
function EntriesPerYearModal() {
  const { state } = useApp();

  const yearGroups = useMemo(() => {
    const yearMap = new Map<number, number>();

    state.entries.forEach(e => {
      const year = e.year;
      if (typeof year === 'number') {
        yearMap.set(year, (yearMap.get(year) || 0) + 1);
      }
    });

    // Sort by year descending (newest first)
    return Array.from(yearMap.entries()).sort((a, b) => b[0] - a[0]);
  }, [state.entries]);

  if (yearGroups.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-10 h-10 text-[#444] mx-auto mb-3" />
        <p className="text-[#666] text-sm">No entries yet</p>
      </div>
    );
  }

  const maxCount = Math.max(...yearGroups.map(([, count]) => count));

  return (
    <div className="space-y-4">
      {yearGroups.map(([year, count]) => {
        const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
        return (
          <div key={year}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white font-semibold">{year}</span>
              <span className="text-sm text-[#B3B3B3]">{count} {count === 1 ? 'entry' : 'entries'}</span>
            </div>
            <div className="w-full h-2 bg-white/[0.08] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#E50914] to-[#ff6b35] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================
   Column Card Component
   ============================================================ */
function StatColumnCard({
  title,
  vertical = false,
  onClick,
  delay = 0
}: {
  title: string;
  vertical?: boolean;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.08] rounded-2xl p-5 hover:border-white/[0.15] hover:from-white/[0.08] transition-all duration-300 group flex items-center justify-center min-h-[140px]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(229,9,20,0.04)_0%,_transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
      <h3
        className={`text-white font-bold ${vertical ? 'writing-mode-vertical' : 'text-sm'} tracking-wide group-hover:text-[#E50914] transition-colors`}
        style={vertical ? { writingMode: 'vertical-rl', textOrientation: 'mixed' } : {}}
      >
        {title}
      </h3>
      <ChevronRight className="absolute bottom-3 right-3 w-4 h-4 text-[#555] group-hover:text-white transition-colors" />
    </motion.button>
  );
}

/* ============================================================
   Main Statistics Tab
   ============================================================ */
export default function StatisticsTab({ onViewProfile }: { onViewProfile?: () => void }) {
  const { state } = useApp();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = useCallback(() => setActiveModal(null), []);

  return (
    <div className="space-y-4 w-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-[#E50914]" />
        <h1 className="text-2xl font-extrabold">Statistics</h1>
      </div>

      {/* BL Watcher Profile Summary Card */}
      <ProfileSummaryCard onViewProfile={onViewProfile || (() => {})} />

      {/* Four Column Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatColumnCard
          title="Countries Breakdown"
          vertical
          onClick={() => setActiveModal('countries')}
          delay={0.05}
        />
        <StatColumnCard
          title="Overview"
          onClick={() => setActiveModal('overview')}
          delay={0.1}
        />
        <StatColumnCard
          title="Highest Rated"
          onClick={() => setActiveModal('highestRated')}
          delay={0.15}
        />
        <StatColumnCard
          title="No. Of Entries Per Year"
          onClick={() => setActiveModal('entriesPerYear')}
          delay={0.2}
        />
      </div>

      {/* Full-Screen Modals */}
      <FullScreenModal
        isOpen={activeModal === 'countries'}
        onClose={closeModal}
        title="Countries Breakdown"
        icon={Globe}
      >
        <CountriesBreakdownModal />
      </FullScreenModal>

      <FullScreenModal
        isOpen={activeModal === 'overview'}
        onClose={closeModal}
        title="Overview"
        icon={BarChart3}
      >
        <OverviewModal />
      </FullScreenModal>

      <FullScreenModal
        isOpen={activeModal === 'highestRated'}
        onClose={closeModal}
        title="Highest Rated"
        icon={Trophy}
      >
        <HighestRatedModal />
      </FullScreenModal>

      <FullScreenModal
        isOpen={activeModal === 'entriesPerYear'}
        onClose={closeModal}
        title="No. Of Entries Per Year"
        icon={Calendar}
      >
        <EntriesPerYearModal />
      </FullScreenModal>
    </div>
  );
}
