/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";
import { FaInbox, FaBell } from "react-icons/fa";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useDeleteMessagesMutation,
  useFetchMessagesQuery,
} from "@/lib/features/messageApiSlice";
import moment from "moment";
import {
  IoCheckbox,
  IoCheckboxOutline,
  IoClose,
  IoSearch,
} from "react-icons/io5";
import { AiFillDelete, AiOutlineRead } from "react-icons/ai";
import SweetToast from "@/components/ui/SweetToast";
import { INTERNAL_SERVER_ERROR } from "@/error";
import { ScaleLoader } from "react-spinners";
import { Prisma } from "@prisma/client";
import { useMarkNotificationsAsSeenMutation } from "@/lib/features/notificatinApiSlice";
import { motion, AnimatePresence } from "framer-motion";

type MessageCategory =
  | "BONUS"
  | "PROMOTION"
  | "ALERT"
  | "TRANSACTION"
  | "WINNER";

export interface ExtendedMessage extends Prisma.MessageGetPayload<object> {
  category?: MessageCategory;
  amount?: number;
}

const CATEGORY_CONFIG: Record<
  MessageCategory,
  { label: string; color: string; bgColor: string }
> = {
  BONUS: {
    label: "Bonus",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  PROMOTION: {
    label: "Promotion",
    color: "text-teal-700",
    bgColor: "bg-teal-50",
  },
  ALERT: { label: "Alert", color: "text-amber-600", bgColor: "bg-amber-50" },
  TRANSACTION: {
    label: "Transaction",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
  },
  WINNER: { label: "Winner!", color: "text-rose-600", bgColor: "bg-rose-50" },
};

interface InboxProps {
  messages?: ExtendedMessage[];
  onClose?: () => void;
}

// Pure List View Component
const MessageListView = ({
  messages,
  onClose,
  isDropdown = false,
}: {
  messages: ExtendedMessage[];
  onClose?: () => void;
  isDropdown?: boolean;
}) => {
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    MessageCategory | "ALL"
  >("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [selectedMessage, setSelectedMessage] =
    useState<ExtendedMessage | null>(null);

  const [deleteApi, { isLoading: deleteLoading }] = useDeleteMessagesMutation();
  const [updateStatus] = useMarkNotificationsAsSeenMutation();

  const categorizedMessages = useMemo(() => {
    return (messages || []).map((msg) => {
      let category: MessageCategory = "ALERT";
      if (msg.title?.toLowerCase().includes("bonus")) category = "BONUS";
      else if (msg.title?.toLowerCase().includes("promotion"))
        category = "PROMOTION";
      else if (msg.title?.toLowerCase().includes("alert")) category = "ALERT";
      else if (
        msg.title?.toLowerCase().includes("deposit") ||
        msg.title?.toLowerCase().includes("withdraw")
      )
        category = "TRANSACTION";
      else if (msg.title?.toLowerCase().includes("won")) category = "WINNER";

      return { ...msg, category };
    });
  }, [messages]);

  const filteredMessages = useMemo(() => {
    let filtered = categorizedMessages;

    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((msg) => msg.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (msg) =>
          msg.title?.toLowerCase().includes(query) ||
          msg.description?.toLowerCase().includes(query),
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }, [categorizedMessages, selectedCategory, searchQuery, sortBy]);

  const handleSelect = (id: string) => {
    setSelectedMessages((state) =>
      state.includes(id) ? state.filter((s) => id !== s) : [...state, id],
    );
  };

  const handleSelectAll = () => {
    setSelectedMessages(
      selectedMessages.length === filteredMessages.length
        ? []
        : filteredMessages.map((m) => m.id),
    );
  };

  const handleDeleteMessages = () => {
    deleteApi({ messagesId: selectedMessages })
      .unwrap()
      .then(() => {
        setSelectedMessages([]);
        SweetToast.fire({
          icon: "success",
          title: "Messages deleted successfully",
          showConfirmButton: false,
          timer: 2000,
        });
      })
      .catch((error: any) => {
        SweetToast.fire({
          icon: "error",
          title: error.data?.message || INTERNAL_SERVER_ERROR,
          showConfirmButton: false,
          timer: 2000,
        });
      });
  };

  useEffect(() => {
    updateStatus({ proccessQueue: ["MESSAGE"] });
  }, [updateStatus]);

  const unseenCount = categorizedMessages.filter((m) => !m.seen).length;
  const categoryStats = useMemo(() => {
    const stats: Record<MessageCategory, number> = {
      BONUS: 0,
      PROMOTION: 0,
      ALERT: 0,
      TRANSACTION: 0,
      WINNER: 0,
    };
    categorizedMessages.forEach((msg) => {
      if (msg.category) stats[msg.category]++;
    });
    return stats;
  }, [categorizedMessages]);

  return (
    <div className="flex flex-col bg-white w-full rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header Bar */}
      <div className="px-4 md:px-6 py-3 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 rounded-lg p-2">
              <FaBell className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Inbox</h2>
              <p className="text-xs text-gray-500">
                {unseenCount > 0 ? (
                  <>
                    <span className="font-semibold text-emerald-600">
                      {unseenCount}
                    </span>{" "}
                    unread
                  </>
                ) : (
                  "All caught up"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedMessages.length > 0 && (
              <span className="text-xs text-gray-600 font-medium">
                {selectedMessages.length} selected
              </span>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors"
              >
                <IoClose className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="hidden md:flex items-center gap-2 px-4 md:px-6 py-2 border-b border-gray-200 overflow-x-auto">
        {(["ALL", ...Object.keys(CATEGORY_CONFIG)] as const).map((cat) => {
          const count =
            cat === "ALL"
              ? categorizedMessages.length
              : categoryStats[cat as MessageCategory];
          const isActive =
            (cat === "ALL" && selectedCategory === "ALL") ||
            (cat !== "ALL" && selectedCategory === cat);

          return (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategory(cat as typeof selectedCategory)
              }
              className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat === "ALL"
                ? "All"
                : CATEGORY_CONFIG[cat as MessageCategory].label}
              <span className="ml-1.5 font-bold">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Select */}
      <div className="md:hidden px-4 py-2 border-b border-gray-200">
        <select
          value={selectedCategory}
          onChange={(e) =>
            setSelectedCategory(e.target.value as typeof selectedCategory)
          }
          className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">All Messages</option>
          {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.label} ({categoryStats[key as MessageCategory]})
            </option>
          ))}
        </select>
      </div>

      {/* Message List */}
      <div
        className={`overflow-y-auto ${
          isDropdown
            ? "max-h-[350px] md:max-h-[280px]"
            : "max-h-[550px] md:max-h-[650px]"
        }`}
      >
        {filteredMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-12">
            <h3 className="text-gray-900 font-semibold text-sm mb-1">
              {searchQuery ? "No messages found" : "No messages yet"}
            </h3>
            <p className="text-xs text-gray-500">
              {searchQuery
                ? "Try adjusting your search query"
                : "Check back later for updates, bonuses, and promotions"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            <AnimatePresence mode="popLayout">
              {filteredMessages.map((message, i) => (
                <motion.li
                  key={message.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ delay: i * 0.02 }}
                  className={`border-b border-gray-100 transition-colors ${
                    !message.seen
                      ? "bg-emerald-50/60"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <button
                    onClick={() => setSelectedMessage(message)}
                    className="w-full px-4 md:px-6 py-3 flex gap-3 items-start text-left group"
                  >
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(message.id);
                      }}
                      className="mt-0.5 flex-shrink-0 cursor-pointer"
                    >
                      {selectedMessages?.includes(message.id) ? (
                        <IoCheckbox className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <IoCheckboxOutline className="w-4 h-4 text-gray-300 group-hover:text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <h3
                          className={`text-xs md:text-sm font-semibold truncate ${
                            !message.seen ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {message.title}
                        </h3>
                        {!message.seen && (
                          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-600 mt-1" />
                        )}
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2 mb-1.5">
                        {message.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">
                          {moment(message.createdAt).fromNow()}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            CATEGORY_CONFIG[message.category || "ALERT"].color
                          } ${CATEGORY_CONFIG[message.category || "ALERT"].bgColor}`}
                        >
                          {CATEGORY_CONFIG[message.category || "ALERT"].label}
                        </span>
                      </div>
                    </div>
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {/* Footer Actions */}
      {filteredMessages.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-4 md:px-6 py-2 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                {selectedMessages.length === filteredMessages.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
              {selectedMessages.length > 0 && (
                <span className="text-xs text-gray-500">
                  ({selectedMessages.length} selected)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 text-[11px]">
              <span className="text-gray-500">Sort:</span>
              <button
                onClick={() => setSortBy("newest")}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  sortBy === "newest"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Newest
              </button>
              <button
                onClick={() => setSortBy("oldest")}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  sortBy === "oldest"
                    ? "bg-emerald-600 text-white"
                    : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                Oldest
              </button>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              disabled={selectedMessages.length === 0}
              onClick={handleDeleteMessages}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-xs"
            >
              {deleteLoading ? (
                <ScaleLoader color="#059669" cssOverride={{ scale: 0.3 }} />
              ) : (
                <>
                  <AiFillDelete className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </>
              )}
            </button>
            <button
              disabled={selectedMessages.length === 0}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 bg-emerald-600 text-white border border-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-xs"
            >
              <AiOutlineRead className="w-3.5 h-3.5" />
              <span>Mark Read</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMessage(null)}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000] p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`px-2.5 py-0.5 rounded-full font-medium text-xs ${
                    CATEGORY_CONFIG[selectedMessage.category || "ALERT"].color
                  } ${CATEGORY_CONFIG[selectedMessage.category || "ALERT"].bgColor}`}
                >
                  {CATEGORY_CONFIG[selectedMessage.category || "ALERT"].label}
                </span>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900 mb-1">
                  {selectedMessage.title}
                </h2>
                <p className="text-gray-700 text-xs leading-relaxed">
                  {selectedMessage.description}
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>
                  {moment(selectedMessage.createdAt).format(
                    "MMM DD, YYYY h:mm A",
                  )}
                </span>
              </div>

              <button
                onClick={() => setSelectedMessage(null)}
                className="w-full py-1.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors text-xs"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Internal Dropdown Wrapper (fetches its own messages for header usage)
const HeaderDropdownInbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data, isLoading } = useFetchMessagesQuery();
  const fetchedMessages = data?.payload || [];

  const unseenCount = fetchedMessages.filter((msg) => !msg.seen).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return <Skeleton className="bg-gray-200 rounded-lg w-[40px] h-[40px]" />;
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative px-2.5 py-2 bg-[#1a1a1a] hover:bg-[#303030] text-white rounded-lg  transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        aria-label="Toggle Inbox"
      >
        <FaInbox className="w-5 h-5 text-white" />
        {unseenCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[90vw] max-w-md md:max-w-xl bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            <MessageListView
              messages={(fetchedMessages as ExtendedMessage[]) || []}
              onClose={() => setIsOpen(false)}
              isDropdown={true}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Universal Export Component
 *
 * 1. Used as `<Inbox />` (or `<MessageBox />`) without props:
 *    -> Renders the Header Dropdown Button (fetches messages internally)
 *
 * 2. Used as `<MessageBox messages={messages} />` with props:
 *    -> Renders the Full Inline Message Box List directly
 */
export default function UniversalInbox({ messages, onClose }: InboxProps) {
  // If `messages` prop is passed, render full list directly
  if (messages) {
    return (
      <MessageListView
        messages={messages}
        onClose={onClose}
        isDropdown={false}
      />
    );
  }

  // Otherwise, render header trigger button + popover
  return <HeaderDropdownInbox />;
}
