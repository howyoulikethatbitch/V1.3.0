import { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Star,
  Globe,
  Heart,
  Trophy,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Film,
  Tv
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import type { WatcherTitle, Achievement, Entry } from '@/types';

/* ============================================================
   Title Progression Data
   ============================================================ */
const WATCHER_TITLES: WatcherTitle[] = [
  { emoji: '🌱', name: 'Newcomer', min: 1, max: 24, description: 'Every collection begins with a single story.' },
  { emoji: '📺', name: 'Casual Viewer', min: 25, max: 74, description: "You're beginning to explore the world of BL." },
  { emoji: '🍿', name: 'Weekend Binger', min: 75, max: 149, description: 'Watching BL has become part of your routine.' },
  { emoji: '🎭', name: 'Drama Enthusiast', min: 150, max: 299, description: "You've experienced many unforgettable stories." },
  { emoji: '💖', name: 'Romance Connoisseur', min: 300, max: 499, description: 'Your collection reflects passion and appreciation for the genre.' },
  { emoji: '🎬', name: 'BL Archivist', min: 500, max: 749, description: 'Your library has become a remarkable archive of BL.' },
  { emoji: '👑', name: 'BL Curator', min: 750, max: 999, description: "You've built a prestigious and thoughtfully curated collection." },
  { emoji: '🌌', name: 'BL Legend', min: 1000, max: Infinity, description: 'Your lifelong dedication has created an extraordinary BL legacy.' },
];

function getWatcherTitle(total: number): WatcherTitle {
  if (total === 0) return WATCHER_TITLES[0];
  return WATCHER_TITLES.find(t => total >= t.min && total <= t.max) || WATCHER_TITLES[WATCHER_TITLES.length - 1];
}

function getNextTitle(current: WatcherTitle): WatcherTitle | null {
  const idx = WATCHER_TITLES.indexOf(current);
  return idx < WATCHER_TITLES.length - 1 ? WATCHER_TITLES[idx + 1] : null;
}

/* ============================================================
   Achievement Definitions
   ============================================================ */
const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-collection', emoji: '🏆', name: 'First Collection',
    description: 'Added your first BL entry',
    condition: (s) => s.total >= 1
  },
  {
    id: 'growing-library', emoji: '📚', name: 'Growing Library',
    description: 'Collected 50 BL titles',
    condition: (s) => s.total >= 50
  },
  {
    id: 'archive-builder', emoji: '🎬', name: 'Archive Builder',
    description: 'Collected 100 BL titles',
    condition: (s) => s.total >= 100
  },
  {
    id: 'world-traveler', emoji: '🌏', name: 'World Traveler',
    description: 'Watched BL from six or more countries',
    condition: (s) => s.countryBreakdown.length >= 6
  },
  {
    id: 'perfectionist', emoji: '⭐', name: 'Perfectionist',
    description: 'Awarded a perfect rating to five titles',
    condition: (s) => {
      // Count 10.0 ratings
      return s.highestRated.filter(h => h.rating === 10.0).length >= 5;
    }
  },
  {
    id: 'loyal-fan', emoji: '❤️', name: 'Loyal Fan',
    description: 'Added 50 favorites',
    condition: (s) => s.favorites >= 50
  },
  {
    id: 'marathon-viewer', emoji: '📺', name: 'Marathon Viewer',
    description: 'Completed 100 BL titles',
    condition: (s) => s.completed >= 100
  },
  {
    id: 'airing-companion', emoji: '🔥', name: 'Airing Companion',
    description: 'Tracked 25 ongoing BL releases',
    condition: (s) => s.ongoing >= 25
  },
  {
    id: 'ranking-master', emoji: '👑', name: 'Ranking Master',
    description: 'Created Top 10 drawers for five different years',
    condition: (s) => s.top10 >= 5
  },
];

/* ============================================================
   Collection Personality Traits
   ============================================================ */
function getPersonalityTraits(stats: {
  total: number;
  completed: number;
  favorites: number;
  avgRating: string;
  ongoing: number;
  countryBreakdown: [string, number][];
  top10: number;
}): { emoji: string; name: string; description: string }[] {
  const traits: { emoji: string; name: string; description: string }[] = [];

  // Completionist — completion rate > 80%
  if (stats.total > 0 && (stats.completed / stats.total) > 0.8) {
    traits.push({ emoji: '🎭', name: 'Completionist', description: 'You complete most series you begin and rarely leave titles unfinished.' });
  }

  // World Explorer — 6+ countries
  if (stats.countryBreakdown.length >= 6) {
    traits.push({ emoji: '🌏', name: 'World Explorer', description: 'Your collection spans multiple countries and styles of BL storytelling.' });
  }

  // Romantic Collector — has favorites
  if (stats.favorites > 0) {
    traits.push({ emoji: '❤️', name: 'Romantic Collector', description: 'You maintain a carefully curated list of favorite titles.' });
  }

  // Selective Critic — average rating < 8.0
  const avg = parseFloat(stats.avgRating);
  if (avg > 0 && avg < 8.0) {
    traits.push({ emoji: '⭐', name: 'Selective Critic', description: 'You reserve perfect ratings for only the most exceptional stories.' });
  }

  // Seasonal Watcher — has ongoing entries
  if (stats.ongoing > 0) {
    traits.push({ emoji: '📅', name: 'Seasonal Watcher', description: 'You actively keep up with currently airing BL releases.' });
  }

  // Curator — has Top 10 drawers for 2+ years
  if (stats.top10 >= 2) {
    traits.push({ emoji: '🎬', name: 'Curator', description: 'You consistently maintain and organize your yearly Top 10 rankings.' });
  }

  return traits;
}

/* ============================================================
   Section Header Component
   ============================================================ */
function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-[#E50914]" />
      <h3 className="text-white font-bold text-sm uppercase tracking-wider">{title}</h3>
      <div className="flex-1 h-px bg-white/[0.06] ml-2" />
    </div>
  );
}

/* ============================================================
   BL Watcher Profile Component
   ============================================================ */
export default function BLWatcherProfile({ onBack }: { onBack: () => void }) {
  const { state, dispatch } = useApp();
  const [watchingSinceInput, setWatchingSinceInput] = useState(
    state.watchingSince?.toString() || ''
  );

  const currentYear = new Date().getFullYear();

  /* ---- Derived Stats ---- */
  const {
    total,
    completed,
    ongoing,
    dropped,
    planned,
    favorites,
    top10,
    avgRating,
    countryBreakdown,
    highestRated,
    watchingSince
  } = useMemo(() => {
    const total = state.entries.length;
    const completed = state.entries.filter(e => e.status === 'COMPLETE').length;
    const ongoing = state.entries.filter(e => e.status === 'ONGOING').length;
    const dropped = state.entries.filter(e => e.status === 'DROPPED').length;
    const planned = state.entries.filter(e => e.status === 'PLANNED').length;
    const favorites = state.favorites.length;
    const top10 = state.top10Drawers.length;
    const avgRating = state.favorites.length > 0
      ? (state.favorites.reduce((s, f) => s + f.overallRating, 0) / state.favorites.length).toFixed(1)
      : '0.0';

    // Countries breakdown
    const countryMap = new Map<string, number>();
    const knownCountries = ['Thailand', 'Japan', 'Taiwan', 'Korea', 'South Korea', 'China'];
    let othersCount = 0;

    state.entries.forEach(e => {
      if (knownCountries.includes(e.country)) {
        const key = e.country === 'South Korea' ? 'Korea' : e.country;
        countryMap.set(key, (countryMap.get(key) || 0) + 1);
      } else {
        othersCount++;
      }
    });
    if (othersCount > 0) countryMap.set('Others', othersCount);
    const countryBreakdown = Array.from(countryMap.entries()).sort((a, b) => b[1] - a[1]);

    // Highest rated (for achievements)
    const highestRated = state.favorites.map(f => {
      const entry = state.entries.find(e => e.id === f.entryId);
      return {
        title: entry?.title || 'Unknown',
        rating: f.overallRating,
        entryId: f.entryId,
        type: entry?.type || 'Series'
      };
    }).sort((a, b) => b.rating - a.rating);

    return {
      total, completed, ongoing, dropped, planned,
      favorites, top10, avgRating, countryBreakdown,
      highestRated, watchingSince: state.watchingSince
    };
  }, [state]);

  /* ---- Title & Progress ---- */
  const currentTitle = useMemo(() => getWatcherTitle(total), [total]);
  const nextTitle = useMemo(() => getNextTitle(currentTitle), [currentTitle]);
  const experience = watchingSince ? currentYear - watchingSince : 0;

  const progressPercent = useMemo(() => {
    if (!nextTitle) return 100;
    const range = nextTitle.min - currentTitle.min;
    const progress = total - currentTitle.min;
    return Math.min(100, Math.max(0, (progress / range) * 100));
  }, [total, currentTitle, nextTitle]);

  /* ---- Collection Growth ---- */
  const collectionGrowth = useMemo(() => {
    const yearMap = new Map<number, number>();
    state.entries.forEach(e => {
      const addYear = new Date(e.createdAt).getFullYear();
      yearMap.set(addYear, (yearMap.get(addYear) || 0) + 1);
    });
    return Array.from(yearMap.entries()).sort((a, b) => b[0] - a[0]);
  }, [state.entries]);

  /* ---- Personality Traits ---- */
  const personalityTraits = useMemo(() => getPersonalityTraits({
    total, completed, favorites, avgRating, ongoing, countryBreakdown, top10
  }), [total, completed, favorites, avgRating, ongoing, countryBreakdown, top10]);

  /* ---- Achievements ---- */
  const achievementStats = { total, completed, ongoing, dropped, planned, favorites, top10, avgRating, countryBreakdown, highestRated, watchingSince };
  const achievements = useMemo(() => {
    return ACHIEVEMENTS.map(ach => ({
      ...ach,
      unlocked: ach.condition(achievementStats)
    }));
  }, [achievementStats]);

  /* ---- Personal Records ---- */
  const personalRecords = useMemo(() => {
    // Highest Rated Series
    const seriesRatings = highestRated.filter(h => h.type === 'Series');
    const highestSeries = seriesRatings[0] || null;

    // Highest Rated Movie
    const movieRatings = highestRated.filter(h => h.type === 'Movie');
    const highestMovie = movieRatings[0] || null;

    // Favorite Country (most entries)
    const favoriteCountry = countryBreakdown[0] || null;

    // Most Active Collection Year
    const mostActiveYear = collectionGrowth.reduce((a, b) => a[1] > b[1] ? a : b, [0, 0] as [number, number]);

    // Completion & Drop rates
    const completionRate = total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0';
    const dropRate = total > 0 ? ((dropped / total) * 100).toFixed(1) : '0.0';

    // Longest ongoing tracking
    const longestOngoing = state.ongoing.reduce((max, o) => {
      const entry = state.entries.find(e => e.id === o.entryId);
      if (entry) {
        const trackingYears = currentYear - new Date(entry.createdAt).getFullYear() + 1;
        return trackingYears > max ? trackingYears : max;
      }
      return max;
    }, 0);

    return {
      highestSeries,
      highestMovie,
      favoriteCountry,
      mostActiveYear: mostActiveYear[0] > 0 ? mostActiveYear : null,
      totalFavorites: favorites,
      totalTop10Drawers: top10,
      avgRating,
      completionRate,
      dropRate,
      longestOngoing
    };
  }, [highestRated, countryBreakdown, collectionGrowth, total, completed, dropped, favorites, top10, avgRating, state.ongoing, state.entries, currentYear]);

  /* ---- Collection Insights ---- */
  const insights = useMemo(() => {
    const parts: string[] = [];

    if (watchingSince && experience > 0) {
      parts.push(`Over the past ${experience} years, you've built a collection of `);
    } else {
      parts.push('You have built a collection of ');
    }

    parts.push(`${total} BL title${total !== 1 ? 's' : ''}`);

    if (countryBreakdown.length >= 3) {
      parts.push(` spanning ${countryBreakdown.length} countries`);
    }

    parts.push('. ');

    if (ongoing > 0) {
      parts.push(`You actively follow ${ongoing} ongoing release${ongoing !== 1 ? 's' : ''}, `);
    }

    if (favorites > 0) {
      parts.push(`have rated ${favorites} favorite${favorites !== 1 ? 's' : ''}, `);
    }

    if (top10 > 0) {
      parts.push(`and maintain Top 10 rankings for ${top10} year${top10 !== 1 ? 's' : ''}`);
    }

    if (parts[parts.length - 1].endsWith('. ')) {
      // Already ends properly
    } else {
      parts.push(', creating a well-curated archive of the genre');
    }

    parts.push('.');

    return parts.join('');
  }, [watchingSince, experience, total, countryBreakdown.length, ongoing, favorites, top10]);

  /* ---- Handlers ---- */
  const handleWatchingSinceChange = useCallback((value: string) => {
    setWatchingSinceInput(value);
    const year = parseInt(value, 10);
    if (!isNaN(year) && year >= 1980 && year <= currentYear) {
      dispatch({ type: 'SET_WATCHING_SINCE', payload: year });
    } else if (value === '') {
      dispatch({ type: 'SET_WATCHING_SINCE', payload: null });
    }
  }, [dispatch, currentYear]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black overflow-y-auto"
      initial={{ opacity: 0, x: '100%' }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
    >
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/[0.06]">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <h1 className="text-white font-bold text-base">BL Watcher Profile</h1>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8 max-w-2xl mx-auto">

        {/* ===== 1. PROFILE HEADER ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center"
        >
          <div className="text-6xl mb-3">{currentTitle.emoji}</div>
          <h2 className="text-2xl font-extrabold text-white mb-2">
            {currentTitle.emoji} {currentTitle.name}
          </h2>
          <p className="text-[#888] text-sm italic max-w-sm mx-auto">
            "A carefully built collection reflecting years of passion for Boys' Love."
          </p>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-6 mt-5">
            <div className="text-center">
              <p className="text-white font-bold text-lg">{total}</p>
              <p className="text-[#888] text-[10px] uppercase tracking-wider">Collection</p>
            </div>
            <div className="w-px h-8 bg-white/[0.1]" />
            <div className="text-center">
              <p className="text-white font-bold text-lg">{watchingSince || '—'}</p>
              <p className="text-[#888] text-[10px] uppercase tracking-wider">Watching Since</p>
            </div>
            <div className="w-px h-8 bg-white/[0.1]" />
            <div className="text-center">
              <p className="text-white font-bold text-lg">{experience > 0 ? `${experience} Years` : '—'}</p>
              <p className="text-[#888] text-[10px] uppercase tracking-wider">Experience</p>
            </div>
          </div>
        </motion.div>

        {/* ===== 2. WATCHING SINCE INPUT ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4"
        >
          <SectionHeader title="Watching Since" icon={Calendar} />
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={watchingSinceInput}
              onChange={(e) => handleWatchingSinceChange(e.target.value)}
              placeholder={currentYear.toString()}
              min={1980}
              max={currentYear}
              className="bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3 text-white text-sm w-full focus:outline-none focus:border-[#E50914]/50 transition-colors placeholder:text-[#555]"
            />
          </div>
          <p className="text-[#666] text-xs mt-2">
            Enter the year you started watching BL. This is for your personal profile only.
          </p>
        </motion.div>

        {/* ===== 3. COLLECTION PROGRESS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4"
        >
          <SectionHeader title="Collection Progress" icon={TrendingUp} />

          <div className="text-center mb-4">
            <p className="text-[#888] text-xs uppercase tracking-wider">Current Title</p>
            <p className="text-white font-bold text-lg mt-1">{currentTitle.emoji} {currentTitle.name}</p>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full h-3 bg-white/[0.08] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#E50914] via-[#ff2d55] to-[#ff6b35] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-[#888] text-xs">{total} titles</span>
              {nextTitle && (
                <span className="text-[#E50914] text-xs font-medium">
                  Next: {nextTitle.emoji} {nextTitle.name} ({nextTitle.min})
                </span>
              )}
            </div>
          </div>
        </motion.div>

        {/* ===== 4. WATCHING JOURNEY ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4"
        >
          <SectionHeader title="Watching Journey" icon={Clock} />

          {collectionGrowth.length === 0 ? (
            <p className="text-[#666] text-sm text-center py-4">Start adding entries to see your journey</p>
          ) : (
            <div className="space-y-3">
              {collectionGrowth.map(([year, count]) => (
                <div key={year} className="flex items-center gap-3">
                  <div className="w-16 text-right">
                    <span className="text-white font-semibold text-sm">{year}</span>
                  </div>
                  <div className="flex-1 h-8 bg-white/[0.04] rounded-lg overflow-hidden relative">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#E50914]/60 to-[#E50914]/20 rounded-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${collectionGrowth[0] ? (count / collectionGrowth[0][1]) * 100 : 0}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                    <span className="absolute inset-0 flex items-center px-3 text-xs text-white font-medium">
                      {count} Title{count !== 1 ? 's' : ''} Added
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ===== 5. COLLECTION PERSONALITY ===== */}
        {personalityTraits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4"
          >
            <SectionHeader title="Collection Personality" icon={Heart} />
            <div className="flex flex-wrap gap-2">
              {personalityTraits.map(trait => (
                <div
                  key={trait.name}
                  className="bg-white/[0.06] border border-white/[0.08] rounded-xl px-3 py-2"
                >
                  <span className="text-sm font-semibold text-white">{trait.emoji} {trait.name}</span>
                  <p className="text-[#888] text-[11px] mt-0.5">{trait.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== 6. ACHIEVEMENT SHOWCASE ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4"
        >
          <SectionHeader title="Achievement Showcase" icon={Trophy} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map(ach => (
              <div
                key={ach.id}
                className={`p-3 rounded-xl border text-center transition-all ${
                  ach.unlocked
                    ? 'bg-white/[0.06] border-white/[0.1]'
                    : 'bg-white/[0.02] border-white/[0.04] opacity-40'
                }`}
              >
                <div className={`text-2xl mb-1 ${ach.unlocked ? '' : 'grayscale'}`}>{ach.emoji}</div>
                <p className={`text-xs font-semibold ${ach.unlocked ? 'text-white' : 'text-[#666]'}`}>
                  {ach.name}
                </p>
                <p className="text-[10px] text-[#888] mt-0.5 leading-tight">{ach.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ===== 7. PERSONAL RECORDS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4"
        >
          <SectionHeader title="Personal Records" icon={Star} />
          <div className="space-y-3">
            <RecordRow
              label="Highest Rated Series"
              value={personalRecords.highestSeries ? `${personalRecords.highestSeries.title} (${personalRecords.highestSeries.rating.toFixed(1)})` : '—'}
              icon={Tv}
            />
            <RecordRow
              label="Highest Rated Movie"
              value={personalRecords.highestMovie ? `${personalRecords.highestMovie.title} (${personalRecords.highestMovie.rating.toFixed(1)})` : '—'}
              icon={Film}
            />
            <RecordRow
              label="Favorite Country"
              value={personalRecords.favoriteCountry ? `${personalRecords.favoriteCountry[0]} (${personalRecords.favoriteCountry[1]} titles)` : '—'}
              icon={Globe}
            />
            <RecordRow
              label="Most Active Year"
              value={personalRecords.mostActiveYear ? `${personalRecords.mostActiveYear[0]} (${personalRecords.mostActiveYear[1]} titles)` : '—'}
              icon={Calendar}
            />
            <RecordRow label="Total Favorites" value={personalRecords.totalFavorites.toString()} icon={Heart} />
            <RecordRow label="Total Top 10 Drawers" value={personalRecords.totalTop10Drawers.toString()} icon={Trophy} />
            <RecordRow label="Average Rating" value={`★ ${personalRecords.avgRating}`} icon={Star} />
            <RecordRow label="Completion Rate" value={`${personalRecords.completionRate}%`} icon={CheckCircle} />
            <RecordRow label="Drop Rate" value={`${personalRecords.dropRate}%`} icon={XCircle} />
            <RecordRow
              label="Longest Ongoing Tracking"
              value={personalRecords.longestOngoing > 0 ? `${personalRecords.longestOngoing} Year${personalRecords.longestOngoing !== 1 ? 's' : ''}` : '—'}
              icon={Clock}
            />
          </div>
        </motion.div>

        {/* ===== 8. COLLECTION INSIGHTS ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-gradient-to-br from-[#E50914]/10 to-transparent border border-[#E50914]/20 rounded-2xl p-5"
        >
          <SectionHeader title="Your BL Journey" icon={TrendingUp} />
          <p className="text-[#B3B3B3] text-sm leading-relaxed italic">
            &ldquo;{insights}&rdquo;
          </p>
        </motion.div>

        {/* Bottom Spacing */}
        <div className="h-8" />
      </div>
    </motion.div>
  );
}

/* ============================================================
   Record Row Component
   ============================================================ */
function RecordRow({
  label,
  value,
  icon: Icon
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-[#666]" />
        <span className="text-[#888] text-xs">{label}</span>
      </div>
      <span className="text-white text-xs font-semibold text-right">{value}</span>
    </div>
  );
}
