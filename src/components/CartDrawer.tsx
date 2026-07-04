/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  X,
  Trash2,
  MapPin,
  ShoppingBag,
  CreditCard,
  Phone,
  User,
  Truck,
  Store,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { CartItem, Order, DeliveryArea } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (dishId: string, quantity: number) => void;
  onRemoveItem: (dishId: string) => void;
  onPlaceOrder: (details: {
    customerName: string;
    customerPhone: string;
    deliveryType: "delivery" | "pickup" | "dine_in";
    deliveryArea?: string;
    deliveryFee: number;
    tableNumber?: string;
    notes?: string;
  }) => any;
  deliveryAreas: DeliveryArea[];
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  deliveryAreas = [],
}: CartDrawerProps) {
  // Input fields
  const [customerName, setCustomerName] = useState("زبون Flavista");
  const [customerPhone, setCustomerPhone] = useState("غير محدد");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup" | "dine_in" >("dine_in");
  const [tableNumber, setTableNumber] = useState("");
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [detailedAddress, setDetailedAddress] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const activeAreas = useMemo(() => {
    return (deliveryAreas || []).filter(area => area.isActive);
  }, [deliveryAreas]);

  const selectedArea = useMemo(() => {
    return activeAreas.find(a => a.id === selectedAreaId);
  }, [activeAreas, selectedAreaId]);

  const deliveryFee = useMemo(() => {
    if (deliveryType !== "delivery") return 0;
    return selectedArea ? selectedArea.fee : 0;
  }, [deliveryType, selectedArea]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, curr) => {
      const actualPrice = curr.menuItem.discountPrice || curr.menuItem.price;
      return acc + actualPrice * curr.quantity;
    }, 0);
  }, [cartItems]);

  const total = useMemo(() => {
    return subtotal + deliveryFee;
  }, [subtotal, deliveryFee]);

  const isFormValid = useMemo(() => {
    if (cartItems.length === 0) return false;
    if (deliveryType === "dine_in") {
      if (!tableNumber.trim()) return false;
    }
    if (deliveryType === "delivery") {
      if (!customerName.trim() || !selectedAreaId || !detailedAddress.trim()) return false;
    }
    if (deliveryType === "pickup") {
      if (!customerName.trim()) return false;
    }
    return true;
  }, [cartItems, deliveryType, tableNumber, customerName, selectedAreaId, detailedAddress]);

  const onSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setErrorMessage("يرجى ملء كافة تفاصيل الطلب المطلوبة للاستلام.");
      return;
    }

    setErrorMessage("");
    const formattedArea = deliveryType === "delivery" && selectedArea 
      ? `${selectedArea.name} (${detailedAddress.trim()})` 
      : undefined;

    onPlaceOrder({
      customerName: customerName.trim(),
      customerPhone: "غير محدد",
      deliveryType,
      deliveryArea: formattedArea || undefined,
      deliveryFee,
      tableNumber: deliveryType === "dine_in" ? tableNumber.trim() : undefined,
      notes: customerNotes.trim() || undefined,
    });

    // Reset local form values for the next order
    setCustomerName("زبون Flavista");
    setCustomerPhone("غير محدد");
    setTableNumber("");
    setSelectedAreaId("");
    setDetailedAddress("");
    setCustomerNotes("");
    setDeliveryType("dine_in");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center p-0 sm:p-4 md:p-6 text-right" dir="rtl">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50 backdrop-blur-md cursor-pointer"
          />

          {/* Bottom Sheet on Mobile / Centered Modal on Desktop */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="relative w-full max-w-xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col z-10 p-0 border border-slate-100 h-[85vh] sm:h-auto sm:max-h-[85vh] overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="bg-white text-[#2D2D2D] p-5 flex items-center justify-between border-b border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-brand-orange animate-bounce" />
                <div>
                  <h2 className="text-sm font-bold leading-tight text-[#2D2D2D]">سلة المأكولات الذكية</h2>
                  <p className="text-xxs text-slate-500 font-semibold mt-0.5">
                    لديك {cartItems.reduce((acc, c) => acc + c.quantity, 0)} وجبات في قائمتك
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="hover:bg-slate-100 p-2 rounded-full text-slate-500 hover:text-[#2D2D2D] cursor-pointer transition-colors"
                title="إغلاق السلة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Content */}
            <div className="flex-1 flex flex-col overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3 bg-[#FFF8F2]">
                  <span className="text-4xl">🛒</span>
                  <h3 className="font-extrabold text-[#2D2D2D] text-base">السلة فارغة حالياً</h3>
                  <p className="text-slate-500 text-xs max-w-xs">
                    أضف بعض وجبات اللحم، البيتزا، أو الحلويات اللذيذة من القائمة لبدء تجربة طلب طعام مثالية.
                  </p>
                  <button
                    onClick={onClose}
                    className="bg-brand-orange/10 text-brand-orange hover:bg-brand-orange/20 px-6 py-2 rounded-xl text-xs font-black transition cursor-pointer"
                  >
                    تصفح الوجبات الآن
                  </button>
                </div>
              ) : (
                <div className="p-5 space-y-6 flex-1 bg-white">
                  {/* Items List */}
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-[#2D2D2D] text-xs border-b border-slate-100 pb-2">
                      الأصناف المختارة بالسلة
                    </h3>

                    <div className="space-y-3.5 max-h-[190px] overflow-y-auto pr-1">
                      {cartItems.map((item) => {
                        const itemPrice = item.menuItem.discountPrice || item.menuItem.price;
                        return (
                          <div
                            key={`cart-${item.menuItem.id}`}
                            className="bg-slate-50/50 rounded-2xl p-3.5 border border-slate-150 flex items-center justify-between gap-3 shadow-xxs relative group"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-[#2D2D2D] text-xs truncate">
                                {item.menuItem.arabicName}
                              </h4>
                              <p className="text-brand-orange font-extrabold text-xs mt-0.5">
                                {itemPrice} دج / للوجبة
                              </p>
                              {item.note && (
                                <span className="text-xxs text-slate-500 bg-slate-100 px-2 py-0.5 rounded italic inline-block mt-1">
                                  ملاحظة: {item.note}
                                </span>
                              )}
                            </div>

                            {/* Increments Box */}
                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.menuItem.id, Math.max(1, item.quantity - 1))}
                                  className="px-2.5 py-0.5 text-slate-600 text-xs font-bold hover:bg-slate-200"
                                >
                                  -
                                </button>
                                <span className="px-2.5 font-bold text-xs text-[#2D2D2D]">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.menuItem.id, item.quantity + 1)}
                                  className="px-2.5 py-0.5 text-slate-600 text-xs font-bold hover:bg-slate-200"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => onRemoveItem(item.menuItem.id)}
                                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                                title="حذف من السلة"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Funnel Checkout Parameters Form */}
                  <form onSubmit={onSubmitOrder} className="space-y-4 pt-4 border-t border-slate-150">
                    <h3 className="font-extrabold text-slate-700 text-xs text-right">
                      تفاصيل الاستلام والزبون
                    </h3>

                    {/* Pickup Vs Delivery Vs Dine-In Tabs */}
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDeliveryType("dine_in")}
                        className={`py-2 px-1 rounded-xl font-bold text-[10px] sm:text-xs flex flex-col items-center justify-center gap-1.5 border cursor-pointer transition-all ${
                          deliveryType === "dine_in"
                            ? "bg-brand-orange text-white border-brand-orange shadow-xs"
                            : "bg-white text-[#2D2D2D] border-gray-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-sm">🍽️</span>
                        <span>داخل المطعم</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType("pickup")}
                        className={`py-2 px-1 rounded-xl font-bold text-[10px] sm:text-xs flex flex-col items-center justify-center gap-1.5 border cursor-pointer transition-all ${
                          deliveryType === "pickup"
                            ? "bg-brand-orange text-white border-brand-orange shadow-xs"
                            : "bg-white text-[#2D2D2D] border-gray-200 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-sm">📦</span>
                        <span>خارج المطعم</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryType("delivery")}
                        className={`py-2 px-1 rounded-xl font-bold text-[10px] sm:text-xs flex flex-col items-center justify-center gap-1.5 border cursor-pointer transition-all ${
                          deliveryType === "delivery"
                            ? "bg-brand-orange text-white border-brand-orange shadow-xs"
                            : "bg-white text-[#2D2D2D] border-gray-200 hover:bg-slate-50"
                        }`}
                      >
                        <Truck className="w-4 h-4 shrink-0" />
                        <span>توصيل للمنزل</span>
                      </button>
                    </div>

                    {/* Name Input */}
                    <div className="space-y-3.5 pt-1">
                      <div className="space-y-1 text-right">
                        <label className="block text-xxs font-extrabold text-slate-700">اسم الزبون الكريم: <span className="text-red-500 font-bold">*</span></label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange font-bold text-right text-[#2D2D2D] shadow-xxs"
                          placeholder="مثال: وائل، محمد عيسى..."
                        />
                      </div>
                    </div>

                    {/* Dine-in Table Number Field */}
                    {deliveryType === "dine_in" && (
                      <div className="bg-brand-orange/10 p-3.5 rounded-2xl border border-brand-orange/20 space-y-2 text-right">
                        <label className="block text-xxs font-bold text-slate-700 flex items-center gap-1">
                          <span className="text-sm">📍</span>
                          <span>أدخل رقم طاولتك داخل المطعم: <span className="text-red-500 font-bold">*</span></span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="مثال: طاولة رقم 4، صالة العائلات..."
                          value={tableNumber}
                          onChange={(e) => setTableNumber(e.target.value)}
                          className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange font-bold text-right text-[#2D2D2D]"
                        />
                        <p className="text-[10px] text-brand-orange leading-tight">سافر طلبك لمطبخ الطهاة مباشرة وسنقدمه ساخناً لطاولتك.</p>
                      </div>
                    )}

                    {/* Selectable Delivery Area Controls */}
                    {deliveryType === "delivery" && (
                      <div className="bg-slate-50/50 p-3.5 rounded-2xl border border-slate-150 space-y-3 text-right">
                        <div>
                          <label className="block text-xxs font-bold text-slate-700 mb-1">
                            اختر بلدية أو منطقة التوصيل: <span className="text-red-600 font-bold">*</span>
                          </label>
                          <select
                            required
                            value={selectedAreaId}
                            onChange={(e) => setSelectedAreaId(e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange font-bold text-right text-[#2D2D2D]"
                          >
                            <option value="">-- اختر المنطقة / البلدية --</option>
                            {activeAreas.map((area) => (
                              <option key={area.id} value={area.id}>
                                {area.name} (التوصيل: {area.fee} دج)
                              </option>
                            ))}
                          </select>
                        </div>

                        {selectedArea && selectedArea.neighborhoods && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            <span className="font-bold text-brand-orange">الأحياء المخدمة:</span> {selectedArea.neighborhoods}
                          </div>
                        )}

                        <div>
                          <label className="block text-xxs font-bold text-slate-700 mb-1">
                            العنوان التفصيلي (الحي، العمارة، رقم الشقة): <span className="text-red-600 font-bold">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="مثال: عمارة 12، الطابق 3، شقة 5..."
                            value={detailedAddress}
                            onChange={(e) => setDetailedAddress(e.target.value)}
                            className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange font-bold text-right text-[#2D2D2D]"
                          />
                        </div>
                        <p className="text-[10px] text-brand-orange leading-tight">سيتم توصيل دافئ بأسرع وقت لعنوانكم المحدد.</p>
                      </div>
                    )}

                    {/* Customer Notes */}
                    <div className="space-y-1 text-right">
                      <label className="block text-xxs font-bold text-slate-600">ملاحظات وطلبات خاصة (اختياري):</label>
                      <textarea
                        placeholder="مثال: بدون مايونيز، الدجاج محمر جيداً..."
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange font-medium text-right h-12 resize-none shadow-xxs text-[#2D2D2D]"
                      />
                    </div>

                    {/* Validation Error Banner */}
                    {errorMessage && (
                      <div className="p-3 bg-red-50 text-red-700 text-xxs rounded-xl border border-red-150 flex items-center gap-2 text-right">
                        <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        <span>{errorMessage}</span>
                      </div>
                    )}
                  </form>
                </div>
              )}
            </div>

            {/* Sticky Foot calculation and checkout buttons */}
            {cartItems.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 p-5 pb-10 sm:pb-8 space-y-4 shadow-inner text-right">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>قيمة المأكولات (الفرعي):</span>
                    <span className="font-bold text-[#2D2D2D]">{subtotal} دج</span>
                  </div>

                  <div className="flex justify-between items-center border-t border-slate-200 pt-2 text-sm font-black text-[#2D2D2D]">
                    <span className="text-base text-slate-600">المبلغ الإجمالي الكلي:</span>
                    <span className="text-xl text-brand-orange">{total} دج</span>
                  </div>
                </div>

                <button
                  onClick={onSubmitOrder}
                  disabled={!isFormValid}
                  className={`w-full py-3 px-6 rounded-2xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition active:scale-98 cursor-pointer ${
                    isFormValid
                      ? "bg-brand-orange hover:bg-brand-orange-hover text-white shadow-brand-orange/10"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  }`}
                >
                  <CreditCard className="w-4 h-4 shrink-0" />
                  <span>تأكيد ({total} دج)</span>
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
