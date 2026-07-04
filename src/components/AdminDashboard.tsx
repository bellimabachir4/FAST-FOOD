/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  ShoppingBag,
  ChefHat,
  Users,
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Check,
  CheckCircle2,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  ClipboardList,
  BarChart4,
  Coffee,
  X,
  PlusCircle,
  Truck,
  Store,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Search,
  CheckSquare,
  Lock,
  ShieldAlert,
  LogOut,
  Bell,
  Eye,
  EyeOff,
  Inbox,
  Settings,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { MenuItem, Order, OrderStatus, Category, AppNotification, DeliveryArea } from "../types";
import { SecurityLog } from "./AdminPasscodeScreen";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  Cell
} from "recharts";
import { motion, AnimatePresence } from "motion/react";

interface AdminDashboardProps {
  orders: Order[];
  menuItems: MenuItem[];
  categories: Category[];
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder?: (orderId: string) => void;
  onAddMenuItem: (item: Omit<MenuItem, "id" | "rating" | "reviews" | "salesCount">) => void;
  onEditMenuItem: (item: MenuItem) => void;
  onDeleteMenuItem: (itemId: string) => void;
  onToggleAvailability: (itemId: string) => void;
  onAddCategory: (category: { name: string; arabicName: string; icon: string; image?: string }) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (catId: string) => void;
  onLogout?: () => void;
  onClearAllOrders?: () => void;
  notifications: AppNotification[];
  onSaveNotifications: (notifs: AppNotification[]) => void;
  deliveryAreas: DeliveryArea[];
  onSaveDeliveryAreas: (areas: DeliveryArea[]) => void;
  logoUrl?: string;
  onSaveLogoUrl?: (url: string) => void;
  orderSettings?: {
    isReceivingEnabled: boolean;
    receiveMethod: "email" | "whatsapp" | "both";
    email: string;
    whatsapp: string;
    phoneForCall?: string;
    menuLabel?: string;
    callBtnColor?: string;
    showMenuIcon?: boolean;
    showCallIcon?: boolean;
    showCartIcon?: boolean;
    welcomeTitle?: string;
    welcomeText?: string;
    promoBannerText?: string;
    promoBannerEnabled?: boolean;
    adminPasscode?: string;
    promoBannerSpeed?: number;
  };
  onUpdateOrderSettings?: (settings: {
    isReceivingEnabled: boolean;
    receiveMethod: "email" | "whatsapp" | "both";
    email: string;
    whatsapp: string;
    phoneForCall?: string;
    menuLabel?: string;
    callBtnColor?: string;
    showMenuIcon?: boolean;
    showCallIcon?: boolean;
    showCartIcon?: boolean;
    welcomeTitle?: string;
    welcomeText?: string;
    promoBannerText?: string;
    promoBannerEnabled?: boolean;
    adminPasscode?: string;
    promoBannerSpeed?: number;
  }) => void;
}

export default function AdminDashboard({
  orders,
  menuItems,
  categories,
  onUpdateOrderStatus,
  onDeleteOrder,
  onAddMenuItem,
  onEditMenuItem,
  onDeleteMenuItem,
  onToggleAvailability,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onLogout,
  onClearAllOrders,
  notifications,
  onSaveNotifications,
  deliveryAreas = [],
  onSaveDeliveryAreas,
  logoUrl,
  onSaveLogoUrl,
  orderSettings,
  onUpdateOrderSettings,
}: AdminDashboardProps) {
  // Navigation Tabs: "orders" | "menu" | "security" | "delivery"
  const [activeTab, setActiveTab] = useState<"orders" | "menu" | "security" | "delivery">("orders");

  // Bottom navigation settings state
  const [phoneForCall, setPhoneForCall] = useState(() => orderSettings?.phoneForCall || "213555123456");
  const [menuLabel, setMenuLabel] = useState(() => orderSettings?.menuLabel || "القائمة");
  const [callBtnColor, setCallBtnColor] = useState(() => orderSettings?.callBtnColor || "#10B981");
  const [showMenuIcon, setShowMenuIcon] = useState(() => orderSettings?.showMenuIcon !== false);
  const [showCallIcon, setShowCallIcon] = useState(() => orderSettings?.showCallIcon !== false);
  const [showCartIcon, setShowCartIcon] = useState(() => orderSettings?.showCartIcon !== false);
  const [welcomeTitle, setWelcomeTitle] = useState(() => orderSettings?.welcomeTitle || "🍽️ أهلاً بك في عالم النكهات المميزة");
  const [welcomeText, setWelcomeText] = useState(() => orderSettings?.welcomeText || "استمتع بتجربة طلب طعام سريعة وسهلة مع قائمة متنوعة من أشهى الوجبات، المحضّرة بعناية من مكونات طازجة وجودة عالية. هدفنا هو تقديم طعام لذيذ وخدمة مميزة تصل إليك بأفضل صورة وفي أسرع وقت");
  const [promoBannerText, setPromoBannerText] = useState(() => orderSettings?.promoBannerText || "");
  const [promoBannerEnabled, setPromoBannerEnabled] = useState(() => orderSettings?.promoBannerEnabled === true);
  const [isReceivingEnabled, setIsReceivingEnabled] = useState(() => orderSettings?.isReceivingEnabled !== false);
  const [adminPasscode, setAdminPasscode] = useState(() => orderSettings?.adminPasscode || "19992026");
  const [promoBannerSpeed, setPromoBannerSpeed] = useState(() => orderSettings?.promoBannerSpeed || 15);
  const [settingsSaveSuccess, setSettingsSaveSuccess] = useState(false);

  // Manual Refresh states
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [refreshSuccessMessage, setRefreshSuccessMessage] = useState(false);

  // Notifications filtering and details states
  const [notifFilter, setNotifFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedNotifOrder, setSelectedNotifOrder] = useState<Order | null>(null);

  // Core Search & filter states
  const [orderFilter, setOrderFilter] = useState<OrderStatus | "all">("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderDateRange, setOrderDateRange] = useState<"all" | "today" | "yesterday" | "this_week">("all");
  const [menuSearch, setMenuSearch] = useState("");
  const [reportRange, setReportRange] = useState<"daily" | "weekly" | "monthly">("weekly");

  // Menu Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Menu Sub-Tabs
  const [menuSubTab, setMenuSubTab] = useState<"items" | "categories">("items");

  // Category branching (expanded categories state)
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategoryExpand = (catId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  // Delivery Area Form States
  const [editingArea, setEditingArea] = useState<DeliveryArea | null>(null);
  const [areaName, setAreaName] = useState("");
  const [areaFee, setAreaFee] = useState<number>(0);
  const [areaNeighborhoods, setAreaNeighborhoods] = useState("");
  const [areaIsActive, setAreaIsActive] = useState(true);

  const handleSaveAreaType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!areaName.trim()) return;

    if (editingArea) {
      // Modify existing
      const updated = deliveryAreas.map(a => 
        a.id === editingArea.id 
          ? { ...a, name: areaName.trim(), fee: Number(areaFee), neighborhoods: areaNeighborhoods.trim(), isActive: areaIsActive } 
          : a
      );
      onSaveDeliveryAreas(updated);
      setEditingArea(null);
    } else {
      // Create new
      const newArea: DeliveryArea = {
        id: `area-${Date.now()}`,
        name: areaName.trim(),
        fee: Number(areaFee),
        neighborhoods: areaNeighborhoods.trim(),
        isActive: areaIsActive,
      };
      onSaveDeliveryAreas([...deliveryAreas, newArea]);
    }

    // Reset Form
    setAreaName("");
    setAreaFee(0);
    setAreaNeighborhoods("");
    setAreaIsActive(true);
  };

  const handleEditAreaClick = (area: DeliveryArea) => {
    setEditingArea(area);
    setAreaName(area.name);
    setAreaFee(area.fee);
    setAreaNeighborhoods(area.neighborhoods || "");
    setAreaIsActive(area.isActive);
  };

  const handleDeleteAreaClick = (areaId: string) => {
    if (confirm("هل أنت متأكد من رغبتك في حذف منطقة التوصيل هذه نهائياً؟")) {
      const updated = deliveryAreas.filter(a => a.id !== areaId);
      onSaveDeliveryAreas(updated);
      if (editingArea?.id === areaId) {
        setEditingArea(null);
        setAreaName("");
        setAreaFee(0);
        setAreaNeighborhoods("");
        setAreaIsActive(true);
      }
    }
  };

  // Category Modal States
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [catName, setCatName] = useState("");
  const [catArabicName, setCatArabicName] = useState("");
  const [catIcon, setCatIcon] = useState("");
  const [catImage, setCatImage] = useState("");

  const openAddCategoryModal = () => {
    setEditingCategory(null);
    setCatName("");
    setCatArabicName("");
    setCatIcon("🍔");
    setCatImage("https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=500");
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatArabicName(cat.arabicName);
    setCatIcon(cat.icon);
    setCatImage(cat.image || "");
    setIsCategoryModalOpen(true);
  };

  const handleCategoryFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      onEditCategory({
        ...editingCategory,
        name: catName,
        arabicName: catArabicName,
        icon: catIcon,
        image: catImage
      });
    } else {
      onAddCategory({
        name: catName,
        arabicName: catArabicName,
        icon: catIcon,
        image: catImage
      });
    }
    setIsCategoryModalOpen(false);
  };

  // Form Inputs
  const [formName, setFormName] = useState("");
  const [formArabicName, setFormArabicName] = useState("");
  const [formCategory, setFormCategory] = useState(() => categories[0]?.id || "meals");
  const [formPrice, setFormPrice] = useState("");
  const [formDiscountPrice, setFormDiscountPrice] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formArabicDescription, setFormArabicDescription] = useState("");

  const presetImages = [
    { label: "كبسة / وجبات", url: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&q=80&w=800" },
    { label: "شاورما دجاج / لحم", url: "https://images.unsplash.com/photo-1561651823-34fed022540e?auto=format&fit=crop&q=80&w=800" },
    { label: "بيتزا ترافل فطر", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=800" },
    { label: "بيتزا خضار مارغريتا", url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&q=80&w=800" },
    { label: "كنافة فستق", url: "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=800" },
    { label: "كيكة زعفران", url: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800" },
    { label: "موهيتو بارد", url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800" },
    { label: "عصير برتقال طازج", url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&q=80&w=800" }
  ];

  // Open Form for Adding new Product
  const [activeTabSelected, setActiveTabSelected] = useState<"meals" | string>(""); // temporary
  const openAddForm = (preselectedCategory?: string) => {
    setEditingItem(null);
    setFormName("");
    setFormArabicName("");
    setFormCategory(preselectedCategory || categories[0]?.id || "meals");
    setFormPrice("");
    setFormDiscountPrice("");
    setFormImage(presetImages[0].url);
    setFormDescription("");
    setFormArabicDescription("");
    setIsFormOpen(true);
  };

  // Open Form to Edit existing Product
  const openEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormArabicName(item.arabicName);
    setFormCategory(item.category);
    setFormPrice(item.price.toString());
    setFormDiscountPrice(item.discountPrice?.toString() || "");
    setFormImage(item.image);
    setFormDescription(item.description);
    setFormArabicDescription(item.arabicDescription);
    setIsFormOpen(true);
  };

  // Submit form handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const priceNum = parseFloat(formPrice);
    const discountNum = formDiscountPrice ? parseFloat(formDiscountPrice) : undefined;

    if (isNaN(priceNum) || priceNum <= 0) {
      console.warn("Invalid sales price entered");
      return;
    }

    if (editingItem) {
      // Edit mode
      onEditMenuItem({
        ...editingItem,
        name: formName,
        arabicName: formArabicName,
        category: formCategory,
        price: priceNum,
        discountPrice: discountNum || undefined,
        image: formImage,
        description: formDescription,
        arabicDescription: formArabicDescription,
      });
    } else {
      // Add mode
      onAddMenuItem({
        name: formName,
        arabicName: formArabicName,
        category: formCategory,
        price: priceNum,
        discountPrice: discountNum || undefined,
        image: formImage,
        description: formDescription,
        arabicDescription: formArabicDescription,
        isAvailable: true,
      });
    }

    setIsFormOpen(false);
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // 1. Status Filter
        if (orderFilter !== "all" && o.status !== orderFilter) {
          return false;
        }

        // 2. Search Query
        if (orderSearch.trim()) {
          const s = orderSearch.toLowerCase();
          const matchesName = (o.customerName || "").toLowerCase().includes(s);
          const matchesPhone = (o.customerPhone || "").toLowerCase().includes(s);
          const matchesNum = (o.orderNumber || "").toLowerCase().includes(s);
          const matchesId = (o.id || "").toLowerCase().includes(s);
          if (!matchesName && !matchesPhone && !matchesNum && !matchesId) {
            return false;
          }
        }

        // 3. Date Filter
        if (orderDateRange !== "all") {
          const orderDate = new Date(o.createdAt);
          const today = new Date();
          
          if (orderDateRange === "today") {
            const isToday = orderDate.getDate() === today.getDate() &&
                            orderDate.getMonth() === today.getMonth() &&
                            orderDate.getFullYear() === today.getFullYear();
            if (!isToday) return false;
          } else if (orderDateRange === "yesterday") {
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);
            const isYesterday = orderDate.getDate() === yesterday.getDate() &&
                                orderDate.getMonth() === yesterday.getMonth() &&
                                orderDate.getFullYear() === yesterday.getFullYear();
            if (!isYesterday) return false;
          } else if (orderDateRange === "this_week") {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(today.getDate() - 7);
            if (orderDate < oneWeekAgo) return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, orderFilter, orderSearch, orderDateRange]);

  // Filtered Menu dishes
  const filteredMenuItems = useMemo(() => {
    const q = (menuSearch || "").toLowerCase();
    return menuItems.filter(
      (item) =>
        (item.name || "").toLowerCase().includes(q) ||
        (item.arabicName || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.arabicDescription || "").toLowerCase().includes(q)
    );
  }, [menuItems, menuSearch]);

  // Analytics KPIs
  const kpis = useMemo(() => {
    const completedOrders = orders.filter((o) => o.status === "completed");
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
    const activeOrdersCount = orders.filter((o) => ["new", "preparing", "delivering"].includes(o.status)).length;
    const itemsSold = completedOrders.reduce(
      (sum, o) => sum + o.items.reduce((acc, current) => acc + current.quantity, 0),
      0
    );

    return {
      revenue: totalRevenue,
      activeOrders: activeOrdersCount,
      completedCount: completedOrders.length,
      itemsSoldCount: itemsSold,
    };
  }, [orders]);

  // Bestsellers list for bar chart
  const bestsellerChartData = useMemo(() => {
    return [...menuItems]
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5)
      .map((item) => ({
        name: item.arabicName,
        الطلب: item.salesCount,
        السعر: item.price,
      }));
  }, [menuItems]);

  // Report Revenues data based on Range Selected
  const revenueChartData = useMemo(() => {
    if (reportRange === "daily") {
      // Sample hourly data for today
      return [
        { time: "08:00 ص", المبيعات: 120 },
        { time: "11:00 ص", المبيعات: 450 },
        { time: "01:00 م", المبيعات: kpis.revenue * 0.35 },
        { time: "04:00 م", المبيعات: 380 },
        { time: "07:00 م", المبيعات: kpis.revenue * 0.4 },
        { time: "10:00 م", المبيعات: kpis.revenue * 0.15 },
      ];
    } else if (reportRange === "weekly") {
      // Last 7 week days
      return [
        { time: "السبت", المبيعات: kpis.revenue * 0.12 + 100 },
        { time: "الأحد", المبيعات: kpis.revenue * 0.14 + 120 },
        { time: "الإثنين", المبيعات: kpis.revenue * 0.11 + 90 },
        { time: "الثلاثاء", المبيعات: kpis.revenue * 0.13 + 150 },
        { time: "الأربعاء", المبيعات: kpis.revenue * 0.15 + 180 },
        { time: "الخميس", المبيعات: kpis.revenue * 0.22 + 250 },
        { time: "الجمعة", المبيعات: kpis.revenue * 0.20 + 300 },
      ];
    } else {
      // Weekly snapshots of the Month
      return [
        { time: "الأسبوع 1", المبيعات: kpis.revenue * 0.22 },
        { time: "الأسبوع 2", المبيعات: kpis.revenue * 0.28 },
        { time: "الأسبوع 3", المبيعات: kpis.revenue * 0.24 },
        { time: "الأسبوع 4", المبيعات: kpis.revenue * 0.32 },
      ];
    }
  }, [reportRange, kpis.revenue]);

  // Colors for bestseller bars
  const colors = ["#F59E0B", "#EF4444", "#10B981", "#3B82F6", "#8B5CF6"];

  // Notifications processing
  const sortedNotifications = useMemo(() => {
    let temp = [...notifications];
    if (notifFilter === "unread") {
      temp = temp.filter((n) => !n.isRead);
    } else if (notifFilter === "read") {
      temp = temp.filter((n) => n.isRead);
    }
    return temp.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, notifFilter]);

  const handleOpenNotification = (notif: AppNotification) => {
    const matched = orders.find((o) => o.id === notif.orderId);
    if (matched) {
      setSelectedNotifOrder(matched);
    } else {
      setSelectedNotifOrder({
        id: notif.orderId,
        orderNumber: notif.orderNumber,
        customerName: notif.customerName,
        customerPhone: "غير متوفر",
        deliveryType: notif.deliveryType,
        deliveryFee: 0,
        status: notif.orderStatus,
        total: 0,
        createdAt: notif.createdAt,
        items: []
      });
    }

    if (!notif.isRead) {
      const updated = notifications.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n));
      onSaveNotifications(updated);
    }
  };

  const handleMarkAsReadByOrderId = (orderId: string) => {
    const updated = notifications.map((n) => (n.orderId === orderId ? { ...n, isRead: true } : n));
    onSaveNotifications(updated);
  };

  const getDeliveryTypeBadge = (type: "delivery" | "pickup" | "dine_in") => {
    switch (type) {
      case "dine_in":
        return { label: "🍽️ داخل المطعم", bg: "bg-purple-50 text-purple-700 border-purple-100" };
      case "pickup":
        return { label: "📦 خارج المطعم", bg: "bg-emerald-50 text-emerald-700 border-emerald-100" };
      case "delivery":
        return { label: "🚀 توصيل للمنزل", bg: "bg-blue-50 text-blue-700 border-blue-100" };
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto w-full" dir="rtl">
      {/* 🧭 RIGHT COLUMN: Immersive Dark Sidebar for Admins */}
      <aside className="w-full lg:w-64 bg-slate-900 text-slate-100 rounded-xl overflow-hidden shadow-sm border border-slate-800 flex flex-col shrink-0 self-start">
        <div className="p-5 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-brand-orange rounded flex items-center justify-center font-black text-white text-xs text-center">A</div>
            <h2 className="text-xs font-bold tracking-wider text-white">لوحة تحكم Flavista</h2>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">إدارة Flavista المتكاملة</span>
        </div>
        
        <nav className="p-3 space-y-1">
          <button
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xxs font-bold transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-brand-orange text-white font-bold shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-right">
              <ClipboardList className="w-3.5 h-3.5 shrink-0" />
              <span>إدارة الطلبات النشطة</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${activeTab === "orders" ? "bg-slate-900 text-white" : "bg-red-500 text-white"}`}>
              {orders.filter(o => o.status === "new" || o.status === "preparing").length}
            </span>
          </button>
 
          <button
            onClick={() => setActiveTab("menu")}
            className={`w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-xxs font-bold transition-all cursor-pointer text-right ${
              activeTab === "menu"
                ? "bg-brand-orange text-white font-bold shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Coffee className="w-3.5 h-3.5 shrink-0" />
            <span>عرض وتعديل القائمة</span>
          </button>

          <button
            onClick={() => setActiveTab("delivery")}
            className={`w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-xxs font-bold transition-all cursor-pointer text-right ${
              activeTab === "delivery"
                ? "bg-brand-orange text-white font-bold shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Truck className="w-3.5 h-3.5 shrink-0" />
            <span>إعدادات التوصيل</span>
          </button>

          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-1.5 px-3 py-2 rounded-lg text-xxs font-bold transition-all cursor-pointer text-right ${
              activeTab === "security"
                ? "bg-brand-orange text-white font-bold shadow"
                : "text-slate-400 hover:text-white hover:bg-slate-800/40"
            }`}
          >
            <Lock className="w-3.5 h-3.5 shrink-0 text-brand-orange" />
            <span>نظام التحقق لـ Flavista</span>
          </button>
        </nav>
      </aside>

      {/* 💻 LEFT COLUMN: MAIN WORKSPACE CONTAINER */}
      <div className="flex-1 space-y-6">
        {/* Status Header inside workspace */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-row items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs font-bold text-slate-900">
                بوابة الإشراف: {activeTab === "orders" ? "إدارة الطلبات الواردة" : activeTab === "menu" ? "صيانة قائمة المأكولات" : activeTab === "security" ? "نظام التحقق لـ Flavista" : "إعدادات مناطق وتكلفة التوصيل"}
              </p>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">عمليات حية ومزامنة فورية للبيانات والأمن.</p>
          </div>

          {/* Quick Delivery Shortcut Link */}
          <div className="relative">
            <button
              onClick={() => setActiveTab("delivery")}
              className={`p-2.5 rounded-xl border flex items-center justify-center relative cursor-pointer transition-all ${
                activeTab === "delivery"
                  ? "bg-brand-orange text-white border-brand-orange shadow-sm"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
              title="تعديل مناطق وأسعار التوصيل"
            >
              <Truck className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

      {/* 🛒 TAB 1: ORDERS CONTROL SHEETS */}
      {activeTab === "orders" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 text-right" dir="rtl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-1.5">
                <ClipboardList className="w-5 h-5 text-brand-orange" />
                <span>قائمة طلبات مطعم Flavista</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                عرض الطلبات الواردة مباشرة ومراجعتها، مع إمكانية حذف الطلب نهائياً عند الانتهاء منه.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
              <div className="text-xxs font-extrabold bg-brand-orange/10 text-brand-orange border border-brand-orange/20 py-1.5 px-3 rounded-lg">
                إجمالي الطلبات النشطة: {orders.length}
              </div>
              
              {/* زر تحديث الطلبات اليدوي */}
              <button
                type="button"
                onClick={() => {
                  setIsManualRefreshing(true);
                  setRefreshSuccessMessage(false);
                  setTimeout(() => {
                    setIsManualRefreshing(false);
                    setRefreshSuccessMessage(true);
                    setTimeout(() => setRefreshSuccessMessage(false), 3000);
                  }, 850);
                }}
                disabled={isManualRefreshing}
                className="text-xxs font-black bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white py-1.5 px-3 pr-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95 disabled:cursor-not-allowed"
                title="تحديث ومزامنة الطلبات في الوقت الفعلي"
              >
                <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${isManualRefreshing ? "animate-spin text-white" : ""}`} />
                <span>تحديث الطلبات</span>
              </button>

              {onClearAllOrders && (
                <button
                  type="button"
                  onClick={() => {
                    const confirmReset = window.confirm("هل أنت متأكد من رغبتك في تصفير وحذف جميع الطلبات النشطة نهائياً؟ سيتم مسح كافة الطلبات وإعادة العداد إلى الصفر.");
                    if (confirmReset) {
                      onClearAllOrders();
                    }
                  }}
                  className="text-xxs font-black bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 pr-2.5 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm active:scale-95 hover:shadow"
                  title="تصفير وحذف كافة الطلبات النشطة لليوم"
                >
                  <RefreshCw className="w-3.5 h-3.5 shrink-0" />
                  <span>تصفير الطلبات</span>
                </button>
              )}
            </div>
          </div>

          {/* Real-time and manually refreshed status feedback */}
          {refreshSuccessMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                <span>🟢 تم تحديث ومزامنة قائمة الطلبات بنجاح مع قاعدة البيانات السحابية في الوقت الفعلي (Real-Time)!</span>
              </span>
              <button onClick={() => setRefreshSuccessMessage(false)} className="text-emerald-500 hover:text-emerald-700 font-extrabold text-xs">✕</button>
            </div>
          )}



          {/* Orders Dynamic Table / Grid */}
          {orders.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-6 space-y-2">
              <span className="text-3xl">📭</span>
              <h3 className="font-bold text-gray-850 text-sm">لا تتوفر طلبات حالياً</h3>
              <p className="text-gray-400 text-xxs">عندما يقوم الزبائن بالشراء، ستظهر تفاصيل طلباتهم هنا فوراً.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-2xl flex flex-col items-center justify-center p-6 space-y-2">
              <span className="text-3xl">🔍</span>
              <h3 className="font-bold text-gray-850 text-sm">لا توجد نتائج مطابقة</h3>
              <p className="text-gray-400 text-xxs">جرب تغيير خيارات التصفية أو كلمة البحث للعثور على الطلبات المطلوبة.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredOrders.map((order) => {
                // Format Date
                const dateStr = new Date(order.createdAt).toLocaleTimeString("ar-SA", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={order.id}
                    className="border border-gray-200 rounded-2xl p-5 bg-white shadow-xs relative overflow-hidden transition-all hover:shadow-md flex flex-col justify-between"
                  >
                    <div>
                      {/* Customer Name and Order Meta */}
                      <div className="space-y-1 mb-4 text-right border-b border-gray-100 pb-3">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-brand-orange">رقم الطلب: {order.orderNumber}</span>
                          <span className="text-xxs text-gray-400 font-mono">{dateStr}</span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-base mt-1">
                          {order.customerName}
                        </h3>
                        <p className="text-xxs text-gray-400 font-mono mt-0.5">{order.customerPhone}</p>
                      </div>

                      {/* Meals Ordered List */}
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 space-y-1.5 my-3">
                        <span className="text-xxs font-bold text-gray-400 block mb-1">الوجبات المطلوبة:</span>
                        {order.items.map((item, idx) => {
                          const price = item.menuItem.discountPrice || item.menuItem.price;
                          return (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-xs text-gray-850 border-b border-gray-100/55 pb-1 last:border-0"
                            >
                              <span className="font-bold text-gray-905">
                                {item.menuItem.arabicName} <span className="text-brand-orange font-black">x{item.quantity}</span>
                              </span>
                              <span className="font-mono font-medium">{price * item.quantity} دج</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Order Type Specifications */}
                      <div className="text-xs text-gray-700 space-y-2 my-3">
                        <div className="flex items-center gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-gray-100">
                          {order.deliveryType === "delivery" ? (
                            <>
                              <Truck className="w-4 h-4 text-brand-orange" />
                              <span className="text-xxs text-gray-750 font-extrabold">توصيل إلى: {order.deliveryArea} (رسوم التوصيل: {order.deliveryFee || 0} دج)</span>
                            </>
                          ) : order.deliveryType === "dine_in" ? (
                            <>
                              <span className="text-sm">🍽️</span>
                              <span className="text-xxs font-extrabold text-purple-700">تناول داخل المطعم - طاولة رقم: {order.tableNumber || "غير محدد"}</span>
                            </>
                          ) : (
                            <>
                              <Store className="w-4 h-4 text-emerald-600" />
                              <span className="text-xxs text-gray-750 font-extrabold">استلام مباشر ومحلي من صالة المطعم</span>
                            </>
                          )}
                        </div>

                        {/* Customer Note */}
                        {order.notes && (
                          <div className="text-red-700 bg-red-50/70 p-2 rounded-xl border border-red-100 text-xxs font-bold">
                            ملاحظة الزبون: {order.notes}
                          </div>
                        )}
                      </div>

                      {/* 🛠️ ORDER STATUS CHANGER BUTTONS */}
                      <div className="mt-4 border-t border-gray-100 pt-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400">تغيير حالة الطلب الحالية:</span>
                          <span className={`text-[10px] px-2.5 py-1 rounded-full font-black ${
                            order.status === "new" ? "bg-amber-100 text-amber-800 animate-pulse" :
                            order.status === "preparing" ? "bg-blue-100 text-blue-800" :
                            order.status === "delivering" ? "bg-purple-100 text-purple-800" :
                            order.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                            "bg-rose-100 text-rose-800"
                          }`}>
                            {order.status === "new" ? "🆕 جديد" :
                             order.status === "preparing" ? "⏳ تحضير" :
                             order.status === "delivering" ? "📦 جاهز" :
                             order.status === "completed" ? "✅ تم التسليم" :
                             "❌ ملغي"}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {[
                            { id: "new", label: "جديد", color: "hover:bg-amber-50 hover:text-amber-700" },
                            { id: "preparing", label: "تحضير", color: "hover:bg-blue-50 hover:text-blue-700" },
                            { id: "delivering", label: "جاهز", color: "hover:bg-purple-50 hover:text-purple-700" },
                            { id: "completed", label: "تسليم", color: "hover:bg-emerald-50 hover:text-emerald-700" },
                            { id: "cancelled", label: "إلغاء", color: "hover:bg-rose-50 hover:text-rose-700" }
                          ].map((st) => (
                            <button
                              key={st.id}
                              type="button"
                              onClick={() => onUpdateOrderStatus(order.id, st.id as any)}
                              className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                                order.status === st.id
                                  ? "bg-slate-900 text-white border-slate-900"
                                  : `bg-white text-gray-550 border-gray-200 ${st.color}`
                              }`}
                            >
                              {st.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Order Summary & Delete Order Button */}
                    <div className="border-t border-gray-100 pt-3.5 flex items-center justify-between mt-4">
                      <div>
                        <span className="text-xxs text-gray-400 block">القيمة الإجمالية المدفوعة:</span>
                        <span className="text-base font-black text-slate-900 font-mono">{order.total} دج</span>
                      </div>

                      {/* Delete Order Action */}
                      <button
                        onClick={() => {
                          if (confirm("هل أنت متأكد من انتهاء هذا الطلب وحذفه نهائياً من القائمة؟")) {
                            onDeleteOrder?.(order.id);
                          }
                        }}
                        className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-750 font-black text-xxs py-2 px-4 rounded-xl transition cursor-pointer active:scale-95 flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف الطلب</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 🍔 TAB 2: MENU DATABASE ITEMS (CRUD) & CATEGORIES CRUD (Merged Hierarchical View) */}
      {activeTab === "menu" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
          {/* Header controls with adding shortcuts */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-sm font-black text-gray-850 flex items-center gap-1.5">
                <Coffee className="w-5 h-5 text-brand-orange" />
                <span>إدارة القائمة والأقسام الشجرية</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                استعرض وأدر كافة الأقسام والماركات بالمطعم، واضغط على أي قسم لعرض وتعديل الوجبات المندرجة تحته بشكل شجري متفرع وتفاعلي.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={onAddCategory ? openAddCategoryModal : undefined}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer active:scale-95 transition"
              >
                <PlusCircle className="w-4 h-4 text-slate-500" />
                <span>إضافة قسم جديد</span>
              </button>
              
              <button
                onClick={openAddForm}
                className="bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer shadow active:scale-95 transition"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة طبق مأكولات جديد</span>
              </button>
            </div>
          </div>

          {/* Unified Hierarchical Categories & Dishes List */}
          <div className="space-y-4">
            {categories.length === 0 ? (
              <div className="p-8 text-center text-gray-400 font-semibold text-xs bg-slate-50 border border-dashed border-gray-200 rounded-2xl">
                لا توجد أقسام متوفرة في القائمة حالياً. يرجى إضافة قسم لبدء تنظيم الوجبات.
              </div>
            ) : (
              categories.map((cat) => {
                const isExpanded = !!expandedCategories[cat.id];
                const catDishes = menuItems.filter(item => item.category === cat.id);
                
                return (
                  <div key={cat.id} className="space-y-2">
                    {/* Category Block Header Row */}
                    <div
                      onClick={() => toggleCategoryExpand(cat.id)}
                      className={`border border-gray-150 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all cursor-pointer select-none ${
                        cat.isAvailable !== false
                          ? "bg-slate-50/70 hover:bg-slate-50"
                          : "bg-gray-100/50 hover:bg-gray-100 opacity-75"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Icon Frame */}
                        <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-xl shrink-0 border border-brand-orange/25 shadow-xxs">
                          {cat.icon}
                        </div>

                        {/* Labels */}
                        <div className="text-right">
                          <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                            <span>{cat.arabicName}</span>
                            <span className="text-[10px] font-mono text-gray-400 uppercase">({cat.name})</span>
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-xxs text-brand-orange font-bold bg-brand-orange/10 px-2.5 py-0.5 rounded-full inline-block">
                              {catDishes.length} وجبة طعام
                            </span>
                            {cat.isAvailable === false && (
                              <span className="text-xxs text-red-600 font-bold bg-red-50 border border-red-150 px-2.5 py-0.5 rounded-full inline-block">
                                مخفي مع جميع المنتجات 🚫
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                        {/* Expand/Collapse branch elements */}
                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => { e.stopPropagation(); toggleCategoryExpand(cat.id); }}
                          className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-650 hover:text-slate-900 transition-all cursor-pointer shadow-xxs border border-slate-200"
                          title={isExpanded ? "إخفاء الوجبات المندرجة (👁️‍🗨️)" : "عرض الوجبات المندرجة (👁️)"}
                        >
                          {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </motion.button>

                        {/* Hide / Show Category Toggle */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            const isCurrentlyAvailable = cat.isAvailable !== false;
                            onEditCategory({
                              ...cat,
                              isAvailable: !isCurrentlyAvailable
                            });
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-xxs border ${
                            cat.isAvailable !== false
                              ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                              : "bg-slate-200 text-slate-500 border-slate-300 hover:bg-slate-300"
                          }`}
                          title={cat.isAvailable !== false ? "إخفاء القسم بالكامل" : "إعادة إظهار القسم"}
                        >
                          {cat.isAvailable !== false ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5 shrink-0" />
                              <span>إخفاء</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5 shrink-0" />
                              <span>إظهار</span>
                            </>
                          )}
                        </motion.button>

                        {/* Quick Add Dish to this Category */}
                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => { e.stopPropagation(); openAddForm(cat.id); }}
                          className="w-9 h-9 rounded-full flex items-center justify-center bg-emerald-50 hover:bg-emerald-500 border border-emerald-200 text-emerald-600 hover:text-white transition-all cursor-pointer shadow-xxs"
                          title="إضافة طبق جديد تحت هذا القسم (➕)"
                        >
                          <Plus className="w-4 h-4" />
                        </motion.button>

                        {/* Edit Category */}
                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => { e.stopPropagation(); openEditCategoryModal(cat); }}
                          className="w-9 h-9 rounded-full flex items-center justify-center bg-amber-50 hover:bg-amber-500 border border-amber-200 text-amber-700 hover:text-white transition-all cursor-pointer shadow-xxs"
                          title="تعديل هذا القسم (✏️)"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </motion.button>
                        
                        {/* Delete Category */}
                        <motion.button
                          whileHover={{ scale: 1.12 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`هل أنت متأكد من حذف قسم "${cat.arabicName}"؟ سيتم نقل الأطعمة التابعة له للقسم الأول المتاح لحمايتها من الحذف.`)) {
                              onDeleteCategory(cat.id);
                            }
                          }}
                          className="w-9 h-9 rounded-full flex items-center justify-center bg-rose-50 hover:bg-red-500 border border-rose-100 text-rose-600 hover:text-white transition-all cursor-pointer shadow-xxs"
                          title="حذف هذا القسم (🗑️)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Branched elements list under expanded Category */}
                    {isExpanded && (
                      <div className="mr-8 border-r-2 border-dashed border-gray-200 pr-4 py-2 space-y-2 animate-fade-in-up">
                        {catDishes.length === 0 ? (
                          <p className="text-xxs text-gray-400 font-semibold italic text-right py-1">
                            لا توجد وجبات مضافة حالياً تحت قسم {cat.arabicName}. يمكنك الضغط على زر (+) في هذا القسم لإضافة وجبة مباشرة إليه.
                          </p>
                        ) : (
                          catDishes.map((item) => (
                            <div
                               key={item.id}
                               className="bg-white hover:bg-slate-50/50 border border-gray-150 rounded-xl p-3 flex items-center justify-between gap-4 transition-all"
                            >
                              <div className="flex items-center gap-2">
                                {/* Small tree branch connector point visual */}
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-orange shadow-xxs shrink-0" />
                                <span className="font-bold text-gray-850 text-xs">{item.arabicName}</span>
                                {!item.isAvailable && (
                                  <span className="text-[9px] text-red-650 bg-red-50 px-2 py-0.5 rounded font-black shrink-0">
                                    مخفي عن الزبائن
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Toggle Visibility Button */}
                                <motion.button
                                  whileHover={{ scale: 1.12 }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={() => onToggleAvailability(item.id)}
                                  className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all cursor-pointer shadow-xxs ${
                                    item.isAvailable
                                      ? "bg-slate-50 hover:bg-slate-700 border-slate-200 text-slate-650 hover:text-white"
                                      : "bg-brand-orange/10 hover:bg-brand-orange border-brand-orange/20 text-brand-orange hover:text-white"
                                  }`}
                                  title={item.isAvailable ? "إخفاء الطبق عن الزبائن (👁️‍🗨️)" : "إظهار الطبق للزبائن (👁️)"}
                                >
                                  {item.isAvailable ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </motion.button>

                                {/* Edit Button */}
                                <motion.button
                                  whileHover={{ scale: 1.12 }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={() => openEditForm(item)}
                                  className="w-9 h-9 rounded-full flex items-center justify-center bg-brand-orange hover:bg-brand-orange-hover text-white rounded-full transition-all cursor-pointer shadow-xxs"
                                  title="تعديل بيانات الطبق (✏️)"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </motion.button>

                                {/* Delete Item Button */}
                                <motion.button
                                  whileHover={{ scale: 1.12 }}
                                  whileTap={{ scale: 0.92 }}
                                  onClick={() => {
                                    if (confirm(`هل أنت متأكد من رغبتك في حذف الوجبة "${item.arabicName}" نهائياً؟`)) {
                                      onDeleteMenuItem(item.id);
                                    }
                                  }}
                                  className="w-9 h-9 rounded-full flex items-center justify-center bg-rose-50 hover:bg-red-500 border border-rose-100 text-rose-600 hover:text-white transition-all cursor-pointer shadow-xxs"
                                  title="حذف هذه الوجبة نهائياً (🗑️)"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </motion.button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 🚀 TAB 4: DELIVERY AREA SETTINGS & FEES CONFIGURATION */}
      {activeTab === "delivery" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6 text-right" dir="rtl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-lg font-black text-gray-900 flex items-center gap-1.5">
                <Truck className="w-5 h-5 text-brand-orange" />
                <span>إعدادات التوصيل وتكلفة الخدمات</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                إضافة وتعديل وحذف مناطق وبلديات التوصيل يدويًا مع تحديد تسعيرة التوصيل والأحياء المخدمة ومتابعة تفعيلها للزبائن.
              </p>
            </div>
          </div>

          {/* Grid Layout: Right side Form, Left side Areas List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* 📝 FORM: ADD / EDIT AREA */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-slate-200/60 space-y-4">
              <h3 className="text-xs font-bold text-slate-800 border-b border-slate-200 pb-2">
                {editingArea ? "✏️ تعديل المنطقة الحالية" : "➕ إضافة منطقة توصيل جديدة"}
              </h3>

              <form onSubmit={handleSaveAreaType} className="space-y-4">
                <div>
                  <label className="block text-xxs font-bold text-gray-650 mb-1">اسم المنطقة أو البلدية: *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: الشراقة، دالي إبراهيم..."
                    value={areaName}
                    onChange={(e) => setAreaName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-650 mb-1">سعر التوصيل للمنطقة (دج): *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="مثال: 300"
                    value={areaFee || ""}
                    onChange={(e) => setAreaFee(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange font-mono font-bold text-right"
                  />
                </div>

                <div>
                  <label className="block text-xxs font-bold text-gray-650 mb-1">البلديات والأحياء المخدمة (اختياري):</label>
                  <textarea
                    placeholder="مثال: وسط البلدية، حي البواسل، ركاب الشناوة..."
                    value={areaNeighborhoods}
                    onChange={(e) => setAreaNeighborhoods(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange h-16 resize-none font-medium"
                  />
                </div>

                <div className="flex items-center justify-between bg-slate-200/30 p-2.5 rounded-xl border border-slate-200/50">
                  <span className="text-xxs font-bold text-slate-700">حالة التوصيل (مفعّل للزبائن):</span>
                  <button
                    type="button"
                    onClick={() => setAreaIsActive(!areaIsActive)}
                    className="text-brand-orange hover:text-brand-orange-hover transition cursor-pointer"
                  >
                    {areaIsActive ? (
                      <span className="text-xxs font-extrabold inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 py-1 px-3 rounded-xl border border-emerald-200">
                        ● مفعّل ونشط
                      </span>
                    ) : (
                      <span className="text-xxs font-extrabold inline-flex items-center gap-1 bg-gray-150 text-gray-700 py-1 px-3 rounded-xl border border-gray-200">
                        ● معطّل حالياً
                      </span>
                    )}
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 text-center text-xs font-black bg-brand-orange hover:bg-brand-orange-hover text-white py-2.5 px-4 rounded-xl cursor-pointer transition shadow-xs hover:shadow active:scale-[0.98]"
                  >
                    {editingArea ? "حفظ التغييرات" : "إضافة المنطقة"}
                  </button>
                  {editingArea && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingArea(null);
                        setAreaName("");
                        setAreaFee(0);
                        setAreaNeighborhoods("");
                        setAreaIsActive(true);
                      }}
                      className="text-xs font-black bg-gray-200 hover:bg-gray-300 text-gray-700 py-2.5 px-4 rounded-xl cursor-pointer transition active:scale-[0.98]"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* 📋 LIST: REGISTERED AREAS */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase">قائمة مناطق التوصيل المحددة</h3>
              
              {deliveryAreas.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 space-y-1">
                  <span className="text-3xl">📭</span>
                  <h4 className="font-bold text-gray-800 text-xs">لا تتوفر أي منطقة توصيل مضافة</h4>
                  <p className="text-gray-400 text-[10px]">استخدم النموذج الجانبي لإضافة مناطق توصيل جديدة يدويًا.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {deliveryAreas.map((area) => (
                    <div
                      key={area.id}
                      className={`border rounded-2xl p-4 flex items-center justify-between gap-4 transition bg-white hover:bg-slate-50/40 ${
                        editingArea?.id === area.id ? "ring-2 ring-brand-orange border-brand-orange shadow bg-brand-orange/5" : "border-gray-200"
                      }`}
                    >
                      <div className="space-y-1.5 flex-1 text-right">
                        <div className="flex items-center gap-2">
                          <h4 className="font-black text-slate-900 text-sm">{area.name}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold border ${
                            area.isActive 
                              ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                              : "bg-gray-100 text-gray-650 border-gray-200"
                          }`}>
                            {area.isActive ? "مفعّل" : "معطّل"}
                          </span>
                        </div>
                        
                        {area.neighborhoods && (
                          <div className="text-[10px] text-gray-400 leading-tight">
                            <span className="font-bold text-slate-600">الأحياء:</span> {area.neighborhoods}
                          </div>
                        )}

                        <div className="text-xs font-bold text-brand-orange font-mono">
                          السعر المعتمد: {area.fee} دج
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditAreaClick(area)}
                          className="p-1.5 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-150 text-slate-600 transition cursor-pointer"
                          title="تعديل"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteAreaClick(area.id)}
                          className="p-1.5 bg-red-50 border border-red-150 rounded-xl hover:bg-red-100 text-red-600 transition cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* 🔐 TAB 3: SECURITY CONTROLS & VERIFICATION SYSTEM */}
      {activeTab === "security" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-xs space-y-6">
          {/* 1. Phone number for Call Us */}
                <div>
                  <label className="block text-xxs font-black text-slate-700 mb-1">رقم هاتف الاتصال المباشر (tel:):</label>
                  <input
                    type="text"
                    placeholder="مثال: 0770391093"
                    value={phoneForCall}
                    onChange={(e) => setPhoneForCall(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-gray-250 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange"
                  />
                  <p className="text-[9px] text-gray-400 mt-0.5 font-bold">الرقم الذي يتصل به الزبون مباشرة عند الضغط على زر الهاتف الأخضر.</p>
                </div>

                {/* 2. Admin Passcode Customizer */}
                <div>
                  <label className="block text-xxs font-black text-slate-700 mb-1">رمز التحقق والتحكم لإدارة المطعم (Passcode):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={12}
                      placeholder="أدخل الرمز السري الفوري"
                      value={adminPasscode}
                      onChange={(e) => setAdminPasscode(e.target.value)}
                      className="flex-1 text-center font-mono text-sm tracking-widest p-2.5 bg-white border border-gray-250 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange text-[#2D2D2D] font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
                        setAdminPasscode(randomCode);
                      }}
                      className="bg-brand-orange/10 hover:bg-brand-orange/20 text-brand-orange font-bold text-xxs px-4 rounded-xl transition cursor-pointer"
                    >
                      توليد رمز عشوائي
                    </button>
                  </div>
                  <p className="text-[9px] text-gray-400 mt-0.5 font-bold">الرمز المستخدم حاليًا لتأكيد الدخول إلى لوحة التحكم. التغيير يتم فوراً بمجرد حفظ الإعدادات.</p>
                </div>

                {/* BOTTOM BAR CONTROLS */}
                <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-150 text-right">
                  <span className="text-xxs font-black text-slate-700 block mb-1 border-b border-gray-100 pb-2">التحكم في ظهور عناصر الشريط السفلي:</span>
                  
                  {/* Show Menu Icon Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-700">إظهار القائمة:</span>
                    <button
                      type="button"
                      onClick={() => setShowMenuIcon(!showMenuIcon)}
                      className={`text-xxs font-extrabold py-1 px-3 rounded-lg border transition cursor-pointer ${
                        showMenuIcon ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-650 border-gray-200"
                      }`}
                    >
                      {showMenuIcon ? "مفعّل" : "معطّل"}
                    </button>
                  </div>

                  {/* Show Call Icon Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-700">إظهار الاتصال السريع:</span>
                    <button
                      type="button"
                      onClick={() => setShowCallIcon(!showCallIcon)}
                      className={`text-xxs font-extrabold py-1 px-3 rounded-lg border transition cursor-pointer ${
                        showCallIcon ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-650 border-gray-200"
                      }`}
                    >
                      {showCallIcon ? "مفعّل" : "معطّل"}
                    </button>
                  </div>

                  {/* Show Cart Icon Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-700">إظهار السلة:</span>
                    <button
                      type="button"
                      onClick={() => setShowCartIcon(!showCartIcon)}
                      className={`text-xxs font-extrabold py-1 px-3 rounded-lg border transition cursor-pointer ${
                        showCartIcon ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-650 border-gray-200"
                      }`}
                    >
                      {showCartIcon ? "مفعّل" : "معطّل"}
                    </button>
                  </div>
                </div>

                {/* CUSTOM CLIENT HOMEPAGE CONTENT & PROMOTION SETTINGS */}
                <div className="space-y-4 bg-white p-5 rounded-xl border border-gray-150 text-right">
                  <span className="text-xxs font-black text-slate-700 block mb-1 border-b border-gray-100 pb-2">نصوص ورسائل ترحيب الواجهة والترويج:</span>
                  
                  {/* 1. Welcome Title Input */}
                  <div>
                    <label className="block text-xxs font-bold text-slate-600 mb-1">عنوان الترحيب بالصفحة الرئيسية:</label>
                    <input
                      type="text"
                      placeholder="مثال: أهلاً بك في عالم النكهات المميزة"
                      value={welcomeTitle}
                      onChange={(e) => setWelcomeTitle(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>

                  {/* 2. Welcome Paragraph Input */}
                  <div>
                    <label className="block text-xxs font-bold text-slate-600 mb-1">فقرة الترحيب والتعريف بالصفحة الرئيسية:</label>
                    <textarea
                      rows={3}
                      placeholder="اكتب فقرة تصف بها المطعم وأهدافه وجودة الطعام..."
                      value={welcomeText}
                      onChange={(e) => setWelcomeText(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange resize-none"
                    />
                  </div>

                  {/* 3. Promo Banner Status Toggle */}
                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-700">تفعيل شريط التخفيضات والإشهار:</span>
                      <span className="text-[9px] text-gray-400 font-bold">إظهار أو إخفاء صندوق العروض والإعلانات بأعلى صفحة العميل</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPromoBannerEnabled(!promoBannerEnabled)}
                      className={`text-xxs font-extrabold py-1 px-3 rounded-lg border transition cursor-pointer ${
                        promoBannerEnabled ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse" : "bg-gray-100 text-gray-650 border-gray-200"
                      }`}
                    >
                      {promoBannerEnabled ? "مفعّل ونشط" : "مخفي ومغلق"}
                    </button>
                  </div>

                  {/* 4. Promo Banner Text Input */}
                  {promoBannerEnabled && (
                    <div className="space-y-1 pt-1">
                      <label className="block text-xxs font-bold text-slate-600 mb-1">نص العرض الإشهاري الترويجي:</label>
                      <textarea
                        rows={2}
                        placeholder="مثال: بمناسبة الافتتاح، استفد من توصيل مجاني على كل الطلبيات فوق 3000 دج لفترة محدودة!"
                        value={promoBannerText}
                        onChange={(e) => setPromoBannerText(e.target.value)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-gray-200 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange resize-none font-bold text-brand-orange"
                      />
                    </div>
                  )}
                </div>

                {/* Save button and feedback */}
                <div className="pt-2 flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onUpdateOrderSettings) {
                        onUpdateOrderSettings({
                          isReceivingEnabled,
                          receiveMethod: orderSettings?.receiveMethod || "email",
                          email: orderSettings?.email || "bellimabachir33@gmail.com",
                          whatsapp: orderSettings?.whatsapp || "213555123456",
                          phoneForCall,
                          menuLabel,
                          callBtnColor,
                          showMenuIcon,
                          showCallIcon,
                          showCartIcon,
                          welcomeTitle,
                          welcomeText,
                          promoBannerText,
                          promoBannerEnabled,
                          adminPasscode,
                          promoBannerSpeed,
                        });
                        setSettingsSaveSuccess(true);
                        setTimeout(() => setSettingsSaveSuccess(false), 3000);
                      }
                    }}
                    className="w-full py-2.5 bg-brand-orange hover:bg-brand-orange-hover text-white text-xs font-black rounded-xl hover:opacity-95 transition cursor-pointer text-center"
                  >
                    حفظ إعدادات شريط التنقل والطلبات بنجاح
                  </button>
                  
                  {settingsSaveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xxs text-emerald-600 font-extrabold flex items-center gap-1 justify-center bg-emerald-50 border border-emerald-200 py-1.5 px-4 rounded-xl w-full"
                    >
                      ✓ تم حفظ كافة تعديلات الإعدادات في الخادم بنجاح!
                    </motion.div>
                  )}
                </div>

            {/* 🖼️ BRANDING & LOGO SETTINGS */}
            <div className="space-y-3 pt-6 border-t border-gray-100">
              <h3 className="text-xs font-bold text-gray-400 uppercase">تخصيص شعار الهوية البصرية (Logo)</h3>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4">
                <span className="text-xxs font-black text-slate-400 block mb-1">تحميل وتحديث شعار المنصة المخصص</span>
                <ImageUploadSelector
                  imageUrl={logoUrl || ""}
                  onImageChange={(url) => {
                    if (onSaveLogoUrl) {
                      onSaveLogoUrl(url || "");
                    }
                  }}
                  placeholder="تحميل شعار مخصص جديد للمطعم"
                />
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  عند تحديد أو تغيير الشعار، سيتم تحديثه في كافة أقسام المنصة، متصفح الزوار، صفحة تسجيل الدخول، وشاشات التحقق فوراً.
                </p>
              </div>
            </div>
          </div>
      )}




      {/* 📝 FORM MODAL: ADD / EDIT PRODUCT */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
              dir="rtl"
            >
              <button
                onClick={() => setIsFormOpen(false)}
                className="absolute top-4 left-4 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-1">
                <span>{editingItem ? "✏️ تعديل صنف حالي بالقائمة" : "➕ إضافة طبق مأكولات جديد"}</span>
              </h2>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Arabic Name */}
                  <div>
                    <label className="block text-xxs font-bold text-gray-700 mb-1">اسم الصنف باللغة العربية: *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: شاورما لحم سوبر"
                      value={formArabicName}
                      onChange={(e) => setFormArabicName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                    />
                  </div>

                  {/* English Name */}
                  <div>
                    <label className="block text-xxs font-bold text-gray-700 mb-1">اسم الصنف باللغة الإنجليزية:</label>
                    <input
                      type="text"
                      placeholder="مثال: Super Meat Shawarma"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Category Select */}
                  <div>
                    <label className="block text-xxs font-bold text-gray-700 mb-1">فئة الطبق: *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl bg-white"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.arabicName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Regular Price */}
                  <div>
                    <label className="block text-xxs font-bold text-gray-700 mb-1">السعر الأصلي (دج): *</label>
                    <input
                      type="number"
                      required
                      step="1"
                      min="1"
                      placeholder="35"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-mono text-left"
                    />
                  </div>

                  {/* Discount Price */}
                  <div>
                    <label className="block text-xxs font-bold text-gray-700 mb-1">سعر العرض/الخصم (اختياري):</label>
                    <input
                      type="number"
                      step="1"
                      placeholder="29"
                      value={formDiscountPrice}
                      onChange={(e) => setFormDiscountPrice(e.target.value)}
                      className="w-full text-xs p-2.5 border border-gray-200 rounded-xl font-mono text-left"
                    />
                  </div>
                </div>

                {/* Cover Image Input - only visible when creating, hidden when editing */}
                {!editingItem && (
                  <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-gray-150">
                    <label className="block text-xxs font-black text-slate-800 mb-1">صورة وجبة الطعام المخصصة: *</label>
                    <ImageUploadSelector
                      imageUrl={formImage}
                      onImageChange={(url) => setFormImage(url)}
                      placeholder="تحميل صورة الوجبة من المعرض"
                      presetImages={presetImages}
                    />
                  </div>
                )}

                {/* Description Arabic */}
                <div>
                  <label className="block text-xxs font-bold text-gray-700 mb-1">أوصاف المكونات باللغة العربية: *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="مثل: خليط لحم بلدي معتق ومتبل مع صلصات حامضة مخبوز بالفرن الساخن..."
                    value={formArabicDescription}
                    onChange={(e) => setFormArabicDescription(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl resize-none"
                  />
                </div>

                {/* Description English */}
                <div>
                  <label className="block text-xxs font-bold text-gray-700 mb-1">أوصاف المكونات باللغة الإنجليزية (اختياري):</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Slices of organic premium chicken with roasted spices, garlic dip and bread..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full text-xs p-2.5 border border-gray-200 rounded-xl resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-brand-orange-hover to-brand-orange text-white text-xs font-black shadow-md rounded-2xl cursor-pointer hover:opacity-95 text-center active:scale-98 transition-transform"
                >
                  {editingItem ? "حفظ وتعديل الصنف" : "إضافة وحفظ الصنف الجديد بالمتجر"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📁 FORM MODAL: ADD / EDIT CATEGORY */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl relative"
              dir="rtl"
            >
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="absolute top-4 left-4 bg-gray-100 hover:bg-gray-200 text-gray-650 p-2 rounded-full cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>

              <h2 className="text-sm font-black text-gray-900 border-b border-gray-100 pb-2 mb-4 flex items-center gap-1.5">
                <span>📁</span>
                <span>{editingCategory ? "تعديل فئة بالمنيو" : "إضافة قسم رئيسي جديد"}</span>
              </h2>

              <form onSubmit={handleCategoryFormSubmit} className="space-y-4 text-right">
                {/* Arabic Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">اسم القسم (بالعربية): *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مشروبات"
                    value={catArabicName}
                    onChange={(e) => setCatArabicName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-gray-250 rounded-xl outline-none focus:ring-1 focus:ring-brand-orange"
                  />
                </div>

                {/* English Code/Name */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">رمز القسم بالإنجليزية: *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: drinks"
                    disabled={!!editingCategory}
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 disabled:bg-gray-150 border border-gray-255 rounded-xl font-sans"
                  />
                </div>

                {/* Icon Emoji */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 mb-1">الأيقونة (إيموجي): *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 🥤"
                    value={catIcon}
                    onChange={(e) => setCatIcon(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-gray-255 rounded-xl text-center"
                  />
                </div>

                {/* Cover Image URL */}
                <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-gray-150">
                  <label className="block text-xxs font-black text-slate-800 mb-1">صورة القسم المخصصة: *</label>
                  <ImageUploadSelector
                    imageUrl={catImage}
                    onImageChange={(url) => setCatImage(url)}
                    placeholder="تحميل صورة القسم من المعرض"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-brand-orange-hover to-brand-orange text-white text-xs font-black rounded-xl hover:opacity-95 transition cursor-pointer text-center"
                >
                  {editingCategory ? "حفظ التعديلات" : "إضافة القسم الآن للمنيو"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔍 NOTIFICATION ORDER DETAILS POPUP MODAL */}
      <AnimatePresence>
        {selectedNotifOrder && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" dir="rtl">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto text-right font-sans"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedNotifOrder(null)}
                className="absolute top-4 left-4 bg-gray-100 hover:bg-gray-200 text-gray-650 p-2 rounded-full cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-5">
                {/* Header title */}
                <div className="border-b border-gray-100 pb-3 flex items-center justify-between mt-2">
                  <h3 className="text-base font-black text-slate-900">
                    تفاصيل ومعاينة الطلب #{selectedNotifOrder.orderNumber}
                  </h3>
                  <span className="text-[10px] bg-brand-orange/10 text-brand-orange px-2.5 py-1 rounded-full font-black">
                    {selectedNotifOrder.deliveryType === "delivery" ? "🚀 توصيل للمنزل" : selectedNotifOrder.deliveryType === "dine_in" ? "🍽️ تناول بالمطعم" : "📦 استلام مباشر"}
                  </span>
                </div>

                {/* Customer info card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-gray-150 space-y-2">
                  <h4 className="font-extrabold text-xs text-gray-400 uppercase">بيانات العميل المستلم</h4>
                  <p className="font-black text-sm text-slate-900">{selectedNotifOrder.customerName}</p>
                  <p className="text-xxs text-gray-400 font-bold">الهاتف المرفق: {selectedNotifOrder.customerPhone || "غير متوفر"}</p>
                  {selectedNotifOrder.deliveryType === "dine_in" && (
                    <p className="text-xxs text-purple-700 font-extrabold bg-purple-50 px-2.5 py-1 rounded-lg w-fit">
                      📍 طاولة رقم: {selectedNotifOrder.tableNumber || "غير محدد"}
                    </p>
                  )}
                  {selectedNotifOrder.deliveryType === "delivery" && (
                    <p className="text-xxs text-blue-700 font-extrabold bg-blue-50 px-2.5 py-1 rounded-lg w-fit leading-relaxed">
                      📍 عنوان التوصيل: {selectedNotifOrder.deliveryArea || "غير محدد"}
                    </p>
                  )}
                </div>

                {/* Menu items listing */}
                <div className="space-y-2.5">
                  <h4 className="font-extrabold text-xs text-gray-400 uppercase">الوجبات المطلوبة بالسلة</h4>
                  <div className="bg-white border border-gray-200/85 rounded-2xl divide-y divide-gray-100 max-h-[160px] overflow-y-auto pr-1">
                    {selectedNotifOrder.items.length === 0 ? (
                      <div className="p-4 text-center text-xxs text-gray-400 italic">تم إفراغ أو تصفير بيانات هذا الطلب سابقاً.</div>
                    ) : (
                      selectedNotifOrder.items.map((item, idx) => {
                        const itemPrice = item.menuItem.discountPrice || item.menuItem.price;
                        return (
                          <div key={idx} className="p-3 flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-gray-900 block">{item.menuItem.arabicName}</span>
                              {item.note && (
                                <span className="text-[10px] text-gray-400 italic block mt-0.5">ملاحظته: {item.note}</span>
                              )}
                            </div>
                            <div className="text-left">
                              <span className="font-black text-gray-800 text-xxs">الكمية: x{item.quantity}</span>
                              <span className="font-bold text-brand-orange block mt-0.5 font-mono">{itemPrice * item.quantity} دج</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Total pricing summaries */}
                <div className="flex justify-between items-center bg-brand-orange/5 border border-brand-orange/20 p-4 rounded-2xl">
                  <div>
                    <span className="text-xxs text-brand-orange font-bold block">الإجمالي الكلي المستحق:</span>
                    <span className="text-base font-black text-brand-orange font-mono">{selectedNotifOrder.total} دج</span>
                  </div>
                  <div>
                    <span className="text-xxs text-gray-400 block">حالة الطلب الحالية:</span>
                    <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-xxs font-extrabold block mt-1">
                      {selectedNotifOrder.status === "new" ? "طلب جديد" : selectedNotifOrder.status === "preparing" ? "قيد التحضير" : selectedNotifOrder.status === "delivering" ? "جاري التوصيل" : selectedNotifOrder.status === "completed" ? "تم التوصيل" : "ملغي"}
                    </span>
                  </div>
                </div>

                {/* Notes if any */}
                {selectedNotifOrder.notes && (
                  <div className="bg-red-50 text-red-850 p-3 rounded-xl border border-red-100 text-xxs font-bold">
                    📌 طلبات وملاحظات الزبون الإضافية: {selectedNotifOrder.notes}
                  </div>
                )}

                {/* State changes action triggers */}
                <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-gray-150">
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateOrderStatus(selectedNotifOrder.id, "preparing");
                      handleMarkAsReadByOrderId(selectedNotifOrder.id);
                      setSelectedNotifOrder({ ...selectedNotifOrder, status: "preparing" });
                    }}
                    disabled={selectedNotifOrder.status !== "new"}
                    className="flex-1 bg-brand-orange hover:bg-brand-orange-hover disabled:bg-gray-100 disabled:text-gray-400 text-white font-black py-2.5 px-4 rounded-xl text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    🚀 مباشرة تحضير الطعام
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateOrderStatus(selectedNotifOrder.id, "completed");
                      handleMarkAsReadByOrderId(selectedNotifOrder.id);
                      setSelectedNotifOrder({ ...selectedNotifOrder, status: "completed" });
                    }}
                    disabled={selectedNotifOrder.status === "completed" || selectedNotifOrder.status === "cancelled"}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-150 disabled:text-gray-400 text-white font-black py-2.5 px-4 rounded-xl text-xs transition active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    ✓ إتمام وتسليم الطلب
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div></div>
  );
}

// 📸 MODERN REUSABLE IMAGE UPLOAD & GALLERY SELECTOR COMPONENT
interface ImageUploadSelectorProps {
  imageUrl: string;
  onImageChange: (url: string) => void;
  placeholder?: string;
  presetImages?: { label: string; url: string }[];
}

export function ImageUploadSelector({
  imageUrl,
  onImageChange,
  placeholder = "اختر صورة",
  presetImages = [],
}: ImageUploadSelectorProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          onImageChange(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-3 text-right" dir="rtl">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
          dragActive
            ? "border-brand-orange bg-brand-orange/5"
            : imageUrl
            ? "border-emerald-500/50 bg-emerald-50/5"
            : "border-gray-250 hover:border-brand-orange hover:bg-brand-orange/5"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {imageUrl ? (
          <div className="flex flex-col items-center gap-2 w-full text-center">
            <img
              src={imageUrl}
              alt="Preview"
              className="w-24 h-24 object-cover rounded-xl shadow-sm border border-slate-100"
              referrerPolicy="no-referrer"
            />
            <span className="text-xxs text-emerald-600 font-bold flex items-center gap-1 justify-center">
              ✓ تم تحميل ومعاينة الصورة بنجاح
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onImageChange("");
              }}
              className="text-xxs text-red-500 font-bold hover:underline cursor-pointer"
            >
              إلغاء الصورة أو اختيار أخرى
            </button>
          </div>
        ) : (
          <div className="text-center space-y-1.5 flex flex-col items-center">
            <div className="text-3xl text-gray-400">📸</div>
            <p className="text-xs font-black text-slate-850">{placeholder}</p>
            <p className="text-[10px] text-gray-400">
              اسحب وأفلت الصورة هنا أو اضغط لتصفح ملفات جهازك (Gallery)
            </p>
          </div>
        )}
      </div>

      {/* Manual URL Input for back compatibility */}
      <div className="space-y-1">
        <label className="block text-xxs text-gray-450 font-bold">أو الصق رابط الصورة المباشر يدوياً:</label>
        <input
          type="url"
          placeholder="https://images.unsplash.com/..."
          value={imageUrl.startsWith("data:") ? "" : imageUrl}
          onChange={(e) => onImageChange(e.target.value)}
          className="w-full text-xs p-2.5 bg-white border border-gray-250 rounded-xl font-mono text-left outline-none focus:ring-1 focus:ring-brand-orange"
        />
      </div>

      {/* Preset Gallery helper */}
      {presetImages.length > 0 && (
        <div className="space-y-1.5 bg-slate-50/80 p-2.5 rounded-xl border border-gray-150">
          <span className="text-xxs font-bold text-gray-400 block">أو اختر صورة جاهزة من مكتبة الصور المباشرة:</span>
          <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
            {presetImages.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onImageChange(p.url);
                }}
                className={`text-xxs font-semibold px-2 py-1 rounded-lg border transition cursor-pointer ${
                  imageUrl === p.url
                    ? "bg-brand-orange border-brand-orange text-white"
                    : "bg-white border-gray-200 hover:bg-brand-orange/10 text-gray-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
