import React from 'react';

function Footer() {
  return (
    <footer className="bg-gada-dark border-t border-gada-cardBorder py-10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Col 1 */}
          <div>
            <h3 className="text-gada-accent font-bold text-lg mb-4">⚡ CIRCUITOPS</h3>
            <p className="text-gada-textMuted text-sm leading-relaxed">
              Premium state-of-the-art cloud-native AI electronics marketplace. Providing high-performance systems, smartphones, smart TVs, and gaming gear globally.
            </p>
            <p className="text-xs text-gada-textMuted mt-4">
              "Smart electronics, optimized for the cloud."
            </p>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-gada-textLight font-semibold text-sm mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-gada-textMuted">
              <li>Smartphones & Mobiles</li>
              <li>Laptops & Workstations</li>
              <li>4K UHD Smart TVs</li>
              <li>Home & Kitchen Appliances</li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-gada-textLight font-semibold text-sm mb-4">Contact Center</h4>
            <p className="text-sm text-gada-textMuted">
              CircuitOps Tech & Logistics Hub<br />
              Goregaon East, Mumbai, MH - 400063
            </p>
            <p className="text-sm text-gada-accent mt-2">
              📞 +91 98765 43210
            </p>
          </div>

        </div>

        <div className="border-t border-gada-cardBorder mt-8 pt-8 text-center text-xs text-gada-textMuted">
          <p>© {new Date().getFullYear()} CircuitOps. Original electronics marketplace brand. No copyright infringements intended.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
