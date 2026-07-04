/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  Search,
  Star,
  Plus,
  ShoppingBag,
  Heart,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
  PlusCircle,
  Eye,
  Check,
  PhoneCall,
  MapPin,
  Instagram,
  Facebook,
  Globe2
} from "lucide-react";
import { MenuItem, Category, Review } from "../types";
import { INITIAL_CATEGORIES } from "../data";
import { motion, AnimatePresence } from "motion/react";

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.69a6.34 6.34 0 0 0 10.86 4.49 6.25 6.25 0 0 0 2.25-4.49v-7a8.21 8.21 0 0 0 4.89 1.6V6.69a4.87 4.87 0 0 1-3.41-1.29z" />
  </svg>
);

interface CustomerMenuProps {
  menuItems: MenuItem[];
  categories: Category[];
  onAddToCart: (item: MenuItem, quantity: number, note?: string) => void;
  onAddReview: (dishId: string, review: Omit<Review, "id" | "date">) => void;
  orderSettings?: {
    welcomeTitle?: string;
    welcomeText?: string;
    promoBannerText?: string;
    promoBannerEnabled?: boolean;
  };
}

export default function CustomerMenu({
  menuItems,
  categories,
  onAddToCart,
  onAddReview,
  orderSettings,
}: CustomerMenuProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDishForDetails, setSelectedDishForDetails] = useState<MenuItem | null>(null);

  // Review Form States
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerRating, setReviewerRating] = useState(5);
  const [reviewerComment, setReviewerComment] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Quick quantity for modal ordering
  const [modalQuantity, setModalQuantity] = useState(1);
  const [modalNote, setModalNote] = useState("");

  const filteredItems = useMemo(() => {
    const q = (searchQuery || "").toLowerCase();
    return menuItems.filter((item) => {
      // Must be currently active/available
      if (!item.isAvailable) return false;

      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const matchSearch =
        (item.name || "").toLowerCase().includes(q) ||
        (item.arabicName || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.arabicDescription || "").toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [menuItems, selectedCategory, searchQuery]);

  // Special offers list
  const specialOffers = useMemo(() => {
    return menuItems.filter((item) => item.discountPrice && item.isAvailable);
  }, [menuItems]);

  // Top-rated dishes
  const topRatedDishes = useMemo(() => {
    return [...menuItems]
      .filter((item) => item.isAvailable)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);
  }, [menuItems]);

  // Handle Review Submission
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDishForDetails || !reviewerName.trim()) return;

    onAddReview(selectedDishForDetails.id, {
      customerName: reviewerName,
      rating: reviewerRating,
      comment: reviewerComment,
    });

    setReviewSuccess(true);
    setReviewerName("");
    setReviewerComment("");
    setReviewerRating(5);

    // Refresh details modal with the newly rated item data
    setTimeout(() => {
      setReviewSuccess(false);
      // Close details or keep open
    }, 2500);
  };

  return (
    <div className="w-full" dir="rtl">
      {/* 🌟 GREETING HERO SECTION WITH ANNOUNCEMENTS & DISCOUNTS */}
      {selectedCategory === "all" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-white border border-slate-100 rounded-[2.5rem] p-6 sm:p-8 shadow-xs hover:shadow-sm transition-all text-right space-y-6"
        >
          <div className="space-y-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-wide flex items-center gap-2">
              <span>{orderSettings?.welcomeTitle || "🍽️ أهلاً بك في عالم النكهات المميزة"}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
              {orderSettings?.welcomeText || "استمتع بتجربة طلب طعام سريعة وسهلة مع قائمة متنوعة من أشهى الوجبات، المحضّرة بعناية من مكونات طازجة وجودة عالية. هدفنا هو تقديم طعام لذيذ وخدمة مميزة تصل إليك بأفضل صورة وفي أسرع وقت"}
            </p>
          </div>

          {/* Dynamic Active Promo Ads / Discounts Banner */}
          {orderSettings?.promoBannerEnabled && orderSettings?.promoBannerText && (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative overflow-hidden bg-brand-orange/10 border border-brand-orange/20 rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-brand-orange/20 flex items-center justify-center shrink-0 text-brand-orange">
                <Sparkles className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div className="flex-1 text-right">
                <span className="text-[10px] font-black text-brand-orange uppercase tracking-wide block leading-none mb-1">📢 عرض وإشهار مميز</span>
                <p className="text-xs font-bold text-slate-850 leading-snug">
                  {orderSettings.promoBannerText}
                </p>
              </div>
            </motion.div>
          )}

          {/* 🔍 Professional Search Bar */}
          <div className="relative max-w-xl mx-auto w-full pt-2">
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-450 pointer-events-none">
              <Search className="w-5 h-5 text-brand-orange" />
            </span>
            <input
              type="text"
              placeholder="ابحث عن وجبتك المفضلة مباشرة... (برجر، بيتزا، شاورما، عصير)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm py-3.5 pr-11 pl-10 border border-slate-200 bg-slate-50 hover:bg-slate-50/70 focus:bg-white rounded-2xl outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all font-bold text-[#2D2D2D] shadow-inner text-right"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400 hover:text-gray-600 active:scale-90 transition-all cursor-pointer"
                title="مسح البحث"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* 🔍 Interactive Menu Navigation & Browsing */}
      <section id="menu-section" className="space-y-8">
        
        {/* --- CONDITION 1: Grid Menu Categories (Landing view with no active search/category filter) --- */}
        {selectedCategory === "all" && !searchQuery ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.map((category) => {
                const count = menuItems.filter((i) => i.category === category.id && i.isAvailable).length;
                return (
                  <motion.div
                    whileHover={{ y: -6, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSearchQuery("");
                    }}
                    id={`cat-card-${category.id}`}
                    className="group relative aspect-square bg-white rounded-[2.5rem] overflow-hidden border border-gray-250 shadow-xs hover:shadow-md cursor-pointer transition-all duration-300 flex flex-col justify-end p-5"
                  >
                    {/* Background Visual Image */}
                    {category.image && (
                      <div className="absolute inset-0 w-full h-full">
                        <img
                          src={category.image}
                          alt={category.arabicName}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
                      </div>
                    )}

                    {/* Department Emoji/Icon Badge */}
                    <div className="absolute top-4 right-4 bg-white/95 text-xl w-10 h-10 rounded-2xl flex items-center justify-center shadow-md border border-white/20 z-10 transition-all duration-300 group-hover:scale-115">
                      <span>{category.icon}</span>
                    </div>

                    {/* Department Labels */}
                    <div className="relative text-white z-10 text-right space-y-1">
                      <span className="text-[9px] bg-brand-orange text-white font-black px-2 py-0.5 rounded-full inline-block leading-none">
                        {count} وجبات
                      </span>
                      <h3 className="text-sm sm:text-base md:text-lg font-black group-hover:text-brand-orange transition-colors">
                        {category.arabicName}
                      </h3>
                      <p className="text-gray-300 text-[10px] font-mono uppercase tracking-wider opacity-85">
                        {category.name}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ) : (
          /* --- CONDITION 2: Detailed Category list / Active Search results --- */
          <div className="space-y-6">
            
            {/* Header control line with integrated Search Bar */}
            {selectedCategory !== "all" && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="bg-brand-orange/15 hover:bg-brand-orange/25 text-brand-orange text-xs font-black px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer active:scale-95 shadow-sm self-start"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>العودة للأقسام الرئيسية</span>
                </button>

                {/* Integrated Search within Category view */}
                <div className="relative max-w-sm w-full font-medium">
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-450">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="ابحث عن طبق، وجبة في هذا القسم..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs py-2 pr-9 pl-4 border border-slate-200 bg-white rounded-xl outline-none focus:ring-1 focus:ring-brand-orange transition-all font-medium text-[#2D2D2D]"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Micro Categories strip for swift horizontal jump */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSearchQuery("");
                }}
                className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 border transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-brand-orange border-brand-orange text-white shadow-sm"
                    : "bg-white border-gray-200 text-[#2D2D2D] hover:bg-slate-50"
                }`}
              >
                <span>🌍</span>
                <span>كل الأقسام</span>
              </button>
              {categories.map((category) => {
                const isActive = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setSearchQuery("");
                    }}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold shrink-0 border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-brand-orange border-brand-orange text-white shadow-sm"
                        : "bg-white border-gray-200 text-[#2D2D2D] hover:bg-slate-50"
                    }`}
                  >
                    <span>{category.icon}</span>
                    <span>{category.arabicName}</span>
                  </button>
                );
              })}
            </div>

            {/* Food Items Grid */}
            <AnimatePresence mode="popLayout">
              {filteredItems.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 bg-white rounded-3xl border border-gray-150 p-8 flex flex-col items-center justify-center space-y-3 shadow-xs"
                >
                  <span className="text-4xl">🔍</span>
                  <h3 className="font-bold text-[#2D2D2D] text-sm">لا توجد نتائج مطابقة لبحثك</h3>
                  <p className="text-gray-400 text-xs">حاول إدخال كلمات بحثية مختلفة أو تصفية فئة أخرى.</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                    }}
                    className="bg-brand-orange/15 text-brand-orange hover:bg-brand-orange/25 font-extrabold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    مسح التصفية والبحث
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {filteredItems.map((item) => {
                    const hasDiscount = !!item.discountPrice;
                    return (
                      <motion.div
                        layout
                        key={item.id}
                        id={`dish-item-${item.id}`}
                        className="bg-white rounded-2xl p-4 border border-gray-150 shadow-xs flex items-center justify-between gap-4 hover:border-brand-orange hover:shadow-xs transition-all duration-300 hover:scale-[1.01]"
                      >
                        {/* Right: Dish Name */}
                        <div className="flex-1 text-right min-w-0 pr-1">
                          <h3 className="font-extrabold text-[#2D2D2D] text-sm sm:text-base leading-tight">
                            {item.arabicName}
                          </h3>
                        </div>

                        {/* Middle: Price */}
                        <div className="flex items-center gap-2 px-2 shrink-0">
                          {hasDiscount ? (
                            <div className="text-left flex flex-col items-end">
                              <span className="font-black text-red-500 text-sm sm:text-base">
                                {item.discountPrice} دج
                              </span>
                              <span className="text-gray-400 line-through text-[10px] sm:text-xs">
                                {item.price} دج
                              </span>
                            </div>
                          ) : (
                            <span className="font-black text-[#2D2D2D] text-sm sm:text-base text-left">
                              {item.price} دج
                            </span>
                          )}
                        </div>

                        {/* Left: Quick Add Button */}
                        <div className="shrink-0">
                          <button
                            onClick={() => onAddToCart(item, 1)}
                            className="bg-brand-orange hover:bg-brand-orange-hover text-white font-black py-2 px-3 sm:px-4 rounded-xl text-xs flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                            <span>إضافة</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>
    </div>
  );
}
