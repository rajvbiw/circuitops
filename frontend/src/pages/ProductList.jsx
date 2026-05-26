import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchCategories } from '../store/productsSlice';
import ProductCard from '../components/ProductCard';
import { Filter, Search, SlidersHorizontal, Star, Trash2 } from 'lucide-react';

function ProductList() {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Load Redux states
  const { products, categories, pagination, loading } = useSelector((state) => state.products);

  // Parse filters from search parameters
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [searchVal, setSearchVal] = useState(searchParams.get('search') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  // Sync state with SearchParams updates (e.g. from navbar searches)
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
    setSearchVal(searchParams.get('search') || '');
    setPage(parseInt(searchParams.get('page')) || 1);
  }, [searchParams]);

  // Trigger search on filter/search parameters change
  useEffect(() => {
    const filters = {};
    if (category) filters.category = category;
    if (searchVal) filters.search = searchVal;
    if (minPrice) filters.minPrice = minPrice;
    if (maxPrice) filters.maxPrice = maxPrice;
    if (rating) filters.rating = rating;
    if (sort) filters.sort = sort;
    filters.page = page;
    filters.limit = 6; // Limit items per page for clearer pagination view

    dispatch(fetchProducts(filters));
    dispatch(fetchCategories());
  }, [category, searchVal, minPrice, maxPrice, rating, sort, page, dispatch]);

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams);
    Object.keys(newFilters).forEach((key) => {
      const val = newFilters[key];
      if (val) {
        params.set(key, val);
      } else {
        params.delete(key);
      }
    });
    // Reset to page 1 on filter edits
    if (newFilters.page === undefined) {
      params.set('page', 1);
      setPage(1);
    }
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setCategory('');
    setSearchVal('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSort('');
    setPage(1);
    setSearchParams({});
  };

  const handlePageChange = (p) => {
    if (p < 1 || p > pagination.totalPages) return;
    setPage(p);
    updateFilters({ page: p });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gada-cardBorder pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gada-textLight">Electronics Catalog</h1>
          <p className="text-xs text-gada-textMuted mt-1">Found {pagination.totalProducts} active products in warehouse</p>
        </div>

        {/* Sort & Search Inputs */}
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search category items..."
              value={searchVal}
              onChange={(e) => {
                setSearchVal(e.target.value);
                updateFilters({ search: e.target.value });
              }}
              className="w-full bg-gada-cardBg text-gada-textLight border border-gada-cardBorder rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gada-accent pl-10"
            />
            <Search className="absolute left-3.5 top-3 text-gada-textMuted w-4 h-4" />
          </div>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              updateFilters({ sort: e.target.value });
            }}
            className="bg-gada-cardBg text-gada-textLight border border-gada-cardBorder rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-gada-accent cursor-pointer"
          >
            <option value="">Sort: Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
            <option value="popular">Most Reviewed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="glass-card border border-gada-cardBorder rounded-2xl p-6 h-fit space-y-6">
          <div className="flex items-center justify-between border-b border-gada-cardBorder pb-4">
            <h3 className="font-extrabold text-sm text-gada-textLight flex items-center gap-2 uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-gada-accent" /> Filters
            </h3>
            <button 
              onClick={handleClearFilters}
              className="text-xs text-gada-danger hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear
            </button>
          </div>

          {/* Categories Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-gada-textMuted uppercase tracking-wider">Categories</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setCategory('');
                  updateFilters({ category: '' });
                }}
                className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${
                  category === '' 
                    ? 'bg-gada-accent text-gada-dark font-bold' 
                    : 'text-gada-textLight hover:bg-gada-bg/50'
                }`}
              >
                All Categories
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setCategory(cat.slug);
                    updateFilters({ category: cat.slug });
                  }}
                  className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors truncate ${
                    category === cat.slug 
                      ? 'bg-gada-accent text-gada-dark font-bold' 
                      : 'text-gada-textLight hover:bg-gada-bg/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 border-t border-gada-cardBorder pt-4">
            <label className="block text-xs font-bold text-gada-textMuted uppercase tracking-wider">Price Range (₹)</label>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  updateFilters({ minPrice: e.target.value });
                }}
                className="w-full bg-gada-dark text-xs text-gada-textLight border border-gada-cardBorder rounded-lg p-2 focus:outline-none"
              />
              <span className="text-gada-textMuted">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  updateFilters({ maxPrice: e.target.value });
                }}
                className="w-full bg-gada-dark text-xs text-gada-textLight border border-gada-cardBorder rounded-lg p-2 focus:outline-none"
              />
            </div>
          </div>

          {/* Rating filter */}
          <div className="space-y-3 border-t border-gada-cardBorder pt-4">
            <label className="block text-xs font-bold text-gada-textMuted uppercase tracking-wider">Minimum Rating</label>
            <div className="flex flex-col gap-2">
              {[4, 3, 2, 1].map((stars) => (
                <label 
                  key={stars}
                  className="flex items-center gap-2 text-sm text-gada-textLight cursor-pointer hover:text-gada-accent"
                >
                  <input
                    type="radio"
                    name="ratingFilter"
                    checked={parseInt(rating) === stars}
                    onChange={() => {
                      setRating(stars.toString());
                      updateFilters({ rating: stars.toString() });
                    }}
                    className="accent-gada-accent"
                  />
                  <span className="flex items-center gap-1">
                    {stars} Stars & Above
                    <span className="flex text-yellow-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Products Grid */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="text-center text-gada-textMuted py-24">Checking showroom shelves, please wait...</div>
          ) : products.length === 0 ? (
            <div className="text-center bg-gada-cardBg border border-gada-cardBorder rounded-2xl p-16 space-y-4">
              <p className="text-gada-textMuted text-lg font-medium">No matching electronics are currently in stock, Ji.</p>
              <button 
                onClick={handleClearFilters}
                className="bg-gada-accent text-gada-dark px-6 py-2.5 rounded-full font-bold text-sm shadow-md"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-gada-cardBorder pt-6">
              <button
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
                className="px-4 py-2 border border-gada-cardBorder text-gada-textLight bg-gada-cardBg hover:bg-gada-accent hover:text-gada-dark rounded-xl text-xs font-bold disabled:opacity-50 transition-all"
              >
                Previous
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePageChange(p)}
                  className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-extrabold border transition-all ${
                    page === p
                      ? 'bg-gada-accent text-gada-dark border-gada-accent shadow-md shadow-gada-accent/10'
                      : 'border-gada-cardBorder text-gada-textLight hover:bg-gada-bg'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={page === pagination.totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="px-4 py-2 border border-gada-cardBorder text-gada-textLight bg-gada-cardBg hover:bg-gada-accent hover:text-gada-dark rounded-xl text-xs font-bold disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default ProductList;
