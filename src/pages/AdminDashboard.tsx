import { useState, useEffect } from 'react';

// Strict Types
interface Template {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  demoUrl: string;
  fileUrl: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface Order {
  id: string;
  userId: string;
  templateId: string;
  amount: number;
  apironeInvoiceId: string | null;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const [password, setPassword] = useState(localStorage.getItem('admin_pass') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': 'Basic ' + btoa('admin:' + password)
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tplRes, ordRes] = await Promise.all([
        fetch('/api/admin/templates', { headers: getHeaders() }),
        fetch('/api/admin/orders', { headers: getHeaders() })
      ]);

      if (tplRes.status === 401 || ordRes.status === 401) {
        setIsAuthenticated(false);
        setMessage({ text: 'Invalid password', type: 'error' });
      } else if (tplRes.ok && ordRes.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('admin_pass', password);
        const tplData = await tplRes.json();
        const ordData = await ordRes.json();
        if (Array.isArray(tplData)) setTemplates(tplData);
        if (Array.isArray(ordData)) setOrders(ordData);
        setMessage({ text: '', type: '' });
      } else {
        setMessage({ text: 'Failed to fetch data', type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Network error', type: 'error' });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (password) {
      fetchData();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          title, 
          description, 
          price: parseInt(price, 10) * 100 // Minor units 
        })
      });
      if (res.ok) {
        setTitle('');
        setDescription('');
        setPrice('');
        setMessage({ text: 'Template added successfully', type: 'success' });
        fetchData();
      } else {
        const err = await res.json();
        setMessage({ text: err.error || 'Failed to add template', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error', type: 'error' });
    }
  };

  const handleStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/admin/templates/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      fetchData();
    } catch (err) {
      setMessage({ text: 'Failed to update status', type: 'error' });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="glass-card p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
          {message.text && (
            <div className={`p-3 rounded mb-4 text-sm ${message.type === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
              {message.text}
            </div>
          )}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              placeholder="Admin Password" 
              required 
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={() => { localStorage.removeItem('admin_pass'); setIsAuthenticated(false); setPassword(''); }} className="btn-secondary text-sm">
          Logout
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg mb-8 ${message.type === 'error' ? 'bg-red-500/20 border border-red-500/50 text-red-400' : 'bg-green-500/20 border border-green-500/50 text-green-400'}`}>
          {message.text}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Add Template */}
        <div className="lg:col-span-1 glass-card p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Add Template</h2>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <input placeholder="Title" required className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-violet-500 outline-none" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea placeholder="Description" required className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-violet-500 outline-none" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            <input placeholder="Price (USD)" type="number" required className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-violet-500 outline-none" value={price} onChange={e => setPrice(e.target.value)} />
            <button type="submit" className="btn-primary mt-2">Add Template</button>
          </form>
        </div>

        {/* Tables */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Manage Templates</h2>
            {loading ? <p className="text-slate-400 text-sm">Loading...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-300">
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map(t => (
                      <tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4">{t.title}</td>
                        <td className="py-3 px-4">${(t.price / 100).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${t.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2">
                          {t.status === 'pending' && (
                            <button onClick={() => handleStatus(t.id, 'approved')} className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded hover:bg-green-500/30 transition-colors">Approve</button>
                          )}
                          {t.status === 'approved' && (
                            <button onClick={() => handleStatus(t.id, 'pending')} className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded hover:bg-yellow-500/30 transition-colors">Hide</button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {templates.length === 0 && (
                      <tr><td colSpan={4} className="py-4 text-center text-slate-400">No templates found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            {loading ? <p className="text-slate-400 text-sm">Loading...</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-300">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(o => (
                      <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-3 px-4 font-mono text-xs">{o.id.substring(0,8)}...</td>
                        <td className="py-3 px-4">${(o.amount / 100).toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            o.status === 'completed' || o.status === 'paid' ? 'bg-green-500/20 text-green-400' :
                            o.status === 'created' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr><td colSpan={4} className="py-4 text-center text-slate-400">No orders found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
