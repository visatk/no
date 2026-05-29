import { Routes, Route, Link, Outlet } from 'react-router-dom';
import { ShoppingCart, LayoutTemplate, Shield } from 'lucide-react';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import TemplateDetails from './pages/TemplateDetails';
import AdminDashboard from './pages/AdminDashboard';

function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-8 h-8 text-violet-500" />
              <Link to="/" className="font-bold text-xl tracking-tight text-white">
                Gravity<span className="text-violet-500">Templates</span>
              </Link>
            </div>
            <div className="flex gap-6 items-center">
              <Link to="/marketplace" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Marketplace
              </Link>
              <Link to="/admin" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1">
                <Shield className="w-4 h-4" /> Admin
              </Link>
              <button className="btn-primary text-sm py-2 px-4 rounded-full flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Cart (0)
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="border-t border-white/10 mt-auto py-8 text-center text-slate-400 text-sm">
        <p>&copy; 2026 GravityTemplates. Built with Cloudflare Workers & React.</p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="marketplace" element={<Marketplace />} />
        <Route path="template/:id" element={<TemplateDetails />} />
        <Route path="admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
