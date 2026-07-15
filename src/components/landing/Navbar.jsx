import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollLinks = [
    { label: 'Episodes', href: '#episodes' },
    { label: 'Host', href: '#host' },
    { label: 'Sponsorships', href: '#sponsorships' },
  ];

  const pageLinks = [
    { label: 'AI Defense Stack', to: '/AIDefenseStack' },
    { label: 'Apply as Vendor', to: '/vendors' },
    // Hidden until episode videos are uploaded — restore to show the Previous Episodes archive.
    // { label: 'Previous Episodes', to: '/episodes' },
    { label: 'About', to: '/about' },
    { label: 'Apply as Guest', to: '/apply' },
    { label: 'Contact', to: '/contact' },
  ];

  const scrollTo = (href) => {
    setOpen(false);
    const id = href.replace('#', '');
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#1F1F1F] border-b border-[#333]">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src="https://media.base44.com/images/public/695b5a111214c1e0b6066ef6/be51e8662_RiskTakersLogo.png" alt="Risk Takers" className="h-9 w-auto rounded-sm" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          {scrollLinks.map(l => (
            <button
              key={l.label}
              onClick={() => scrollTo(l.href)}
              className="text-sm text-[#CCCCCC] hover:text-white font-medium transition-colors"
            >
              {l.label}
            </button>
          ))}
          {pageLinks.map(l => (
            <Link
              key={l.label}
              to={l.to}
              className="text-sm text-[#CCCCCC] hover:text-white font-medium transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/Join"
            className="bg-[#F1C40F] hover:bg-[#D4AC0D] text-[#1F1F1F] text-sm font-black px-4 py-2 transition-colors"
          >
            Register
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-[#1F1F1F] border-t border-[#333] px-4 pb-4">
          {scrollLinks.map(l => (
            <button
              key={l.label}
              onClick={() => scrollTo(l.href)}
              className="block w-full text-left py-3 text-sm text-[#CCCCCC] hover:text-white font-medium border-b border-[#333]"
            >
              {l.label}
            </button>
          ))}
          {pageLinks.map(l => (
            <Link
              key={l.label}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block w-full text-left py-3 text-sm text-[#CCCCCC] hover:text-white font-medium border-b border-[#333] last:border-0"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/Join"
            onClick={() => setOpen(false)}
            className="block w-full text-center py-3 mt-3 bg-[#F1C40F] text-[#1F1F1F] text-sm font-black"
          >
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}