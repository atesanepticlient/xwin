"use client";

import {
  ArrowLeft,
  Search,
  ChevronDown,
  SlidersHorizontal,
  Plus,
  X,
  Check,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { IoWalletSharp } from "react-icons/io5";
import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import GameCard from "../casino/GameCard";
import { gameSearchEngine } from "@/lib/games";
import providersData from "@/../data/gra-provider.json";
import { categories } from "@/../public/data/games";
import Image from "next/image";
import MobileCasinoTab from "./casino";
import BottomTab from "./BottomTab";
import { formatAmount } from "@/lib/helpers";
import useCurrentUser from "@/hook/useCurrentUser";
import { FaBangladeshiTakaSign, FaIndianRupeeSign } from "react-icons/fa6";
import { FaCoins } from "react-icons/fa";


const ITEMS_PER_PAGE = 20;

// Filter Popup Component
const FilterPopup = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  categories,
  providers,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [providerSearch, setProviderSearch] = useState("");

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  const filteredProviders = useMemo(() => {
    if (!providerSearch.trim()) return providers;
    return providers.filter((p) =>
      p.name.toLowerCase().includes(providerSearch.toLowerCase()),
    );
  }, [providerSearch, providers]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md animate-slide-up rounded-t-2xl bg-white p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="space-y-6 py-4">
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-700">Category</h3>
            <div className="grid grid-cols-3 gap-1.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = localFilters.category === cat.slug;
                return (
                  <button
                    key={cat.slug}
                    onClick={() => {
                      setLocalFilters((prev) => ({
                        ...prev,
                        category: isActive ? "" : cat.slug,
                      }));
                    }}
                    className={`text-xs px-3 py-2 rounded transition-all font-medium border flex flex-col items-center justify-center gap-1.5 ${
                      isActive
                        ? "bg-[#55A630] text-white border-[#55A630]"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name}
                    {Icon && <Icon className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-700">Provider</h3>
            <input
              value={providerSearch}
              onChange={(e) => setProviderSearch(e.target.value)}
              type="text"
              placeholder="Search provider..."
              className="w-full rounded-lg border border-gray-200 text-black bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#55A630] mb-3"
            />
            <div className="grid grid-cols-3 gap-1.5 max-h-[150px] overflow-y-auto">
              {filteredProviders.map((provider) => {
                const isActive = localFilters.provider === provider.name;
                return (
                  <button
                    key={provider.name}
                    onClick={() => {
                      setLocalFilters((prev) => ({
                        ...prev,
                        provider: isActive ? "" : provider.name,
                      }));
                    }}
                    className={`rounded-sm p-2 border-b-[4px] transition-all bg-gradient-to-b from-[#00000008] flex justify-center items-center ${
                      isActive
                        ? "to-[#C1E02733] border-b-[#55A630]"
                        : "to-[#0000000a] border-b-gray-300 hover:border-b-[#55A630]"
                    }`}
                  >
                    {provider.image ? (
                      <Image
                        src={provider.image}
                        alt={provider.name}
                        width={80}
                        height={32}
                        className="w-full h-auto object-contain max-h-8"
                      />
                    ) : (
                      <span className="text-xs text-gray-500 font-medium">
                        {provider.name}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-700">Status</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setLocalFilters((prev) => ({
                    ...prev,
                    status: prev.status === "enabled" ? "all" : "enabled",
                  }));
                }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm transition ${
                  localFilters.status === "enabled"
                    ? "bg-[#262626] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Check size={16} className="inline mr-1" />
                Enabled Only
              </button>
              <button
                onClick={() => {
                  setLocalFilters((prev) => ({
                    ...prev,
                    status: prev.status === "disabled" ? "all" : "disabled",
                  }));
                }}
                className={`flex-1 rounded-lg px-4 py-2 text-sm transition ${
                  localFilters.status === "disabled"
                    ? "bg-[#262626] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Disabled Only
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 border-t border-gray-100 pt-4">
          <button
            onClick={() => {
              onResetFilters();
              onClose();
            }}
            className="flex-1 rounded-lg bg-gray-100 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
          >
            Reset
          </button>
          <button
            onClick={() => {
              onApplyFilters(localFilters);
              onClose();
            }}
            className="flex-1 rounded-lg bg-[#499A13] py-3 text-sm font-medium text-white transition hover:bg-[#3d8a10]"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

// Search Popup Component
const SearchPopup = ({ isOpen, onClose, onSearch }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim()) {
      const searchResults = gameSearchEngine.search({
        query: query,
        limit: 20,
      });
      setResults(searchResults);
    } else {
      setResults([]);
    }
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-white pt-4">
      <div className="w-full max-w-md px-4">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search games..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent py-2 text-sm text-black outline-none placeholder:text-gray-400"
            autoFocus
          />
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mt-4 max-h-[70vh] overflow-y-auto">
          {results.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {results.map((game) => (
                <GameCard key={game.id} game={game} theme="light" />
              ))}
            </div>
          ) : query ? (
            <div className="flex h-40 flex-col items-center justify-center text-gray-400">
              <Search size={40} className="mb-2 opacity-30" />
              <p className="text-sm">No games found</p>
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center text-gray-400">
              <p className="text-sm">Type to search games</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface GameMobileProps {
  initialCategory?: string;
  initialProvider?: string;
  initialSearch?: string;
}

// Inner component to handle useSearchParams safely
const GameMobileContent = ({
  initialCategory,
  initialProvider,
  initialSearch,
}: GameMobileProps) => {
  const searchParams = useSearchParams();

  // Parse external input from URL parameters or direct props
  const queryCategory = searchParams.get("category") || initialCategory || "";
  const queryProvider = searchParams.get("provider") || initialProvider || "";
  const querySearch =
    searchParams.get("search") || searchParams.get("q") || initialSearch || "";

  const [selectedCategory, setSelectedCategory] = useState<string>(
    queryCategory || "All",
  );
  const [showFilter, setShowFilter] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>(querySearch);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [filters, setFilters] = useState({
    category: queryCategory,
    provider: queryProvider,
    status: "all",
  });

  // Sync state when URL params change dynamically
  useEffect(() => {
    if (queryCategory) {
      setSelectedCategory(queryCategory);
    }
    if (queryProvider || queryCategory) {
      setFilters((prev) => ({
        ...prev,
        category: queryCategory || prev.category,
        provider: queryProvider || prev.provider,
      }));
    }
    if (querySearch) {
      setSearchTerm(querySearch);
    }
  }, [queryCategory, queryProvider, querySearch]);

  const loadMoreRef = useRef<HTMLDivElement>(null);

  const allGames = useMemo(() => {
    return gameSearchEngine.getAll(1, 9999);
  }, []);

  const filteredGames = useMemo(() => {
    let results = [...allGames];

    if (searchTerm.trim()) {
      results = gameSearchEngine.search({
        query: searchTerm,
        limit: 9999,
      });
    }

    if (selectedCategory !== "All" && selectedCategory !== "Popular") {
      const categoryResults = gameSearchEngine.getByCategory(
        selectedCategory,
        9999,
      );
      if (searchTerm.trim()) {
        results = results.filter((game) =>
          categoryResults.some((catGame) => catGame.id === game.id),
        );
      } else {
        results = categoryResults;
      }
    }

    if (filters.provider) {
      const providerResults = gameSearchEngine.searchByField(
        "provider",
        filters.provider,
        9999,
      );
      results = results.filter((game) =>
        providerResults.some((provGame) => provGame.id === game.id),
      );
    }

    if (filters.category && filters.category !== selectedCategory) {
      const categoryResults = gameSearchEngine.getByCategory(
        filters.category,
        9999,
      );
      results = results.filter((game) =>
        categoryResults.some((catGame) => catGame.id === game.id),
      );
    }

    return results;
  }, [allGames, searchTerm, selectedCategory, filters]);

  // Reset pagination back to 20 whenever active filters change
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedCategory, searchTerm, filters]);

  // Sliced games for rendering
  const displayedGames = useMemo(() => {
    return filteredGames.slice(0, visibleCount);
  }, [filteredGames, visibleCount]);

  const hasMore = visibleCount < filteredGames.length;

  // IntersectionObserver to load 20 more games on reaching bottom
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
        }
      },
      { rootMargin: "200px" },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loadMoreRef]);

  const getCategoryDisplayName = () => {
    if (selectedCategory === "All") return "All Games";
    if (selectedCategory === "Popular") return "Popular Games";
    const category = categories.find((c) => c.slug === selectedCategory);
    return category ? category.name : selectedCategory;
  };

  const tabs = useMemo(() => {
    const defaultTabs = ["All", "Popular"];
    const categoryTabs = categories.map((c) => c.slug);
    return [...defaultTabs, ...categoryTabs];
  }, []);

  const handleGamePlay = (game) => {
    console.log("🎮 Play game:", game.title);
  };

  const handleGamePlayFree = (game) => {
    console.log("🎮 Play free game:", game.title);
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      category: "",
      provider: "",
      status: "all",
    });
  };

  if (allGames.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="mx-auto h-16 w-16 rounded-full bg-yellow-100 flex items-center justify-center">
            <span className="text-3xl">📭</span>
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-800">
            No games available
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            The game list is empty. Please check your data source.
          </p>
        </div>
      </div>
    );
  }

  const user = useCurrentUser();
  const formattedAmount = formatAmount(
    user?.wallet?.balance,
    user?.wallet?.balance,
  );
  const getCurrencyIcon = (currency?: string) => {
    switch (currency?.toUpperCase()) {
      case "BDT":
        return (
          <FaBangladeshiTakaSign className="w-3 h-3 text-black shrink-0" />
        );
      case "INR":
        return <FaIndianRupeeSign className="w-3 h-3 text-black shrink-0" />;
      case "PKR":
        return (
          <span className="text-[10px] font-bold text-black leading-none shrink-0">
            Rs
          </span>
        );
      default:
        return <FaCoins className="w-3 h-3 text-black shrink-0" />;
    }
  };
  const router = useRouter();

  return (
    <div className="relative">
      <div className="w-full max-w-md overflow-hidden">
        <div className="bg-white shadow">
          <div className="flex h-[60px] items-center justify-between px-4">
            <button onClick={() => router.back()}>
              <ArrowLeft size={22} strokeWidth={2} className="text-[#777]" />
            </button>

            <h1 className="text-[18px] capitalize font-semibold text-[#7b7b7b]">
              {getCategoryDisplayName()}
            </h1>

            <button onClick={() => setShowSearch(true)}>
              <Search size={22} strokeWidth={2} className="text-[#777]" />
            </button>
          </div>

          {user ? (
            <div className="flex gap-2 px-1.5 pb-2">
              <div className="flex h-[35px] flex-1 items-center rounded-xl bg-[rgb(237,240,240)] px-4">
                <div className="mr-3 flex items-center justify-center rounded-xl">
                  <IoWalletSharp size={17} className="text-[#2b2b2b]" />
                </div>
                <span className="text-[13px] font-medium text-[#222] flex items-center gap-0.5">
                  {getCurrencyIcon(user?.wallet?.currencyCode)}
                  {formattedAmount}
                </span>
                <ChevronDown size={22} className="ml-auto text-[#666]" />
              </div>

              <Link
                href={"/account/deposit"}
                className="flex h-[35px] items-center gap-2 rounded-xl bg-[#499A13] px-6 text-[13px] font-medium text-white"
              >
                <Plus size={17} />
                Deposit
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-1.5 pb-2">
              <Link
                href={"/login"}
                className="text-sm font-semibold text-white bg-[#242424] hover:bg-[#2d2d2d] rounded-md block w-full text-center py-1.5"
              >
                Log in
              </Link>
              <Link
                href={"/register"}
                className="text-sm font-semibold text-white bg-[#499A13] hover:bg-[#549e23] rounded-md block w-full text-center py-1.5"
              >
                Registration
              </Link>
            </div>
          )}
        </div>
      </div>

      <main className="min-h-screen bg-[#EDF0F2] py-3 px-2">
        <div className="relative">
          <div className="flex items-center flex-nowrap hide-scrollbar max-w-full overflow-x-auto gap-1.5 pb-4">
            {tabs.map((tab) => {
              const displayName =
                tab === "All"
                  ? "All"
                  : tab === "Popular"
                    ? "Popular"
                    : categories.find((c) => c.slug === tab)?.name || tab;
              return (
                <button
                  key={tab}
                  onClick={() => setSelectedCategory(tab)}
                  className={`rounded-3xl w-max px-3 py-[6px] text-[12px] transition whitespace-nowrap  ${
                    selectedCategory === tab
                      ? "bg-[#262626] text-white"
                      : "bg-white text-[#222]"
                  }`}
                >
                  {displayName}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setShowFilter(true)}
            className="absolute -top-1 -right-1 flex h-[35px] w-[35px] items-center justify-center rounded-full bg-white shadow-md"
          >
            <SlidersHorizontal size={17} className="text-[#666]" />
          </button>
        </div>

        {displayedGames.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-1.5 pb-6">
              {displayedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  theme="light"
                  onPlay={handleGamePlay}
                  onPlayFree={handleGamePlayFree}
                />
              ))}
            </div>

            {hasMore && (
              <div
                ref={loadMoreRef}
                className="flex items-center justify-center py-6 text-gray-500"
              >
                <Loader2 className="h-6 w-6 animate-spin text-[#499A13]" />
              </div>
            )}
          </>
        ) : (
          <div className="flex h-60 flex-col items-center justify-center text-gray-400">
            <Search size={40} className="mb-2 opacity-30" />
            <p className="text-sm">No games found</p>
            <p className="text-xs">Try adjusting your filters</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
                handleResetFilters();
              }}
              className="mt-4 text-sm text-[#499A13] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </main>

      <FilterPopup
        isOpen={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        categories={categories}
        providers={providersData}
      />

      <SearchPopup
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        onSearch={(game) => {
          console.log("Selected game:", game);
        }}
      />

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
      <BottomTab />
    </div>
  );
};

// Main Export Wrapped with Suspense (required by Next.js when using useSearchParams)
export const GameMobile = (props: GameMobileProps) => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#EDF0F2]">
          <Loader2 className="h-8 w-8 animate-spin text-[#499A13]" />
        </div>
      }
    >
      <GameMobileContent {...props} />
    </Suspense>
  );
};

export default GameMobile;
