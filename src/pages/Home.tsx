import { Link } from 'react-router-dom';
import { ArrowRight, Star, Zap, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">Templates</span> <br />
          For Next-Gen Apps
        </h1>
        <p className="mt-4 text-xl text-slate-400 max-w-3xl mx-auto mb-10">
          Kickstart your next project with meticulously crafted, responsive, and aesthetic templates built for the modern web.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/marketplace" className="btn-primary flex items-center gap-2">
            Explore Marketplace <ArrowRight className="w-5 h-5" />
          </Link>
          <a href="#features" className="btn-secondary">
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="w-full max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="glass-card p-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center mb-4 text-violet-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
            <p className="text-slate-400">Optimized for speed and performance, powered by modern frameworks like Vite and React.</p>
          </div>
          <div className="glass-card p-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 text-cyan-400">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Premium Design</h3>
            <p className="text-slate-400">Beautiful glassmorphism, modern typography, and smooth micro-animations out of the box.</p>
          </div>
          <div className="glass-card p-8 text-center flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure Payments</h3>
            <p className="text-slate-400">Integrated with Apirone for fast, anonymous, and secure crypto checkouts.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
