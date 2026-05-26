import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  LayoutDashboard, Users, Package, ShoppingCart, Tag, 
  BarChart3, Plus, Edit2, Trash2, X, AlertTriangle 
} from 'lucide-react';
import api from '../utils/api';

const AdminDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    discount_price: '',
    category_id: '',
    stock_quantity: '',
    image_url: '',
    bin_location: 'A-00',
    safety_stock: '5'
  });

  // Simple hardcoded stats for the UI
  const stats = [
    { name: 'Total Revenue', value: '₹4,25,000', icon: BarChart3 },
    { name: 'Active Orders', value: '124', icon: ShoppingCart },
    { name: 'Products in Stock', value: products.length || '45', icon: Package },
    { name: 'Total Users', value: '892', icon: Users },
  ];

  // Fetch products and categories when activeTab is products or on mount
  useEffect(() => {
    if (user?.role === 'admin') {
      fetchCategories();
      fetchAdminProducts();
    }
  }, [user]);

  const fetchAdminProducts = async () => {
    setLoading(true);
    try {
      const response = await api.get('/products?limit=100');
      if (response.data && response.data.products) {
        setProducts(response.data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/products/categories');
      if (response.data && response.data.categories) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      discount_price: '',
      category_id: categories[0]?.id || '1',
      stock_quantity: '',
      image_url: '',
      bin_location: 'A-00',
      safety_stock: '5'
    });
    setShowModal(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      discount_price: product.discount_price || '',
      category_id: product.category_id || '1',
      stock_quantity: product.stock_quantity || '0',
      image_url: product.image_url || '',
      bin_location: product.bin_location || 'A-00',
      safety_stock: product.safety_stock || '5'
    });
    setShowModal(true);
  };

  const handleDeleteClick = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${productId}`);
        alert('Product deleted successfully');
        fetchAdminProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...formData,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        category_id: parseInt(formData.category_id),
        stock_quantity: parseInt(formData.stock_quantity),
        safety_stock: parseInt(formData.safety_stock)
      };

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, dataToSend);
        alert('Product updated successfully!');
      } else {
        await api.post('/products', dataToSend);
        alert('Product created successfully!');
      }
      setShowModal(false);
      fetchAdminProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-red-500 mb-2">Access Denied</h2>
          <p className="text-gray-400">You need administrator privileges to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col hidden md:flex">
          <div className="p-6">
            <h2 className="text-xl font-bold text-yellow-500">Gada Admin</h2>
            <p className="text-xs text-gray-400 mt-1">Electronics Marketplace</p>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {[
              { id: 'overview', name: 'Overview', icon: LayoutDashboard },
              { id: 'products', name: 'Products Manager', icon: Package },
              { id: 'orders', name: 'Orders', icon: ShoppingCart },
              { id: 'users', name: 'Users', icon: Users },
              { id: 'coupons', name: 'Coupons', icon: Tag },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id ? 'bg-yellow-500 text-gray-900 font-medium' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto bg-gray-900 p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white capitalize">{activeTab === 'products' ? 'Products Manager' : activeTab}</h1>
            {activeTab === 'products' && (
              <button 
                onClick={handleAddClick}
                className="flex items-center gap-2 bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
              >
                <Plus size={18} />
                Add Product
              </button>
            )}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                  <div key={stat.name} className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-400 font-medium">{stat.name}</h3>
                      <div className="p-2 bg-gray-700 rounded-lg">
                        <stat.icon className="w-5 h-5 text-yellow-500" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent Orders Placeholder */}
              <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h3 className="font-bold text-white">Recent Orders</h3>
                </div>
                <div className="p-6 text-center text-gray-400">
                  <p>Order tracking data will appear here.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-gray-400">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="p-12 text-center text-gray-400">No products found. Add some to get started!</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-700 text-gray-300 text-sm font-semibold uppercase border-b border-gray-600">
                        <th className="px-6 py-4">Image</th>
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700 text-sm">
                      {products.map((product) => {
                        const isLowStock = product.stock_quantity <= (product.safety_stock || 5);
                        return (
                          <tr key={product.id} className="hover:bg-gray-750 transition-colors">
                            <td className="px-6 py-4">
                              <img 
                                src={product.image_url || 'https://via.placeholder.com/150'} 
                                alt={product.name} 
                                className="w-12 h-12 object-cover rounded-lg border border-gray-600"
                              />
                            </td>
                            <td className="px-6 py-4 font-medium text-white max-w-xs truncate">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 text-gray-350">
                              {product.category_name || 'Electronics'}
                            </td>
                            <td className="px-6 py-4 text-yellow-500 font-semibold">
                              ₹{product.price.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className={isLowStock ? 'text-red-400 font-bold' : 'text-gray-250'}>
                                  {product.stock_quantity}
                                </span>
                                {isLowStock && (
                                  <AlertTriangle size={16} className="text-red-400" title="Low Stock Warning!" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                product.status === 'active' ? 'bg-green-900/60 text-green-400 border border-green-800' : 'bg-red-900/60 text-red-400 border border-red-800'
                              }`}>
                                {product.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center items-center gap-3">
                                <button 
                                  onClick={() => handleEditClick(product)}
                                  className="p-2 text-blue-400 hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteClick(product.id)}
                                  className="p-2 text-red-400 hover:bg-gray-700 rounded-lg transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'products' && (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 h-96 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="text-lg">Management interface for {activeTab}</p>
                <p className="text-sm mt-2">Connect to backend CRUD endpoints here.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-700 bg-gray-850">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Product Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Gada Phone 15 Pro"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>

                {/* Category selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Category *</label>
                  <select 
                    value={formData.category_id}
                    onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Image URL</label>
                  <input 
                    type="text" 
                    value={formData.image_url}
                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Price (₹) *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    placeholder="79999"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>

                {/* Discount Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Discount Price (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.discount_price}
                    onChange={(e) => setFormData({...formData, discount_price: e.target.value})}
                    placeholder="74999"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Stock Quantity *</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                    placeholder="25"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>

                {/* Safety Stock */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Safety Stock Limit</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.safety_stock}
                    onChange={(e) => setFormData({...formData, safety_stock: e.target.value})}
                    placeholder="5"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>

                {/* Warehouse Bin Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Warehouse Bin Location</label>
                  <input 
                    type="text" 
                    value={formData.bin_location}
                    onChange={(e) => setFormData({...formData, bin_location: e.target.value})}
                    placeholder="e.g. A-01"
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-300 mb-1">Product Description</label>
                  <textarea 
                    rows="3"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Write key features and technical specifications..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-yellow-500 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-650 hover:bg-gray-700 text-gray-350 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg font-bold transition-colors"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

