import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchCart, updateCartQuantity, removeFromCart, selectCartSubtotal } from '../store/cartSlice';
import { Trash2, ArrowRight, ShoppingBag, ShieldCheck, Ticket } from 'lucide-react';
import api from '../utils/api';

function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const subtotal = useSelector(selectCartSubtotal);

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discountAmount }
  const [couponError, setCouponError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  const handleQtyChange = (productId, newQty, stockQty) => {
    if (newQty <= 0) {
      dispatch(removeFromCart(productId));
      return;
    }
    if (newQty > stockQty) {
      alert(`Only ${stockQty} units of this product are in stock at Gada Electronics, Ji.`);
      return;
    }
    dispatch(updateCartQuantity({ productId, quantity: newQty }));
  };

  const handleRemove = (productId) => {
    if (window.confirm('Remove this product from your cart?')) {
      dispatch(removeFromCart(productId));
    }
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');
    setAppliedCoupon(null);

    try {
      const response = await api.post('/orders/coupon/validate', {
        code: couponCode.trim().toUpperCase(),
        cartAmount: subtotal
      });

      setAppliedCoupon({
        code: response.data.couponCode,
        discountAmount: parseFloat(response.data.discountAmount)
      });
      setCouponCode('');
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  const checkoutAmount = appliedCoupon 
    ? Math.max(0, subtotal - appliedCoupon.discountAmount)
    : subtotal;

  const handleProceedToCheckout = () => {
    navigate('/checkout', { 
      state: { 
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        discountAmount: appliedCoupon ? appliedCoupon.discountAmount : 0
      } 
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-gada-cardBg rounded-2xl border border-gada-cardBorder mt-10 p-6 space-y-4">
        <ShoppingBag className="w-12 h-12 text-gada-accent mx-auto" />
        <h2 className="text-xl font-bold text-gada-textLight">Your Cart is Locked</h2>
        <p className="text-sm text-gada-textMuted">Please log in to manage your shopping cart and place orders, Ji.</p>
        <Link to="/login" className="inline-block bg-gada-accent text-gada-dark px-8 py-3 rounded-full font-bold text-sm">
          Login Now
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-gada-cardBg rounded-2xl border border-gada-cardBorder mt-10 p-6 space-y-4">
        <ShoppingBag className="w-12 h-12 text-gada-textMuted mx-auto" />
        <h2 className="text-xl font-bold text-gada-textLight">Your Cart is Empty</h2>
        <p className="text-sm text-gada-textMuted">Aapki cart khali hai! Browse our catalog to find exciting electronics bargains.</p>
        <Link to="/products" className="inline-block bg-gada-accent text-gada-dark px-8 py-3 rounded-full font-bold text-sm">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gada-textLight">Shopping Cart</h1>
        <p className="text-xs text-gada-textMuted mt-1">Verify your products and apply coupon offers before placing orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const hasDiscount = item.discount_price !== null;
            const finalItemPrice = hasDiscount ? parseFloat(item.discount_price) : parseFloat(item.price);
            
            return (
              <div 
                key={item.id} 
                className="glass-card border border-gada-cardBorder p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between hover:border-gada-accent/20 transition-all"
              >
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <img 
                    src={item.image_url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200'} 
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-gada-cardBorder bg-gada-dark"
                  />
                  <div>
                    <Link to={`/products/${item.slug}`} className="font-bold text-sm text-gada-textLight hover:text-gada-accent transition-colors line-clamp-1">
                      {item.name}
                    </Link>
                    <p className="text-xs text-gada-textMuted mt-1">Unit Price: ₹{finalItemPrice.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 border-t sm:border-t-0 border-gada-cardBorder/60 pt-3 sm:pt-0">
                  {/* Quantity adjustment */}
                  <div className="flex items-center bg-gada-dark border border-gada-cardBorder rounded-lg overflow-hidden">
                    <button 
                      onClick={() => handleQtyChange(item.product_id, item.quantity - 1, item.stock_quantity)}
                      className="px-3 py-1 text-gada-textLight hover:bg-gada-bg"
                    >
                      -
                    </button>
                    <span className="px-3 font-bold text-xs text-gada-textLight">{item.quantity}</span>
                    <button 
                      onClick={() => handleQtyChange(item.product_id, item.quantity + 1, item.stock_quantity)}
                      className="px-3 py-1 text-gada-textLight hover:bg-gada-bg"
                    >
                      +
                    </button>
                  </div>

                  {/* Pricing and Delete */}
                  <div className="flex items-center gap-4">
                    <span className="font-extrabold text-sm text-gada-accent w-24 text-right">
                      ₹{(finalItemPrice * item.quantity).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleRemove(item.product_id)}
                      className="p-2 text-gada-textMuted hover:text-gada-danger rounded-lg transition-colors border border-transparent hover:border-gada-cardBorder bg-gada-bg/25"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Pricing Summary */}
        <div className="space-y-6">
          <div className="glass-card border border-gada-cardBorder rounded-2xl p-6 space-y-6">
            <h3 className="font-extrabold text-sm text-gada-textLight uppercase tracking-wider border-b border-gada-cardBorder pb-4">
              Billing Summary
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-gada-textMuted">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              {appliedCoupon && (
                <div className="flex justify-between text-gada-success font-semibold">
                  <span className="flex items-center gap-1">
                    Discount ({appliedCoupon.code})
                    <button onClick={handleRemoveCoupon} className="text-[10px] text-gada-danger underline hover:text-red-400">
                      Remove
                    </button>
                  </span>
                  <span>-₹{appliedCoupon.discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-gada-textMuted">
                <span>Showroom Shipping</span>
                <span className="text-gada-success font-medium">FREE</span>
              </div>

              <div className="border-t border-gada-cardBorder/60 pt-4 flex justify-between text-lg font-black text-gada-textLight">
                <span>Grand Total</span>
                <span className="text-gada-accent">₹{checkoutAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Coupons box */}
            <form onSubmit={handleApplyCoupon} className="border-t border-gada-cardBorder/60 pt-4 space-y-3">
              <label className="block text-xs font-bold text-gada-textMuted uppercase tracking-wider flex items-center gap-1.5">
                <Ticket className="w-3.5 h-3.5 text-gada-accent" /> Store Promos
              </label>

              {couponError && <p className="text-xs text-gada-danger font-medium">{couponError}</p>}

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="CODE (e.g. GADAWELCOME)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 bg-gada-dark text-xs text-gada-textLight border border-gada-cardBorder rounded-xl px-3 py-2.5 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={couponLoading || !couponCode.trim()}
                  className="bg-gada-bg hover:bg-gada-accent text-gada-textLight hover:text-gada-dark font-bold px-4 rounded-xl text-xs transition-colors border border-gada-cardBorder hover:border-gada-accent"
                >
                  Apply
                </button>
              </div>
              <p className="text-[10px] text-gada-textMuted">Try coupon **GADAWELCOME** for flat ₹500 off orders over ₹2000!</p>
            </form>

            <button
              onClick={handleProceedToCheckout}
              className="w-full bg-gada-accent hover:bg-gada-accentHover text-gada-dark font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-gada-accent/15 transition-all active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gada-textMuted justify-center bg-gada-cardBg/20 border border-gada-cardBorder p-4 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-gada-success" />
            <span>Secure 256-bit Razorpay Gateways</span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Cart;
