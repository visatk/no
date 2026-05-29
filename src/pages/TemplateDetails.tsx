import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ExternalLink, CheckCircle } from 'lucide-react';

interface Template {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  demoUrl: string;
}

export default function TemplateDetails() {
  const { id } = useParams<{ id: string }>();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/templates/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setTemplate(data);
        setLoading(false);
      });
  }, [id]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setPurchasing(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: id, email })
      });
      const data = await res.json();
      if (data.invoiceUrl) {
        setInvoiceUrl(data.invoiceUrl);
      } else {
        alert('Failed to generate invoice');
      }
    } catch (err) {
      console.error(err);
      alert('Error creating order');
    }
    setPurchasing(false);
  };

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!template) {
    return <div className="text-center py-20">Template not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <div className="glass-card overflow-hidden p-2">
            <img src={template.imageUrl} alt={template.title} className="w-full rounded-lg" />
          </div>
          <div className="mt-8 flex gap-4">
            <a href={template.demoUrl} target="_blank" rel="noreferrer" className="btn-secondary flex-1 flex justify-center items-center gap-2">
              Live Demo <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-extrabold mb-4">{template.title}</h1>
          <p className="text-xl text-slate-300 mb-8">{template.description}</p>
          
          <div className="glass-card p-8">
            <div className="text-4xl font-bold mb-6">${(template.price / 100).toFixed(2)}</div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-slate-300"><CheckCircle className="w-5 h-5 text-violet-500" /> Full source code</li>
              <li className="flex items-center gap-2 text-slate-300"><CheckCircle className="w-5 h-5 text-violet-500" /> Lifetime updates</li>
              <li className="flex items-center gap-2 text-slate-300"><CheckCircle className="w-5 h-5 text-violet-500" /> Premium support</li>
            </ul>

            {invoiceUrl ? (
              <div className="text-center p-4 border border-green-500/30 bg-green-500/10 rounded-xl">
                <p className="text-green-400 font-bold mb-4">Invoice Generated!</p>
                <a href={invoiceUrl} target="_blank" rel="noreferrer" className="btn-primary w-full block">
                  Proceed to Payment (Apirone)
                </a>
              </div>
            ) : (
              <form onSubmit={handlePurchase} className="flex flex-col gap-4">
                <input 
                  type="email" 
                  required 
                  placeholder="Enter your email to purchase" 
                  className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-violet-500 text-white w-full"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
                <button type="submit" disabled={purchasing} className="btn-primary w-full">
                  {purchasing ? 'Processing...' : 'Buy Now with Crypto'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
