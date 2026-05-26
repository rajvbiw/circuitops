import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import GadaAIModal from './GadaAIModal';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Navbar />
      <main className="flex-grow pt-16 relative">
        <Outlet />
      </main>
      <Footer />
      {/* Floating AI Assistant Modal */}
      <GadaAIModal />
    </div>
  );
};

export default Layout;
