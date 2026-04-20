import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import heroImg from './assets/hero.png'
import './App.css'

const WHATSAPP = '254799030211'
const wa = (msg: string) => window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`, '_blank')

type Service = { id: string; label: string; desc: string; price: number; emoji: string }
type Package = { id: string; name: string; tag: string; price: number; items: string; highlight?: boolean }
type Hours   = { id: string; days: string; time: string }

const FALLBACK_SERVICES: Service[] = []
const FALLBACK_PACKAGES: Package[] = []
const FALLBACK_HOURS: Hours[] = []

const TESTIMONIALS: { name: string; text: string; stars: number }[] = []

type CartItem = Service & { qty: number }

export default function App() {
  const [cart, setCart]         = useState<CartItem[]>([])
  const [date, setDate]         = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [services,  setServices]  = useState<Service[]>(FALLBACK_SERVICES)
  const [packages,  setPackages]  = useState<Package[]>(FALLBACK_PACKAGES)
  const [hours,     setHours]     = useState<Hours[]>(FALLBACK_HOURS)
  const [portfolio, setPortfolio] = useState<{id:string;url:string;category:string}[]>([])
  const [lightbox, setLightbox]   = useState<number | null>(null)
  const [activeCategory, setActiveCategory] = useState('Events')

  useEffect(() => {
    Promise.all([
      getDocs(collection(db, 'services')),
      getDocs(collection(db, 'packages')),
      getDocs(collection(db, 'hours')),
      getDocs(collection(db, 'portfolio')),
    ]).then(([s, p, h, pf]) => {
      if (!s.empty) setServices(s.docs.map(d => ({ id: d.id, ...d.data() } as Service)))
      if (!p.empty) setPackages(p.docs.map(d => ({ id: d.id, ...d.data() } as Package)))
      if (!h.empty) setHours(h.docs.map(d => ({ id: d.id, ...d.data() } as Hours)))
      if (!pf.empty) setPortfolio(pf.docs.map(d => ({ id: d.id, ...d.data() } as any)))
    }).catch(() => {})
  }, [])

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

  const bookPackage = (pkg: Package) =>
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
            <span key={c} className={`cat-tag${activeCategory === c ? ' cat-active' : ''}`} onClick={() => { setActiveCategory(c); setLightbox(null) }}>{c}</span>
          ))}
        </div>

        <div className="grid">
          {portfolio.length > 0
            ? portfolio.filter(p => p.category === activeCategory).map((p, i) => (
                <div key={p.id} className="grid-item" onClick={() => setLightbox(i)}>
                  <img src={p.url} alt={p.category} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'top'}} />
                </div>
              ))
            : Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="grid-item"><div className="placeholder-img">📷</div></div>
              ))
          }
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="section alt">
        <p className="section-eyebrow">What We Offer</p>
        <h2>Services &amp; Pricing</h2>
        <div className="services-grid">
          {services.map(svc => (
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
          {packages.map(pkg => (
            <div key={pkg.id} className={`pkg-card${pkg.highlight ? ' pkg-highlight' : ''}`}>
              {pkg.highlight && <div className="pkg-badge">Most Popular</div>}
              <p className="pkg-tag">{pkg.tag}</p>
              <h3 className="pkg-name">{pkg.name}</h3>
              <p className="pkg-price">{pkg.price.toLocaleString()}</p>
              <ul className="pkg-list">
                {String(pkg.items).split(',').map(item => <li key={item}>{item.trim()}</li>)}
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
        {cart.length > 0 && (
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
            {hours.map(h => <p key={h.id}>{h.days}: {h.time}</p>)}
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
        <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      </a>

      <footer>
        <p>© {new Date().getFullYear()} <span>Color Studios</span> · Istanbul Building, 5th Floor Room S48, Eastleigh, Nairobi</p>
      </footer>

      {/* ── LIGHTBOX ── */}
      {lightbox !== null && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lb-close" onClick={() => setLightbox(null)}>✕</button>
          <button className="lb-prev" onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + portfolio.length) % portfolio.length) }}>&#8249;</button>
          <img src={portfolio[lightbox].url} alt={portfolio[lightbox].category} onClick={e => e.stopPropagation()} />
          <span className="lb-category">{portfolio[lightbox].category}</span>
          <button className="lb-next" onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % portfolio.length) }}>&#8250;</button>
        </div>
      )}
    </>
  )
}
