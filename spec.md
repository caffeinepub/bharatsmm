# Specification

## Summary
**Goal:** Add an admin-only "Add Balance" capability that allows the admin to directly credit any user's wallet balance from the Admin Dashboard.

**Planned changes:**
- Add a backend Motoko function `addBalanceToUser(userId: Principal, amount: Nat)` in `backend/main.mo` that is restricted to the admin principal and credits the specified amount to the target user's balance
- Add a `useAddBalanceToUser` TanStack Query mutation hook in `frontend/src/hooks/useQueries.ts` that calls the backend function and invalidates relevant balance/user queries on success
- Add an "Add Balance" section to the existing Admin Dashboard page (`frontend/src/pages/AdminDashboard.tsx`) with a principal input, an INR amount input, and a submit button that shows success or error toasts, styled with the existing dark navy/orange-red theme

**User-visible outcome:** The admin can open the Admin Dashboard, enter a user's principal and an INR amount, click "Add Balance", and have that balance instantly credited to the user's account with a confirmation toast.
