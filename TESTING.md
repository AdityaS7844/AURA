# AURA — Comprehensive Manual Testing Guide

This document provides a complete, step-by-step verification checklist for manual testing of the AURA application across all milestones.

---

## Prerequisites Before Testing

1. **Start Backend Server**:
   ```bash
   cd c:\AURA\backend
   .\venv\Scripts\uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```
   *Verify backend is live at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).*

2. **Start Frontend Server**:
   ```bash
   cd c:\AURA\frontend
   npm run dev
   ```
   *Open [http://127.0.0.1:5173](http://127.0.0.1:5173).*

3. **Verify Seed Data**:
   ```bash
   cd c:\AURA\backend
   .\venv\Scripts\python.exe scripts/seed.py
   ```
   *Confirmed: Demo user (`demo@wardrobe.com` / `demo12345`) has 26 seeded clothes, preferences for Mumbai, and sample styling records.*

---

## Test Suite 1: Landing Page & 1-Click Demo Login (Milestones 0, 1, 10)

- [ ] **1.1 Public Landing Page**
  - Open an Incognito/Private browser window and navigate to `http://127.0.0.1:5173/`.
  - **Expected**: The landing page displays the AURA hero section, headline *"Never wonder what to wear again"*, 4 feature capability cards, and the integrated Sign In card on the right.
- [ ] **1.2 1-Click Demo Login**
  - Click the **"1-Click Demo Login"** button in the header or on the hero panel.
  - **Expected**: You are instantly logged in as `Demo Stylist` and redirected to `/` (Dashboard).
- [ ] **1.3 Manual Form Validation**
  - Log out via the sidebar. On the landing page, switch to **"Create Account"**. Try submitting an 8-character invalid password.
  - **Expected**: Clear validation error appears without page refresh.

---

## Test Suite 2: Wardrobe Catalog & Management (Milestones 3, 4, 5)

- [ ] **2.1 Browse Wardrobe Grid**
  - Click **"My Wardrobe"** in the sidebar (`/wardrobe`).
  - **Expected**: Displays 26 seeded items with images/icons, category tags, color swatches, formality ratings, and wear count badges.
- [ ] **2.2 Category & Attribute Filtering**
  - Click the category filter pills: `Tops` (7 items), `Bottoms` (5 items), `Footwear` (4 items), `Outerwear` (4 items), `Dresses` (3 items), `Accessories` (3 items).
  - Select a formality filter or season filter.
  - **Expected**: Grid filters instantly in real-time.
- [ ] **2.3 Item Detail View**
  - Click on any clothing item card (e.g. `Classic White Oxford Shirt`).
  - **Expected**: Navigates to `/wardrobe/:id` displaying high-res card, fabric, warmth rating, occasions, wear frequency, and last worn date.
- [ ] **2.4 Add New Item**
  - Click **"+ Add Item"** (`/wardrobe/add`).
  - Fill in Name: `Test Linen Blazer`, Category: `Outerwear`, Color: `Beige`, Formality: `4`, Occasions: `Office, Formal`.
  - Submit form.
  - **Expected**: Success message appears, item is persisted to SQLite, and redirected to wardrobe list.
- [ ] **2.5 Delete Item**
  - Click on `Test Linen Blazer` -> Click **Delete Item** -> Confirm deletion modal.
  - **Expected**: Item is safely removed from database and user is redirected to wardrobe.

---

## Test Suite 3: Weather Intelligence (Milestone 5)

- [ ] **3.1 Live Weather Card**
  - View the Dashboard or AI Stylist page.
  - **Expected**: Real-time temperature, weather icon, condition description (e.g. "Sunny", "Partly cloudy"), and temperature class tag (`warm`, `hot`, `mild`, `cool`) are displayed for Mumbai via Open-Meteo.
- [ ] **3.2 Weather Adaptation in Stylist**
  - Navigate to **"AI Stylist"** (`/stylist`).
  - Click **"Change / Override"** on the weather card.
  - Type `12` °C (cold) to simulate winter conditions.
  - **Expected**: AI Stylist displays the manual override badge and adapts prompt generation to cold-weather layering.

---

## Test Suite 4: Google Gemini AI Stylist (Milestones 6, 7)

- [ ] **4.1 Occasion Selection**
  - On `/stylist`, choose from the 8 occasion tiles: `Casual`, `Office`, `Formal`, `Party`, `Date`, `Sports`, `Travel`, `Festival`.
  - Select `Office`.
- [ ] **4.2 Anchor Item Picker**
  - Click **"Select Anchor Item"**.
  - A modal opens showing your wardrobe tops and bottoms.
  - Select `Classic White Oxford Shirt`. Click **"Confirm Anchor"**.
  - **Expected**: The anchor card shows "Locked Anchor Item: Classic White Oxford Shirt".
- [ ] **4.3 Outfit Recommendation Generation**
  - Click **"Generate Outfits with AI"**.
  - **Expected**:
    - Animated loading skeleton appears (*"Gemini is reviewing your wardrobe..."*).
    - Returns 3-4 styled outfit combinations.
    - Every outfit contains **only real clothing items** from your wardrobe.
    - The anchor item is strictly present in every combination.
    - Each outfit card displays occasion tag, match score, styling reason, and an item thumbnail collage.
- [ ] **4.4 Outfit Breakdown Modal**
  - Click **"View Details"** on any outfit card.
  - **Expected**: Modal displays high-resolution collage and full breakdown of each individual garment.

---

## Test Suite 5: Feedback & Wear Tracking (Milestone 8)

- [ ] **5.1 Like & Dislike Exclusivity**
  - On an outfit card, click the **Thumbs Up (Like)** button.
  - **Expected**: Card updates to liked state (highlighted in purple).
  - Click **Thumbs Down (Dislike)**.
  - **Expected**: The Like is automatically cleared, and Dislike becomes active (mutual exclusivity).
  - Clicking Dislike again toggles it off.
- [ ] **5.2 Save & Unsave Outfits**
  - Click the **Bookmark (Save)** icon.
  - Navigate to **"Saved Outfits"** (`/saved`).
  - **Expected**: The saved outfit appears in the **"Saved Outfits"** tab.
  - Unsaving removes it from the saved list.
- [ ] **5.3 Mark as Worn Tracking**
  - On any outfit card (or in the calendar planner), click **"I Wore This"**.
  - **Expected**: Visual feedback confirmation appears (*"Marked as Worn!"*).
  - Navigate to **"Wardrobe"** or **"Insights"**.
  - **Expected**: The `times_worn` count for every clothing item in that outfit has increased by 1, and `last_worn` is set to today's date.

---

## Test Suite 6: Outfit Calendar Planner (Milestone 10)

- [ ] **6.1 Weekly Calendar View**
  - Click **"Outfit Planner"** in the sidebar (`/planner`).
  - **Expected**: Shows 7 day columns (Monday through Sunday) for the current week, with the current date highlighted with a **"Today"** badge.
- [ ] **6.2 Schedule Outfit to Date**
  - Click **"+ Plan Outfit"** on any day (e.g. Wednesday).
  - A modal opens showing your styled/saved outfits.
  - Select an outfit, enter a note: *"Client Presentation"*, and click **"Save to Calendar"**.
  - **Expected**: The outfit card with thumbnail collage, occasion badge, and note appears immediately in that day's column.
- [ ] **6.3 Duplicate Protection**
  - Schedule the same outfit again on that same day with note: *"Updated Meeting"*.
  - **Expected**: The note updates in-place without creating a duplicate record.
- [ ] **6.4 Unschedule Outfit**
  - Click the trash/remove icon on a scheduled card.
  - **Expected**: The entry is removed from the calendar.

---

## Test Suite 7: Wardrobe Insights & Analytics (Milestone 9)

- [ ] **7.1 KPI Analytics**
  - Click **"Insights"** in the sidebar (`/insights`).
  - **Expected**:
    - **Wardrobe Utilization %** matches `(worn items / total items) * 100`.
    - Total clothes count matches SQLite wardrobe.
    - Saved outfits and total styled counts match database.
- [ ] **7.2 Category Distribution**
  - **Expected**: Visual color-coded progress bars show exact percentages for Tops, Bottoms, Dresses, Outerwear, Footwear, and Accessories.
- [ ] **7.3 Most Worn vs. Forgotten Gems**
  - **Most Worn**: Shows ranked list of pieces with wear count badges.
  - **Forgotten Gems**: Shows pieces with 0 wears.
- [ ] **7.4 "Style It" Quick Action**
  - Click the **"Style It"** button next to a Forgotten Gem item.
  - **Expected**: Automatically navigates to AI Stylist with that forgotten piece pre-selected as the anchor item!

---

## Test Suite 8: Profile & Settings (Milestones 2, 10)

- [ ] **8.1 Update Display Name**
  - Click **"Profile & Settings"** (`/profile`).
  - Change display name to `Alex Morgan` and click **"Update Name"**.
  - **Expected**: Success banner appears; user name in sidebar and header updates immediately.
- [ ] **8.2 Change Password**
  - Enter current password `demo12345` and a new password (min 8 chars).
  - **Expected**: Password is updated in SQLite.
- [ ] **8.3 Delete Account Modal**
  - Scroll down to the **Danger Zone**.
  - Click **"Delete Account"**.
  - **Expected**: Confirmation modal opens with explicit warnings. Clicking Cancel safely dismisses it.

---

## Test Suite 9: Error Handling & 404 Route (Milestone 10)

- [ ] **9.1 404 Not Found Page**
  - Enter a non-existent URL: `http://127.0.0.1:5173/some-random-route`.
  - **Expected**: Displays the AURA 404 page with navigation shortcuts back to Dashboard and Wardrobe.
- [ ] **9.2 Error Boundary**
  - In case of any unhandled component exceptions, the top-level Error Boundary catches the error and presents a "Reload" / "Return Home" interface without a white screen.

---

## Test Suite 10: Automated Pytest Suite

Run all backend integration tests:
```bash
cd c:\AURA\backend
.\venv\Scripts\pytest -v
```

**Expected Result**:
```text
======================= 54 passed, 1 warning in ~17s =======================
```
- All tests execute using mock Gemini responses (no live API key or external network needed for CI/CD).
- Strict user isolation and database integrity verified across all 54 test cases.
