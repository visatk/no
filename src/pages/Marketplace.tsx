import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Template {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function Marketplace() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/templates')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setTemplates(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-8">Marketplace</h1>
      
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-20 text-slate-400 glass-card">
          <p>No templates available yet. Check back later!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map(t => (
            <div key={t.id} className="glass-card overflow-hidden group">
              <div className="aspect-video overflow-hidden">
                <img 
                  src={t.imageUrl} 
                  alt={t.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{t.title}</h3>
                <p className="text-slate-400 text-sm mb-4 line-clamp-2">{t.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">${(t.price / 100).toFixed(2)}</span>
                  <Link to={`/template/${t.id}`} className="btn-secondary text-sm">
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
