import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../store/cartSlice';
import { MapPin, Phone, User, PlusCircle, CreditCard, ShieldCheck, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import api from '../utils/api';

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { items, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Address variables
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  // New Address form state
  const [newAddr, setNewAddr] = useState({
    name: '', phone: '', street: '', city: '', state: '', pin_code: '', is_default: false
  });
  
  // Checkout flow states
  const [couponCode] = useState(location.state?.couponCode || null);
  const [discountAmount] = useState(location.state?.discountAmount || 0);
  const [placingOrder, setPlacingOrder] = useState(false);
  
  // Payment Simulation Modal states
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [draftOrder, setDraftOrder] = useState(null); // stores order details returned by server
  const [paymentVerifying, setPaymentVerifying] = useState(false);

  // Success screen
  const [orderConfirmedNum, setOrderConfirmedNum] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(fetchCart());
    loadAddresses();
  }, [isAuthenticated, dispatch, navigate]);

  const loadAddresses = async () => {
    setAddressLoading(true);
    try {
      const response = await api.get('/orders/addresses');
      setAddresses(response.data.addresses);
      if (response.data.addresses.length > 0) {
        const defaultAddr = response.data.addresses.find(a => a.is_default);
        setSelectedAddressId(defaultAddr ? defaultAddr.id : response.data.addresses[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      await api.post('/orders/addresses', newAddr);
      setShowAddAddress(false);
      setNewAddr({ name: '', phone: '', street: '', city: '', state: '', pin_code: '', is_default: false });
      loadAddresses();
    } catch (err) {
      alert('Failed to save address. Please check input parameters.');
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.discount_price || item.price) * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - discountAmount);

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a shipping address first, Ji.');
      return;
    }

    setPlacingOrder(true);
    try {
      // 1. Post order draft details to Express
      const response = await api.post('/orders/checkout', {
        addressId: selectedAddressId,
        couponCode
      });

      setDraftOrder(response.data); // { orderId, orderNumber, payableAmount, pgOrderId, keyId }
      
      // 2. Open payment simulator modal
      setPaymentModalOpen(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to place order draft.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const simulatePaymentResponse = async (status) => {
    if (!draftOrder) return;
    setPaymentVerifying(true);

    try {
      if (status === 'success') {
        const payload = {
          orderId: draftOrder.orderId,
          razorpayOrderId: draftOrder.pgOrderId,
          razorpayPaymentId: `pay_simulated_${Date.now()}`,
          razorpaySignature: 'mock_signature_signature',
          isSimulated: true // tells backend to skip cryptography signature verification
        };

        const response = await api.post('/orders/payment/verify', payload);
        
        // Confirm order placed
        setOrderConfirmedNum(response.data.orderNumber);
        dispatch(fetchCart()); // clear local cart
        setPaymentModalOpen(false);
      } else {
        alert('Payment Simulation Cancelled. Order remains in pending state.');
        setPaymentModalOpen(false);
        navigate('/dashboard?tab=orders');
      }
    } catch (err) {
      alert('Failed to verify simulated payment: ' + (err.response?.data?.message || err.message));
    } finally {
      setPaymentVerifying(false);
    }
  };

  // Order Confirmed screen
  if (orderConfirmedNum) {
    return (
      <div className="max-w-md mx-auto text-center py-20 bg-gada-cardBg rounded-3xl border border-gada-cardBorder mt-10 p-8 space-y-6">
        <div className="w-16 h-16 bg-gada-success/15 text-gada-success rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-gada-textLight">Order Confirmed!</h2>
        <p className="text-sm text-gada-textMuted leading-relaxed">
          Namaste! Your order **{orderConfirmedNum}** has been successfully placed at Gada Electronics. Our warehouse team is packing your items now.
        </p>
        <div className="border-t border-gada-cardBorder/60 pt-4 flex gap-4">
          <Link to="/dashboard?tab=orders" className="flex-1 bg-gada-accent text-gada-dark font-bold py-3 rounded-xl text-xs">
            Track Orders
          </Link>
          <Link to="/" className="flex-1 bg-gada-bg border border-gada-cardBorder text-gada-textLight font-semibold py-3 rounded-xl text-xs">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-gada-textLight">Shipping & Checkout</h1>
        <p className="text-xs text-gada-textMuted mt-1">Provide delivery address details and complete Razorpay transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Address Book */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card border border-gada-cardBorder rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gada-cardBorder pb-4">
              <h3 className="font-extrabold text-sm text-gada-textLight uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gada-accent" /> Shipping Address
              </h3>
              {!showAddAddress && (
                <button
                  onClick={() => setShowAddAddress(true)}
                  className="text-xs text-gada-accent font-bold hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Add Address
                </button>
              )}
            </div>

            {/* Address List */}
            {!showAddAddress && (
              <div className="grid grid-cols-1 gap-4">
                {addressLoading ? (
                  <p className="text-xs text-gada-textMuted">Loading address catalog...</p>
                ) : addresses.length === 0 ? (
                  <p className="text-xs text-gada-textMuted">No shipping addresses saved yet. Please add one below, Ji.</p>
                ) : (
                  addresses.map((a) => (
                    <label 
                      key={a.id}
                      className={`border p-4 rounded-xl flex items-start gap-3 cursor-pointer transition-all ${
                        selectedAddressId === a.id 
                          ? 'border-gada-accent bg-gada-bg/30' 
                          : 'border-gada-cardBorder hover:border-gada-cardBorder/80 bg-gada-dark/25'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shippingAddress"
                        checked={selectedAddressId === a.id}
                        onChange={() => setSelectedAddressId(a.id)}
                        className="mt-1 accent-gada-accent"
                      />
                      <div className="text-xs text-gada-textLight space-y-1">
                        <p className="font-bold flex items-center gap-1">
                          <User className="w-3 h-3 text-gada-accent" /> {a.name}
                          {a.is_default === 1 && (
                            <span className="bg-gada-accent/15 text-gada-accent text-[9px] px-2 py-0.5 rounded-full font-bold ml-1">
                              DEFAULT
                            </span>
                          )}
                        </p>
                        <p className="text-gada-textMuted flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {a.phone}
                        </p>
                        <p className="text-gada-textMuted leading-relaxed pt-1">
                          {a.street}, {a.city}, {a.state} - <span className="font-bold text-gada-textLight">{a.pin_code}</span>
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            )}

            {/* Add Address Form inline */}
            {showAddAddress && (
              <form onSubmit={handleCreateAddress} className="space-y-4 bg-gada-bg/20 p-5 rounded-xl border border-gada-cardBorder">
                <h4 className="text-xs font-bold text-gada-textLight border-b border-gada-cardBorder pb-2">Add New Address Entry</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gada-textMuted uppercase font-bold">Recipient Name</label>
                    <input 
                      type="text" required
                      value={newAddr.name}
                      onChange={(e) => setNewAddr({...newAddr, name: e.target.value})}
                      placeholder="e.g. Jethalal Gada"
                      className="bg-gada-dark text-xs text-gada-textLight border border-gada-cardBorder rounded-lg p-2.5 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gada-textMuted uppercase font-bold">Phone Number</label>
                    <input 
                      type="text" required
                      value={newAddr.phone}
                      onChange={(e) => setNewAddr({...newAddr, phone: e.target.value})}
                      placeholder="e.g. 9876543210"
                      className="bg-gada-dark text-xs text-gada-textLight border border-gada-cardBorder rounded-lg p-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-gada-textMuted uppercase font-bold">Street Address</label>
                  <input 
                    type="text" required
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({...newAddr, street: e.target.value})}
                    placeholder="Room/Flat No., Building, Area name"
                    className="bg-gada-dark text-xs text-gada-textLight border border-gada-cardBorder rounded-lg p-2.5 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gada-textMuted uppercase font-bold">City</label>
                    <input 
                      type="text" required
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({...newAddr, city: e.target.value})}
                      placeholder="e.g. Mumbai"
                      className="bg-gada-dark text-xs text-gada-textLight border border-gada-cardBorder rounded-lg p-2.5 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gada-textMuted uppercase font-bold">State</label>
                    <input 
                      type="text" required
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({...newAddr, state: e.target.value})}
                      placeholder="e.g. Maharashtra"
                      className="bg-gada-dark text-xs text-gada-textLight border border-gada-cardBorder rounded-lg p-2.5 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-gada-textMuted uppercase font-bold">Pincode</label>
                    <input 
                      type="text" required
                      value={newAddr.pin_code}
                      onChange={(e) => setNewAddr({...newAddr, pin_code: e.target.value})}
                      placeholder="400063"
                      className="bg-gada-dark text-xs text-gada-textLight border border-gada-cardBorder rounded-lg p-2.5 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="setDefault"
                    checked={newAddr.is_default}
                    onChange={(e) => setNewAddr({...newAddr, is_default: e.target.checked})}
                    className="accent-gada-accent cursor-pointer"
                  />
                  <label htmlFor="setDefault" className="text-xs text-gada-textLight cursor-pointer">Set as default shipping address</label>
                </div>

                <div className="flex gap-3 pt-2 border-t border-gada-cardBorder/60">
                  <button
                    type="submit"
                    className="bg-gada-accent text-gada-dark font-bold px-5 py-2.5 rounded-xl text-xs"
                  >
                    Save Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddAddress(false)}
                    className="bg-transparent border border-gada-cardBorder text-gada-textLight font-semibold px-4 py-2.5 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* Pricing Summary */}
        <div>
          <div className="glass-card border border-gada-cardBorder rounded-2xl p-6 space-y-6">
            <h3 className="font-extrabold text-sm text-gada-textLight uppercase tracking-wider border-b border-gada-cardBorder pb-4">
              Review Checkout
            </h3>

            {/* Cart products min preview */}
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-xs text-gada-textLight">
                  <span className="truncate max-w-[70%]">{item.name} <span className="text-gada-textMuted font-bold">x{item.quantity}</span></span>
                  <span className="font-semibold">₹{((item.discount_price || item.price) * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gada-cardBorder/60 pt-4 space-y-3.5 text-sm">
              <div className="flex justify-between text-gada-textMuted text-xs">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-gada-success text-xs font-bold">
                  <span>Coupon discount</span>
                  <span>-₹{parseFloat(discountAmount).toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-gada-textMuted text-xs">
                <span>Shipping Fee</span>
                <span className="text-gada-success font-medium">FREE</span>
              </div>
              <div className="border-t border-gada-cardBorder/60 pt-4 flex justify-between text-lg font-black text-gada-textLight">
                <span>Payable Amount</span>
                <span className="text-gada-accent">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={placingOrder || !selectedAddressId || items.length === 0}
              className="w-full bg-gada-accent hover:bg-gada-accentHover disabled:bg-gada-bg text-gada-dark disabled:text-gada-textMuted font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 text-sm shadow-md shadow-gada-accent/15 transition-all"
            >
              <CreditCard className="w-4 h-4" />
              <span>{placingOrder ? 'Drafting Order...' : 'Pay with Razorpay'}</span>
            </button>

            <div className="flex items-center gap-2 text-[10px] text-gada-textMuted justify-center">
              <ShieldCheck className="w-4 h-4 text-gada-success" />
              <span>Local Warehouse Escrows Guaranteed</span>
            </div>
          </div>
        </div>

      </div>

      {/* Razorpay Payments Simulation Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gada-cardBg border border-gada-cardBorder rounded-3xl p-6 shadow-2xl relative space-y-6">
            
            <div className="flex justify-between items-start border-b border-gada-cardBorder pb-4">
              <div className="flex items-center gap-2">
                <span className="bg-gada-accent text-gada-dark p-1.5 rounded-lg font-bold text-sm">💳</span>
                <div>
                  <h3 className="font-extrabold text-sm text-gada-textLight uppercase tracking-wider">Razorpay Sandbox</h3>
                  <p className="text-[10px] text-gada-success font-bold">Payments Simulator Mode</p>
                </div>
              </div>
              <button 
                onClick={() => setPaymentModalOpen(false)}
                className="p-1 text-gada-textMuted hover:text-gada-textLight rounded-lg border border-gada-cardBorder"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-gada-dark/60 border border-gada-cardBorder p-4 rounded-2xl text-xs space-y-2.5">
              <div className="flex justify-between">
                <span className="text-gada-textMuted">Order Receipt ID:</span>
                <span className="font-bold text-gada-textLight">{draftOrder?.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gada-textMuted">Razorpay Order ID:</span>
                <span className="font-bold text-gada-textLight">{draftOrder?.pgOrderId}</span>
              </div>
              <div className="flex justify-between border-t border-gada-cardBorder/60 pt-2 text-sm">
                <span className="text-gada-textMuted font-bold">Total Amount payable:</span>
                <span className="font-black text-gada-accent">₹{draftOrder?.payableAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl text-xs text-yellow-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="leading-relaxed">This handles payment authorization and captures stock. Choose simulated result below.</p>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => simulatePaymentResponse('success')}
                disabled={paymentVerifying}
                className="bg-gada-success hover:opacity-90 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                {paymentVerifying ? 'Confirming Ledger...' : 'Simulate Success (Complete Order)'}
              </button>
              <button
                onClick={() => simulatePaymentResponse('fail')}
                disabled={paymentVerifying}
                className="bg-transparent border border-gada-danger text-gada-danger hover:bg-gada-danger/10 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                Simulate Payment Failure / Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Checkout;
