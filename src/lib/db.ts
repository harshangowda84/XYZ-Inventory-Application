import { CourierOption, CutoffSlot, Order, StockItem, StockTransfer } from "@/types/fulfillment";
import defaultData from "@/data/data.json";

export interface DatabaseSchema {
  orders: Order[];
  inventory: StockItem[];
  transfers: StockTransfer[];
  cutoffs: CutoffSlot[];
}

const STORAGE_KEY = "XYZ_FULFILLMENT_DATA_V2";

export function loadData(): DatabaseSchema {
  if (typeof window === "undefined") {
    return defaultData as unknown as DatabaseSchema;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultData));
      return defaultData as unknown as DatabaseSchema;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read from persistent database", err);
    return defaultData as unknown as DatabaseSchema;
  }
}

export function saveData(data: DatabaseSchema): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save to persistent database", err);
  }
}
