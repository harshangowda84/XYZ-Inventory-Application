# XYZ // FULFILLMENT HUB [OPERATIONS ENGINE]

> A dead-simple, high-contrast fulfillment operations system built specifically for small e-commerce businesses scaling from spreadsheets (200–300 orders/day) to multi-person warehouse operations.

---

## 💡 Designed for Real Human Workflows
The prompt highlights a core operational reality:
- **Office Team (1–2 people):** Reviews incoming channel orders, monitors cutoffs, compares courier costs, and generates shipping labels.
- **Warehouse Team (2–3 people):** Highly experienced with physical warehouse operations, but **not comfortable with complex technology or dense spreadsheets**.

Instead of confusing multi-step menus or disjointed calendars, this app simplifies the entire business into **3 clear, role-specific views**:

1. **🏢 1. Office (Orders & Shipping Labels):**
   - At-a-glance status pills (`All Orders`, `🚨 Priority Same-Day`, `Needs Label`, `In Warehouse`, `Dispatched`).
   - Quick search by order number, customer, or product.
   - 1-Click order review with live stock check.
   - Courier rate & cutoff comparison (*Porter ₹320 / 3:00 PM*, *BlueDart ₹450 / 5:00 PM*, *Delhivery ₹180 / 11:00 PM*).
   - 1-Click: *"Generate Shipping Label & Send to Warehouse"*.

2. **📦 2. Warehouse Floor (Pick, Pack & Handover):**
   - **Zero technical jargon** — giant touch buttons and high-contrast typography.
   - Active worker profile selection (`Ramesh`, `Suresh`, `Deepak`).
   - Urgent **🚨 Same-Day Priority** orders automatically pinned to the top of the queue.
   - Prominent, unmistakable shelf coordinates: `📍 SHELF: ROW 1, BOX 2`.
   - 1-Click pick confirmations (`+1 Picked`).
   - *"Item Missing?"* escape hatch that safely alerts the office without stalling the worker.
   - Staging bays (`Bay 1`, `Bay 2`, `Bay 3`) with a 1-click **"Driver Picked Up"** sign-off button.

3. **🏬 3. Stock (Warehouse 1 & 2 Replenishment):**
   - Full visibility across **Main Warehouse (A)** and **Warehouse 2 (B - Reserve)**.
   - Instant identification of stock shortages on Main shelves.
   - 1-Click internal transfer order creation (`Wh 2 &rarr; Main`) and receipt confirmation.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18.17+ or v20+)
- npm

### Installation & Launch
```bash
# 1. Install dependencies
npm install

# 2. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎨 Design System
- **High-Contrast Monochrome & Functional Colors:** Pure white canvas with crisp black borders and high-visibility status tags.
- **Touch-First Accessibility:** Giant buttons and shelf indicators designed for tablets and touch terminals on the warehouse packing line.
- **No Date Drift or Complex Filtering:** Orders default to the active fulfillment pipeline with instantaneous search and status filtering.
