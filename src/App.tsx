/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from "react";
import {
  Utensils,
  ShoppingBag,
  User,
  Shield,
  Heart,
  Smartphone,
  Facebook,
  Instagram,
  Twitter,
  Globe2,
  Calendar,
  Sparkles,
  PhoneCall,
  Menu as Hamburger,
  LogOut,
  MapPin,
  Clock,
  CheckCircle,
  X,
  Bell
} from "lucide-react";

// Components
import { motion, AnimatePresence } from "motion/react";
import CustomerMenu from "./components/CustomerMenu";
import AboutPage from "./components/AboutPage";
import CartDrawer from "./components/CartDrawer";
import AdminDashboard from "./components/AdminDashboard";
import NotificationToast from "./components/NotificationToast";
import WelcomeScreen from "./components/WelcomeScreen";
import AdminPasscodeScreen from "./components/AdminPasscodeScreen";
import FlavistaLogo from "./components/FlavistaLogo";
import BottomTabBar from "./components/BottomTabBar";
import { dispatchOrderNotifications, triggerGmailRedirect } from "./utils/orderNotification";

// Data & Types
import { INITIAL_MENU, INITIAL_CATEGORIES, INITIAL_ORDERS, INITIAL_DELIVERY_AREAS } from "./data";
import { MenuItem, CartItem, Order, ToastNotification, OrderStatus, Review, Category, AppNotification, DeliveryArea } from "./types";

// Firebase Integration
import {
  db,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  cleanUndefined,
  handleFirestoreError,
  OperationType
} from "./firebase";

// Local Storage Persistence State


export default function App() {
  // Dynamic logo url state
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    return localStorage.getItem("flavista_custom_logo") || "/src/assets/images/flavista_logo.jpg";
  });

  const handleSaveLogoUrl = (url: string) => {
    setLogoUrl(url);
    if (url) {
      localStorage.setItem("flavista_custom_logo", url);
    } else {
      localStorage.removeItem("flavista_custom_logo");
    }
  };

  // Administrative authorization state (temporary in active session)
  const [isAdminAuthed, setIsAdminAuthed] = useState<boolean>(() => {
    return sessionStorage.getItem("flavista_adm_authed") === "true";
  });

  // Secret admin logo-click states
  const [logoClicks, setLogoClicks] = useState<number>(0);
  const [logoLastClick, setLogoLastClick] = useState<number>(0);
  const [showSecretModal, setShowSecretModal] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>("");
  const [passcodeError, setPasscodeError] = useState<string>("");

  const handleLogoClick = () => {
    const now = Date.now();
    if (now - logoLastClick < 2000) {
      const nextClicks = logoClicks + 1;
      setLogoClicks(nextClicks);
      if (nextClicks >= 5) {
        setShowSecretModal(true);
        setLogoClicks(0);
      }
    } else {
      setLogoClicks(1);
    }
    setLogoLastClick(now);

    if (view === "admin") {
      setView("customer");
    }
  };

  // --- STATE PERSISTENCE WITH LOCALSTORAGE ---
  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem("lazeez_categories");
      let list = saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
      if (Array.isArray(list)) {
        // Enforce new category images for updated categories
        list = list.map((cat: Category) => {
          const matchingInit = INITIAL_CATEGORIES.find(c => c.id === cat.id);
          if (matchingInit && ["malfouf", "tacos", "drinks", "crepes", "sweet"].includes(cat.id)) {
            return { ...cat, image: matchingInit.image };
          }
          return cat;
        });

        const hasDrinks = list.some((c: Category) => c && c.id === "drinks");
        const hasSweet = list.some((c: Category) => c && c.id === "sweet");
        const hasJuices = list.some((c: Category) => c && c.id === "natural_juices");
        const hasCrepes = list.some((c: Category) => c && c.id === "crepes");
        if (!hasDrinks || !hasSweet || !hasJuices || !hasCrepes) {
          const merged = [...list].filter(Boolean);
          if (!hasDrinks) {
            const item = INITIAL_CATEGORIES.find(c => c.id === "drinks");
            if (item) merged.push(item);
          }
          if (!hasSweet) {
            const item = INITIAL_CATEGORIES.find(c => c.id === "sweet");
            if (item) merged.push(item);
          }
          if (!hasJuices) {
            const item = INITIAL_CATEGORIES.find(c => c.id === "natural_juices");
            if (item) merged.push(item);
          }
          if (!hasCrepes) {
            const item = INITIAL_CATEGORIES.find(c => c.id === "crepes");
            if (item) merged.push(item);
          }
          localStorage.setItem("lazeez_categories", JSON.stringify(merged));
          return merged;
        }
        localStorage.setItem("lazeez_categories", JSON.stringify(list));
        return list.filter(Boolean);
      }
    } catch (e) {
      console.error("Error parsing categories, resorting to initial definitions:", e);
    }
    return INITIAL_CATEGORIES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem("lazeez_menu");
      const list = saved ? JSON.parse(saved) : INITIAL_MENU;
      if (Array.isArray(list)) {
        const newIds = [
          "dr-slim-33", "dr-slim-1l", "dr-selecto-33", "dr-selecto-1l", 
          "dr-farha-33", "dr-farha-1l", "dr-jofree-33", "dr-jofree-1l", 
          "dr-water-33", "dr-water-1l", "nj-fruit-juice", 
          "cr-choco", "cr-banana", "cr-strawberry", "cr-mix"
        ];
        const anyMissing = newIds.some(id => !list.some((m: MenuItem) => m && m.id === id));
        
        if (anyMissing) {
          const merged = [...list].filter(Boolean);
          newIds.forEach(id => {
            if (!merged.some((m: MenuItem) => m && m.id === id)) {
              const item = INITIAL_MENU.find(m => m.id === id);
              if (item) merged.push(item);
            }
          });
          localStorage.setItem("lazeez_menu", JSON.stringify(merged));
          return merged;
        }
        return list.filter(Boolean);
      }
    } catch (e) {
      console.error("Error parsing menu items, resorting to initial definitions:", e);
    }
    return INITIAL_MENU;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem("lazeez_orders");
      const list = saved ? JSON.parse(saved) : INITIAL_ORDERS;
      if (Array.isArray(list)) {
        return list.filter(Boolean);
      }
    } catch (e) {
      console.error("Error parsing orders:", e);
    }
    return INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("lazeez_cart");
      const parsed = saved ? JSON.parse(saved) : [];
      if (Array.isArray(parsed)) {
        return parsed.filter(Boolean);
      }
    } catch (e) {
      console.error("Error parsing cart:", e);
    }
    return [];
  });

  const filteredCart = useMemo(() => {
    return cart.filter((cartItem) => {
      const dbItem = menuItems.find((m) => m.id === cartItem.menuItem.id);
      if (!dbItem || !dbItem.isAvailable) return false;
      const isCatAvailable = categories.find(c => c.id === dbItem.category)?.isAvailable !== false;
      return isCatAvailable;
    });
  }, [cart, menuItems, categories]);

  // Views switcher: "customer" | "admin"
  const [view, setView] = useState<"customer" | "admin">("customer");

  // Order Receiving Settings state
  const [orderSettings, setOrderSettings] = useState<{
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
  }>({
    isReceivingEnabled: true,
    receiveMethod: "email",
    email: "bellimabachir33@gmail.com",
    whatsapp: "213555123456",
    phoneForCall: "213555123456",
    menuLabel: "القائمة",
    callBtnColor: "#10B981",
    showMenuIcon: true,
    showCallIcon: true,
    showCartIcon: true,
    welcomeTitle: "🍽️ أهلاً بك في عالم النكهات المميزة",
    welcomeText: "استمتع بتجربة طلب طعام سريعة وسهلة مع قائمة متنوعة من أشهى الوجبات، المحضّرة بعناية من مكونات طازجة وجودة عالية. هدفنا هو تقديم طعام لذيذ وخدمة مميزة تصل إليك بأفضل صورة وفي أسرع وقت",
    promoBannerText: "",
    promoBannerEnabled: false,
    adminPasscode: "19992026",
    promoBannerSpeed: 15,
  });

  // Welcome page status switcher: true means welcome is visible, false means main menu is loaded
  const [showWelcome, setShowWelcome] = useState(true);

  // UI state managers
  const [activeNavTab, setActiveNavTab] = useState<"menu" | "orders" | "about">("menu");

  // Scroll to top on navigation/page transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view, activeNavTab, showWelcome]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Customer-placed order tracking states
  const [myPlacedOrderIds, setMyPlacedOrderIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("flavista_my_placed_order_ids");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [isCustomerNotifDropdownOpen, setIsCustomerNotifDropdownOpen] = useState(false);

  // Mobile menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Order success popup modal status
  const [orderSuccessPopup, setOrderSuccessPopup] = useState<{
    isOpen: boolean;
    message: string;
    deliveryType: "delivery" | "pickup" | "dine_in";
    order?: Order;
  } | null>(null);

  // Notifications State for Restaurant Admins
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem("lazeez_notifications");
      const list = saved ? JSON.parse(saved) : [];
      if (Array.isArray(list)) {
        return list.filter(Boolean);
      }
    } catch (e) {
      console.error("Error parsing notifications:", e);
    }
    return [];
  });

  // Delivery Areas State for Customers and Admins
  const [deliveryAreas, setDeliveryAreas] = useState<DeliveryArea[]>(() => {
    try {
      const saved = localStorage.getItem("lazeez_delivery_areas");
      const list = saved ? JSON.parse(saved) : INITIAL_DELIVERY_AREAS;
      if (Array.isArray(list)) {
        return list.filter(Boolean);
      }
    } catch (e) {
      console.error("Error parsing delivery areas:", e);
    }
    return INITIAL_DELIVERY_AREAS;
  });

  // Automatically filter out hidden items from the cart to fulfill:
  // "عند إخفاء أي طبق أو منتج من القائمة يجب أن يتم إخفاؤه تلقائيًا من جميع أماكن المنصة، بما في ذلك ... السلة"
  useEffect(() => {
    const validCart = cart.filter((cartItem) => {
      const dbItem = menuItems.find((m) => m.id === cartItem.menuItem.id);
      if (!dbItem || !dbItem.isAvailable) return false;
      const isCatAvailable = categories.find(c => c.id === dbItem.category)?.isAvailable !== false;
      return isCatAvailable;
    });
    if (validCart.length !== cart.length) {
      saveCart(validCart);
    }
  }, [menuItems, categories, cart]);

  // Track status changes of customer-placed orders in real-time
  const myOrders = useMemo(() => {
    return orders.filter((o) => myPlacedOrderIds.includes(o.id));
  }, [orders, myPlacedOrderIds]);

  const prevStatusesRef = React.useRef<Record<string, string>>({});

  useEffect(() => {
    myOrders.forEach((o) => {
      const prevStatus = prevStatusesRef.current[o.id];
      if (prevStatus && prevStatus !== o.status) {
        let statusLabel = "";
        switch (o.status) {
          case "preparing":
            statusLabel = "قيد التحضير الآن 👨‍🍳";
            break;
          case "delivering":
            statusLabel = "جاري التوصيل الآن إلى عنوانكم 🚀";
            break;
          case "completed":
            statusLabel = "تم التوصيل والتسليم بنجاح! بالصحة والعافية ♥️";
            break;
          case "cancelled":
            statusLabel = "تم إلغاؤه من قبل الإدارة ❌";
            break;
          default:
            statusLabel = "طلب جديد 🆕";
            break;
        }

        setToasts((prev) => [
          ...prev,
          {
            id: `toast-status-${Date.now()}-${o.id}`,
            message: `تحديث طلبك #${o.orderNumber}: أصبح ${statusLabel}`,
            dishName: "",
            dishImage: "",
            price: 0,
            type: "info",
          },
        ]);
      }
      prevStatusesRef.current[o.id] = o.status;
    });
  }, [myOrders]);

  // --- REAL-TIME FIREBASE SYNC LISTENERS & INITIAL SEEDING ---
  useEffect(() => {
    // Seed initial orders if the app hasn't been seeded yet
    const seedCheck = localStorage.getItem("flavista_seeded_v1");
    if (!seedCheck) {
      INITIAL_ORDERS.forEach(async (ord) => {
        try {
          await setDoc(doc(db, "orders", ord.id), cleanUndefined({
            ...ord,
            restaurantId: "flavista"
          }));
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `orders/${ord.id}`);
        }
      });
      localStorage.setItem("flavista_seeded_v1", "true");
    }

    // Seeding Categories if not seeded yet
    const seedCategoriesCheck = localStorage.getItem("flavista_categories_seeded_v1");
    if (!seedCategoriesCheck) {
      INITIAL_CATEGORIES.forEach(async (cat) => {
        try {
          await setDoc(doc(db, "categories", cat.id), cleanUndefined({
            ...cat,
            restaurantId: "flavista"
          }));
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `categories/${cat.id}`);
        }
      });
      localStorage.setItem("flavista_categories_seeded_v1", "true");
    }

    // Seeding Menu Items if not seeded yet
    const seedMenuCheck = localStorage.getItem("flavista_menu_seeded_v1");
    if (!seedMenuCheck) {
      INITIAL_MENU.forEach(async (item) => {
        try {
          await setDoc(doc(db, "menu_items", item.id), cleanUndefined({
            ...item,
            restaurantId: "flavista"
          }));
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `menu_items/${item.id}`);
        }
      });
      localStorage.setItem("flavista_menu_seeded_v1", "true");
    }

    // 1. Listen to Real-Time Orders
    const ordersQuery = query(
      collection(db, "orders"),
      where("restaurantId", "==", "flavista")
    );
    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      const dbOrders: Order[] = [];
      snapshot.forEach((docSnapshot) => {
        dbOrders.push({ id: docSnapshot.id, ...docSnapshot.data() } as Order);
      });
      // Sort newest to oldest
      dbOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setOrders(dbOrders);
      localStorage.setItem("flavista_orders", JSON.stringify(dbOrders));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "orders");
    });

    // 2. Listen to Real-Time Admin Notifications
    const notifsQuery = query(
      collection(db, "notifications"),
      where("restaurantId", "==", "flavista")
    );
    const unsubscribeNotifs = onSnapshot(notifsQuery, (snapshot) => {
      const dbNotifs: AppNotification[] = [];
      snapshot.forEach((docSnapshot) => {
        dbNotifs.push({ id: docSnapshot.id, ...docSnapshot.data() } as AppNotification);
      });
      // Sort newest to oldest
      dbNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setNotifications(dbNotifs);
      localStorage.setItem("flavista_notifications", JSON.stringify(dbNotifs));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "notifications");
    });

    // Seeding Delivery Areas if not seeded yet
    const seedAreasCheck = localStorage.getItem("flavista_areas_seeded_v1");
    if (!seedAreasCheck) {
      INITIAL_DELIVERY_AREAS.forEach(async (area) => {
        try {
          await setDoc(doc(db, "delivery_areas", area.id), cleanUndefined({
            ...area,
            restaurantId: "flavista"
          }));
        } catch (e) {
          handleFirestoreError(e, OperationType.WRITE, `delivery_areas/${area.id}`);
        }
      });
      localStorage.setItem("flavista_areas_seeded_v1", "true");
    }

    // 3. Listen to Real-Time Delivery Areas
    const areasQuery = query(
      collection(db, "delivery_areas"),
      where("restaurantId", "==", "flavista")
    );
    const unsubscribeAreas = onSnapshot(areasQuery, (snapshot) => {
      const dbAreas: DeliveryArea[] = [];
      snapshot.forEach((docSnapshot) => {
        dbAreas.push({ id: docSnapshot.id, ...docSnapshot.data() } as DeliveryArea);
      });
      
      setDeliveryAreas(dbAreas);
      localStorage.setItem("lazeez_delivery_areas", JSON.stringify(dbAreas));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "delivery_areas");
    });

    // 4. Listen to Real-Time Order Settings
    const unsubscribeSettings = onSnapshot(doc(db, "settings", "order_settings"), (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        setOrderSettings({
          isReceivingEnabled: data.isReceivingEnabled !== false,
          receiveMethod: data.receiveMethod || "email",
          email: data.email || "bellimabachir33@gmail.com",
          whatsapp: data.whatsapp || "213555123456",
          phoneForCall: data.phoneForCall || "213555123456",
          menuLabel: data.menuLabel || "القائمة",
          callBtnColor: data.callBtnColor || "#10B981",
          showMenuIcon: data.showMenuIcon !== false,
          showCallIcon: data.showCallIcon !== false,
          showCartIcon: data.showCartIcon !== false,
          welcomeTitle: data.welcomeTitle || "🍽️ أهلاً بك في عالم النكهات المميزة",
          welcomeText: data.welcomeText || "استمتع بتجربة طلب طعام سريعة وسهلة مع قائمة متنوعة من أشهى الوجبات، المحضّرة بعناية من مكونات طازجة وجودة عالية. هدفنا هو تقديم طعام لذيذ وخدمة مميزة تصل إليك بأفضل صورة وفي أسرع وقت",
          promoBannerText: data.promoBannerText || "",
          promoBannerEnabled: data.promoBannerEnabled === true,
          adminPasscode: data.adminPasscode || "19992026",
          promoBannerSpeed: data.promoBannerSpeed || 15,
        });
      } else {
        // Doc doesn't exist, let's seed or set a default
        setDoc(doc(db, "settings", "order_settings"), {
          id: "order_settings",
          isReceivingEnabled: true,
          receiveMethod: "email",
          email: "bellimabachir33@gmail.com",
          whatsapp: "213555123456",
          phoneForCall: "213555123456",
          menuLabel: "القائمة",
          callBtnColor: "#10B981",
          showMenuIcon: true,
          showCallIcon: true,
          showCartIcon: true,
          welcomeTitle: "🍽️ أهلاً بك في عالم النكهات المميزة",
          welcomeText: "استمتع بتجربة طلب طعام سريعة وسهلة مع قائمة متنوعة من أشهى الوجبات، المحضّرة بعناية من مكونات طازجة وجودة عالية. هدفنا هو تقديم طعام لذيذ وخدمة مميزة تصل إليك بأفضل صورة وفي أسرع وقت",
          promoBannerText: "",
          promoBannerEnabled: false,
          adminPasscode: "19992026",
          promoBannerSpeed: 15,
          restaurantId: "flavista"
        }).catch(err => {
          handleFirestoreError(err, OperationType.WRITE, "settings/order_settings");
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "settings/order_settings");
    });

    // 5. Listen to Real-Time Categories
    const categoriesQuery = query(
      collection(db, "categories"),
      where("restaurantId", "==", "flavista")
    );
    const unsubscribeCategories = onSnapshot(categoriesQuery, (snapshot) => {
      const dbCategories: Category[] = [];
      snapshot.forEach((docSnapshot) => {
        dbCategories.push({ id: docSnapshot.id, ...docSnapshot.data() } as Category);
      });
      setCategories(dbCategories);
      localStorage.setItem("lazeez_categories", JSON.stringify(dbCategories));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "categories");
    });

    // 6. Listen to Real-Time Menu Items
    const menuItemsQuery = query(
      collection(db, "menu_items"),
      where("restaurantId", "==", "flavista")
    );
    const unsubscribeMenuItems = onSnapshot(menuItemsQuery, (snapshot) => {
      const dbItems: MenuItem[] = [];
      snapshot.forEach((docSnapshot) => {
        dbItems.push({ id: docSnapshot.id, ...docSnapshot.data() } as MenuItem);
      });
      setMenuItems(dbItems);
      localStorage.setItem("lazeez_menu", JSON.stringify(dbItems));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "menu_items");
    });

    return () => {
      unsubscribeOrders();
      unsubscribeNotifs();
      unsubscribeAreas();
      unsubscribeSettings();
      unsubscribeCategories();
      unsubscribeMenuItems();
    };
  }, []);

  // Helper function to update order receiving settings
  const handleSaveOrderSettings = async (settings: {
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
  }) => {
    setOrderSettings(settings);
    try {
      await setDoc(doc(db, "settings", "order_settings"), {
        ...settings,
        id: "order_settings",
        restaurantId: "flavista"
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "settings/order_settings");
    }
  };

  // Helper function to update categories
  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem("lazeez_categories", JSON.stringify(newCategories));
  };

  // Helper function to update menu items
  const saveMenuItems = (newItems: MenuItem[]) => {
    setMenuItems(newItems);
    localStorage.setItem("lazeez_menu", JSON.stringify(newItems));
  };

  // Helper function to update orders in localStorage (for immediate fallback/load)
  const saveOrders = (newOrders: Order[]) => {
    setOrders(newOrders);
    localStorage.setItem("lazeez_orders", JSON.stringify(newOrders));
  };

  // Helper function to update cart in local storage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("lazeez_cart", JSON.stringify(newCart));
  };

  // Helper function to update delivery areas in real-time Firestore
  const saveDeliveryAreas = async (newAreas: DeliveryArea[]) => {
    setDeliveryAreas(newAreas);
    localStorage.setItem("flavista_delivery_areas", JSON.stringify(newAreas));
    try {
      // Sync each area to Firestore
      for (const area of newAreas) {
        await setDoc(doc(db, "delivery_areas", area.id), cleanUndefined({
          ...area,
          restaurantId: "flavista"
        }));
      }
      // Clean up any deleted areas from Firestore
      const missing = deliveryAreas.filter(a => !newAreas.some(na => na.id === a.id));
      for (const m of missing) {
        await deleteDoc(doc(db, "delivery_areas", m.id));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "delivery_areas");
    }
  };

  // Helper function to update notifications in local storage & Firestore
  const saveNotifications = async (newNotifs: AppNotification[]) => {
    setNotifications(newNotifs);
    localStorage.setItem("flavista_notifications", JSON.stringify(newNotifs));

    try {
      if (newNotifs.length === 0) {
        for (const notif of notifications) {
          await deleteDoc(doc(db, "notifications", notif.id));
        }
      } else {
        for (const notif of newNotifs) {
          const oldNotif = notifications.find(n => n.id === notif.id);
          if (!oldNotif || oldNotif.isRead !== notif.isRead || oldNotif.orderStatus !== notif.orderStatus) {
            await setDoc(doc(db, "notifications", notif.id), cleanUndefined({
              ...notif,
              restaurantId: "flavista"
            }));
          }
        }
        const missing = notifications.filter(n => !newNotifs.some(nn => nn.id === n.id));
        for (const m of missing) {
          await deleteDoc(doc(db, "notifications", m.id));
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "notifications");
    }
  };

  // --- CART OPERATIONS ---
  const handleAddToCart = (item: MenuItem, quantity: number, note?: string) => {
    const existingIndex = cart.findIndex((c) => c.menuItem.id === item.id);
    let updatedCart = [...cart];

    if (existingIndex > -1) {
      updatedCart[existingIndex].quantity += quantity;
      if (note) {
        updatedCart[existingIndex].note = note;
      }
    } else {
      updatedCart.push({ menuItem: item, quantity, note });
    }

    saveCart(updatedCart);
  };

  const handleUpdateQuantity = (dishId: string, quantity: number) => {
    const updated = cart.map((c) => {
      if (c.menuItem.id === dishId) {
        return { ...c, quantity };
      }
      return c;
    });

    saveCart(updated);
  };

  const handleRemoveItem = (dishId: string) => {
    const updated = cart.filter((c) => c.menuItem.id !== dishId);
    saveCart(updated);
  };

  // --- CHECKOUT PLACING ORDER ---
  const handlePlaceOrder = (details: {
    customerName: string;
    customerPhone: string;
    deliveryType: "delivery" | "pickup" | "dine_in";
    deliveryArea?: string;
    deliveryFee: number;
    tableNumber?: string;
    notes?: string;
  }) => {
    // 1. Guard: Check if order receiving is enabled by admin
    if (!orderSettings.isReceivingEnabled) {
      setToasts((prev) => [
        ...prev,
        {
          id: `toast-err-${Date.now()}`,
          message: "⚠️ عذراً، استقبال الطلبات متوقف حالياً من قبل إدارة المطعم. يرجى المحاولة لاحقاً.",
          dishName: "",
          dishImage: "",
          price: 0,
          type: "info",
        }
      ]);
      return null;
    }

    // Generate order number sequentially from 1 to 100
    const lastSeq = localStorage.getItem("flavista_order_sequence") || "0";
    let nextSeq = parseInt(lastSeq, 10) + 1;
    if (nextSeq > 100 || nextSeq < 1) {
      nextSeq = 1;
    }
    localStorage.setItem("flavista_order_sequence", nextSeq.toString());
    const orderNumber = nextSeq.toString();

    // Calculate sum
    const subtotal = cart.reduce((acc, curr) => {
      const price = curr.menuItem.discountPrice || curr.menuItem.price;
      return acc + price * curr.quantity;
    }, 0);

    const orderId = `order-${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      orderNumber,
      items: cart,
      customerName: details.customerName,
      customerPhone: details.customerPhone,
      deliveryType: details.deliveryType,
      tableNumber: details.tableNumber,
      deliveryArea: details.deliveryArea,
      deliveryFee: 0, // No delivery/shipping fee for municipalities
      notes: details.notes,
      status: "new",
      total: subtotal, // Delivery fee is always deleted (0)
      createdAt: new Date().toISOString()
    };

    // Save order & notification to Firestore in real-time
    const orderDocRef = doc(db, "orders", orderId);
    setDoc(orderDocRef, cleanUndefined({
      ...newOrder,
      restaurantId: "flavista"
    })).catch((err) => handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`));

    const notifId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const notifDocRef = doc(db, "notifications", notifId);
    setDoc(notifDocRef, cleanUndefined({
      id: notifId,
      orderId: orderId,
      orderNumber: orderNumber,
      customerName: details.customerName,
      deliveryType: details.deliveryType,
      createdAt: newOrder.createdAt,
      orderStatus: "new",
      isRead: false,
      restaurantId: "flavista"
    })).catch((err) => handleFirestoreError(err, OperationType.CREATE, `notifications/${notifId}`));

    // Update sales items count for menu dishes bestseller stats
    cart.forEach(async (cartMatched) => {
      const dbItem = menuItems.find((m) => m.id === cartMatched.menuItem.id);
      if (dbItem) {
        try {
          await setDoc(doc(db, "menu_items", dbItem.id), cleanUndefined({
            ...dbItem,
            salesCount: dbItem.salesCount + cartMatched.quantity,
            restaurantId: "flavista"
          }));
        } catch (e) {
          console.error("Error updating sales count:", e);
        }
      }
    });

    setToasts((prev) => [
      ...prev,
      {
        id: `toast-success-${Date.now()}`,
        message: `🎉 تم تسجيل طلبك وإرساله بنجاح إلى لوحة إدارة المطعم!`,
        dishName: "",
        dishImage: "",
        price: 0,
        type: "info",
      }
    ]);

    // Clear cart
    saveCart([]);

    // Determine specific success message based on delivery type requirements:
    const popupMessage = "لقد تم إرسال طلبك بنجاح ومباشرة إلى لوحة إدارة المطعم! جاري تحضير وجبتك المفضلة الآن للبدء في تحضيرها فوراً.";

    // Save order ID to customer tracked order IDs list
    const updatedPlacedIds = [...myPlacedOrderIds, orderId];
    setMyPlacedOrderIds(updatedPlacedIds);
    localStorage.setItem("flavista_my_placed_order_ids", JSON.stringify(updatedPlacedIds));

    setOrderSuccessPopup({
      isOpen: true,
      deliveryType: details.deliveryType,
      message: popupMessage,
      order: newOrder
    });

    // Close the cart side drawer
    setIsCartOpen(false);

    return newOrder;
  };

  // --- ORDER STATUS TRANSITIONS (ADMIN) ---
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      const orderDocRef = doc(db, "orders", orderId);
      await updateDoc(orderDocRef, { status });

      // Clean/update any notifications linked with this order
      const matchingNotif = notifications.find(n => n.orderId === orderId);
      if (matchingNotif) {
        await updateDoc(doc(db, "notifications", matchingNotif.id), { orderStatus: status });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteDoc(doc(db, "orders", orderId));
      const matchingNotif = notifications.find(n => n.orderId === orderId);
      if (matchingNotif) {
        await deleteDoc(doc(db, "notifications", matchingNotif.id));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `orders/${orderId}`);
    }
  };

  // --- DISHES CRUD MANAGERS (ADMIN) ---
  const handleAddMenuItem = async (item: Omit<MenuItem, "id" | "rating" | "reviews" | "salesCount">) => {
    const dishId = `dish-${Date.now()}`;
    const newItem: MenuItem = {
      ...item,
      id: dishId,
      rating: 5,
      reviews: [],
      salesCount: 0
    };
    try {
      await setDoc(doc(db, "menu_items", dishId), cleanUndefined({
        ...newItem,
        restaurantId: "flavista"
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `menu_items/${dishId}`);
    }
  };

  const handleEditMenuItem = async (item: MenuItem) => {
    try {
      await setDoc(doc(db, "menu_items", item.id), cleanUndefined({
        ...item,
        restaurantId: "flavista"
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `menu_items/${item.id}`);
    }
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    try {
      await deleteDoc(doc(db, "menu_items", itemId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `menu_items/${itemId}`);
    }
  };

  const handleToggleAvailability = async (itemId: string) => {
    const matched = menuItems.find((m) => m.id === itemId);
    if (!matched) return;
    try {
      await setDoc(doc(db, "menu_items", itemId), cleanUndefined({
        ...matched,
        isAvailable: !matched.isAvailable,
        restaurantId: "flavista"
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `menu_items/${itemId}`);
    }
  };

  // --- CATEGORIES CRUD MANAGERS (ADMIN) ---
  const handleAddCategory = async (newCat: { name: string; arabicName: string; icon: string; image?: string }) => {
    const catId = (newCat.name || "").toLowerCase().replace(/\s+/g, "_") || `cat-${Date.now()}`;
    const categoryObj = {
      ...newCat,
      id: catId
    };
    try {
      await setDoc(doc(db, "categories", catId), cleanUndefined({
        ...categoryObj,
        restaurantId: "flavista"
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${catId}`);
    }
  };

  const handleEditCategory = async (editedCat: Category) => {
    try {
      await setDoc(doc(db, "categories", editedCat.id), cleanUndefined({
        ...editedCat,
        restaurantId: "flavista"
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${editedCat.id}`);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    try {
      await deleteDoc(doc(db, "categories", catId));
      
      // Smoothly re-assign any orphan dishes in that category
      const remainingCats = categories.filter((cat) => cat.id !== catId);
      const firstCatId = remainingCats.length > 0 ? remainingCats[0].id : "general";
      
      const updatedDishes = menuItems.filter((item) => item.category === catId);
      for (const item of updatedDishes) {
        await setDoc(doc(db, "menu_items", item.id), cleanUndefined({
          ...item,
          category: firstCatId,
          restaurantId: "flavista"
        }));
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${catId}`);
    }
  };

  // --- ADD REVIEWS AND DISH RATINGS OVERLAY ---
  const handleAddReview = async (dishId: string, review: Omit<Review, "id" | "date">) => {
    const matched = menuItems.find((m) => m.id === dishId);
    if (!matched) return;

    const newReview: Review = {
      ...review,
      id: `review-${Date.now()}`,
      date: new Date().toISOString().split("T")[0]
    };

    const newReviews = [newReview, ...matched.reviews];
    const totalStars = newReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = parseFloat((totalStars / newReviews.length).toFixed(1));

    try {
      await setDoc(doc(db, "menu_items", dishId), cleanUndefined({
        ...matched,
        reviews: newReviews,
        rating: avg,
        restaurantId: "flavista"
      }));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `menu_items/${dishId}`);
    }
  };

  // Close a toast manually
  const handleCloseToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (showWelcome) {
    return <WelcomeScreen onEnter={() => setShowWelcome(false)} logoUrl={logoUrl} />;
  }

  // Intercept view navigation to admin if not authenticated
  if (view === "admin" && !isAdminAuthed) {
    return (
      <AdminPasscodeScreen
        correctCode={orderSettings.adminPasscode}
        onSuccess={() => {
          setIsAdminAuthed(true);
          sessionStorage.setItem("flavista_adm_authed", "true");
        }}
        onBack={() => setView("customer")}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8F2] selection:bg-brand-orange selection:text-white overflow-hidden text-right text-[#2D2D2D]" dir="rtl">

      {/* 🚀 ELITE RESPONSIVE MENU HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs h-16 sm:h-20 flex items-center">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none active:opacity-85" onClick={handleLogoClick}>
            <div className="w-11 h-11">
              <FlavistaLogo
                logoUrl={logoUrl}
                className="w-full h-full object-cover rounded-full border-2 border-brand-orange shadow-sm bg-white"
              />
            </div>
            <div>
              <span className="text-lg font-black text-[#FF6B35] tracking-tight font-sans">Flav'ista</span>
              <span className="text-[10px] text-zinc-550 font-bold block leading-none">SAVOR THE DIFFERENCE</span>
            </div>
          </div>

          {/* Nav Links - Desktop (Only shown if admin is signed in) */}
          {isAdminAuthed && (
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setView("customer")}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer ${
                  view === "customer"
                    ? "bg-brand-orange text-white font-bold shadow-sm"
                    : "text-slate-500 hover:text-brand-orange hover:bg-slate-50"
                }`}
              >
                📊 صالة الطلبات 🍽️
              </button>

              <button
                onClick={() => setView("admin")}
                className={`text-xs font-bold px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  view === "admin"
                    ? "bg-brand-orange text-white font-bold shadow-sm"
                    : "text-slate-600 hover:text-brand-orange hover:bg-slate-50 border border-transparent"
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>إدارة Flavista والمخازن</span>
              </button>
            </nav>
          )}

          {/* Shopping basket & profile action bar */}
          <div className="flex items-center gap-3">
            {view === "customer" && (
              <div className="relative">
                <button
                  onClick={() => setIsCustomerNotifDropdownOpen(!isCustomerNotifDropdownOpen)}
                  className="relative bg-slate-50 border border-slate-150 p-2.5 rounded-2xl text-slate-600 hover:text-brand-orange hover:bg-slate-100 cursor-pointer shadow-xxs transition-all duration-200 flex items-center justify-center"
                  title="إشعارات الطلبات"
                >
                  <Bell className="w-5 h-5" />
                  {myOrders.length > 0 && (
                    <span className="absolute -top-1 -left-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce shadow-xs border-2 border-white">
                      {myOrders.filter(o => o.status !== "completed" && o.status !== "cancelled").length || myOrders.length}
                    </span>
                  )}
                </button>

                {/* Dropdown Card */}
                <AnimatePresence>
                  {isCustomerNotifDropdownOpen && (
                    <>
                      {/* Fullscreen Backdrop Overlay to dismiss on outside click */}
                      <div
                        className="fixed inset-0 z-40 bg-transparent"
                        onClick={() => setIsCustomerNotifDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute left-0 mt-3 w-80 bg-white border border-slate-200 rounded-3xl shadow-xl z-50 p-4 text-right flex flex-col gap-3 max-h-[420px] overflow-y-auto"
                        dir="rtl"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-base">🔔</span>
                            <h4 className="text-xs font-black text-slate-800">متابعة حالات طلباتك</h4>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400">تحديث فوري</span>
                        </div>

                        {myOrders.length === 0 ? (
                          <div className="py-6 text-center space-y-2">
                            <span className="text-2xl block">🍽️</span>
                            <p className="text-xxs text-gray-500 font-bold">لم تقم بإجراء أي طلبات بعد في هذه الجلسة.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {myOrders.map((order) => {
                              let statusText = "";
                              let statusColorClass = "";
                              switch (order.status) {
                                case "new":
                                  statusText = "طلب جديد 🆕";
                                  statusColorClass = "bg-blue-50 text-blue-700 border-blue-200";
                                  break;
                                case "preparing":
                                  statusText = "قيد التحضير 👨‍🍳";
                                  statusColorClass = "bg-orange-50 text-orange-700 border-orange-200";
                                  break;
                                case "delivering":
                                  statusText = "جاري التوصيل 🚀";
                                  statusColorClass = "bg-amber-50 text-amber-700 border-amber-200";
                                  break;
                                case "completed":
                                  statusText = "تم التوصيل ✓";
                                  statusColorClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
                                  break;
                                case "cancelled":
                                  statusText = "تم الإلغاء ❌";
                                  statusColorClass = "bg-red-50 text-red-700 border-red-200";
                                  break;
                                default:
                                  statusText = order.status;
                                  statusColorClass = "bg-gray-50 text-gray-700 border-gray-200";
                                  break;
                              }

                              return (
                                <div key={order.id} className="border border-slate-100 bg-slate-50/60 p-3 rounded-2xl flex flex-col gap-1.5 hover:bg-slate-50 transition">
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-slate-800">{order.customerName}</span>
                                    <span className={`text-[10px] font-black py-0.5 px-2.5 rounded-full border ${statusColorClass}`}>
                                      {statusText}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-gray-500 font-bold flex items-center justify-between">
                                    <span>المجموع: {order.total} دج</span>
                                    <span>{new Date(order.createdAt).toLocaleTimeString("ar-DZ", {hour: '2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  {/* List of item names */}
                                  <p className="text-[10px] text-gray-400 truncate leading-relaxed">
                                    {order.items.map(i => `${i.menuItem.arabicName} (x${i.quantity})`).join("، ")}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Navigation Toggle (Only shown if admin is signed in) */}
            {isAdminAuthed && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden bg-white border border-gray-200 p-2 rounded-2xl text-[#2D2D2D] hover:text-brand-orange cursor-pointer hover:bg-slate-50 shadow-xxs"
              >
                <Hamburger className="w-5.5 h-5.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer Overlay */}
        {isAdminAuthed && mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-2 animate-fade-in text-right">
            <button
              onClick={() => {
                setView("customer");
                setMobileMenuOpen(false);
              }}
              className="w-full text-right py-3.5 px-4 rounded-xl text-xs font-black block hover:bg-slate-50 text-slate-700"
            >
              🍽️ صالة المأكولات والطلبات للزبائن
            </button>
            <button
              onClick={() => {
                setView("admin");
                setMobileMenuOpen(false);
              }}
              className="w-full text-right py-3.5 px-4 rounded-xl text-xs font-black block bg-brand-orange text-white flex items-center gap-2 justify-between"
            >
              <span>📊 إدارة مطعم Flavista</span>
              <Shield className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      {/* 🌌 MAIN WORKSPACE ENTRY WRAPPER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-36">
        {view === "customer" ? (
          <div>
            <AnimatePresence mode="wait">
              {activeNavTab === "about" ? (
                <div key="about-page">
                  <AboutPage phoneForCall={orderSettings.phoneForCall} />
                </div>
              ) : (
                <motion.div
                  key="menu-page"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                >
                  <CustomerMenu
                    menuItems={menuItems.filter(m => m.isAvailable && categories.find(c => c.id === m.category)?.isAvailable !== false)}
                    categories={categories.filter(cat => cat.isAvailable !== false)}
                    onAddToCart={handleAddToCart}
                    onAddReview={handleAddReview}
                    orderSettings={orderSettings}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="animate-fade-in-up">
            <AdminDashboard
              orders={orders}
              menuItems={menuItems}
              categories={categories}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              onAddMenuItem={handleAddMenuItem}
              onEditMenuItem={handleEditMenuItem}
              onDeleteMenuItem={handleDeleteMenuItem}
              onToggleAvailability={handleToggleAvailability}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              logoUrl={logoUrl}
              onSaveLogoUrl={handleSaveLogoUrl}
              onLogout={() => {
                setIsAdminAuthed(false);
                sessionStorage.removeItem("flavista_adm_authed");
              }}
              onClearAllOrders={async () => {
                try {
                  saveOrders([]);
                  for (const order of orders) {
                    await deleteDoc(doc(db, "orders", order.id));
                  }
                } catch (err) {
                  handleFirestoreError(err, OperationType.DELETE, "orders");
                }
              }}
              notifications={notifications}
              onSaveNotifications={saveNotifications}
              deliveryAreas={deliveryAreas}
              onSaveDeliveryAreas={saveDeliveryAreas}
              orderSettings={orderSettings}
              onUpdateOrderSettings={handleSaveOrderSettings}
            />
          </div>
        )}
      </main>

      {/* 🚀 FLOATING SYSTEM NOTIFICATION TOAST OVERLAY */}
      <NotificationToast
        toasts={toasts}
        onClose={handleCloseToast}
        onOpenCart={() => setIsCartOpen(true)}
        logoUrl={logoUrl}
      />

      {/* ⚠️ MODERN iOS BOTTOM TAB BAR (Customer view only) */}
      {view === "customer" && (
        <BottomTabBar
          cart={filteredCart}
          activeTab={activeNavTab}
          onTabChange={setActiveNavTab}
          onOpenCart={() => setIsCartOpen(true)}
          onMenuClick={() => {
            const element = document.getElementById("menu-section");
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            } else {
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
          }}
          onAboutClick={() => {
            const element = document.getElementById("about-section");
            if (element) {
              element.scrollIntoView({ behavior: "smooth" });
            }
          }}
        />
      )}

      {/* 📞 SECURE FLOATING DIRECT CALL BUTTON (Replaces old cart button) */}
      {view === "customer" && orderSettings.showCallIcon && (
        <motion.button
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (window.navigator && window.navigator.vibrate) {
              window.navigator.vibrate(20);
            }
            window.location.href = `tel:${orderSettings.phoneForCall || "0770391093"}`;
          }}
          style={{ backgroundColor: orderSettings.callBtnColor || "#10B981" }}
          className="fixed bottom-24 right-6 z-40 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg cursor-pointer transition-all focus:outline-none border-2 border-white"
          title="اتصال مباشر بالمطعم"
        >
          <div className="relative">
            <span className="absolute inset-0 rounded-full opacity-35 animate-ping" style={{ backgroundColor: orderSettings.callBtnColor || "#10B981" }} />
            <PhoneCall className="w-5.5 h-5.5 text-white relative z-10 animate-pulse" />
          </div>
        </motion.button>
      )}

      {/* 🛒 CHECKOUT SIDE DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => {
          setIsCartOpen(false);
          if (activeNavTab === "orders") {
            setActiveNavTab("menu");
          }
        }}
        cartItems={filteredCart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onPlaceOrder={handlePlaceOrder}
        deliveryAreas={deliveryAreas}
      />

      {/* 🌟 CUSTOM ORDER SUCCESS CONFIRMATION POPUP MODAL */}
      <AnimatePresence>
        {orderSuccessPopup?.isOpen && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-md text-right font-sans" dir="rtl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl border border-gray-150 flex flex-col items-center text-center gap-6"
            >
              {/* Large beautiful emerald success checkCircle */}
              <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 relative">
                <span className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping opacity-75" />
                <CheckCircle className="w-9 h-9 relative z-10" />
              </div>

              {/* Title & Type Specific Badge */}
              <div className="space-y-2 flex flex-col items-center">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-full">
                  {orderSuccessPopup.deliveryType === "delivery" ? "🚀 خدمة التوصيل للمنزل" : "🍽️ استلام محلي من المطعم"}
                </span>
                <h3 className="text-base font-black text-[#2D2D2D] mt-1">تمت العملية بنجاح!</h3>
              </div>

              {/* Message Display container */}
              <div className="bg-[#FFF8F2] border border-orange-100 rounded-2xl p-4.5 w-full animate-pulse-once">
                <p className="text-[#2D2D2D] text-xs font-bold leading-relaxed">
                  {orderSuccessPopup.message}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col w-full gap-2 pt-1">
                <button
                  onClick={() => {
                    setOrderSuccessPopup(null);
                  }}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-3 px-6 rounded-2xl text-xs transition active:scale-95 cursor-pointer"
                >
                  إغلاق النافذة والذهاب للمنيو
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Secret Passcode Modal for Restaurant Admin */}
      {showSecretModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-xs text-right" dir="rtl">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-6 shadow-2xl border border-gray-150 flex flex-col gap-4 animate-scale-in">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="text-lg">🔒</span>
              <h3 className="text-base font-black text-[#2D2D2D]">نظام التحقق لإدارة Flavista</h3>
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-xxs font-bold text-slate-600">الرمز السري الفوري للدخول:</label>
              <input
                type="password"
                placeholder="••••••••"
                maxLength={12}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setPasscodeError("");
                }}
                className="w-full text-center text-lg font-mono tracking-widest p-2.5 border border-gray-200 bg-slate-50 text-[#2D2D2D] rounded-xl focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none transition"
              />
              {passcodeError && (
                <p className="text-xxs text-red-500 font-semibold">{passcodeError}</p>
              )}
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => {
                  const correctPass = orderSettings.adminPasscode || "19992026";
                  if (passcode === correctPass) {
                    setIsAdminAuthed(true);
                    sessionStorage.setItem("flavista_adm_authed", "true");
                    setView("admin");
                    setShowSecretModal(false);
                    setPasscode("");
                    setPasscodeError("");
                  } else {
                    setPasscodeError("رمز المرور خاطئ! يرجى المحاولة مرة أخرى.");
                  }
                }}
                className="flex-1 bg-brand-orange hover:bg-brand-orange-hover text-white font-bold py-2.5 px-4 rounded-xl text-xs transition active:scale-95 cursor-pointer shadow"
              >
                تأكيد الدخول
              </button>
              <button
                onClick={() => {
                  setShowSecretModal(false);
                  setPasscode("");
                  setPasscodeError("");
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-750 font-bold py-2.5 px-4 rounded-xl text-xs transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

