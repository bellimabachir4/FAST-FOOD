/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { X, ShoppingBag } from "lucide-react";
import { ToastNotification } from "../types";
import { AnimatePresence, motion } from "motion/react";
import FlavistaLogo from "./FlavistaLogo";

interface NotificationToastProps {
  toasts: ToastNotification[];
  onClose: (id: string) => void;
  onOpenCart: () => void;
  logoUrl?: string;
}

export default function NotificationToast({ toasts, onClose, onOpenCart, logoUrl }: NotificationToastProps) {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[250] flex flex-col gap-3 max-w-md w-[calc(100%-2rem)] sm:w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={onClose}
            onOpenCart={onOpenCart}
            logoUrl={logoUrl}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastItemProps {
  key?: string;
  toast: ToastNotification;
  onClose: (id: string) => void;
  onOpenCart: () => void;
  logoUrl?: string;
}

function ToastItem({ toast, onClose, onOpenCart, logoUrl }: ToastItemProps) {
  useEffect(() => {
    const duration = toast.duration || 5000;
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -25, scale: 0.95, filter: "blur(2px)" }}
      transition={{ type: "spring", damping: 22, stiffness: 200 }}
      className="bg-white/95 backdrop-blur-md border-r-4 border-brand-orange border border-slate-150 rounded-2xl shadow-xl p-4 flex items-center gap-4 w-full pointer-events-auto cursor-pointer relative overflow-hidden group hover:shadow-2xl hover:border-brand-orange/30 transition-all duration-300"
      dir="rtl"
    >
      {/* Dynamic top progress/indicator indicator */}
      <span className="absolute top-0 right-0 h-0.5 bg-brand-orange w-full opacity-60 group-hover:opacity-100 transition-all duration-300" />

      {/* Product Image Thumbnail or Restaurant Logo */}
      {toast.type !== "info" && toast.dishImage ? (
        <img
          src={toast.dishImage}
          alt={toast.dishName || "وجبة طعام"}
          referrerPolicy="no-referrer"
          className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-100 shadow-sm"
        />
      ) : (
        <div className="w-14 h-14 rounded-xl bg-brand-orange/5 flex items-center justify-center shrink-0 border border-brand-orange/15 p-1 bg-white shadow-inner">
          <FlavistaLogo logoUrl={logoUrl} className="w-full h-full object-contain rounded-lg" />
        </div>
      )}

      {/* Text Details */}
      <div className="flex-1 min-w-0 text-right">
        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full inline-block mb-1 border ${
          toast.type === "info" 
            ? "text-brand-orange bg-brand-orange/10 border-brand-orange/15" 
            : "text-emerald-600 bg-emerald-50 border-emerald-150"
        }`}>
          {toast.type === "info" ? "مطعم Flavista 🍽️" : "تمت الإضافة بنجاح! 🎉"}
        </span>
        <h4 className="text-xs font-black text-slate-800 leading-relaxed break-words">
          {toast.message || toast.dishName}
        </h4>
        {toast.type !== "info" && toast.price > 0 && (
          <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-bold">
            <span>السعر من السلة:</span>
            <span className="font-extrabold text-brand-orange">
              {toast.price} دج
            </span>
          </p>
        )}
      </div>

      {/* Interactive Actions */}
      <div className="flex flex-col gap-1.5 items-end shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose(toast.id);
          }}
          className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-1.5 rounded-xl transition-all duration-200 cursor-pointer"
          title="إغلاق التنبيه"
        >
          <X className="w-4 h-4" />
        </button>

        {toast.type !== "info" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenCart();
              onClose(toast.id);
            }}
            className="mt-0.5 flex items-center gap-1 bg-brand-orange text-white font-black py-1 px-2.5 text-[10px] rounded-lg hover:bg-brand-orange-hover shadow-xs active:scale-95 transition-all outline-none cursor-pointer"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>السلة</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

