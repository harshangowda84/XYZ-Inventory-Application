export type OrderPriority = "SAME_DAY" | "STANDARD";

export type OrderStatus =
  | "PENDING_LABEL"
  | "READY_TO_PICK"
  | "PICKING"
  | "PACKING"
  | "STAGED"
  | "DISPATCHED";

export interface OrderItem {
  id: string;
  name: string;
  variant: string;
  quantity: number;
  shelfLocation: string; // e.g. Row 1, Box 2
  pickedQty: number;
  isMissing?: boolean;
}

export interface CourierOption {
  id: string;
  name: string;
  speed: string;
  cost: number;
  cutoffTime: string;
  assignedBay: string;
}

export interface CutoffSlot {
  id: string;
  time: string;
  service: string;
  bay: string;
  status: string;
}

export interface Order {
  id: string; // e.g. "001", "002"
  orderDate: string; // Date customer placed order, e.g. "2026-10-04"
  dispatchDate: string; // Date assigned for warehouse to dispatch, e.g. "2026-10-04"
  customerName: string;
  channel: string;
  deliveryPromiseDate: string; // e.g. "12-Nov-2026"
  priority: OrderPriority;
  status: OrderStatus;
  items: OrderItem[];
  courier?: CourierOption;
  trackingNumber?: string;
  stagingBay?: string;
  assignedPicker?: string;
  exceptionNote?: string;
  allocatedSlot?: string; // e.g. "3:00 PM Porter Van"
  isStockVerified?: boolean;
  stockAvailabilityMessage?: string;
}

export interface StockItem {
  id: string;
  name: string;
  variant: string;
  shelfLocation: string;
  mainWarehouseStock: number;
  secondaryWarehouseStock: number;
}

export interface StockTransfer {
  id: string;
  itemName: string;
  quantity: number;
  from: string;
  to: string;
  status: "REQUESTED" | "RECEIVED";
  requestedAt: string;
}
