"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  FaFilter,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { ImCross } from "react-icons/im";
import { IoSearch } from "react-icons/io5";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import Image from "next/image";
import { categories } from "@/../public/data/games";
import { gameSearchEngine } from "@/lib/games"; // Your new search engine
import { useSearchGames } from "@/store/useStore";

// Import your provider data
import providersData from "@/../data/gra-provider.json";
import GameCard from "@/components/casino/GameCard";
import { GreGameItem } from "@/types/game";

const ITEMS_PER_PAGE = 20;

export const SearchButton = () => {
  const { toggleSearchUi, showSearchUi, setFilterProps } = useSearchGames(
    (state) => state,
  );

  const hanldeOpenSearch = () => {
    toggleSearchUi();
    setFilterProps({
      filteringOff: true,
    });
  };

  return (
    <button
      onClick={hanldeOpenSearch}
      className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer text-white bg-[#4f4f4f]"
    >
      {showSearchUi ? <ImCross /> : <FaSearch />}
    </button>
  );
};

export interface FilterProps {
  selectedCategory: string;
  setSelectedCategory: (slug: string) => void;
  selectedProvider: string;
  setSelectedProvider: (slug: string) => void;
  onClear: () => void;
}

const Filter: React.FC<FilterProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedProvider,
  setSelectedProvider,
  onClear,
}) => {
  const [providerSearch, setProviderSearch] = useState("");

  // Filter providers based on search
  const filteredProvidersList = useMemo(() => {
    if (!providerSearch.trim()) return providersData;
    return providersData.filter((p) =>
      p.name.toLowerCase().includes(providerSearch.toLowerCase()),
    );
  }, [providerSearch]);

  return (
    <Popover className="relative inline-block text-left">
      <PopoverButton className="w-9 h-9 flex items-center justify-center rounded-md cursor-pointer text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-[#55A630]">
        <FaFilter />
      </PopoverButton>

      <PopoverPanel
        transition
        className="absolute right-0 z-50 mt-2 w-[300px] sm:w-[380px] rounded-lg border border-gray-200 bg-white p-4 shadow-xl transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="text-gray-900 text-xs font-semibold uppercase tracking-wider">
              Filter Games
            </span>
            <button
              onClick={onClear}
              className="text-gray-500 tracking-wide font-medium text-xs hover:text-gray-900 transition-colors cursor-pointer"
            >
              Clear Filter
            </button>
          </div>

          <div>
            <h4 className="text-gray-500 text-xs font-medium uppercase mb-2">
              Categories
            </h4>
            <div className="grid grid-cols-3 gap-1.5 max-h-[120px] overflow-y-auto">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = cat.slug === selectedCategory;

                return (
                  <button
                    key={cat.slug}
                    onClick={() =>
                      setSelectedCategory(isActive ? "" : cat.slug)
                    }
                    className={`text-xs px-3 py-1.5 rounded transition-all font-medium border flex flex-col items-center justify-center gap-1.5 ${
                      isActive
                        ? "bg-[#55A630] text-white border-[#55A630]"
                        : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-gray-300"
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
            <h4 className="text-gray-500 text-xs font-medium uppercase mb-2">
              Providers
            </h4>

            <input
              value={providerSearch}
              onChange={(e) => setProviderSearch(e.target.value)}
              type="text"
              placeholder="Search by provider..."
              className="outline-none w-full block bg-gray-50 text-xs placeholder:text-gray-400 text-gray-900 font-normal px-3 py-2 rounded border border-gray-200 mb-3 focus:border-[#55A630] transition-colors"
            />

            <div className="max-h-[220px] overflow-y-auto grid grid-cols-3 gap-1.5 pr-1">
              {filteredProvidersList.map((provider, i) => {
                const isActive = provider.name === selectedProvider;

                return (
                  <button
                    key={i}
                    onClick={() =>
                      setSelectedProvider(isActive ? "" : provider.name)
                    }
                    className={`rounded-sm p-2 border-b-[4px] hover:border-b-[#55A630] hover:to-[#C1E02733] transition-all bg-gradient-to-b from-[#00000008] flex justify-center items-center cursor-pointer ${
                      isActive
                        ? "to-[#C1E02733] border-b-[#55A630]"
                        : "to-[#0000000a] border-b-gray-300"
                    }`}
                  >
                    {provider.image ? (
                      <picture>
                        <Image
                          src={provider.image}
                          alt={provider.name}
                          width={80}
                          height={32}
                          className="w-full h-auto object-contain max-h-8"
                        />
                      </picture>
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
        </div>
      </PopoverPanel>
    </Popover>
  );
};

const NoGames = () => {
  return (
    <div className="flex items-center justify-center flex-col gap-2 py-12">
      <FaSearch className="w-6 h-6 text-[#969696]" />
      <p className="text-xs text-[#969696]">
        No games found matching your filters
      </p>
    </div>
  );
};

export interface SearchGamesProps {
  name?: string;
  category?: string;
  provider?: string;
  filteringOff?: boolean;
}

const SearchGames: React.FC<SearchGamesProps> = ({
  name = "",
  category = "",
  provider = "",
  filteringOff = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Check if user has engaged with any internal search/filter UI
  const hasUserFiltered = Boolean(
    searchTerm.trim() || selectedCategory || selectedProvider,
  );

  // Determine active search values
  const activeSearch = searchTerm || (filteringOff ? "" : name);
  const activeCategory = selectedCategory || (filteringOff ? "" : category);
  const activeProvider = selectedProvider || (filteringOff ? "" : provider);

  const handleClearFilter = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedProvider("");
  };

  // Get filtered games using the new gameSearchEngine
  const filteredGames = useMemo(() => {
    // IF filteringOff is true AND user hasn't typed or picked a filter, RETURN EMPTY ARRAY
    if (filteringOff && !hasUserFiltered) {
      return [];
    }

    // If no search term and no filters, return all valid games
    if (!activeSearch && !activeCategory && !activeProvider) {
      return gameSearchEngine.getAll(1, 9999);
    }

    let results: GreGameItem[] = [];

    // If there's a search term, use the main search
    if (activeSearch) {
      results = gameSearchEngine.search({
        query: activeSearch,
        limit: 9999,
      });
    } else {
      // Start with all valid games
      results = gameSearchEngine.getAll(1, 9999);
    }

    // Apply category filter (using getByCategory which checks both category AND title)
    if (activeCategory) {
      const categoryResults = gameSearchEngine.getByCategory(
        activeCategory,
        9999,
      );
      results = results.filter((game) =>
        categoryResults.some((catGame) => catGame.id === game.id),
      );
    }

    // Apply provider filter
    if (activeProvider) {
      const providerResults = gameSearchEngine.searchByField(
        "provider",
        activeProvider,
        9999,
      );
      results = results.filter((game) =>
        providerResults.some((provGame) => provGame.id === game.id),
      );
    }

    return results;
  }, [
    filteringOff,
    hasUserFiltered,
    activeSearch,
    activeCategory,
    activeProvider,
  ]);

  // Reset pagination when filter criteria changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeSearch, activeCategory, activeProvider]);

  // Paginate games
  const totalPages = Math.ceil(filteredGames.length / ITEMS_PER_PAGE);
  const paginatedGames = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGames.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGames, currentPage]);

  return (
    <div className="w-full px-2">
      {/* Search Input & Filter Controls */}
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1 md:max-w-[300px] flex items-center gap-1.5 bg-white rounded-sm px-2 py-2.5 shadow-sm ">
          <div className="pl-2 pr-3 border-r border-gray-200">
            <IoSearch className="w-4 h-4 text-black" />
          </div>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search games..."
            className="w-full outline-none border-none bg-transparent text-xs lg:text-sm text-black"
          />
        </div>

        <div>
          <Filter
            selectedCategory={activeCategory}
            setSelectedCategory={setSelectedCategory}
            selectedProvider={activeProvider}
            setSelectedProvider={setSelectedProvider}
            onClear={handleClearFilter}
          />
        </div>
      </div>

      {/* Results count */}
      {!filteringOff && filteredGames.length > 0 && (
        <div className="mt-3 text-xs text-gray-500">
          Found {filteredGames.length} games
        </div>
      )}

      {/* Render Games or Empty State */}
      <div className="py-4">
        {paginatedGames.length === 0 ? (
          <NoGames />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {paginatedGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                // onPlay={(g) => console.log("Play:", g.title)}
                // onPlayFree={(g) => console.log("Play Free:", g.title)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4 pb-8">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
          >
            <FaChevronLeft className="w-3 h-3" /> Prev
          </button>

          <span className="text-xs text-zinc-400 font-medium">
            Page <strong className="text-white">{currentPage}</strong> of{" "}
            <strong className="text-white">{totalPages}</strong>
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-gray-200 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
          >
            Next <FaChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchGames;
