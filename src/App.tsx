import { useEffect } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { CategoryPage } from '@/pages/CategoryPage';
import { Checkout } from '@/pages/Checkout';
import { Home } from '@/pages/Home';
import { ProductDetail } from '@/pages/ProductDetail';
import { AdminCustomers } from '@/pages/admin/Customers';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminOrders } from '@/pages/admin/Orders';
import { AdminProductForm } from '@/pages/admin/ProductForm';
import { AdminProductDetail } from '@/pages/admin/ProductDetail';
import { getToken } from '@/lib/api';
import { useAuth } from '@/stores/auth';
import { AdminProducts } from '@/pages/admin/Products';
import { AdminSettings } from '@/pages/admin/Settings';

/** Kembalikan scroll ke atas setiap pindah halaman. */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * Routing toko (path dibuat identik dengan rencana Laravel + Inertia
 * agar migrasi mudah): / -> Home, /wanita /pria /anak /terbaru,
 * /produk/:slug, /checkout. Drawer cart tersedia di semua halaman toko.
 * Setiap pindah halaman dibungkus fade-in halus (.animate-page).
 *
 * Area admin (/admin/*) memakai chrome sendiri (sidebar AdminLayout),
 * sehingga Navbar/Footer toko disembunyikan di sana.
 */
export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Shell />
      <CartDrawer />
    </BrowserRouter>
  );
}

/** Pilih chrome toko vs admin berdasar awalan path. */
function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return <AdminShell pathname={pathname} />;
  }

  return (
    <>
      <Navbar />
      <AnimatedRoutes />
      <Footer />
    </>
  );
}

/**
 * Area admin terproteksi token Sanctum: tanpa sesi valid, selain halaman
 * login, selalu dialihkan ke /admin/login.
 */
function AdminShell({ pathname }: { pathname: string }) {
  const admin = useAuth((s) => s.admin);
  const ready = useAuth((s) => s.ready);
  const authed = admin !== null && getToken() !== null;

  if (!ready) return null;
  if (pathname !== '/admin/login' && !authed) {
    return <Navigate to="/admin/login" replace />;
  }
  if (pathname === '/admin/login' && authed) {
    return <Navigate to="/admin" replace />;
  }
    return (
      <div key={pathname} className="animate-page">
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/produk" element={<AdminProducts />} />
          <Route path="/admin/produk/baru" element={<AdminProductForm />} />
          <Route path="/admin/produk/:id" element={<AdminProductDetail />} />
          <Route path="/admin/produk/:id/ubah" element={<AdminProductForm />} />
          <Route path="/admin/pesanan" element={<AdminOrders />} />
          <Route path="/admin/pelanggan" element={<AdminCustomers />} />
          <Route path="/admin/pengaturan" element={<AdminSettings />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </div>
    );
}

/** Routes toko + animasi fade tiap pathname berubah. */
function AnimatedRoutes() {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="animate-page">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wanita" element={<CategoryPage page="wanita" />} />
        <Route path="/pria" element={<CategoryPage page="pria" />} />
        <Route path="/anak" element={<CategoryPage page="anak" />} />
        <Route path="/terbaru" element={<CategoryPage page="terbaru" />} />
        <Route path="/produk/:slug" element={<ProductDetail />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
