import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../store/productsSlice';
import ProductCard from '../components/ProductCard';
import { Sparkles, Tv, Smartphone, Cpu, Laptop, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { toggleChat } from '../store/uiSlice';

function Home() {
  const dispatch = useDispatch();
  const { products, categories, loading } = useSelector((state) => state.products);

  useEffect(() => {
    // Fetch products (default query loads top active products)
    dispatch(fetchProducts({ limit: 8 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  // Filter deals (items that have a discount price)
  const deals = products.filter(p => p.discount_price !== null).slice(0, 4);
  // Filter featured (all or top items)
  const featured = products.slice(0, 6);

  // Map category slugs to icons
  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'smartphones': return <Smartphone className="w-6 h-6" />;
      case 'laptops': return <Laptop className="w-6 h-6" />;
      case 'smart-tvs': return <Tv className="w-6 h-6" />;
      default: return <Cpu className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-16 pb-10">
      
      {/* Hero Banner Section */}
      <div className="relative bg-gradient-to-br from-gada-bg to-gada-dark rounded-3xl overflow-hidden border border-gada-cardBorder p-8 sm:p-16 flex flex-col md:flex-row items-center justify-between gap-8 max-w-7xl mx-auto mt-6 shadow-2xl">
        <div className="flex-1 space-y-6 text-center md:text-left">
          <span className="bg-gada-accent/10 border border-gada-accent/30 text-gada-accent px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            ⚡ Welcome to the Next-Gen Cloud-Native Electronics Hub
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-gada-textLight leading-tight">
            State-of-the-Art <br />
            <span className="text-gada-accent">Cloud-Native AI Marketplace</span>
          </h1>
          <p className="text-gada-textMuted text-base sm:text-lg max-w-lg leading-relaxed">
            Optimize your setup with premium smartphones, laptops, smart TVs, and cloud-ready appliances backed by global express warranties.
          </p>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
            <Link 
              to="/products"
              className="bg-gada-accent hover:bg-gada-accentHover text-gada-dark font-bold px-8 py-3.5 rounded-full text-sm transition-all shadow-lg shadow-gada-accent/20 active:scale-95"
            >
              Shop Electronics
            </Link>
            <button 
              onClick={() => dispatch(toggleChat())}
              className="bg-gada-cardBg hover:bg-gada-cardBg/80 border border-gada-cardBorder text-gada-textLight font-semibold px-6 py-3.5 rounded-full text-sm transition-all"
            >
              Ask CircuitOps AI Assistant
            </button>
          </div>
        </div>

        {/* Hero Banner Graphic */}
        <div className="flex-1 max-w-sm sm:max-w-md w-full relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-gada-accent to-yellow-500 rounded-2xl blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
          <img 
            src="https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=600" 
            alt="Showroom TV Display" 
            className="w-full object-cover rounded-2xl border border-gada-cardBorder shadow-2xl relative"
          />
        </div>
      </div>

      {/* Trust Badges */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 px-4">
        <div className="glass-card p-6 rounded-2xl border border-gada-cardBorder flex items-center gap-4">
          <div className="bg-gada-accent/10 p-3 rounded-full text-gada-accent">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gada-textLight">100% Genuine Brands</h4>
            <p className="text-xs text-gada-textMuted mt-1">Official manufacturer bills & local service warranty cards.</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-gada-cardBorder flex items-center gap-4">
          <div className="bg-gada-accent/10 p-3 rounded-full text-gada-accent">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gada-textLight">Super-Fast Delivery</h4>
            <p className="text-xs text-gada-textMuted mt-1">Delivery within 24 hours globally with express routing.</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-gada-cardBorder flex items-center gap-4">
          <div className="bg-gada-accent/10 p-3 rounded-full text-gada-accent">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-gada-textLight">7-Day Easy Exchange</h4>
            <p className="text-xs text-gada-textMuted mt-1">No-hassle returns and exchanges at our global logistics hubs.</p>
          </div>
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-3 mb-10">
          <h2 className="text-3xl font-extrabold text-gada-textLight tracking-tight">Browse Shop Categories</h2>
          <p className="text-sm text-gada-textMuted max-w-md">Find the perfect appliance or mobile built for modern smart home environments.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link 
              key={cat.id}
              to={`/products?category=${cat.slug}`}
              className="glass-card hover:border-gada-accent/50 p-6 rounded-2xl text-center transition-all flex flex-col items-center justify-center gap-3 active:scale-95 group"
            >
              <div className="bg-gada-bg p-3.5 rounded-xl border border-gada-cardBorder group-hover:text-gada-accent transition-colors">
                {getCategoryIcon(cat.slug)}
              </div>
              <span className="text-xs font-bold text-gada-textLight group-hover:text-gada-accent transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Deals Section */}
      {deals.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 bg-gradient-to-r from-gada-cardBg/40 via-gada-dark to-gada-cardBg/40 py-12 rounded-3xl border border-gada-cardBorder/60">
          <div className="flex items-center justify-between mb-8 px-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gada-accent" />
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gada-textLight">CircuitOps Daily Deals</h2>
            </div>
            <Link to="/products" className="text-xs font-bold text-gada-accent hover:underline flex items-center gap-1">
              View All Deals &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {deals.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-3 mb-10">
          <h2 className="text-3xl font-extrabold text-gada-textLight">Top Trending Products</h2>
          <p className="text-sm text-gada-textMuted max-w-md">Our highest selling, highly rated electronics products this week.</p>
        </div>

        {loading ? (
          <div className="text-center text-gada-textMuted py-20">Loading catalog showroom items...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

export default Home;
