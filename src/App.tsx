import { useState, useEffect } from 'react'
import heroImg from './assets/hero.png'
import './App.css'

const WHATSAPP = '254799030211'

type Service = { id: string; label: string; price: number }

const SERVICES: Service[] = [
  { id: 'dress_single', label: 'Clothing shoot – per dress', price: 100 },
  { id: 'dress_set', label: 'Clothing shoot – full set (Front/Side/Back)', price: 500 },
  { id: 'family_studio', label: 'Family portrait – studio', price: 2000 },
  { id: 'family_outdoor', label: 'Family portrait – outdoor', price: 3000 },
  { id: 'event_photo', label: 'Event photography', price: 5000 },
  { id: 'event_video', label: 'Event videography', price: 8000 },
  { id: 'passport', label: 'Passport photos (instant)', price: 300 },
]

type CartItem = Service & { qty: number }

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [date, setDate] = useState('')

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => e.target.classList.toggle('visible', e.isIntersecting)),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.section').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const add = (svc: Service) =>
    setCart(prev => {
      const existing = prev.find(i => i.id === svc.id)
      return existing
        ? prev.map(i => i.id === svc.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...svc, qty: 1 }]
    })

  const remove = (id: string) => setCart(prev => prev.filter(i => i.id !== id))

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0)

  const bookOnWhatsApp = () => {
    const lines = cart.map(i => `• ${i.label} x${i.qty} = KSh ${i.price * i.qty}`).join('%0A')
    const msg = `Hello Color Studios, I'd like to book:%0A%0A${lines}%0A%0ATotal: KSh ${total}%0APreferred date: ${date || '___'}`
    window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank')
  }

  return (
    <>
      {/* ── HERO ── */}
      <header className="hero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="hero-overlay">
          <p className="hero-eyebrow">✦ Nairobi's Premier Studio</p>
          <h1 className="logo">Color Studios</h1>
          <p className="tagline">Fashion · Portraits · Events · Passport</p>
          <p className="sub">Professional photography that tells your story.<br />Book your session instantly on WhatsApp.</p>
          <div className="hero-btns">
            <a href="#services" className="btn btn-outline">View Services</a>
            <a href="#booking" className="btn btn-primary">Book Now</a>
          </div>
        </div>
      </header>

      {/* ── PORTFOLIO ── */}
      <section id="portfolio" className="section">
        <h2>Portfolio</h2>
        <div className="categories">
          {['Fashion / Product', 'Family Portraits', 'Events', 'Passport'].map(c => (
            <span key={c} className="cat-tag">{c}</span>
          ))}
        </div>
        <div className="grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid-item">
              <div className="placeholder-img">📷</div>
            </div>
          ))}
        </div>
        <p className="grid-note">Add your photos to <code>src/assets/</code> and replace the placeholders above.</p>
      </section>

      {/* ── SERVICES & PRICING ── */}
      <section id="services" className="section alt">
        <h2>Services &amp; Pricing</h2>
        <div className="services-grid">
          {[
            { emoji: '👗', title: 'Product Photography', items: SERVICES.slice(0, 2) },
            { emoji: '👨‍👩‍👧', title: 'Family Portraits', items: SERVICES.slice(2, 4) },
            { emoji: '🎉', title: 'Events', items: SERVICES.slice(4, 6) },
            { emoji: '🪪', title: 'Passport Photos', items: SERVICES.slice(6) },
          ].map(group => (
            <div key={group.title} className="service-card">
              <div className="service-icon">{group.emoji}</div>
              <h3>{group.title}</h3>
              {group.items.map(svc => (
                <div key={svc.id} className="service-row">
                  <span>{svc.label}</span>
                  <span className="price">KSh {svc.price.toLocaleString()}</span>
                  <button className="btn btn-sm" onClick={() => add(svc)}>+ Add</button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── BOOKING CART ── */}
      <section id="booking" className="section">
        <h2>Your Booking</h2>
        {cart.length === 0 ? (
          <p className="empty-cart">No services added yet. Pick from the list above ☝️</p>
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
            <input
              type="date"
              className="date-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              aria-label="Preferred date"
            />
            <button className="btn btn-primary btn-wa" onClick={bookOnWhatsApp}>
              📲 Book via WhatsApp
            </button>
          </div>
        )}
      </section>

      {/* ── WHY US ── */}
      <section className="section alt">
        <h2>Why Choose Us</h2>
        <div className="why-grid">
          {[
            ['🏆', 'High-quality images'],
            ['⚡', 'Fast delivery'],
            ['💰', 'Affordable pricing'],
            ['🎬', 'Professional studio setup'],
          ].map(([icon, text]) => (
            <div key={text} className="why-card">
              <span className="why-icon">{icon}</span>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── LOCATION + HOURS ── */}
      <section className="section">
        <h2>Find Us</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>📍 Location</h3>
            <p>Istanbul Building, 5th Floor, Room S48</p>
            <p>Eastleigh (Opposite Tokyo Mall)</p>
            <p>✔ Lift available</p>
          </div>
          <div className="info-card">
            <h3>⏰ Working Hours</h3>
            <p>Mon – Sat: 8:00 AM – 7:00 PM</p>
            <p>Sunday: 10:00 AM – 4:00 PM</p>
          </div>
        </div>
      </section>

      {/* ── STICKY CTA ── */}
      <a
        className="sticky-wa"
        href={`https://wa.me/${WHATSAPP}`}
        target="_blank"
        rel="noreferrer"
        aria-label="Book on WhatsApp"
      >
        📲 Book on WhatsApp
      </a>
    </>
  )
}
