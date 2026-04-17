import { useState, useEffect } from 'react'
import heroImg from './assets/hero.png'
import './App.css'

const WHATSAPP = '254799030211'
const wa = (msg: string) => window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')

type Service = { id: string; label: string; desc: string; price: number; emoji: string }

const SERVICES: Service[] = [
  { id: 'dress_single', emoji: '👗', label: 'Clothing Shoot', desc: 'Per dress – single angle', price: 100 },
  { id: 'dress_set',    emoji: '✨', label: 'Full Set Shoot', desc: 'Front, Side & Back per dress', price: 500 },
  { id: 'family_studio',emoji: '🏠', label: 'Studio Portrait', desc: 'Individual / couple / family', price: 2000 },
  { id: 'family_outdoor',emoji:'🌿', label: 'Outdoor Portrait', desc: 'Natural light session', price: 3000 },
  { id: 'event_photo',  emoji: '🎉', label: 'Event Photography', desc: 'Full event coverage', price: 5000 },
  { id: 'event_video',  emoji: '🎬', label: 'Event Videography', desc: 'Cinematic video coverage', price: 8000 },
  { id: 'passport',     emoji: '🪪', label: 'Passport Photos', desc: 'Instant processing & print', price: 300 },
]

const PACKAGES = [
  {
    name: 'Starter',
    tag: 'Perfect for individuals',
    price: 1500,
    items: ['1 outfit', '5 edited photos', 'Studio lighting', 'Same-day delivery'],
  },
  {
    name: 'Fashion Model',
    tag: 'Most popular',
    price: 4000,
    items: ['3 outfits', '20 edited photos', 'Full posing guidance', 'Studio + outdoor option'],
    highlight: true,
  },
  {
    name: 'Brand Premium',
    tag: 'For fashion brands',
    price: 9000,
    items: ['Unlimited outfits', '50+ edited photos', 'Video clips included', 'Makeup support', 'Priority delivery'],
  },
]

const TESTIMONIALS = [
  { name: 'Amina K.', text: "Best studio I've used for my fashion brand. Very professional and fast delivery!", stars: 5 },
  { name: 'Fatuma M.', text: 'My passport photos came out so clean. The team is friendly and quick.', stars: 5 },
  { name: 'Zara H.', text: 'Booked a family shoot — the photos were stunning. Highly recommend!', stars: 5 },
]

type CartItem = Service & { qty: number }

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [date, setDate] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuOpen && !(e.target as Element).closest('.topnav')) setMenuOpen(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.1 }
    )
    document.querySelectorAll('.section').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const add = (svc: Service) =>
    setCart(prev => {
      const ex = prev.find(i => i.id === svc.id)
      return ex ? prev.map(i => i.id === svc.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...svc, qty: 1 }]
    })

  const remove = (id: string) => setCart(prev => prev.filter(i => i.id !== id))
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const bookCart = () => {
    const lines = cart.map(i => `• ${i.label} x${i.qty} = KSh ${(i.price * i.qty).toLocaleString()}`).join('\n')
    wa(`Hi Color Studios 👋\n\nI'd like to book:\n\n${lines}\n\nTotal: KSh ${total.toLocaleString()}\nPreferred date: ${date || '___'}`)
  }

  const bookPackage = (pkg: typeof PACKAGES[0]) =>
    wa(`Hi Color Studios 👋\n\nI'm interested in the *${pkg.name} Package* (KSh ${pkg.price.toLocaleString()}).\n\nPreferred date: ___`)

  const bookService = (svc: Service) =>
    wa(`Hi Color Studios 👋\n\nI'd like to book: *${svc.label}*\nPrice: KSh ${svc.price.toLocaleString()}\n\nPreferred date: ___`)

  return (
    <>
      {/* ── NAV ── */}
      <nav className={`topnav${menuOpen ? ' open' : ''}`}>
        <a href="#" className="nav-logo">Color Studios</a>
        <button className="nav-toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
        <ul className="nav-links" onClick={() => setMenuOpen(false)}>
          {[['#portfolio','Portfolio'],['#services','Services'],['#packages','Packages'],['#booking','Book'],['#testimonials','Reviews'],['#location','Location']].map(([href, label]) => (
            <li key={href}><a href={href}>{label}</a></li>
          ))}
        </ul>
      </nav>

      {/* ── HERO ── */}
      <header className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="hero-overlay">
          <p className="hero-eyebrow">✦ Nairobi's Premier Photography Studio</p>
          <h1 className="logo">Color Studios</h1>
          <p className="sub">We create images that sell your brand and tell your story.<br />Book your session in seconds via WhatsApp.</p>
          <div className="hero-btns">
            <a href="#portfolio" className="btn btn-primary">View Portfolio</a>
            <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi Color Studios 👋, I\'d like to book a session!')}`}
               target="_blank" rel="noreferrer" className="btn btn-outline">
              📲 Book via WhatsApp
            </a>
          </div>
        </div>
      </header>

      {/* ── PORTFOLIO ── */}
      <section id="portfolio" className="section">
        <p className="section-eyebrow">Our Work</p>
        <h2>Our Work Speaks for Itself</h2>
        <div className="categories">
          {['Fashion / Product', 'Studio Portraits', 'Events', 'Passport'].map(c => (
            <span key={c} className="cat-tag">{c}</span>
          ))}
        </div>
        <div className="grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="grid-item">
              <div className="placeholder-img">📷</div>
            </div>
          ))}
        </div>
        <p className="grid-note">Drop your photos into <code>src/assets/</code> and replace the placeholders.</p>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="section alt">
        <p className="section-eyebrow">What We Offer</p>
        <h2>Services &amp; Pricing</h2>
        <div className="services-grid">
          {SERVICES.map(svc => (
            <div key={svc.id} className="service-card">
              <div className="service-icon">{svc.emoji}</div>
              <h3>{svc.label}</h3>
              <p className="service-desc">{svc.desc}</p>
              <div className="service-footer">
                <span className="price">From KSh {svc.price.toLocaleString()}</span>
                <div className="service-actions">
                  <button className="btn btn-sm" onClick={() => add(svc)}>+ Cart</button>
                  <button className="btn btn-sm btn-wa-sm" onClick={() => bookService(svc)}>📲 Book</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section id="packages" className="section">
        <p className="section-eyebrow">Bundles</p>
        <h2>Choose a Package</h2>
        <div className="packages-grid">
          {PACKAGES.map(pkg => (
            <div key={pkg.name} className={`pkg-card${pkg.highlight ? ' pkg-highlight' : ''}`}>
              {pkg.highlight && <div className="pkg-badge">Most Popular</div>}
              <p className="pkg-tag">{pkg.tag}</p>
              <h3 className="pkg-name">{pkg.name}</h3>
              <p className="pkg-price">{pkg.price.toLocaleString()}</p>
              <ul className="pkg-list">
                {pkg.items.map(item => <li key={item}>✓ {item}</li>)}
              </ul>
              <button className="btn btn-primary pkg-btn" onClick={() => bookPackage(pkg)}>
                📲 Book This Package
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOOKING CART ── */}
      <section id="booking" className="section alt">
        <p className="section-eyebrow">Custom Booking</p>
        <h2>Build Your Session</h2>
        {cart.length === 0 ? (
          <p className="empty-cart">Add services from the list above to build a custom booking ☝️</p>
        ) : (
          <div className="cart">
            {cart.map(i => (
              <div key={i.id} className="cart-row">
                <span>{i.label} × {i.qty}</span>
                <span>KSh {(i.price * i.qty).toLocaleString()}</span>
                <button className="btn-remove" onClick={() => remove(i.id)}>✕</button>
              </div>
            ))}
            <div className="cart-total">Total: <strong>KSh {total.toLocaleString()}</strong></div>
            <input type="date" className="date-input" value={date} onChange={e => setDate(e.target.value)} aria-label="Preferred date" />
            <button className="btn btn-primary btn-wa" onClick={bookCart}>📲 Send Booking via WhatsApp</button>
          </div>
        )}
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="section">
        <p className="section-eyebrow">Client Love</p>
        <h2>What Our Clients Say</h2>
        <div className="stats-row">
          {[['500+', 'Clients Served'], ['98%', 'Satisfaction Rate'], ['3+', 'Years Experience']].map(([n, l]) => (
            <div key={l} className="stat"><span className="stat-num">{n}</span><span className="stat-label">{l}</span></div>
          ))}
        </div>
        <div className="testimonials-grid">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="testimonial-card">
              <div className="stars">{'★'.repeat(t.stars)}</div>
              <p className="testimonial-text">"{t.text}"</p>
              <p className="testimonial-name">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LOCATION ── */}
      <section id="location" className="section alt">
        <p className="section-eyebrow">Visit Us</p>
        <h2>Find Us in Eastleigh</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>📍 Location</h3>
            <p>Istanbul Building, 5th Floor, Room S48</p>
            <p>Eastleigh — Opposite Tokyo Mall</p>
            <p className="info-badge">✔ Lift available &nbsp;·&nbsp; Secure building &nbsp;·&nbsp; Easy access</p>
          </div>
          <div className="info-card">
            <h3>⏰ Working Hours</h3>
            <p>Mon – Sat: 8:00 AM – 7:00 PM</p>
            <p>Sunday: 10:00 AM – 4:00 PM</p>
            <a className="btn btn-primary info-btn"
               href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi, I\'d like to book a session at Color Studios!')}`}
               target="_blank" rel="noreferrer">
              📲 Book Now
            </a>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="section final-cta">
        <h2>Ready for Your Shoot?</h2>
        <p>Book in 30 seconds — just tap below and send a message.</p>
        <a className="btn btn-primary btn-lg"
           href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi Color Studios 👋, I\'d like to book a session!')}`}
           target="_blank" rel="noreferrer">
          📲 Book on WhatsApp Now
        </a>
      </section>

      {/* ── STICKY CTA ── */}
      <a className="sticky-wa" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noreferrer" aria-label="Book on WhatsApp">
        📲 Book on WhatsApp
      </a>

      <footer>
        <p>© {new Date().getFullYear()} <span>Color Studios</span> · Istanbul Building, 5th Floor Room S48, Eastleigh, Nairobi</p>
      </footer>
    </>
  )
}
