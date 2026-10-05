"use client";

import React from "react";
import { FulfillmentProvider, useFulfillment } from "@/context/FulfillmentContext";
import { Header } from "@/components/Header";
import { OfficeView } from "@/components/OfficeView";
import { WarehouseFloorView } from "@/components/WarehouseFloorView";
import { StockView } from "@/components/StockView";

function MainDashboard() {
  const { activeView } = useFulfillment();

  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-100/60 text-slate-900 flex flex-col font-sans">
      <Header />

      <main className="flex-1 w-full overflow-hidden p-3">
        {(activeView === "OFFICE" || activeView === "ORDERS" || activeView === "DISPATCH") && (
          <OfficeView />
        )}
        {(activeView === "WAREHOUSE" || activeView === "KIOSK" || activeView === "STAGING") && (
          <WarehouseFloorView />
        )}
        {(activeView === "STOCK" || activeView === "INVENTORY") && (
          <StockView />
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <FulfillmentProvider>
      <MainDashboard />
    </FulfillmentProvider>
  );
}
