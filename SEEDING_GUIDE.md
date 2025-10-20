# Database Seeding Guide

## 🌱 What Gets Seeded

This script populates your MongoDB database with realistic test data:

### Personnel (5 employees):
1. **Ahmed Mansour** - Foreman (1200 TND/month)
2. **Saif Nemri** - Engineer (1500 TND/month)
3. **Raed Nasri** - Construction Worker (900 TND/month)
4. **Mohamed Khirallah** - Electrician (1100 TND/month)
5. **Ka Rim** - Mason (950 TND/month)

### Work Sites (4 sites):
- Construction Site Alpha (Tunis)
- Road Work Project Beta (Route de Bizerte)
- Commercial Complex Gamma (La Marsa)
- Bridge Renovation Delta (Sfax)

### Vehicles (5 vehicles):
- Mercedes Dump Truck (TUN-1234)
- Volvo Excavator (TUN-5678)
- Caterpillar Bulldozer (TUN-9012)
- Toyota Pickup (TUN-3456)
- Komatsu Excavator (TUN-7890)

### Suppliers (5 suppliers):
- Tunisian Cement Co. (Materials)
- Steel & Iron Supplies (Materials)
- Fuel Express Tunisia (Fuel)
- Hardware Tools Plus (Tools)
- Safety Equipment Pro (Safety)

### Stock Items (8 items):
- Cement bags, Steel rods, Diesel fuel
- Power drills, Safety helmets, Safety vests
- (Includes low stock items for testing alerts)

### Daily Assignments (4 assignments):
- Recent assignments with personnel, vehicles, and fuel costs
- Mix of paid/unpaid personnel
- Realistic fuel cost entries

---

## 🚀 How to Run

### Option 1: Run Seed Script (Recommended)

```bash
cd BEnestjs-main
npm run seed
```

### Option 2: Manual Command

```bash
cd BEnestjs-main
npx ts-node src/seed.ts
```

---

## ⚠️ Important Notes

1. **Clears existing data**: This script will DELETE all existing data before seeding
2. **Backend must be stopped**: Stop the backend server before running seed
3. **MongoDB must be running**: Ensure MongoDB is running on localhost:27017
4. **Run once**: You only need to run this once to populate the database

---

## ✅ After Seeding

1. Start the backend: `npm run start:dev`
2. Start the frontend: `cd ../FEnextjs-main && npm run dev`
3. Open http://localhost:3000
4. All modules will have data to display!

---

## 🧪 Test Coverage

The seeded data covers:
- ✅ All 7 modules (Work Sites, Employees, Vehicles, Daily Assignments, Suppliers, Stock, Fuel Costs)
- ✅ Low stock alerts (some items below minQuantity)
- ✅ Paid/unpaid personnel tracking
- ✅ Vehicle assignments to work sites
- ✅ Fuel costs with multiple payment methods
- ✅ Supplier relationships with stock items
- ✅ Realistic Tunisian data (names, locations, currencies)

---

## 🔄 Re-seeding

To clear and re-seed the database:

```bash
npm run seed
```

This will delete all existing data and create fresh test data.
