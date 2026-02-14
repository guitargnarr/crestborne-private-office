import { useState, useEffect, Suspense, lazy } from 'react';
import {
  Menu, X, ArrowUp, Mail, Phone, MapPin, Globe, Shield,
  TrendingUp, Users, Building2, BarChart3, ChevronRight,
} from 'lucide-react';
import SilkThreadsBg from './components/SilkThreadsBg';

const GravitationalLensHero = lazy(() => import('./components/GravitationalLensHero'));

const SERVICES = [
  { icon: TrendingUp, title: 'Investment Management', desc: 'Multi-asset, multi-custodian portfolio construction across global equities, fixed income, alternatives, and structured products.' },
  { icon: Shield, title: 'Wealth Structuring', desc: 'Trust, holding company, and VCC fund structures optimised for cross-border tax efficiency and asset protection.' },
  { icon: Users, title: 'Trust & Estate', desc: 'Succession planning, philanthropic advisory, and intergenerational wealth transfer across jurisdictions.' },
  { icon: Globe, title: 'Cross-Border Advisory', desc: 'CRS, AEOI, and FATCA compliance. Multi-jurisdiction regulatory navigation for families with global footprints.' },
  { icon: Building2, title: 'Family Office Services', desc: 'Governance frameworks, next-generation education, consolidated reporting, and lifestyle management.' },
  { icon: BarChart3, title: 'Market Intelligence', desc: 'Institutional-grade research, macroeconomic analysis, and bespoke portfolio insights delivered to your dashboard.' },
];

const OFFICES = [
  { city: 'Singapore', label: 'Headquarters', address: '6 Battery Road, Raffles Place', tz: 'GMT+8' },
  { city: 'Hong Kong', label: 'Greater China', address: 'Two International Finance Centre, Central', tz: 'GMT+8' },
  { city: 'Dubai', label: 'Middle East', address: 'Gate Village, Building 5, DIFC', tz: 'GMT+4' },
  { city: 'Tokyo', label: 'Japan', address: 'Otemachi Financial City, Chiyoda', tz: 'GMT+9' },
  { city: 'Taipei', label: 'Taiwan', address: 'Xinyi District, Taipei 101 Tower', tz: 'GMT+8' },
];

const INSIGHTS = [
  { category: 'REGULATORY', title: 'The Shifting Landscape of Cross-Border Wealth Structuring', date: 'February 2026', excerpt: 'New CRS reporting requirements and their implications for multi-jurisdictional family wealth.' },
  { category: 'INVESTMENT', title: 'Why Open Architecture Outperforms in Volatile Markets', date: 'January 2026', excerpt: 'Independent advisory and multi-custodian strategies show resilience when proprietary models falter.' },
  { category: 'FAMILY OFFICE', title: 'Next-Generation Family Governance: Beyond the Boardroom', date: 'December 2025', excerpt: 'Engaging Gen Z heirs in wealth stewardship through education, inclusion, and shared purpose.' },
];

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      setShowTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div className="film-grain">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-header' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => scrollTo('hero')} className="font-display text-xl tracking-[0.15em] text-pearl-100 hover:text-sage-400 transition-colors">
            CRESTBORNE
          </button>
          <nav className="hidden md:flex items-center gap-8">
            {['services', 'approach', 'global', 'insights'].map(s => (
              <button key={s} onClick={() => scrollTo(s)} className="text-sm text-pearl-200 hover:text-sage-300 transition-colors capitalize tracking-wide">
                {s === 'global' ? 'Global Presence' : s}
              </button>
            ))}
            <button onClick={() => scrollTo('contact')} className="btn-sage text-xs py-2 px-5">
              Contact
            </button>
          </nav>
          <button className="md:hidden text-pearl-100" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden fixed inset-0 top-0 z-40" style={{ background: 'rgba(8,14,26,0.96)' }}>
            <div className="flex flex-col items-center justify-center h-full gap-8">
              {['services', 'approach', 'global', 'insights', 'contact'].map(s => (
                <button key={s} onClick={() => scrollTo(s)} className="font-display text-2xl text-pearl-100 hover:text-sage-300 transition-colors capitalize">
                  {s === 'global' ? 'Global Presence' : s}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Suspense fallback={<div className="absolute inset-0" style={{ background: '#080e1a' }} />}>
          <GravitationalLensHero />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-t from-[#080e1a] via-transparent to-transparent" style={{ zIndex: 1 }} />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto" style={{ animation: 'fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.3s both' }}>
          <p className="eyebrow mb-6">Crestborne Private Office</p>
          <h1 className="font-display font-light text-pearl-100 mb-6" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', lineHeight: 1.1 }}>
            Where Legacy Meets Precision
          </h1>
          <p className="text-pearl-200 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed" style={{ animation: 'fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.6s both' }}>
            Independent wealth advisory for ultra-high-net-worth families across Asia-Pacific and the Middle East.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center" style={{ animation: 'fadeSlideUp 1s cubic-bezier(0.16,1,0.3,1) 0.8s both' }}>
            <button onClick={() => scrollTo('contact')} className="btn-sage">Schedule a Consultation</button>
            <button onClick={() => scrollTo('approach')} className="btn-ghost">Our Approach</button>
          </div>
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-12 flex-wrap" style={{ animation: 'fadeIn 1.5s ease 1.2s both' }}>
            {['MAS Licensed', 'SFC Regulated', 'DIFC Authorised'].map(badge => (
              <span key={badge} className="text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-sm border border-sage-600/20 text-sage-400">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <p className="eyebrow mb-3">Capabilities</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-pearl-100 mb-16">
            Institutional-Grade Private Wealth
          </h2>
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 glass-card p-8 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-sm flex items-center justify-center mb-6" style={{ background: 'rgba(138,158,143,0.1)' }}>
                  <Shield size={20} className="text-sage-400" />
                </div>
                <h3 className="font-display text-2xl font-light text-pearl-100 mb-4">Investment Management</h3>
                <p className="text-pearl-200 text-sm leading-relaxed mb-6">
                  Multi-asset, multi-custodian portfolio construction. Open architecture ensures access to best-in-class products across global equities, fixed income, alternatives, and structured products — free from proprietary bias.
                </p>
              </div>
              <button onClick={() => scrollTo('approach')} className="text-sage-400 text-sm flex items-center gap-2 hover:gap-3 transition-all">
                Learn about our approach <ChevronRight size={14} />
              </button>
            </div>
            <div className="lg:col-span-3 grid sm:grid-cols-2 gap-6">
              {SERVICES.slice(1, 5).map((s) => (
                <div key={s.title} className="glass-card p-6">
                  <div className="w-9 h-9 rounded-sm flex items-center justify-center mb-4" style={{ background: 'rgba(138,158,143,0.1)' }}>
                    <s.icon size={18} className="text-sage-400" />
                  </div>
                  <h3 className="font-display text-lg font-light text-pearl-100 mb-2">{s.title}</h3>
                  <p className="text-pearl-300 text-xs leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 glass-card p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(138,158,143,0.1)' }}>
              <BarChart3 size={18} className="text-sage-400" />
            </div>
            <div>
              <h3 className="font-display text-lg font-light text-pearl-100 mb-1">{SERVICES[5].title}</h3>
              <p className="text-pearl-300 text-xs leading-relaxed">{SERVICES[5].desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Approach (Silk Threads) */}
      <section id="approach" className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: '#080e1a' }}>
          <SilkThreadsBg />
        </div>
        <div className="absolute inset-0" style={{ background: 'rgba(8,14,26,0.4)', zIndex: 1 }} />
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <p className="eyebrow mb-3">Our Model</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-pearl-100 mb-4">
            The EAM Advantage
          </h2>
          <p className="text-pearl-200 text-sm max-w-xl mb-16 leading-relaxed">
            As an independent External Asset Manager, we sit on your side of the table. No proprietary products. No custodian conflicts. Your wealth, managed with precision and transparency.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: 'Open Architecture', desc: 'Access to global custodian banks and best-in-class investment products. We select based on merit, not affiliation.' },
              { icon: Shield, title: 'Independent Advisory', desc: 'Fee-based, conflict-free counsel. Our revenue is tied to your outcomes, not product commissions.' },
              { icon: Building2, title: 'Multi-Custodian', desc: 'Assets distributed across multiple institutions and jurisdictions for optimal protection and regulatory diversification.' },
            ].map((item) => (
              <div key={item.title} className="glass-card p-8">
                <item.icon size={24} className="text-sage-400 mb-6" />
                <h3 className="font-display text-xl font-light text-pearl-100 mb-3">{item.title}</h3>
                <p className="text-pearl-200 text-sm leading-relaxed">{item.desc}</p>
                <div className="accent-line mt-6" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <section id="global" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <p className="eyebrow mb-3">Global Reach</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-pearl-100 mb-16">
            Strategically Positioned
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFICES.map((o) => (
              <div key={o.city} className="glass-card p-6 group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 rounded-full bg-sage-400 group-hover:shadow-sage-glow transition-shadow" />
                  <span className="text-[10px] tracking-widest uppercase text-sage-500">{o.label}</span>
                </div>
                <h3 className="font-display text-2xl font-light text-pearl-100 mb-2">{o.city}</h3>
                <p className="text-pearl-300 text-xs flex items-center gap-2">
                  <MapPin size={12} className="text-sage-500 flex-shrink-0" /> {o.address}
                </p>
                <p className="text-midnight-500 text-[10px] mt-3 tracking-wider">{o.tz}</p>
              </div>
            ))}
          </div>
          <div className="accent-line mt-16" />
        </div>
      </section>

      {/* Insights */}
      <section id="insights" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <p className="eyebrow mb-3">Insights</p>
          <h2 className="font-display text-3xl md:text-4xl font-light text-pearl-100 mb-16">
            Market Intelligence
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {INSIGHTS.map((article) => (
              <article key={article.title} className="glass-card p-8 flex flex-col group cursor-pointer">
                <span className="text-[9px] tracking-[0.25em] uppercase text-sage-400 mb-4">{article.category}</span>
                <h3 className="font-display text-xl font-light text-pearl-100 mb-3 leading-snug group-hover:text-sage-300 transition-colors">
                  {article.title}
                </h3>
                <p className="text-pearl-300 text-xs leading-relaxed mb-6 flex-1">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-midnight-500 text-[10px] tracking-wider">{article.date}</span>
                  <span className="text-sage-400 text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                    Read <ChevronRight size={12} />
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="eyebrow mb-3">Contact</p>
              <h2 className="font-display text-3xl md:text-4xl font-light text-pearl-100 mb-6">
                Begin a Conversation
              </h2>
              <p className="text-pearl-200 text-sm leading-relaxed mb-8 max-w-md">
                We work with individuals and families with investable assets exceeding USD 10 million. All inquiries are treated with strict confidentiality.
              </p>
              <div className="space-y-4 mb-8">
                <a href="mailto:enquiries@crestborne.com" className="flex items-center gap-3 text-pearl-200 text-sm hover:text-sage-300 transition-colors">
                  <Mail size={16} className="text-sage-500" /> enquiries@crestborne.com
                </a>
                <a href="tel:+6562001000" className="flex items-center gap-3 text-pearl-200 text-sm hover:text-sage-300 transition-colors">
                  <Phone size={16} className="text-sage-500" /> +65 6200 1000
                </a>
                <div className="flex items-center gap-3 text-pearl-200 text-sm">
                  <MapPin size={16} className="text-sage-500" /> 6 Battery Road, Raffles Place, Singapore
                </div>
              </div>
              <div className="accent-line" />
            </div>
            <div className="glass-card p-8">
              <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-sage-500 mb-2 block">Full Name</label>
                  <input type="text" className="input-field" placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-sage-500 mb-2 block">Email</label>
                  <input type="email" className="input-field" placeholder="your@email.com" />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-sage-500 mb-2 block">Phone</label>
                  <input type="tel" className="input-field" placeholder="+65..." />
                </div>
                <div>
                  <label className="text-[10px] tracking-widest uppercase text-sage-500 mb-2 block">How can we assist?</label>
                  <select className="input-field" defaultValue="">
                    <option value="" disabled>Select a service</option>
                    <option>Investment Management</option>
                    <option>Wealth Structuring</option>
                    <option>Trust & Estate</option>
                    <option>Cross-Border Advisory</option>
                    <option>Family Office Services</option>
                    <option>General Enquiry</option>
                  </select>
                </div>
                <button type="submit" className="btn-sage w-full mt-2">Submit Enquiry</button>
                <p className="text-midnight-500 text-[10px] text-center tracking-wider mt-3">
                  All inquiries are treated with strict confidentiality.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-sage-600/10" style={{ background: '#060a14' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 mb-12">
            <div>
              <p className="font-display text-lg tracking-[0.15em] text-pearl-100 mb-4">CRESTBORNE</p>
              <p className="text-pearl-300 text-xs leading-relaxed mb-4">
                Independent wealth advisory for ultra-high-net-worth families across Asia-Pacific and the Middle East.
              </p>
              <div className="flex gap-4">
                {['MAS', 'SFC', 'DIFC'].map(r => (
                  <span key={r} className="text-[9px] tracking-[0.2em] text-sage-500 border border-sage-600/15 px-2 py-1 rounded-sm">{r}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-sage-500 mb-4">Navigation</p>
              <div className="space-y-3">
                {['services', 'approach', 'global', 'insights', 'contact'].map(s => (
                  <button key={s} onClick={() => scrollTo(s)} className="block text-pearl-300 text-xs hover:text-sage-300 transition-colors capitalize">
                    {s === 'global' ? 'Global Presence' : s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-sage-500 mb-4">Headquarters</p>
              <p className="text-pearl-300 text-xs leading-relaxed">
                6 Battery Road<br />
                Raffles Place<br />
                Singapore 049909
              </p>
              <p className="text-pearl-300 text-xs mt-4">+65 6200 1000</p>
              <p className="text-pearl-300 text-xs">enquiries@crestborne.com</p>
            </div>
          </div>
          <div className="accent-line mb-8" />
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-midnight-500 text-[10px] tracking-wider">
              &copy; 2026 Crestborne Private Office. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Disclaimer'].map(t => (
                <span key={t} className="text-midnight-500 text-[10px] tracking-wider cursor-pointer hover:text-sage-500 transition-colors">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-sm flex items-center justify-center border border-sage-600/20 hover:border-sage-400 transition-all"
          style={{ background: 'rgba(8,14,26,0.85)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease' }}
          aria-label="Back to top"
        >
          <ArrowUp size={16} className="text-sage-400" />
        </button>
      )}
    </div>
  );
}
