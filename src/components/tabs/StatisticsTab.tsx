import { useMemo } from 'react';
import { motion } from 'framer-motion';
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
  Trophy
} from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function StatisticsTab() {
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

    // Countries breakdown
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

    const countryBreakdown = Array.from(countryMap.entries())
      .sort((a, b) => b[1] - a[1]);

    // Highest rated entries (allow ties)
    let highestRated: { title: string; rating: number; entryId: string }[] = [];
    if (state.favorites.length > 0) {
      const maxRating = Math.max(...state.favorites.map(f => f.overallRating));
      highestRated = state.favorites
        .filter(f => f.overallRating === maxRating)
        .map(f => {
          const entry = state.entries.find(e => e.id === f.entryId);
          return {
            title: entry?.title || 'Unknown',
            rating: f.overallRating,
            entryId: f.entryId
          };
        });
    }

    return {
      total, completed, ongoing, dropped, planned, favorites, top10, avgRating,
      countryBreakdown,
      highestRated
    };
  }, [state]);

  const statCards = [
    { label: 'TOTAL ENTRIES', value: stats.total, icon: Tv, color: 'text-white' },
    { label: 'COMPLETED', value: stats.completed, icon: CheckCircle, color: 'text-green-400' },
    { label: 'ONGOING', value: stats.ongoing, icon: Play, color: 'text-blue-400' },
    { label: 'DROPPED', value: stats.dropped, icon: XCircle, color: 'text-red-400' },
    { label: 'PLANNED', value: stats.planned, icon: Calendar, color: 'text-purple-400' },
    { label: 'FAVORITES', value: stats.favorites, icon: Heart, color: 'text-[#E50914]' },
    { label: 'TOP 10', value: stats.top10, icon: Star, color: 'text-yellow-400' },
    { label: 'AVG RATING', value: `★ ${stats.avgRating}`, icon: TrendingUp, color: 'text-yellow-400' },
  ];

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-[#E50914]" />
        <h1 className="text-2xl font-extrabold">Statistics</h1>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
                <span className="text-[10px] text-[#888] font-medium tracking-wide">{card.label}</span>
              </div>
              <p className={`text-2xl font-bold ${card.color === 'text-white' ? 'text-white' : card.color}`}>
                {card.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Countries Breakdown */}
      {stats.countryBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-[#E50914]" />
            <h2 className="text-white font-semibold text-sm">Countries Breakdown</h2>
          </div>
          <div className="space-y-3">
            {stats.countryBreakdown.map(([country, count]) => {
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={country}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[#B3B3B3]">{country}</span>
                    <span className="text-xs text-white font-medium">{count}</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-[#E50914] rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Highest Rated Entries */}
      {stats.highestRated.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <h2 className="text-white font-semibold text-sm">Highest Rated Entries</h2>
          </div>
          <div className="space-y-2">
            {stats.highestRated.map((item) => (
              <div
                key={item.entryId}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04]"
              >
                <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                </div>
                <span className="text-sm font-bold text-yellow-400 flex-shrink-0">
                  ★ {item.rating.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top 10 Drawers Overview */}
      {state.top10Drawers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-4 h-4 text-[#E50914]" />
            <h2 className="text-white font-semibold text-sm">Top 10 Drawers</h2>
          </div>
          <div className="space-y-3">
            {state.top10Drawers.map(drawer => (
              <div key={drawer.year} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04]">
                <span className="text-sm font-medium">{drawer.year}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#E50914] rounded-full"
                      style={{ width: `${(drawer.entries.length / 10) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-[#B3B3B3]">{drawer.entries.length}/10</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
