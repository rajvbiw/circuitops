import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetail, clearProductDetail } from '../store/productsSlice';
import { addToCart } from '../store/cartSlice';
import { setChatOpen } from '../store/uiSlice';
import { Star, ShieldAlert, BadgeInfo, ShoppingCart, Bot, Sparkles, MessageCirclePlus, Award } from 'lucide-react';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

function ProductDetail() {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { currentProduct, relatedProducts, detailLoading, error } = useSelector((state) => state.products);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('specs'); // specs vs reviews
  
  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  useEffect(() => {
    dispatch(fetchProductDetail(slug));
    return () => {
      dispatch(clearProductDetail());
    };
  }, [slug, dispatch]);

  if (detailLoading) {
    return <div className="text-center text-gada-textMuted py-32">Loading product showroom catalog details...</div>;
  }

  if (error || !currentProduct) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-gada-cardBg rounded-2xl border border-gada-cardBorder mt-10 p-6 space-y-4">
        <h2 className="text-xl font-bold text-gada-danger">Appliance/Product Not Found</h2>
        <p className="text-sm text-gada-textMuted">This product may have been restocked or discontinued. Please check other categories, Ji.</p>
        <Link to="/products" className="inline-block bg-gada-accent text-gada-dark px-6 py-2.5 rounded-full font-bold text-xs">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const price = parseFloat(currentProduct.price);
  const discountPrice = currentProduct.discount_price ? parseFloat(currentProduct.discount_price) : null;
  const hasDiscount = discountPrice !== null;
  const finalPrice = hasDiscount ? discountPrice : price;
  const isOutOfStock = currentProduct.stock_quantity <= 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to add items to your cart.');
      return;
    }
    
    setAdding(true);
    try {
      await dispatch(addToCart({ productId: currentProduct.id, quantity: qty })).unwrap();
      alert(`Added ${qty} unit(s) of ${currentProduct.name} to cart.`);
    } catch (err) {
      alert(err || 'Failed to add item to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleAISummarize = () => {
    dispatch(setChatOpen(true));
    // Simulate sending message to chat
    setTimeout(() => {
      const chatInput = document.querySelector('input[placeholder*="Ask about ACs"]');
      if (chatInput) {
        // Set input value and click send trigger (handled dynamically inside chat drawer state)
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        nativeInputValueSetter.call(chatInput, `Summarize the specifications and features of ${currentProduct.name}`);
        chatInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        // Find send button and click
        const sendBtn = chatInput.nextSibling;
        if (sendBtn) sendBtn.click();
      }
    }, 400);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');
    setSubmittingReview(true);

    try {
      const response = await api.post('/products/review', {
        productId: currentProduct.id,
        rating,
        comment
      });
      setReviewSuccess(response.data.message || 'Review posted successfully!');
      setComment('');
      // Reload product details to show new review
      dispatch(fetchProductDetail(slug));
    } catch (err) {
      setReviewError(err.response?.data?.message || 'You must purchase this product from Gada Electronics to leave a review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      
      {/* Back to catalog */}
      <div>
        <Link to="/products" className="text-xs font-bold text-gada-accent hover:underline">
          &larr; Back to Showroom Catalog
        </Link>
      </div>

      {/* Main Details layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* Left Col: Image */}
        <div className="space-y-4">
          <div className="glass-card border border-gada-cardBorder rounded-3xl overflow-hidden aspect-video relative">
            {hasDiscount && (
              <span className="absolute top-4 left-4 bg-gada-accent text-gada-dark font-extrabold px-3 py-1.5 rounded-full text-xs shadow-md">
                ON SALE
              </span>
            )}
            <img 
              src={currentProduct.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=500'} 
              alt={currentProduct.name}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex gap-2.5 items-center justify-center bg-gada-cardBg/40 border border-gada-cardBorder p-4 rounded-2xl text-xs text-gada-textMuted">
            <Award className="w-4 h-4 text-gada-accent" />
            <span>Official Gada Warranty Seal • ISO-Certified Appliance</span>
          </div>
        </div>

        {/* Right Col: Details */}
        <div className="space-y-6">
          <span className="bg-gada-bg border border-gada-cardBorder text-gada-accent text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
            {currentProduct.category_name}
          </span>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gada-textLight">{currentProduct.name}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex text-yellow-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.round(currentProduct.avg_rating) ? 'fill-current' : 'text-gada-cardBorder'}`} 
                />
              ))}
            </div>
            <span className="text-sm font-bold text-gada-textLight">{currentProduct.avg_rating} Stars</span>
            <span className="text-xs text-gada-textMuted">({currentProduct.review_count} customer reviews)</span>
          </div>

          {/* Pricing */}
          <div className="p-5 bg-gada-cardBg rounded-2xl border border-gada-cardBorder flex items-center justify-between">
            <div>
              <p className="text-xs text-gada-textMuted">Gada Showroom Price</p>
              <div className="flex items-baseline gap-2 mt-1">
                {hasDiscount ? (
                  <>
                    <span className="text-3xl font-black text-gada-accent">
                      ₹{discountPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-sm text-gada-textMuted line-through">
                      ₹{price.toLocaleString('en-IN')}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-gada-textLight">
                    ₹{price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {/* AI Summary shortcut */}
            <button
              onClick={handleAISummarize}
              className="flex items-center gap-2 bg-gradient-to-r from-gada-accent to-yellow-500 hover:opacity-90 text-gada-dark font-extrabold px-4.5 py-2.5 rounded-xl shadow-lg text-xs tracking-wide"
            >
              <Bot className="w-4 h-4" />
              <span>AI Summary</span>
            </button>
          </div>

          {/* Stock description */}
          <div className="flex items-center gap-2.5 text-sm">
            {isOutOfStock ? (
              <span className="text-gada-danger font-bold flex items-center gap-1">
                <ShieldAlert className="w-4 h-4" /> Out of stock (Restocking soon)
              </span>
            ) : (
              <span className="text-gada-success font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gada-success animate-ping"></span>
                In Stock ({currentProduct.stock_quantity} units available)
              </span>
            )}

            {currentProduct.inventory?.bin_location && (
              <span className="text-xs text-gada-textMuted border border-gada-cardBorder px-2.5 py-0.5 rounded-full">
                Bin Location: {currentProduct.inventory.bin_location}
              </span>
            )}
          </div>

          {/* Add to Cart form */}
          {!isOutOfStock && (
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center bg-gada-cardBg border border-gada-cardBorder rounded-xl overflow-hidden">
                <button 
                  onClick={() => setQty(q => Math.max(1, q - 1))}
                  className="px-4 py-2 text-gada-textLight hover:bg-gada-bg"
                >
                  -
                </button>
                <span className="px-4 font-bold text-sm text-gada-textLight">{qty}</span>
                <button 
                  onClick={() => setQty(q => Math.min(currentProduct.stock_quantity, q + 1))}
                  className="px-4 py-2 text-gada-textLight hover:bg-gada-bg"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="flex-1 bg-gada-accent hover:bg-gada-accentHover text-gada-dark font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-gada-accent/15 transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Tabs: Specifications & Reviews */}
      <div className="glass-card border border-gada-cardBorder rounded-3xl overflow-hidden mt-10">
        <div className="flex border-b border-gada-cardBorder bg-gada-cardBg/60">
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'specs' 
                ? 'border-gada-accent text-gada-accent bg-gada-dark/20' 
                : 'border-transparent text-gada-textMuted hover:text-gada-textLight'
            }`}
          >
            Product Overview
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-4 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'reviews' 
                ? 'border-gada-accent text-gada-accent bg-gada-dark/20' 
                : 'border-transparent text-gada-textMuted hover:text-gada-textLight'
            }`}
          >
            Showroom Reviews ({currentProduct.reviews?.length || 0})
          </button>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'specs' ? (
            <div className="space-y-4">
              <h3 className="font-extrabold text-base text-gada-textLight uppercase tracking-wider mb-2">Specifications</h3>
              <p className="text-sm text-gada-textMuted leading-relaxed">
                {currentProduct.description}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-gada-bg/50 border border-gada-cardBorder p-4 rounded-xl">
                  <span className="text-[10px] text-gada-textMuted uppercase block">Energy efficiency</span>
                  <span className="text-xs font-bold text-gada-accent">5-Star Inverter Rating</span>
                </div>
                <div className="bg-gada-bg/50 border border-gada-cardBorder p-4 rounded-xl">
                  <span className="text-[10px] text-gada-textMuted uppercase block">Service Warranty</span>
                  <span className="text-xs font-bold text-gada-accent">1 Year Local Showroom</span>
                </div>
                <div className="bg-gada-bg/50 border border-gada-cardBorder p-4 rounded-xl">
                  <span className="text-[10px] text-gada-textMuted uppercase block">Volts Range</span>
                  <span className="text-xs font-bold text-gada-accent">220V - 240V AC</span>
                </div>
                <div className="bg-gada-bg/50 border border-gada-cardBorder p-4 rounded-xl">
                  <span className="text-[10px] text-gada-textMuted uppercase block">Brand Tier</span>
                  <span className="text-xs font-bold text-gada-accent">Premium Store Build</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              
              {/* Write Review Form */}
              {isAuthenticated ? (
                <form onSubmit={submitReview} className="bg-gada-bg/30 p-5 rounded-2xl border border-gada-cardBorder space-y-4">
                  <h4 className="font-extrabold text-sm text-gada-textLight flex items-center gap-1.5">
                    <MessageCirclePlus className="w-4 h-4 text-gada-accent" /> Leave Showroom Review
                  </h4>

                  {reviewError && <p className="text-xs text-gada-danger font-medium">{reviewError}</p>}
                  {reviewSuccess && <p className="text-xs text-gada-success font-medium">{reviewSuccess}</p>}

                  <div className="flex items-center gap-4">
                    <label className="text-xs font-bold text-gada-textMuted">Star Rating:</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(parseInt(e.target.value))}
                      className="bg-gada-dark border border-gada-cardBorder text-gada-textLight text-xs rounded-lg p-1.5 focus:outline-none"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 - Best)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                      <option value={3}>⭐⭐⭐ (3 - Average)</option>
                      <option value={2}>⭐⭐ (2 - Poor)</option>
                      <option value={1}>⭐ (1 - Terrible)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gada-textMuted">Comment:</label>
                    <textarea
                      placeholder="Share your experience using this product. Minimum length 3 characters..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      rows={3}
                      className="w-full bg-gada-dark text-sm text-gada-textLight border border-gada-cardBorder rounded-xl p-3 focus:outline-none focus:border-gada-accent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-gada-accent hover:bg-gada-accentHover text-gada-dark font-bold px-6 py-2 rounded-xl text-xs"
                  >
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="bg-gada-bg/30 p-4 rounded-xl border border-gada-cardBorder text-xs text-gada-textMuted text-center">
                  Please <Link to="/login" className="text-gada-accent underline">sign in</Link> and buy this item to write reviews.
                </div>
              )}

              {/* Reviews List */}
              <div className="space-y-4">
                {currentProduct.reviews?.length === 0 ? (
                  <p className="text-xs text-gada-textMuted">No reviews have been written for this product yet, Ji.</p>
                ) : (
                  currentProduct.reviews?.map((r) => (
                    <div key={r.id} className="border-b border-gada-cardBorder pb-4 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-sm text-gada-textLight">{r.user_name}</p>
                          <div className="flex text-yellow-400 mt-1">
                            {Array.from({ length: r.rating }).map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-current" />
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-gada-textMuted">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gada-textMuted mt-2.5 italic">"{r.comment}"</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts?.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-gada-cardBorder">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-gada-accent" />
            <h2 className="text-2xl font-extrabold text-gada-textLight">Suggested Related Products</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default ProductDetail;
