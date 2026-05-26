import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, User, Search, Bot, Heart, LogOut, Menu, X, Shield } from 'lucide-react';
import { logoutUser } from '../store/authSlice';
import { fetchCart, selectCartItemCount } from '../store/cartSlice';
import { toggleChat, toggleMobileMenu, setMobileMenuOpen } from '../store/uiSlice';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const cartItemCount = useSelector(selectCartItemCount);
  const { isMobileMenuOpen } = useSelector((state) => state.ui);

  const [searchVal, setSearchVal] = useState('');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
      dispatch(setMobileMenuOpen(false));
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="bg-gada-dark border-b border-gada-cardBorder sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo Section */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gada-accent text-gada-dark p-2 rounded-lg font-bold text-xl tracking-tight shadow-lg shadow-gada-accent/20 group-hover:scale-105 transition-transform duration-200">
                ⚡ Circuit
              </div>
              <span className="text-xl font-bold tracking-wide text-gada-textLight hidden sm:block">
                Ops
              </span>
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <input
              type="text"
              placeholder="Search cloud-native electronics, laptops, microcontrollers..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-gada-cardBg text-gada-textLight border border-gada-cardBorder rounded-full px-5 py-2.5 pl-12 text-sm focus:outline-none focus:border-gada-accent transition-colors"
            />
            <Search className="absolute left-4 top-3 text-gada-textMuted w-4 h-4" />
          </form>

          {/* Nav Links - Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/products" className="text-gada-textLight hover:text-gada-accent text-sm font-medium transition-colors">
              Browse Store
            </Link>

            {/* AI Assistant Button */}
            <button
              onClick={() => dispatch(toggleChat())}
              className="flex items-center gap-2 bg-gradient-to-r from-gada-accent to-yellow-500 text-gada-dark font-semibold px-4 py-2 rounded-full shadow-md hover:shadow-gada-accent/40 active:scale-95 transition-all text-sm"
              title="Chat with CircuitOps AI Assistant"
            >
              <Bot className="w-4 h-4 animate-bounce-slow" />
              <span>Circuit AI</span>
            </button>

            {/* Wishlist */}
            {isAuthenticated && (
              <Link to="/dashboard?tab=wishlist" className="relative text-gada-textLight hover:text-gada-accent transition-colors">
                <Heart className="w-6 h-6" />
              </Link>
            )}

            {/* Cart Icon */}
            <Link to="/cart" className="relative text-gada-textLight hover:text-gada-accent transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gada-accent text-gada-dark text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse-slow">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Admin Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-1.5 focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gada-bg border border-gada-accent flex items-center justify-center text-gada-accent font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 rounded-xl bg-gada-cardBg border border-gada-cardBorder shadow-2xl py-2 z-50 glass-card">
                    <div className="px-4 py-2 border-b border-gada-cardBorder">
                      <p className="text-sm font-bold text-gada-textLight truncate">{user?.name}</p>
                      <p className="text-xs text-gada-textMuted truncate">{user?.email}</p>
                    </div>
                    
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gada-accent hover:bg-gada-bg/50 transition-colors"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gada-textLight hover:bg-gada-bg/50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <span>User Profile</span>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-gada-danger hover:bg-gada-bg/50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="border border-gada-accent text-gada-accent hover:bg-gada-accent hover:text-gada-dark px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Buttons */}
          <div className="flex items-center gap-4 md:hidden">
            <Link to="/cart" className="relative text-gada-textLight hover:text-gada-accent transition-colors">
              <ShoppingBag className="w-6 h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-gada-accent text-gada-dark text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => dispatch(toggleMobileMenu())}
              className="text-gada-textLight focus:outline-none"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-gada-dark border-b border-gada-cardBorder px-4 pt-2 pb-6 space-y-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-gada-cardBg text-gada-textLight border border-gada-cardBorder rounded-full px-5 py-2 text-sm focus:outline-none"
            />
            <Search className="absolute right-4 top-2.5 text-gada-textMuted w-4 h-4" />
          </form>

          <div className="flex flex-col gap-2">
            <Link
              to="/products"
              onClick={() => dispatch(toggleMobileMenu())}
              className="text-gada-textLight hover:text-gada-accent py-2 text-sm font-medium transition-colors"
            >
              Browse Store
            </Link>
            
            <button
              onClick={() => {
                dispatch(toggleChat());
                dispatch(toggleMobileMenu());
              }}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-gada-accent to-yellow-500 text-gada-dark font-semibold py-2.5 rounded-full shadow-md text-sm"
            >
              <Bot className="w-4 h-4" />
              <span>Ask CircuitOps AI Assistant</span>
            </button>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => dispatch(toggleMobileMenu())}
                  className="text-gada-textLight hover:text-gada-accent py-2 text-sm font-medium transition-colors"
                >
                  My Profile & Orders
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => dispatch(toggleMobileMenu())}
                    className="text-gada-accent hover:text-yellow-400 py-2 text-sm font-medium transition-colors"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-gada-danger hover:text-red-400 text-left py-2 text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => dispatch(toggleMobileMenu())}
                className="text-center border border-gada-accent text-gada-accent hover:bg-gada-accent hover:text-gada-dark py-2 rounded-full text-sm font-semibold transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
