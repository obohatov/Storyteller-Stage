import { type ReactNode, lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Redirect,
  Router as WouterRouter,
} from 'wouter';

import { SplitScreenHome } from '@/pages/SplitScreenHome';
import { PlaysListPage } from '@/pages/PlaysListPage';
import { PlayDetailPage } from '@/pages/PlayDetailPage';
import { TalesListPage } from '@/pages/TalesListPage';
import { TaleDetailPage } from '@/pages/TaleDetailPage';
import { AboutPage } from '@/pages/AboutPage';
import { ContactPage } from '@/pages/ContactPage';

import { AdminLayout } from '@/admin/AdminLayout';
const AdminDashboard = lazy(() => import('@/admin/AdminDashboard'));
const AdminFairyTalesList = lazy(() => import('@/admin/AdminFairyTalesList'));
const AdminFairyTaleEdit = lazy(() => import('@/admin/AdminFairyTaleEdit'));
const AdminPlaysList = lazy(() => import('@/admin/AdminPlaysList'));
const AdminPlayEdit = lazy(() => import('@/admin/AdminPlayEdit'));
const AdminAbout = lazy(() => import('@/admin/AdminAbout'));
const AdminMessages = lazy(() => import('@/admin/AdminMessages'));
const AdminMessageDetail = lazy(() => import('@/admin/AdminMessageDetail'));

const queryClient = new QueryClient();

function AdminRoutes() {
  return (
    <AdminLayout>
      <Suspense fallback={<div className="p-8 text-stage-dark/50">Loading...</div>}>
        <Switch>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/fairy-tales" component={AdminFairyTalesList} />
          <Route path="/admin/fairy-tales/:id" component={AdminFairyTaleEdit} />
          <Route path="/admin/plays" component={AdminPlaysList} />
          <Route path="/admin/plays/:id" component={AdminPlayEdit} />
          <Route path="/admin/about" component={AdminAbout} />
          <Route path="/admin/messages/:id" component={AdminMessageDetail} />
          <Route path="/admin/messages" component={AdminMessages} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AdminLayout>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        {/* Admin Routes */}
        <Route path="/admin" nest>
          <AdminRoutes />
        </Route>

        {/* Redirect root to English */}
        <Route path="/">
          <Redirect to="/en" />
        </Route>

        <Route path="/:locale" component={SplitScreenHome} />
        
        <Route path="/:locale/plays" component={PlaysListPage} />
        <Route path="/:locale/plays/:slug" component={PlayDetailPage} />
        
        <Route path="/:locale/fairy-tales" component={TalesListPage} />
        <Route path="/:locale/fairy-tales/:slug" component={TaleDetailPage} />
        
        <Route path="/:locale/about" component={AboutPage} />
        <Route path="/:locale/contact" component={ContactPage} />

        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
