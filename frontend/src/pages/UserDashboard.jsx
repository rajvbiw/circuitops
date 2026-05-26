import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../store/authSlice';
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-white">
        <p>Please login to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center text-2xl font-bold text-gray-900 mx-auto mb-3">
                {user.name.charAt(0)}
              </div>
              <h3 className="text-lg font-bold text-white">{user.name}</h3>
              <p className="text-sm text-gray-400">{user.email}</p>
            </div>
            
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile' ? 'bg-yellow-500 text-gray-900 font-medium' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <User size={18} />
                My Profile
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'orders' ? 'bg-yellow-500 text-gray-900 font-medium' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Package size={18} />
                My Orders
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'addresses' ? 'bg-yellow-500 text-gray-900 font-medium' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <MapPin size={18} />
                Saved Addresses
              </button>
              <button
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'wishlist' ? 'bg-yellow-500 text-gray-900 font-medium' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Heart size={18} />
                Wishlist
              </button>
              <hr className="border-gray-700 my-4" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-700 min-h-[500px]">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Account Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                  <p className="text-lg text-white bg-gray-700/50 p-3 rounded-lg border border-gray-600">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                  <p className="text-lg text-white bg-gray-700/50 p-3 rounded-lg border border-gray-600">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Account Role</label>
                  <p className="text-lg text-white bg-gray-700/50 p-3 rounded-lg border border-gray-600 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Order History</h2>
              <div className="text-center py-10 bg-gray-700/30 rounded-xl border border-gray-600 border-dashed">
                <Package className="mx-auto h-12 w-12 text-gray-500 mb-3" />
                <p className="text-gray-400">You haven't placed any orders yet.</p>
                <button className="mt-4 px-6 py-2 bg-yellow-500 text-gray-900 font-medium rounded-lg hover:bg-yellow-400">
                  Start Shopping
                </button>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">Saved Addresses</h2>
              <div className="text-center py-10 bg-gray-700/30 rounded-xl border border-gray-600 border-dashed">
                <MapPin className="mx-auto h-12 w-12 text-gray-500 mb-3" />
                <p className="text-gray-400">No addresses saved.</p>
                <button className="mt-4 px-6 py-2 border border-yellow-500 text-yellow-500 font-medium rounded-lg hover:bg-yellow-500/10 transition-colors">
                  Add New Address
                </button>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">My Wishlist</h2>
              <div className="text-center py-10 bg-gray-700/30 rounded-xl border border-gray-600 border-dashed">
                <Heart className="mx-auto h-12 w-12 text-gray-500 mb-3" />
                <p className="text-gray-400">Your wishlist is empty.</p>
                <button className="mt-4 px-6 py-2 bg-yellow-500 text-gray-900 font-medium rounded-lg hover:bg-yellow-400">
                  Explore Products
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
