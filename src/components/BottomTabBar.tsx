/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Menu, ShoppingBag, Phone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem } from "../types";

interface BottomTabBarProps {
  cart: CartItem[];
  activeTab: "menu" | "orders" | "about";
  onTabChange: (tab: "menu" | "orders" | "about") => void;
  onOpenCart: () => void;
  onMenuClick: () => void;
  onAboutClick: () => void;
}

export default function BottomTabBar({
  cart = [],
  activeTab = "menu",
  onTabChange,
  onOpenCart,
  onMenuClick,
  onAboutClick,
}: BottomTabBarProps) {
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badgeText = cartCount > 99 ? "99+" : cartCount.toString();

  const handleTabClick = (tab: "menu" | "orders" | "about") => {
    // Haptic feedback if supported by browser/device
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(12);
    }
    
    onTabChange(tab);
    if (tab === "menu") {
      onMenuClick();
    } else if (tab === "orders") {
      onOpenCart();
    } else if (tab === "about") {
      onAboutClick();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[290px] z-[100] pointer-events-none">
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full bg-white/90 backdrop-blur-md rounded-full py-1.5 px-4 shadow-[0_10px_25px_rgba(0,0,0,0.06)] flex items-center justify-between pointer-events-auto relative select-none border border-slate-100"
        dir="rtl"
      >
        {/* 1. MENU TAB (Right-most in RTL) */}
        <div className="flex-1 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTabClick("menu")}
            className="p-3.5 relative flex flex-col items-center justify-center cursor-pointer focus:outline-none"
            title="القائمة"
            aria-label="القائمة"
          >
            <Menu
              className={`w-5.5 h-5.5 transition-all duration-300 ${
                activeTab === "menu" ? "text-brand-orange scale-110 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            />
            {activeTab === "menu" && (
              <motion.span
                layoutId="active-orange-indicator"
                className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-orange shadow-xxs"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </motion.button>
        </div>

        {/* 2. ORDERS / CART TAB (Center) */}
        <div className="flex-1 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTabClick("orders")}
            className="p-3.5 relative flex flex-col items-center justify-center cursor-pointer focus:outline-none"
            title="الطلبات"
            aria-label="الطلبات"
          >
            <ShoppingBag
              className={`w-5.5 h-5.5 transition-all duration-300 ${
                activeTab === "orders" ? "text-brand-orange scale-110 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            />
            
            {/* Dynamic Badge for Cart Count */}
            <AnimatePresence>
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute top-1.5 right-1 bg-red-500 text-white text-[9px] font-black min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center border-2 border-white shadow-sm leading-none"
                >
                  {badgeText}
                </motion.span>
              )}
            </AnimatePresence>

            {activeTab === "orders" && (
              <motion.span
                layoutId="active-orange-indicator"
                className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-orange shadow-xxs"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </motion.button>
        </div>

        {/* 3. ABOUT TAB (Left-most in RTL) */}
        <div className="flex-1 flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTabClick("about")}
            className="p-3.5 relative flex flex-col items-center justify-center cursor-pointer focus:outline-none"
            title="حولنا"
            aria-label="حولنا"
          >
            <Phone
              className={`w-5.5 h-5.5 transition-all duration-300 ${
                activeTab === "about" ? "text-brand-orange scale-110 font-bold" : "text-slate-400 hover:text-slate-600"
              }`}
            />
            {activeTab === "about" && (
              <motion.span
                layoutId="active-orange-indicator"
                className="absolute bottom-1 w-1 h-1 rounded-full bg-brand-orange shadow-xxs"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
