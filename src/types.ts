/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MenuItem {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  arabicDescription: string;
  price: number;
  category: string; // e.g. "meals", "pizza", "drinks", "desserts"
  image: string;
  discountPrice?: number; // Optional special offer price
  rating: number; // calculated average
  reviews: Review[];
  isAvailable: boolean;
  salesCount: number; // for bestseller analytics
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  note?: string;
}

export type OrderStatus = "new" | "preparing" | "delivering" | "completed" | "cancelled";

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  deliveryType: "delivery" | "pickup" | "dine_in";
  tableNumber?: string; // For dine_in orders inside Flavista
  deliveryArea?: string; // name of delivery area
  deliveryFee: number;
  notes?: string;
  status: OrderStatus;
  total: number;
  createdAt: string; // ISO String
}

export interface DeliveryArea {
  id: string;
  name: string;
  fee: number;
  isActive: boolean;
  neighborhoods?: string;
}

export interface Category {
  id: string;
  name: string;
  arabicName: string;
  icon: string; // Lucide icon name or emoji
  image?: string; // Cover image for Grid Categories
  isAvailable?: boolean; // For category visibility show/hide toggle
}

export interface ToastNotification {
  id: string;
  message: string;
  dishName: string;
  dishImage: string;
  price: number;
  type: "cart_add" | "order_status" | "info";
  duration?: number;
}

export interface AppNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName: string;
  deliveryType: "delivery" | "pickup" | "dine_in";
  createdAt: string;
  orderStatus: OrderStatus;
  isRead: boolean;
}

export interface OrderReceivingSettings {
  isReceivingEnabled: boolean;
  receiveMethod: "email" | "whatsapp" | "both";
  email: string;
  whatsapp: string;
}


