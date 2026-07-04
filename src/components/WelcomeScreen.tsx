import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowLeft } from "lucide-react";
import FlavistaLogo from "./FlavistaLogo";

interface WelcomeScreenProps {
  onEnter: () => void;
  logoUrl?: string;
}

export default function WelcomeScreen({ onEnter, logoUrl }: WelcomeScreenProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFF8F2] text-[#2D2D2D] overflow-hidden select-none">
      {/* Abstract Background Atmospheric Elements */}
      <div className="absolute top-[-20%] left-[-30%] w-[80vw] h-[80vw] rounded-full bg-brand-orange/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-30%] w-[80vw] h-[80vw] rounded-full bg-brand-orange/5 blur-3xl pointer-events-none animate-pulse" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col items-center max-w-sm sm:max-w-md w-full px-6 text-center">
        
        {/* Glowing Sparkles badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 flex items-center gap-1.5 px-4 py-1.5 bg-white border border-brand-orange/20 rounded-full text-brand-orange text-xs font-bold uppercase tracking-wider shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-brand-orange animate-spin" style={{ animationDuration: "3s" }} />
          <span>مطعم Flavista العصري</span>
        </motion.div>

        {/* 🍔 Stylized Restaurant logo (Centerpiece) */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.15 }}
          className="relative mb-10 w-32 h-32 sm:w-36 sm:h-36 bg-white rounded-full flex items-center justify-center shadow-lg shadow-brand-orange/10 group cursor-pointer"
        >
          {/* Double outer glowing rings with expansion simulation */}
          <div className="absolute inset-[-6px] rounded-full border-2 border-dashed border-brand-orange/40 animate-[spin_45s_linear_infinite]" />
          <div className="absolute inset-[-14px] rounded-full border border-brand-orange/10 animate-ping opacity-35 pointer-events-none" />

          {/* Blended Circle wrapper */}
          <div className="w-full h-full rounded-full overflow-hidden p-1 bg-white shadow-md border-2 border-brand-orange">
            <FlavistaLogo
              logoUrl={logoUrl}
              className="w-full h-full object-cover rounded-full bg-white select-none pointer-events-none"
            />
          </div>
        </motion.div>

        {/* 📜 Restaurant Name & Welcome Wording */}
        <div className="space-y-4 mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#FF6B35] drop-shadow-xs font-sans"
          >
            Flav'ista
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="text-zinc-700 text-sm sm:text-base font-semibold leading-relaxed max-w-xs mx-auto"
          >
            مرحباً بكم في مطعم <span className="text-brand-orange font-extrabold">Flavista</span>! عِش متعة المذاق الأصيل بمكونات طازجة وسريعة التحضير.
          </motion.p>
        </div>

        {/* 🔘 Main Large Interactive Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="w-full"
        >
          <button
            onClick={onEnter}
            className="w-full relative py-4 px-8 bg-brand-orange hover:bg-brand-orange-hover text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-brand-orange/30 flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer group border border-brand-orange/25"
          >
            {/* Pulse glowing backdrop */}
            <span className="absolute inset-0 rounded-2xl bg-brand-orange/20 scale-105 opacity-0 group-hover:opacity-100 transition duration-300 blur-sm pointer-events-none" />

            {/* Icon and label */}
            <span className="text-white text-base">اطلب الآن</span>
            <ArrowLeft className="w-5 h-5 shrink-0 transition-transform group-hover:-translate-x-1 text-white" />
          </button>
        </motion.div>

        {/* Mini elegant indicator footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.65 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-16 text-xxs tracking-widest text-zinc-500 font-semibold uppercase"
        >
          FLAVISTA CO. © 2026
        </motion.p>

      </div>
    </div>
  );
}
