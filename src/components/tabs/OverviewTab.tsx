import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tv, ChevronLeft, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import Poster from '../Poster';
import EntryModal from '../EntryModal';
import type { Entry } from '@/types';

/* ============================================================
   Airing Today - Cover Flow Carousel
   ============================================================ */
function AiringTodayCarousel({
  airingToday,
  onEntryClick
}: {
  airingToday: { entry: Entry; ongoing: { currentEpisode: number; totalEpisodes: number; airDays: string[] } }[];
  onEntryClick: (entry: Entry) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handlePrev = useCallback(() => {
    setActiveIndex(prev => (prev > 0 ? prev - 1 : airingToday.length - 1));
  }, [airingToday.length]);

  const handleNext = useCallback(() => {
    setActiveIndex(prev => (prev < airingToday.length - 1 ? prev + 1 : 0));
  }, [airingToday.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePrev, handleNext]);

  if (airingToday.length === 0) {
    return (
      <div className="relative h-64 rounded-2xl overflow-hidden bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.06] flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(229,9,20,0.08)_0%,_transparent_70%)]" />
        <div className="text-center relative z-10">
          <Tv className="w-10 h-10 text-[#444] mx-auto mb-3" />
          <p className="text-[#666] text-sm font-medium">No Airing BL Today</p>
          <p className="text-[#555] text-xs mt-1">Check back tomorrow for updates</p>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="relative select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
            Airing Today
          </h2>
          <p className="text-[#888] text-xs mt-0.5">{today} &middot; {airingToday.length} series</p>
        </div>
        {airingToday.length > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors tap-active"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center hover:bg-white/[0.1] transition-colors tap-active"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Cover Flow Carousel */}
      <div
        className="relative h-[320px] sm:h-[360px]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {airingToday.map((item, index) => {
          const offset = index - activeIndex;
          const isActive = index === activeIndex;
          const absOffset = Math.abs(offset);

          // Wrap around for infinite feel
          let visualOffset = offset;
          if (offset > airingToday.length / 2) visualOffset = offset - airingToday.length;
          if (offset < -airingToday.length / 2) visualOffset = offset + airingToday.length;

          const translateX = visualOffset * 55;
          const scale = isActive ? 1 : Math.max(0.75, 1 - absOffset * 0.12);
          const zIndex = airingToday.length - absOffset;
          const opacity = isActive ? 1 : Math.max(0.3, 1 - absOffset * 0.25);

          return (
            <motion.div
              key={item.entry.id}
              className="absolute inset-0 flex items-center justify-center cursor-pointer"
              style={{ zIndex }}
              animate={{
                x: `${translateX}%`,
                scale,
                opacity,
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={() => !isActive ? setActiveIndex(index) : onEntryClick(item.entry)}
            >
              <div className="relative flex flex-col items-center">
                {/* Poster */}
                <div
                  className={`relative rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
                    isActive ? 'shadow-red-900/40 ring-1 ring-white/10' : 'shadow-black/60'
                  }`}
                  style={{ width: isActive ? 180 : 140, height: isActive ? 260 : 200 }}
                >
                  {item.entry.poster ? (
                    <img
                      src={item.entry.poster}
                      alt={item.entry.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center">
                      <Tv className="w-10 h-10 text-[#444]" />
                    </div>
                  )}

                  {/* Glassmorphism overlay for active card */}
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  )}

                  {/* Active card info overlay */}
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-bold text-sm truncate">{item.entry.title}</p>
                      <p className="text-[#B3B3B3] text-[11px] mt-0.5">
                        {item.ongoing.airDays.join(', ')}
                      </p>
                      <p className="text-[#E50914] text-[11px] font-semibold mt-1">
                        Episode {item.ongoing.currentEpisode} / {item.ongoing.totalEpisodes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Non-active card title below */}
                {!isActive && (
                  <p className="text-[#888] text-[11px] mt-2 truncate max-w-[120px] text-center">
                    {item.entry.title}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Dot indicators */}
        {airingToday.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-1.5">
            {airingToday.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? 'w-5 h-1.5 bg-[#E50914]'
                    : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   Recently Added Entries (24h window)
   ============================================================ */
function RecentlyAddedSection({
  entries,
  onEntryClick
}: {
  entries: Entry[];
  onEntryClick: (entry: Entry) => void;
}) {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;

  const recentEntries = useMemo(() => {
    return entries
      .filter(e => now - e.createdAt < twentyFourHours)
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
  }, [entries, now]);

  // Hide entire section if no qualifying entries
  if (recentEntries.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Clock className="w-4 h-4 text-[#E50914]" />
        <h2 className="text-white font-bold text-base">Recently Added</h2>
        <span className="text-[#666] text-xs">({recentEntries.length})</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {recentEntries.map((entry) => (
          <button
            key={entry.id}
            onClick={() => onEntryClick(entry)}
            className="flex-shrink-0 w-28 text-left"
          >
            <Poster src={entry.poster} title={entry.title} size="lg" className="w-28 h-40 rounded-xl" />
            <p className="text-white text-xs font-medium mt-2 truncate">{entry.title}</p>
            <p className="text-[#888] text-[10px]">{entry.year}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   Curated Rewatch Picks
   ============================================================ */
function RewatchPicksSection({
  entries,
  favorites,
  onEntryClick
}: {
  entries: Entry[];
  favorites: Entry[];
  onEntryClick: (entry: Entry) => void;
}) {
  const picks = useMemo(() => {
    // Get today's date string for consistent daily randomization
    const today = new Date().toDateString();

    // Simple seeded random from date string
    let seed = 0;
    for (let i = 0; i < today.length; i++) seed += today.charCodeAt(i);
    const random = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Shuffle arrays with seed
    const shuffle = <T,>(arr: T[]) => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const shuffledFavs = shuffle(favorites);
    const nonFavEntries = entries.filter(e => !favorites.some(f => f.id === e.id));
    const shuffledGeneral = shuffle(nonFavEntries);
    const droppedEntries = entries.filter(e => e.status === 'DROPPED');
    const shuffledDropped = shuffle(droppedEntries);

    const selected: Entry[] = [];

    // 2 Favorites
    for (let i = 0; i < Math.min(2, shuffledFavs.length); i++) {
      selected.push(shuffledFavs[i]);
    }

    // 2 General List Entries (not favorites, not dropped)
    const generalCandidates = shuffledGeneral.filter(e => e.status !== 'DROPPED');
    for (let i = 0; i < Math.min(2, generalCandidates.length); i++) {
      if (!selected.some(s => s.id === generalCandidates[i].id)) {
        selected.push(generalCandidates[i]);
      }
    }

    // 1 Dropped Entry
    for (let i = 0; i < Math.min(1, shuffledDropped.length); i++) {
      if (!selected.some(s => s.id === shuffledDropped[i].id)) {
        selected.push(shuffledDropped[i]);
      }
    }

    // If we don't have 5, fill with random entries
    if (selected.length < 5) {
      const remaining = shuffle(entries).filter(e => !selected.some(s => s.id === e.id));
      while (selected.length < 5 && remaining.length > 0) {
        selected.push(remaining.shift()!);
      }
    }

    return shuffle(selected);
  }, [entries, favorites]);

  if (picks.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-yellow-400" />
        <h2 className="text-white font-bold text-base">Top Rewatch Picks</h2>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
        {picks.map((entry) => {
          const isFav = favorites.some(f => f.id === entry.id);
          return (
            <button
              key={entry.id}
              onClick={() => onEntryClick(entry)}
              className="flex-shrink-0 w-28 text-left"
            >
              <div className="relative">
                <Poster src={entry.poster} title={entry.title} size="lg" className="w-28 h-40 rounded-xl" />
                {isFav && (
                  <div className="absolute top-1.5 right-1.5 bg-[#E50914] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                    <span className="flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5" />
                      Top
                    </span>
                  </div>
                )}
              </div>
              <p className="text-white text-xs font-medium mt-2 truncate">{entry.title}</p>
              <p className="text-[#888] text-[10px]">{entry.year}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   Main Overview Tab
   ============================================================ */
export default function OverviewTab() {
  const { state } = useApp();
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const airingToday = useMemo(() => {
    return state.ongoing
      .filter(o => o.airDays.includes(today as typeof o.airDays[number]))
      .map(o => {
        const entry = state.entries.find(e => e.id === o.entryId);
        return entry ? { entry, ongoing: o } : null;
      })
      .filter(Boolean) as { entry: Entry; ongoing: typeof state.ongoing[number] }[];
  }, [state, today]);

  // Entries for Recently Added (General List only)
  const generalListEntries = useMemo(() => {
    return state.entries;
  }, [state.entries]);

  // Entries for Rewatch Picks
  const favoritedEntries = useMemo(() => {
    return state.favorites
      .map(f => state.entries.find(e => e.id === f.entryId))
      .filter(Boolean) as Entry[];
  }, [state.favorites, state.entries]);

  return (
    <div className="space-y-8 w-full">
      {/* Airing Today Hero */}
      <AiringTodayCarousel
        airingToday={airingToday}
        onEntryClick={setSelectedEntry}
      />

      {/* Recently Added Entries */}
      <RecentlyAddedSection
        entries={generalListEntries}
        onEntryClick={setSelectedEntry}
      />

      {/* Curated Rewatch Picks */}
      <RewatchPicksSection
        entries={state.entries}
        favorites={favoritedEntries}
        onEntryClick={setSelectedEntry}
      />

      {/* Entry Detail Modal */}
      <EntryModal
        isOpen={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        entry={selectedEntry}
      />
    </div>
  );
}
