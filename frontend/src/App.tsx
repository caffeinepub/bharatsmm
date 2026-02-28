import React from 'react';
import {
  createRouter,
  createRoute,
  createRootRoute,
  RouterProvider,
  Outlet,
} from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import ProfileSetupModal from './components/ProfileSetupModal';
import Dashboard from './pages/Dashboard';
import NewOrder from './pages/NewOrder';
import Orders from './pages/Orders';
import Services from './pages/Services';
import AddFunds from './pages/AddFunds';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';

// Root layout with auth gate
function RootLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/assets/generated/bharatsmm-logo.dim_256x256.png"
            alt="BharatSMM"
            className="w-16 h-16 rounded-2xl object-cover animate-pulse"
          />
          <p className="text-muted-foreground text-sm">Loading BharatSMM...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <Layout />
      <ProfileSetupModal open={showProfileSetup} />
    </>
  );
}

// Route definitions
const rootRoute = createRootRoute({
  component: RootLayout,
});

const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: () => <Outlet />,
});

const dashboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: Dashboard,
});

const newOrderRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/new-order',
  component: NewOrder,
});

const ordersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/orders',
  component: Orders,
});

const servicesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/services',
  component: Services,
});

const addFundsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/add-funds',
  component: AddFunds,
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/profile',
  component: Profile,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    dashboardRoute,
    newOrderRoute,
    ordersRoute,
    servicesRoute,
    addFundsRoute,
    profileRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
