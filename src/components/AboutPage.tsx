/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import {
  PhoneCall,
  MapPin,
  Instagram,
  Facebook,
  Globe2,
  Clock,
  Sparkles,
  ShieldCheck,
  Truck
} from "lucide-react";
import { motion } from "motion/react";

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.69a6.34 6.34 0 0 0 10.86 4.49 6.25 6.25 0 0 0 2.25-4.49v-7a8.21 8.21 0 0 0 4.89 1.6V6.69a4.87 4.87 0 0 1-3.41-1.29z" />
  </svg>
);

interface AboutPageProps {
  phoneForCall?: string;
}

export default function AboutPage({ phoneForCall = "0770391093" }: AboutPageProps) {
  // Safe vibration helper
  const triggerHaptic = () => {
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="max-w-3xl mx-auto space-y-8 pb-32 pt-2 text-right px-4"
      dir="rtl"
    >
      {/* Brand Hero Card */}
      <div className="bg-gradient-to-br from-brand-orange to-brand-orange-hover text-white rounded-[2.5rem] p-8 shadow-md relative overflow-hidden">
        <div className="absolute -top-12 -left-12 w-44 h-44 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-white/5 rounded-full blur-xl" />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center justify-center bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
            <span>مطعم Flav'ista</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black tracking-wide">شغف تقديم المذاق الفريد واللذيذ ✨</h2>
          
          <p className="text-sm text-amber-50 leading-relaxed font-medium">
            مرحباً بكم في مطعم <strong className="font-extrabold text-white">Flav'ista</strong>! نحن فخورون بتقديم أشهى المأكولات المحضرة بأجود المكونات الطازجة وأعلى المعايير. نعتمد على الدقة، النظافة، والسرعة لننقل إليكم تجربة طعام استثنائية في كل وجبة تختارونها.
          </p>
        </div>
      </div>

      {/* Values & Features Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center sm:items-start text-center sm:text-right space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-brand-orange/10 flex items-center justify-center text-brand-orange">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900">سرعة التحضير والطلب</h4>
          <p className="text-xxs text-slate-500 font-bold leading-normal">
            نهتم بوقتك ونلتزم بتحضير وتغليف وجباتك بسرعة مع الحفاظ على حرارتها وجودتها العالية.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center sm:items-start text-center sm:text-right space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900">مكونات طازجة 100%</h4>
          <p className="text-xxs text-slate-500 font-bold leading-normal">
            نحن لا نساوم أبداً على الجودة، جميع الخضروات واللحوم والمكونات يتم اقتناؤها وتحضيرها يومياً.
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center sm:items-start text-center sm:text-right space-y-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Truck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-black text-slate-900">توصيل آمن وحار</h4>
          <p className="text-xxs text-slate-500 font-bold leading-normal">
            شركاء التوصيل لدينا مجهزون بحافظات حرارية مخصصة لضمان وصول وجبتك كأنها خرجت للتو من المطبخ.
          </p>
        </div>
      </div>

      {/* Modern Contact Channels Section */}
      <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="border-b border-slate-100 pb-4">
          <h3 className="text-lg font-black text-slate-900">قنوات التواصل والوصول المباشر</h3>
          <p className="text-xs text-slate-400 font-bold mt-1">تواصل معنا، تصفح حساباتنا أو تفضل بزيارة موقعنا</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* الهاتف */}
          <motion.a
            whileTap={{ scale: 0.97 }}
            onClick={triggerHaptic}
            href={`tel:${phoneForCall}`}
            className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-brand-orange/5 border border-slate-150/80 hover:border-brand-orange/20 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-400">اتصل بنا مباشرة</span>
                <span className="text-xs font-mono font-black text-slate-800 group-hover:text-brand-orange transition-colors">
                  {phoneForCall}
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-500/15 text-emerald-700 px-2.5 py-1 rounded-lg font-black group-hover:bg-emerald-500 group-hover:text-white transition-colors">اتصال سريع</span>
          </motion.a>

          {/* العنوان / الخريطة */}
          <motion.a
            whileTap={{ scale: 0.97 }}
            onClick={triggerHaptic}
            href="https://maps.google.com/?q=حي 8 ماي 1945، طريق مديرية التربية، ولاية الوادي، الجزائر"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-brand-orange/5 border border-slate-150/80 hover:border-brand-orange/20 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600 group-hover:bg-red-500 group-hover:text-white transition-all">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-400">الموقع الجغرافي</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-brand-orange transition-colors">
                  حي 8 ماي 1945، ولاية الوادي
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-red-500/15 text-red-700 px-2.5 py-1 rounded-lg font-black group-hover:bg-red-500 group-hover:text-white transition-colors">عرض الاتجاه</span>
          </motion.a>

          {/* Instagram */}
          <motion.a
            whileTap={{ scale: 0.97 }}
            onClick={triggerHaptic}
            href="https://www.instagram.com/flavista_food"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-brand-orange/5 border border-slate-150/80 hover:border-brand-orange/20 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600 group-hover:bg-pink-500 group-hover:text-white transition-all">
                <Instagram className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-400">إنستغرام المطعم</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-brand-orange transition-colors">
                  @flavista_food
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-pink-500/15 text-pink-700 px-2.5 py-1 rounded-lg font-black group-hover:bg-pink-500 group-hover:text-white transition-colors">زيارة</span>
          </motion.a>

          {/* Facebook */}
          <motion.a
            whileTap={{ scale: 0.97 }}
            onClick={triggerHaptic}
            href="https://www.facebook.com/profile.php?id=61558126251316&mibextid=wwXIfr"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-brand-orange/5 border border-slate-150/80 hover:border-brand-orange/20 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <Facebook className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-400">فيسبوك المطعم</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-brand-orange transition-colors">
                  Flav'ista Food
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-blue-600/15 text-blue-700 px-2.5 py-1 rounded-lg font-black group-hover:bg-blue-600 group-hover:text-white transition-colors">زيارة</span>
          </motion.a>

          {/* TikTok */}
          <motion.a
            whileTap={{ scale: 0.97 }}
            onClick={triggerHaptic}
            href="https://www.tiktok.com/@flavista_food?lang=en-GB"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-brand-orange/5 border border-slate-150/80 hover:border-brand-orange/20 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900/10 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all">
                <TikTokIcon className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-400">تيك توك المطعم</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-brand-orange transition-colors">
                  @flavista_food
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-slate-900/15 text-slate-900 px-2.5 py-1 rounded-lg font-black group-hover:bg-slate-900 group-hover:text-white transition-colors">زيارة</span>
          </motion.a>

          {/* الموقع الموحد */}
          <motion.a
            whileTap={{ scale: 0.97 }}
            onClick={triggerHaptic}
            href="https://tr.ee/GgsJwSTC1x"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 bg-slate-50 hover:bg-brand-orange/5 border border-slate-150/80 hover:border-brand-orange/20 rounded-2xl transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all">
                <Globe2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black text-slate-400">رابط شجرة الحسابات</span>
                <span className="text-xs font-bold text-slate-800 group-hover:text-brand-orange transition-colors">
                  الموقع والرابط الموحد
                </span>
              </div>
            </div>
            <span className="text-[10px] bg-amber-500/15 text-amber-700 px-2.5 py-1 rounded-lg font-black group-hover:bg-amber-500 group-hover:text-white transition-colors">تصفح</span>
          </motion.a>
        </div>
      </div>

      {/* Copyright Footer */}
      <div className="text-center text-xxs text-slate-400 font-bold tracking-wide pt-4">
        © جميع الحقوق محفوظة لدى Flavista Food.
      </div>
    </motion.div>
  );
}
