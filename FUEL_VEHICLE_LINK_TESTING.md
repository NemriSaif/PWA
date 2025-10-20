# Fuel-Vehicle Link Feature - Testing & Troubleshooting Guide

## 🚨 Issues Fixed

### 1. **Vehicle Dropdown Not Showing Names** ✅
- **Problem**: Empty checkboxes in vehicle dropdown
- **Cause**: Used wrong field name (`immatriculation` instead of `plateNumber`)
- **Fix**: Updated to use correct field names from VehiculeData interface

### 2. **"Unknown Vehicle" After Selection** ✅
- **Problem**: Shows "Unknown Vehicle" even after selecting a valid vehicle
- **Cause**: Field name mismatch in vehicle lookup logic
- **Fix**: Updated lookup to use `plateNumber` instead of `immatriculation`

### 3. **Overlapping Text in Work Site Dropdown** ✅
- **Problem**: Text overlapping/truncating in dropdown button
- **Cause**: NextUI dropdown button not configured for text overflow
- **Fix**: Added proper CSS for text ellipsis and left alignment

### 4. **Fuel Costs Only Show Oct 18-19** ⚠️
- **Problem**: Today's assignments (Oct 20) don't appear in fuel costs page
- **Possible Causes**:
  - IndexedDB cache is stale (most likely)
  - Backend not populating vehicle reference
  - Offline queue not synced yet

## 🧪 Testing Steps

### Step 1: Clear IndexedDB Cache (IMPORTANT!)
Open browser console (F12) and run:
```javascript
// Delete the entire database
indexedDB.deleteDatabase('GMS_Offline_DB');

// Then refresh the page
location.reload();
```

### Step 2: Verify Backend is Populating Vehicle Data
Open browser console and check the API response:
```javascript
fetch('http://localhost:3000/daily-assignment')
  .then(res => res.json())
  .then(data => {
    console.log('All assignments:', data);
    // Check if fuelCosts have vehicule field populated
    const withFuel = data.filter(a => a.fuelCosts?.length > 0);
    console.log('Assignments with fuel costs:', withFuel);
    console.log('Sample fuel cost:', withFuel[0]?.fuelCosts[0]);
  });
```

### Step 3: Create New Assignment with Fuel Cost
1. Navigate to **Daily Assignments** page
2. Click **"+ Add Assignment"**
3. Fill in the details:
   - **Date**: Select today (October 20, 2025)
   - **Work Site**: Select any work site (text should not overlap now)
   - **Step 2**: Optionally assign personnel
   - **Step 3**: Optionally assign vehicles
   - **Step 4 - Fuel Costs**: Click **"+ Add Fuel Cost"**
     - **Description**: "Diesel for excavator"
     - **Vehicle**: Click dropdown - should now show vehicle names like "🚗 Caterpillar 320 - ABC123"
     - **Amount**: 150
     - **Payment Method**: Select payment method
     - **Notes**: Optional
4. Click **"Create Assignment"**

### Step 4: Verify in Fuel Costs Page
1. Navigate to **Fuel Costs** page
2. Check that the new fuel cost appears with:
   - ✅ Today's date (Oct 20)
   - ✅ Vehicle column shows the vehicle name (e.g., "Caterpillar 320")
   - ✅ All other fields populated correctly

### Step 5: Test Without Vehicle
1. Create another assignment with fuel cost
2. In the vehicle dropdown, select **"✖️ None"**
3. Verify it saves and displays **"🚗 Not specified"** in the vehicle column

## 🔍 Troubleshooting

### Problem: Still seeing "Unknown Vehicle"
**Debug Steps**:
1. Open browser console
2. Go to Daily Assignments page
3. Check the `vehicules` array:
   ```javascript
   // In console, when modal is open
   console.log(vehicules);
   ```
4. Verify each vehicle has `_id`, `name`, and `plateNumber` fields

### Problem: Fuel costs from Oct 20 not showing
**Debug Steps**:
1. Clear IndexedDB (see Step 1)
2. Check backend response:
   ```javascript
   fetch('http://localhost:3000/daily-assignment')
     .then(res => res.json())
     .then(data => console.log('Backend data:', data))
   ```
3. Check if offline queue has pending operations:
   ```javascript
   const request = indexedDB.open('GMS_Offline_DB');
   request.onsuccess = (event) => {
     const db = event.target.result;
     const tx = db.transaction(['offlineQueue'], 'readonly');
     const store = tx.objectStore('offlineQueue');
     const getAll = store.getAll();
     getAll.onsuccess = () => {
       console.log('Offline queue:', getAll.result);
     };
   };
   ```

### Problem: Dropdowns still showing overlapping text
**Solution**: Hard refresh the page (Ctrl + Shift + R) to ensure new CSS is loaded

### Problem: Vehicle dropdown empty/not loading
**Possible Causes**:
1. Backend not returning vehicles - check `/vehicule` endpoint
2. Frontend not fetching vehicles - check browser console for errors
3. TypeScript interface mismatch - verify VehiculeData has correct fields

## 📊 Expected Database Structure

### Before (Old fuel cost):
```javascript
{
  description: "Diesel",
  amount: 100,
  paymentMethod: "cash",
  notes: "For truck"
  // No vehicule field
}
```

### After (New fuel cost with vehicle):
```javascript
{
  description: "Diesel",
  amount: 100,
  vehicule: "673f5a1b2c3d4e5f6a7b8c9d", // ObjectId reference
  paymentMethod: "cash",
  notes: "For excavator"
}
```

### When populated by backend:
```javascript
{
  description: "Diesel",
  amount: 100,
  vehicule: {
    _id: "673f5a1b2c3d4e5f6a7b8c9d",
    name: "Caterpillar 320",
    type: "Excavator",
    plateNumber: "ABC123"
  },
  paymentMethod: "cash",
  notes: "For excavator"
}
```

## ✅ Success Criteria

The feature is working correctly when:
1. ✅ Vehicle dropdown shows vehicle names (not empty)
2. ✅ Selected vehicle appears in dropdown button
3. ✅ Fuel costs page shows vehicle column
4. ✅ Vehicle names display correctly (not "Unknown Vehicle")
5. ✅ "None" option works for fuel costs without vehicle
6. ✅ All dates including today (Oct 20) appear in fuel costs
7. ✅ Work site dropdown text doesn't overlap

## 🎯 Quick Fix Checklist

If you're still having issues, run through this checklist:

- [ ] Clear IndexedDB: `indexedDB.deleteDatabase('GMS_Offline_DB')`
- [ ] Hard refresh: Ctrl + Shift + R
- [ ] Verify backend running: http://localhost:3000/daily-assignment
- [ ] Check browser console for errors
- [ ] Verify vehicles exist: http://localhost:3000/vehicule
- [ ] Test creating new assignment with fuel cost
- [ ] Check fuel costs page shows all data

## 🚀 Next Steps After Testing

Once everything works:
1. Commit the changes: `git add . && git commit -m "feat: Add fuel-vehicle link"`
2. Push to GitHub: `git push origin main`
3. Update FEATURE_ANALYSIS.md to mark fuel-vehicle link as complete

---

**Note**: The backend changes require a server restart to take effect. Make sure you've restarted the NestJS backend (already done - running on port 3000).
