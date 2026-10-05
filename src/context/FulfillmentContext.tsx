"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { CourierOption, CutoffSlot, Order, StockItem, StockTransfer } from "@/types/fulfillment";
import { COURIERS, INITIAL_CUTOFFS, INITIAL_INVENTORY, INITIAL_ORDERS, INITIAL_TRANSFERS } from "@/data/mockData";
import { loadData, saveData, DatabaseSchema } from "@/lib/db";
import { getTodayDateString } from "@/lib/dateUtils";

export type ActiveView =
  | "OFFICE"
  | "WAREHOUSE"
  | "STOCK"
  | "ORDERS"
  | "DISPATCH"
  | "KIOSK"
  | "STAGING"
  | "INVENTORY";

interface FulfillmentContextType {
  orders: Order[];
  inventory: StockItem[];
  transfers: StockTransfer[];
  cutoffs: CutoffSlot[];
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  
  // Cutoffs
  updateCutoff: (id: string, time: string, service: string) => void;

  // New Order
  placeNewOrder: (orderData: Partial<Order>) => void;
  assignOrderDispatchDate: (orderId: string, dispatchDate: string) => void;

  // Lifecycle
  toggleManualVerify: (orderId: string) => void;
  allocateCourierSlot: (orderId: string, courierId: string, slotTime: string) => void;
  markBoxPacked: (orderId: string) => void;
  confirmOrderPickedUp: (orderId: string) => void;
  rescheduleDispatch: (orderId: string, newDispatchDate: string) => void;

  // Warehouse Kiosk & Stock
  updatePickQuantity: (orderId: string, itemId: string, qty: number) => void;
  markItemMissing: (orderId: string, itemId: string, reason: string) => void;
  completePacking: (orderId: string) => void;
  dispatchBay: (bayName: string) => void;
  requestStockTransfer: (itemId: string, quantity: number) => void;
  receiveTransfer: (transferId: string) => void;
  assignPicker: (orderId: string, pickerName: string) => void;
}

const FulfillmentContext = createContext<FulfillmentContextType | undefined>(undefined);

export function FulfillmentProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<StockItem[]>(INITIAL_INVENTORY);
  const [transfers, setTransfers] = useState<StockTransfer[]>(INITIAL_TRANSFERS);
  const [cutoffs, setCutoffs] = useState<CutoffSlot[]>(INITIAL_CUTOFFS);
  const [activeView, setActiveView] = useState<ActiveView>("OFFICE");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from persistent storage on mount
  useEffect(() => {
    const data = loadData();
    setOrders(data.orders);
    setInventory(data.inventory);
    setTransfers(data.transfers);
    setCutoffs(data.cutoffs);
    setIsLoaded(true);
  }, []);

  // Save changes to persistent storage
  useEffect(() => {
    if (!isLoaded) return;
    saveData({ orders, inventory, transfers, cutoffs });
  }, [orders, inventory, transfers, cutoffs, isLoaded]);

  // Sync selectedOrder
  useEffect(() => {
    if (selectedOrder) {
      const updated = orders.find((o) => o.id === selectedOrder.id);
      if (updated) setSelectedOrder(updated);
    }
  }, [orders]);

  const updateCutoff = (id: string, time: string, service: string) => {
    setCutoffs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, time, service } : c))
    );
  };

  const checkStockForItem = (items: Order["items"]) => {
    let allAvailable = true;
    let shortages: string[] = [];
    for (const it of items) {
      const stock = inventory.find((s) => s.name === it.name);
      if (!stock || stock.mainWarehouseStock < it.quantity) {
        allAvailable = false;
        shortages.push(`${it.name} (${stock ? stock.mainWarehouseStock : 0} in Main)`);
      }
    }
    return {
      isAvailable: allAvailable,
      message: allAvailable
        ? "In Stock in Main Warehouse"
        : `Shortage: ${shortages.join(", ")} (Stock available in Warehouse 2)`,
    };
  };

  const placeNewOrder = (orderData: Partial<Order>) => {
    const nextId = String(orders.length + 1).padStart(3, "0");
    const stockInfo = checkStockForItem(orderData.items || []);

    const effectiveOrderDate = orderData.orderDate || selectedDate || getTodayDateString();
    const effectiveDispatchDate = orderData.dispatchDate || selectedDate || getTodayDateString();

    const newOrder: Order = {
      id: nextId,
      orderDate: effectiveOrderDate,
      dispatchDate: effectiveDispatchDate,
      customerName: orderData.customerName || "Customer",
      channel: orderData.channel || "Shopify",
      deliveryPromiseDate: orderData.deliveryPromiseDate || "12-Nov-2026",
      priority: orderData.priority || "STANDARD",
      status: "PENDING_LABEL",
      items: orderData.items || [],
      isStockVerified: false, // Manual verification needed!
      stockAvailabilityMessage: stockInfo.message,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrder(newOrder);
    setSelectedDate(effectiveDispatchDate);
  };

  const assignOrderDispatchDate = (orderId: string, dispatchDate: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, dispatchDate } : order
      )
    );
    if (dispatchDate) {
      setSelectedDate(dispatchDate);
    }
  };

  // Toggle manual verification (Step 1)
  const toggleManualVerify = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const nextState = !o.isStockVerified;
          return {
            ...o,
            isStockVerified: nextState,
            stockAvailabilityMessage: nextState
              ? "Manually verified by reviewer"
              : "Manual verification pending",
          };
        }
        return o;
      })
    );
  };

  // Step 2: Allocate Combined Slot & Courier
  const allocateCourierSlot = (orderId: string, courierId: string, slotTime: string) => {
    const courier = COURIERS.find((c) => c.id === courierId) || COURIERS[0];
    const generatedTracking = `${courier.name.slice(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            courier,
            trackingNumber: generatedTracking,
            stagingBay: courier.assignedBay,
            allocatedSlot: `${slotTime} • ${courier.name}`,
            status: order.status === "PENDING_LABEL" ? "READY_TO_PICK" : order.status,
          };
        }
        return order;
      })
    );
  };

  // Step 3: Pack Box
  const markBoxPacked = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const allPicked = order.items.map((it) => ({ ...it, pickedQty: it.quantity }));
          return {
            ...order,
            items: allPicked,
            status: "STAGED",
          };
        }
        return order;
      })
    );
  };

  // Step 4: Confirm Handover
  const confirmOrderPickedUp = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          return {
            ...order,
            status: "DISPATCHED",
          };
        }
        return order;
      })
    );
  };

  const rescheduleDispatch = (orderId: string, newDispatchDate: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, dispatchDate: newDispatchDate } : order
      )
    );
    if (newDispatchDate) {
      setSelectedDate(newDispatchDate);
    }
  };

  const assignPicker = (orderId: string, pickerName: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "PICKING", assignedPicker: pickerName } : order
      )
    );
  };

  const updatePickQuantity = (orderId: string, itemId: string, qty: number) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const updatedItems = order.items.map((item) =>
            item.id === itemId ? { ...item, pickedQty: Math.min(item.quantity, Math.max(0, qty)) } : item
          );
          const allPicked = updatedItems.every((it) => it.pickedQty === it.quantity);
          return {
            ...order,
            status: allPicked ? "PACKING" : "PICKING",
            items: updatedItems,
          };
        }
        return order;
      })
    );
  };

  const markItemMissing = (orderId: string, itemId: string, reason: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id === orderId) {
          const item = order.items.find((i) => i.id === itemId);
          const updatedItems = order.items.map((i) =>
            i.id === itemId ? { ...i, isMissing: true } : i
          );
          if (item) {
            const stock = inventory.find((s) => s.name === item.name);
            if (stock && stock.secondaryWarehouseStock > 0) {
              requestStockTransfer(stock.id, item.quantity * 2);
            }
          }
          return {
            ...order,
            exceptionNote: `Item missing on shelf: ${item?.name} (${reason})`,
            items: updatedItems,
          };
        }
        return order;
      })
    );
  };

  const completePacking = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, status: "STAGED" } : order))
    );
  };

  const dispatchBay = (bayName: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.stagingBay === bayName && order.status === "STAGED"
          ? { ...order, status: "DISPATCHED" }
          : order
      )
    );
  };

  const requestStockTransfer = (itemId: string, quantity: number) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;
    const newTransfer: StockTransfer = {
      id: `T-0${transfers.length + 1}`,
      itemName: `${item.name} (${item.variant})`,
      quantity,
      from: "Warehouse 2",
      to: "Main Warehouse",
      status: "REQUESTED",
      requestedAt: "Just now",
    };
    setTransfers((prev) => [newTransfer, ...prev]);
  };

  const receiveTransfer = (transferId: string) => {
    const transfer = transfers.find((t) => t.id === transferId);
    if (!transfer) return;
    setInventory((prev) =>
      prev.map((item) => {
        if (transfer.itemName.includes(item.name)) {
          return {
            ...item,
            mainWarehouseStock: item.mainWarehouseStock + transfer.quantity,
            secondaryWarehouseStock: Math.max(0, item.secondaryWarehouseStock - transfer.quantity),
          };
        }
        return item;
      })
    );
    setTransfers((prev) =>
      prev.map((t) => (t.id === transferId ? { ...t, status: "RECEIVED" } : t))
    );
  };

  return (
    <FulfillmentContext.Provider
      value={{
        orders,
        inventory,
        transfers,
        cutoffs,
        activeView,
        setActiveView,
        selectedOrder,
        setSelectedOrder,
        selectedDate,
        setSelectedDate,
        updateCutoff,
        placeNewOrder,
        assignOrderDispatchDate,
        toggleManualVerify,
        allocateCourierSlot,
        markBoxPacked,
        confirmOrderPickedUp,
        rescheduleDispatch,
        updatePickQuantity,
        markItemMissing,
        completePacking,
        dispatchBay,
        requestStockTransfer,
        receiveTransfer,
        assignPicker,
      }}
    >
      {children}
    </FulfillmentContext.Provider>
  );
}

export function useFulfillment() {
  const context = useContext(FulfillmentContext);
  if (!context) throw new Error("useFulfillment must be used within FulfillmentProvider");
  return context;
}
