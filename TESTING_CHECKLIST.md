# Testing Checklist - Before Final Push

## Quick Start
1. **Start Backend**: `cd BEnestjs-main && npm run start:dev`
2. **Start Frontend**: `cd FEnextjs-main && npm run dev`
3. **Open Browser**: http://localhost:3000

---

## ✅ Modules to Test (7 Total)

### 1. 🏗️ Work Sites (Chantiers)
- **Route**: `/work-sites`
- **Backend**: `http://localhost:3001/chantier`
- **Tests**:
  - [ ] View list of work sites
  - [ ] Add new work site (name, location, description)
  - [ ] Edit existing work site
  - [ ] Delete work site
  - [ ] Works offline (data cached)

### 2. 👷 Employees (Personnel)
- **Route**: `/employees`
- **Backend**: `http://localhost:3001/personnel`
- **Tests**:
  - [ ] View list of employees
  - [ ] Add new employee (name, role, salary)
  - [ ] Edit employee details
  - [ ] Delete employee
  - [ ] Works offline (data cached)

### 3. 🚗 Vehicles (Vehicules)
- **Route**: `/vehicles`
- **Backend**: `http://localhost:3001/vehicule`
- **Tests**:
  - [ ] View list of vehicles
  - [ ] Add new vehicle (immatriculation, marque, modele, type, kilometrage)
  - [ ] Edit vehicle details
  - [ ] Delete vehicle
  - [ ] Status badge shows correctly (Available/In Use)
  - [ ] Works offline (data cached)

### 4. 📋 Daily Assignments
- **Route**: `/daily-assignments`
- **Backend**: `http://localhost:3001/daily-assignment`
- **Tests**:
  - [ ] View list of daily assignments
  - [ ] Add new assignment (date, chantier, personnel, vehicles, fuel costs)
  - [ ] Edit existing assignment
  - [ ] Delete assignment
  - [ ] Mark personnel as paid
  - [ ] Total costs calculated correctly
  - [ ] Fuel costs embedded in assignments

### 5. 🏢 Suppliers (Fournisseurs) ⭐ NEW
- **Route**: `/suppliers`
- **Backend**: `http://localhost:3001/fournisseur`
- **Tests**:
  - [ ] View list of suppliers
  - [ ] Add new supplier (name, contact, phone, email, address, category)
  - [ ] Edit supplier details
  - [ ] Delete supplier
  - [ ] Works offline (data cached)

### 6. 📦 Stock/Inventory ⭐ NEW
- **Route**: `/stock`
- **Backend**: `http://localhost:3001/stock`
- **Tests**:
  - [ ] View list of stock items
  - [ ] Add new stock item (quantity, unit, category, supplier link, chantier link, minQuantity)
  - [ ] Edit stock details
  - [ ] Delete stock item
  - [ ] Low stock warning displays when quantity <= minQuantity
  - [ ] Supplier dropdown populated from /fournisseur
  - [ ] Works offline (data cached)

### 7. ⛽ Fuel Costs (Gazole) ⭐ FIXED
- **Route**: `/fuel-coasts`
- **Backend**: Extracted from `/daily-assignment`
- **Tests**:
  - [ ] View all fuel costs from all assignments
  - [ ] Total cost displays correctly
  - [ ] Total entries count correct
  - [ ] Search by description or work site works
  - [ ] Shows message if no fuel costs exist
  - [ ] Note: Fuel costs are added through Daily Assignments page

---

## 🔄 PWA Features to Test

### Offline Mode
1. [ ] Load any page while online
2. [ ] Turn off backend server
3. [ ] Navigate between pages - should still show cached data
4. [ ] Offline indicator appears when backend is down
5. [ ] Try to add/edit data offline - should queue or show error

### Install Prompt
1. [ ] "Install App" button appears in header
2. [ ] Click to install as PWA
3. [ ] App opens in standalone window
4. [ ] App icon appears on desktop/home screen

### Service Worker
1. [ ] Check `/public/sw.js` exists
2. [ ] Check `/public/manifest.json` exists
3. [ ] Service worker registers on page load (check console)

---

## 🐛 Known Issues / Limitations

### ✅ FIXED:
- ✅ Fuel costs page showing 404 - NOW FIXED (fetches from daily assignments)
- ✅ Vehicles page incomplete - NOW ENHANCED (full CRUD, offline support)

### ⚠️ Minor Issues:
- Stock page doesn't use offline-aware API yet (uses axios directly)
- CRLF line ending warnings (Windows-specific, non-breaking)

### 📝 To Note:
- Fuel costs are NOT a separate entity - they're embedded in Daily Assignments
- To add fuel costs: Go to Daily Assignments → Add/Edit Assignment → Add Fuel Costs section
- Suppliers link to Stock items via ObjectId reference

---

## 🎯 Testing Strategy

### Quick Test (10 minutes):
1. Start both servers
2. Test one CRUD operation on each of the 7 modules
3. Check offline indicator appears when backend stopped

### Full Test (30 minutes):
1. Test all CRUD operations on all modules
2. Test offline mode thoroughly
3. Test PWA install
4. Test responsive design on mobile view
5. Verify all navigation links work

### Validation Prep (1 hour):
1. Full test above
2. Practice 15-minute demo
3. Prepare talking points for each feature
4. Review `VALIDATION_GUIDE.md`

---

## 📊 Module Status Summary

| Module | Backend | Frontend | Offline | Status |
|--------|---------|----------|---------|--------|
| Work Sites | ✅ | ✅ | ✅ | Ready |
| Employees | ✅ | ✅ | ✅ | Ready |
| Vehicles | ✅ | ✅ | ✅ | Ready |
| Daily Assignments | ✅ | ✅ | ❌ | Ready |
| Suppliers | ✅ | ✅ | ✅ | **NEW** |
| Stock | ✅ | ✅ | ⚠️ | **NEW** |
| Fuel Costs | ✅ | ✅ | N/A | **FIXED** |

**Legend:**
- ✅ = Fully implemented
- ⚠️ = Works but could be improved
- ❌ = Not implemented
- N/A = Not applicable

---

## 🚀 Ready to Test?

Run these commands in **separate terminals**:

```bash
# Terminal 1 - Backend
cd "c:\Users\itsme\Desktop\PWA\BEnestjs-main"
npm run start:dev

# Terminal 2 - Frontend
cd "c:\Users\itsme\Desktop\PWA\FEnextjs-main"
npm run dev
```

Then open http://localhost:3000 and start testing! 🎉
