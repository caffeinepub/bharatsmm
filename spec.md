# Specification

## Summary
**Goal:** Build BharatSMM, a full Social Media Marketing (SMM) panel with a Motoko backend and a multi-page React frontend.

**Planned changes:**
- Create a single Motoko actor (`backend/main.mo`) managing a services catalog, user orders, and user balances with query/update functions for listing services, placing orders, checking order status, and topping up balance.
- Seed the backend with at least 15 SMM services across Instagram, YouTube, Twitter/X, Facebook, TikTok, and Telegram categories (each with name, category, price per 1000, min/max order quantity).
- Build a React frontend with a persistent sidebar layout and pages: Dashboard (balance summary, recent orders, quick-order shortcut), New Order (category selector, service dropdown, link input, quantity input, real-time total calculator, submit), Orders (paginated table with colored status badges), Services (read-only catalog grouped by category), Add Funds (balance display + top-up form), and Profile (shows user principal).
- Apply a dark navy/charcoal global theme (`#0f172a` / `#1e293b`) with orange-red accents (`#f97316` / `#ef4444`), white card surfaces, clean sans-serif typography, and consistent status badge colors (Pending = yellow, Processing = blue, Completed = green, Cancelled = red).
- Display the BharatSMM logo in the sidebar header loaded from the static assets path.
- Fetch all data from the backend canister via React Query hooks; all forms show loading and error states.
- Sidebar is persistent on desktop and collapsible on mobile.

**User-visible outcome:** Users can visit the BharatSMM panel, browse available SMM services, place orders, track order status, add funds to their balance, and view their profile — all within a polished dark-themed dashboard.
