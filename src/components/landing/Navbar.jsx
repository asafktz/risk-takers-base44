import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollLinks = [
    { label: 'Episodes', href: '#episodes' },
    { label: 'Host', href: '#host' },
    { label: 'Sponsorships', href: '#sponsorships' },
  ];

  const pageLinks = [
    { label: 'AI Defense Stack', to: '/AIDefenseStack' },
    { label: 'Gift Store', to: '/gift-store', accent: true },
    { label: 'Apply as Vendor', to: '/vendors' },
    // Hidden until episode videos are uploaded — restore to show the Previous Episodes archive.
    // { label: 'Previous Episodes', to: '/episodes' },
    { label: 'About', to: '/about' },
    { label: 'Apply as Guest', to: '/apply' },
    { label: 'Contact', to: '/contact' },
  ];

  const scrollTo = (href) => {
    const id = href.replace('#', '');
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const closeMobileMenu = (event) => {
    event.currentTarget.closest('details')?.removeAttribute('open');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#1F1F1F] border-b border-[#333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-14">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
          <img src="https://media.base44.com/images/public/695b5a111214c1e0b6066ef6/be51e8662_RiskTakersLogo.png" alt="Risk Takers" className="h-9 w-auto rounded-sm" />
        </Link>

        {/* Desktop links */}
        <div className="hidden xl:flex items-center gap-5">
          {scrollLinks.map(l => (
            <button
              key={l.label}
              onClick={() => scrollTo(l.href)}
              className={`text-sm font-medium transition-colors ${
                l.accent ? 'text-[#F1C40F] hover:text-[#FFE36B]' : 'text-[#CCCCCC] hover:text-white'
              }`}
            >
              {l.label}
            </button>
          ))}
          {pageLinks.map(l => (
            <Link
              key={l.label}
              to={l.to}
              className={`text-sm font-medium transition-colors ${
                l.accent ? 'text-[#F1C40F] hover:text-[#FFE36B]' : 'text-[#CCCCCC] hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/AIDefenseStack#register"
            className="bg-[#F1C40F] hover:bg-[#D4AC0D] text-[#1F1F1F] text-sm font-black px-4 py-2 transition-colors"
          >
            Register
          </Link>
        </div>

        {/* Native disclosure keeps navigation usable before and after hydration. */}
        <details className="group xl:hidden">
          <summary
            className="cursor-pointer list-none text-white [&::-webkit-details-marker]:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5 group-open:hidden" aria-hidden="true" />
            <X className="hidden h-5 w-5 group-open:block" aria-hidden="true" />
          </summary>

          <div id="mobile-navigation" className="fixed left-0 right-0 top-14 bg-[#1F1F1F] border-t border-[#333] px-4 pb-4">
            {scrollLinks.map(l => (
              <button
                key={l.label}
                onClick={(event) => {
                  closeMobileMenu(event);
                  scrollTo(l.href);
                }}
                className="block w-full text-left py-3 text-sm text-[#CCCCCC] hover:text-white font-medium border-b border-[#333]"
              >
                {l.label}
              </button>
            ))}
            {pageLinks.map(l => (
              <Link
                key={l.label}
                to={l.to}
                onClick={closeMobileMenu}
                className={`block w-full border-b border-[#333] py-3 text-left text-sm font-medium last:border-0 ${
                  l.accent ? 'text-[#F1C40F] hover:text-[#FFE36B]' : 'text-[#CCCCCC] hover:text-white'
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              to="/AIDefenseStack#register"
              onClick={closeMobileMenu}
              className="block w-full text-center py-3 mt-3 bg-[#F1C40F] text-[#1F1F1F] text-sm font-black"
            >
              Register
            </Link>
          </div>
        </details>
      </div>
    </nav>
  );
}
