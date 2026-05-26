import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { addToCart } from '../store/cartSlice';
import api from '../utils/api';

function ProductCard({ product, wishlistedInitial = false, onWishlistToggle }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [isWishlisted, setIsWishlisted] = useState(wishlistedInitial);
  const [adding, setAdding] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const price = parseFloat(product.price);
  const discountPrice = product.discount_price ? parseFloat(product.discount_price) : null;
  const hasDiscount = discountPrice !== null;
  
  const discountPercent = hasDiscount 
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault(); // prevent navigate to product detail
    if (!isAuthenticated) {
      alert('Please sign in to add items to your cart.');
      return;
    }
    
    setAdding(true);
    setErrorMsg('');
    try {
      await dispatch(addToCart({ productId: product.id, quantity: 1 })).unwrap();
    } catch (err) {
      setErrorMsg(err || 'Failed to add to cart');
      alert(err || 'Stock limit exceeded.');
    } finally {
      setAdding(false);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault(); // prevent navigate to product detail
    if (!isAuthenticated) {
      alert('Please sign in to add items to your wishlist.');
      return;
    }

    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.delete(`/wishlist/${product.id}`);
        setIsWishlisted(false);
        if (onWishlistToggle) onWishlistToggle(product.id, false);
      } else {
        await api.post('/wishlist', { productId: product.id });
        setIsWishlisted(true);
        if (onWishlistToggle) onWishlistToggle(product.id, true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="group glass-card rounded-2xl overflow-hidden border border-gada-cardBorder hover:border-gada-accent/50 transition-all duration-300 flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl hover:shadow-gada-accent/5">
      <Link to={`/products/${product.slug}`} className="relative block overflow-hidden bg-gada-dark aspect-video">
        {/* Discount Sticker */}
        {hasDiscount && (
          <span className="absolute top-3 left-3 bg-gada-accent text-gada-dark text-xs font-extrabold px-2.5 py-1 rounded-full z-10 shadow-md">
            -{discountPercent}% OFF
          </span>
        )}

        {/* Wishlist Heart */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          className="absolute top-3 right-3 p-2 rounded-full bg-gada-dark/80 border border-gada-cardBorder text-gada-textLight hover:text-gada-accent z-10 transition-colors"
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-gada-accent text-gada-accent' : ''}`} />
        </button>

        {/* Image */}
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=300'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Info Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-1 text-xs text-gada-accent mb-2">
            <span className="bg-gada-bg px-2.5 py-0.5 rounded-full border border-gada-cardBorder text-gada-textLight">
              {product.category_name || 'Electronics'}
            </span>
          </div>

          <Link to={`/products/${product.slug}`}>
            <h3 className="font-bold text-base text-gada-textLight group-hover:text-gada-accent transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex text-yellow-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-semibold text-gada-textLight">
              {product.avg_rating ? parseFloat(product.avg_rating).toFixed(1) : '0.0'}
            </span>
            <span className="text-xs text-gada-textMuted">
              ({product.review_count || 0} reviews)
            </span>
          </div>

          <p className="text-xs text-gada-textMuted mt-3 line-clamp-2">
            {product.description}
          </p>
        </div>

        {/* Action / Buy */}
        <div className="mt-5 pt-4 border-t border-gada-cardBorder flex items-center justify-between">
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-lg font-extrabold text-gada-accent">
                  ₹{Number(discountPrice).toLocaleString('en-IN')}
                </span>
                <span className="text-xs text-gada-textMuted line-through">
                  ₹{Number(price).toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="text-lg font-extrabold text-gada-textLight">
                ₹{Number(price).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={adding || product.stock_quantity === 0}
            className={`flex items-center justify-center p-3.5 rounded-xl transition-all duration-300 ${
              product.stock_quantity === 0
                ? 'bg-gada-bg text-gada-textMuted cursor-not-allowed border border-gada-cardBorder'
                : 'bg-gada-bg hover:bg-gada-accent text-gada-textLight hover:text-gada-dark border border-gada-cardBorder hover:border-gada-accent active:scale-95'
            }`}
            title={product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
