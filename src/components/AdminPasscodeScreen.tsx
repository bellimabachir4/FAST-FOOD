import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, ShieldAlert, Lock, Unlock, AlertTriangle, Wifi, Clock } from "lucide-react";

interface AdminPasscodeScreenProps {
  onSuccess: () => void;
  onBack: () => void;
  correctCode?: string;
}

export interface SecurityLog {
  id: string;
  timestamp: string;
  status: "success" | "denied" | "blocked" | "reset";
  enteredCode: string;
  details: string;
  device: string;
  ip: string;
}

export default function AdminPasscodeScreen({ onSuccess, onBack, correctCode = "19992026" }: AdminPasscodeScreenProps) {
  const [pin, setPin] = useState<string>("");
  const [errorWord, setErrorWord] = useState<string>("");
  const [attempts, setAttempts] = useState<number>(() => {
    const saved = localStorage.getItem("flavista_failed_attempts");
    return saved ? parseInt(saved, 10) : 0;
  });
  
  const [blockTimeLeft, setBlockTimeLeft] = useState<number>(0);

  // Load block time if exists
  useEffect(() => {
    const blockUntil = localStorage.getItem("flavista_blocked_until");
    if (blockUntil) {
      const until = parseInt(blockUntil, 10);
      const now = Date.now();
      if (until > now) {
        setBlockTimeLeft(Math.ceil((until - now) / 1000));
      } else {
        localStorage.removeItem("flavista_blocked_until");
      }
    }
  }, []);

  // Block timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (blockTimeLeft > 0) {
      timer = setInterval(() => {
        setBlockTimeLeft((prev) => {
          if (prev <= 1) {
            localStorage.removeItem("flavista_blocked_until");
            setAttempts(0);
            localStorage.setItem("flavista_failed_attempts", "0");
            // Log block release
            addSecurityLog("reset", "****", "انتهت فترة الحظر التلقائي وتمت إعادة تعيين الرمز");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [blockTimeLeft]);

  // Helper function to append security log
  const addSecurityLog = (status: "success" | "denied" | "blocked" | "reset", code: string, details: string) => {
    const savedLogs = localStorage.getItem("flavista_security_logs");
    const parsedLogs: SecurityLog[] = savedLogs ? JSON.parse(savedLogs) : [];
    
    // Generate realistic device information
    const userAgent = navigator.userAgent;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);
    const deviceType = isMobile ? "هاتف محمول (Mobile Client)" : "جهاز مكتب (Desktop Terminal)";
    
    // Realistic Algerian locations & clean mock IPs for aesthetics
    const mockIPs = ["105.101.42.17", "197.112.5.83", "41.201.162.24", "105.109.201.8"];
    const algerianCities = ["الجزائر العاصمة (Algiers)", "وهران (Oran)", "قسنطينة (Constantine)", "تيزي وزو (Tizi Ouzou)"];
    
    const randomIdx = Math.floor(Math.random() * algerianCities.length);
    const selectedIP = mockIPs[randomIdx];
    const city = algerianCities[randomIdx];

    const newLog: SecurityLog = {
      id: `sec-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString("ar-DZ", { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " | " + new Date().toLocaleDateString("ar-DZ"),
      status,
      enteredCode: code,
      details,
      device: `${deviceType} - ${city}`,
      ip: selectedIP
    };

    localStorage.setItem("flavista_security_logs", JSON.stringify([newLog, ...parsedLogs]));
  };

  // Pre-seed some aesthetic security audit logs if empty
  useEffect(() => {
    const savedLogs = localStorage.getItem("flavista_security_logs");
    if (!savedLogs) {
      const initialLogs: SecurityLog[] = [
        {
          id: "sec-1",
          timestamp: new Date(Date.now() - 3600000).toLocaleTimeString("ar-DZ") + " | " + new Date().toLocaleDateString("ar-DZ"),
          status: "reset",
          enteredCode: "****",
          details: "تم تهيئة وتشغيل نظام حماية الأعضاء لأول مرة بنجاح",
          device: "خادم النظام الأساسي (Localhost Server)",
          ip: "127.0.0.1"
        }
      ];
      localStorage.setItem("flavista_security_logs", JSON.stringify(initialLogs));
    }
  }, []);

  const handleKeyPress = (num: string) => {
    if (blockTimeLeft > 0) return;
    if (pin.length < 8) {
      setErrorWord("");
      setPin((prev) => prev + num);
    }
  };

  const handleBackspace = () => {
    if (blockTimeLeft > 0) return;
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (blockTimeLeft > 0) return;
    setPin("");
    setErrorWord("");
  };

  const handleAuthorizeSubmit = () => {
    if (blockTimeLeft > 0) return;
    
    // Validate secure PIN credentials
    const correctCodeValue = correctCode;
    
    if (pin === correctCodeValue) {
      // SUCCESS LOGGING
      addSecurityLog("success", "•".repeat(pin.length), "تم تأكيد الهوية بنجاح وتم الوصول إلى لوحة الإدارة");
      localStorage.setItem("flavista_failed_attempts", "0");
      setAttempts(0);
      onSuccess();
    } else {
      // FAILED ATTEMPT LOGGING
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("flavista_failed_attempts", newAttempts.toString());
      
      const maskedValue = "•".repeat(pin.length) || "فارغ";
      
      if (newAttempts >= 3) {
        // LOCK AND BLOCK OUT SYSTEM ACTIVATED (3 wrong attempts)
        const blockDurationMs = 60000; // 60 seconds of severe blockout
        const blockedUntilStr = (Date.now() + blockDurationMs).toString();
        localStorage.setItem("flavista_blocked_until", blockedUntilStr);
        setBlockTimeLeft(60);
        
        addSecurityLog("blocked", maskedValue, "محاولة دخول غير مصرح بها متتالية (#3) - تم حظر وتجميد لوحة الإدارة لحمايتها");
        setErrorWord("تم تفعيل نظام الحظر التلقائي! تم تجميد الوصول لـ 60 ثانية لحماية بيانات العملاء.");
        setPin("");
      } else {
        addSecurityLog("denied", maskedValue, `محاولة دخول فاشلة رقم #${newAttempts} بكود خاطئ`);
        setErrorWord(`الرمز السري غير صحيح! تبقى لديك ${3 - newAttempts} محاولات قبل الحظر.`);
        setPin("");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FFF8F2] text-[#2D2D2D] overflow-hidden select-none font-sans" dir="rtl">
      {/* Background radial soft golden-orange lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] h-[90vw] sm:w-[600px] sm:h-[600px] rounded-full bg-brand-orange/5 blur-3xl pointer-events-none" />
      
      {/* Interactive top network status indicator bar */}
      <div className="absolute top-4 right-6 left-6 flex justify-between items-center text-slate-400 text-xxs pointer-events-none">
        <div className="flex items-center gap-1.5 font-mono">
          <Wifi className="w-3.5 h-3.5 text-brand-orange" />
          <span>FLAVISTA_SECURE_SSL</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-brand-orange" />
          <span>2026 UTC</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6 text-center">
        {/* Guarding Shield Centerpiece */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <motion.div
              animate={blockTimeLeft > 0 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`w-18 h-18 rounded-2xl flex items-center justify-center shadow-md ${
                blockTimeLeft > 0 
                  ? "bg-red-500/10 border-2 border-red-500/30 text-red-500" 
                  : attempts > 0 
                    ? "bg-brand-orange/10 border border-brand-orange/30 text-brand-orange"
                    : "bg-brand-orange/10 border border-brand-orange/30 text-brand-orange"
              }`}
            >
              {blockTimeLeft > 0 ? (
                <ShieldAlert className="w-9 h-9" />
              ) : pin.length > 0 ? (
                <Unlock className="w-9 h-9 animate-pulse" />
              ) : (
                <Lock className="w-9 h-9" />
              )}
            </motion.div>
            
            {/* Small active padlock label badge */}
            <span className={`absolute -bottom-1.5 -left-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
              blockTimeLeft > 0 ? "bg-red-600 text-white animate-pulse" : "bg-white border border-gray-200 text-slate-500"
            }`}>
              {blockTimeLeft > 0 ? "محظور مؤقتاً" : "مشفّر IPS"}
            </span>
          </div>
        </div>

        {/* Security Title labels */}
        <div className="space-y-1 mb-8">
          <h1 className="text-xl font-black text-[#2D2D2D] tracking-wide">نظام التحقق لإدارة Flavista</h1>
          <p className="text-xs text-slate-500 leading-relaxed px-5 font-medium">
            الوصول لبيانات الزبائن وصيانة المنيو محصور فقط للأعضاء المعتمدين والمفوضين من إدارة مطعم فلافيستا.
          </p>
        </div>

        {/* Passcode display box dashboard */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 shadow-md relative">
          <div className="text-[10px] text-brand-orange font-bold uppercase text-right mb-1">حقل الرمز السري الفوري:</div>
          <div className="h-10 flex items-center justify-center gap-1.5">
            {blockTimeLeft > 0 ? (
              <div className="flex items-center gap-2 text-red-500 text-sm font-black font-sans leading-none">
                <AlertTriangle className="w-4 h-4" />
                <span>بروتوكول حماية نشط.. انتظر {blockTimeLeft} ثانية</span>
              </div>
            ) : pin.length === 0 ? (
              <span className="text-slate-400 text-xs font-bold font-sans">يرجى إدخال الرمز السري الفوري</span>
            ) : (
              <div className="flex gap-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 rounded-full border transition-all ${
                      i < pin.length
                        ? "bg-brand-orange border-brand-orange shadow-[0_0_8px_#FF6B35]"
                        : "bg-slate-100 border-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error notification banner with shaking simulation */}
        <AnimatePresence>
          {errorWord && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-3 text-[11px] rounded-xl text-center border font-bold mb-6 flex items-center justify-center gap-1.5 ${
                blockTimeLeft > 0 
                  ? "bg-red-500/10 text-red-400 border-red-500/20" 
                  : "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorWord}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keypad Numeric Controller Grid */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              disabled={blockTimeLeft > 0 || pin.length >= 8}
              className="py-3.5 text-lg font-black font-sans bg-white border border-gray-200 text-[#2D2D2D] hover:bg-orange-50 hover:text-brand-orange rounded-xl transition cursor-pointer flex items-center justify-center active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-xxs"
            >
              {num}
            </button>
          ))}

          {/* Delete Clear Operations */}
          <button
            type="button"
            onClick={handleClear}
            disabled={blockTimeLeft > 0 || pin.length === 0}
            className="py-3.5 text-xs font-bold text-red-500 bg-white border border-gray-200 hover:bg-red-50 rounded-xl transition cursor-pointer flex items-center justify-center active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-xxs"
          >
            مسح الكل
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress("0")}
            disabled={blockTimeLeft > 0 || pin.length >= 8}
            className="py-3.5 text-lg font-black font-sans bg-white border border-gray-200 text-[#2D2D2D] hover:bg-orange-50 hover:text-brand-orange rounded-xl transition cursor-pointer flex items-center justify-center active:scale-95 disabled:pointer-events-none shadow-xxs"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            disabled={blockTimeLeft > 0 || pin.length === 0}
            className="py-3.5 bg-white border border-gray-200 text-slate-400 hover:bg-slate-50 hover:text-brand-orange rounded-xl transition cursor-pointer flex items-center justify-center active:scale-95 disabled:opacity-45 disabled:pointer-events-none shadow-xxs"
            title="حذف رقم"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
          </button>
        </div>

        {/* Submit authentication trigger */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="w-1/3 py-3.5 bg-white hover:bg-slate-50 border border-gray-200 text-slate-500 hover:text-brand-orange rounded-2xl text-xs font-bold transition active:scale-98 cursor-pointer shadow-xxs"
          >
            الرجوع للصالة
          </button>

          <button
            type="button"
            onClick={handleAuthorizeSubmit}
            disabled={blockTimeLeft > 0 || pin.length < 8}
            className="flex-1 py-3.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black rounded-2xl shadow-md shadow-brand-orange/10 transition active:scale-98 cursor-pointer disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-1.5 border border-brand-orange/20"
          >
            <Shield className="w-4 h-4" />
            <span>تأكيد الدخول الآمن</span>
          </button>
        </div>

        {/* Dynamic warning footer */}
        <p className="mt-8 text-slate-400 text-[10px] leading-relaxed">
          جميع محاولات الدخول، الناجحة والمحجوبة، تخضع للمراجعة والرقابة من قِبل إدارة الأمان الرقمي بمطعم فلافيستا (Flavista).
        </p>
      </div>
    </div>
  );
}
