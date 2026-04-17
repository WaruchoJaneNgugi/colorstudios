import { useState, useEffect, useRef } from 'react'
import {
  collection, getDocs, addDoc, deleteDoc, doc, setDoc, updateDoc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from './firebase'
import { Images, Layers, Package, Clock, LogOut } from 'lucide-react'
import './admin.css'

const ADMIN_USER = 'Colorstudio@admin'
const ADMIN_PIN  = '2026'

type Tab = 'portfolio' | 'services' | 'packages' | 'hours'

// ── types ──────────────────────────────────────────────
interface PortfolioItem { id: string; url: string; category: string }
interface Service       { id: string; emoji: string; label: string; desc: string; price: number }
interface Package       { id: string; name: string; tag: string; price: number; items: string; highlight: boolean }
interface Hours         { id: string; days: string; time: string }

export default function AdminPanel() {
  const [authed, setAuthed]   = useState(false)
  const [user, setUser]       = useState('')
  const [pin, setPin]         = useState('')
  const [error, setError]     = useState('')
  const [tab, setTab]         = useState<Tab>('portfolio')

  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [services,  setServices]  = useState<Service[]>([])
  const [packages,  setPackages]  = useState<Package[]>([])
  const [hours,     setHours]     = useState<Hours[]>([])

  const fileRef = useRef<HTMLInputElement>(null)

  const login = () => {
    if (user === ADMIN_USER && pin === ADMIN_PIN) { setAuthed(true); setError('') }
    else setError('Invalid username or PIN')
  }

  // ── fetch ──────────────────────────────────────────
  const fetch = async () => {
    const [p, s, pk, h] = await Promise.all([
      getDocs(collection(db, 'portfolio')),
      getDocs(collection(db, 'services')),
      getDocs(collection(db, 'packages')),
      getDocs(collection(db, 'hours')),
    ])
    setPortfolio(p.docs.map(d => ({ id: d.id, ...d.data() } as PortfolioItem)))
    setServices(s.docs.map(d => ({ id: d.id, ...d.data() } as Service)))
    setPackages(pk.docs.map(d => ({ id: d.id, ...d.data() } as Package)))
    setHours(h.docs.map(d => ({ id: d.id, ...d.data() } as Hours)))
  }

  useEffect(() => { if (authed) fetch() }, [authed])

  // ── portfolio ──────────────────────────────────────
  const uploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    const storageRef = ref(storage, `portfolio/${Date.now()}_${file.name}`)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    const cat = (document.getElementById('photo-cat') as HTMLSelectElement).value
    await addDoc(collection(db, 'portfolio'), { url, category: cat })
    fetch()
  }

  const deletePhoto = async (item: PortfolioItem) => {
    try { await deleteObject(ref(storage, item.url)) } catch {}
    await deleteDoc(doc(db, 'portfolio', item.id))
    fetch()
  }

  // ── services ──────────────────────────────────────
  const [svcForm, setSvcForm] = useState({ emoji:'', label:'', desc:'', price:'' })
  const saveService = async () => {
    if (!svcForm.label) return
    await addDoc(collection(db, 'services'), { ...svcForm, price: Number(svcForm.price) })
    setSvcForm({ emoji:'', label:'', desc:'', price:'' }); fetch()
  }
  const deleteService = async (id: string) => { await deleteDoc(doc(db, 'services', id)); fetch() }

  // ── packages ──────────────────────────────────────
  const [pkgForm, setPkgForm] = useState({ name:'', tag:'', price:'', items:'', highlight: false })
  const savePackage = async () => {
    if (!pkgForm.name) return
    await addDoc(collection(db, 'packages'), { ...pkgForm, price: Number(pkgForm.price) })
    setPkgForm({ name:'', tag:'', price:'', items:'', highlight: false }); fetch()
  }
  const deletePackage = async (id: string) => { await deleteDoc(doc(db, 'packages', id)); fetch() }
  const toggleHighlight = async (pkg: Package) => {
    await updateDoc(doc(db, 'packages', pkg.id), { highlight: !pkg.highlight }); fetch()
  }

  // ── hours ──────────────────────────────────────────
  const [hrForm, setHrForm] = useState({ days:'', time:'' })
  const saveHours = async () => {
    if (!hrForm.days) return
    // upsert by days key
    await setDoc(doc(db, 'hours', hrForm.days.replace(/\s/g,'-')), hrForm)
    setHrForm({ days:'', time:'' }); fetch()
  }
  const deleteHours = async (id: string) => { await deleteDoc(doc(db, 'hours', id)); fetch() }

  // ── login screen ──────────────────────────────────
  if (!authed) return (
    <div className="admin-login">
      <div className="admin-login-card">
        <p className="admin-eyebrow">Admin Access</p>
        <h1>Color Studios</h1>
        <input placeholder="Username" value={user} onChange={e => setUser(e.target.value)} />
        <input placeholder="PIN" type="password" value={pin} onChange={e => setPin(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()} />
        {error && <p className="admin-error">{error}</p>}
        <button onClick={login}>Login</button>
      </div>
    </div>
  )

  return (
    <div className="admin-wrap">
      <header className="admin-header">
        <span>Color Studios — Admin</span>
        <button className="admin-logout" onClick={() => setAuthed(false)}>Logout</button>
      </header>

      <nav className="admin-tabs">
        {(['portfolio','services','packages','hours'] as Tab[]).map(t => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      {/* mobile bottom nav */}
      <nav className="admin-bottom-nav">
        {([
          { t:'portfolio', icon:<Images size={20}/>,  label:'Portfolio' },
          { t:'services',  icon:<Layers size={20}/>,  label:'Services'  },
          { t:'packages',  icon:<Package size={20}/>, label:'Packages'  },
          { t:'hours',     icon:<Clock size={20}/>,   label:'Hours'     },
        ] as {t:Tab, icon:React.ReactNode, label:string}[]).map(({t,icon,label}) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {icon}<span>{label}</span>
          </button>
        ))}
        <button className="bottom-logout" onClick={() => setAuthed(false)}>
          <LogOut size={20}/><span>Logout</span>
        </button>
      </nav>

      <main className="admin-main">

        {/* ── PORTFOLIO ── */}
        {tab === 'portfolio' && (
          <section>
            <h2>Portfolio Photos</h2>
            <div className="admin-row">
              <select id="photo-cat">
                {['Fashion / Product','Studio Portraits','Events','Passport'].map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={() => fileRef.current?.click()}>+ Upload Photo</button>
              <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}} onChange={uploadPhoto} />
            </div>
            <div className="admin-grid">
              {portfolio.map(p => (
                <div key={p.id} className="admin-photo">
                  <img src={p.url} alt={p.category} />
                  <span>{p.category}</span>
                  <button onClick={() => deletePhoto(p)}>✕</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── SERVICES ── */}
        {tab === 'services' && (
          <section>
            <h2>Services &amp; Pricing</h2>
            <div className="admin-form">
              <select value={svcForm.emoji} onChange={e => setSvcForm(f=>({...f,emoji:e.target.value}))} style={{width:90}}>
                <option value="">Icon</option>
                {['👗','✨','🏠','🌿','🎉','🎬','🪪','📸','💄','👑','🌸','🎀','💅','🕊️','🌺','🎭','🖼️','💍','👒','🌟'].map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              <input placeholder="Label" value={svcForm.label} onChange={e => setSvcForm(f=>({...f,label:e.target.value}))} />
              <input placeholder="Description" value={svcForm.desc} onChange={e => setSvcForm(f=>({...f,desc:e.target.value}))} />
              <input placeholder="Price (KSh)" type="number" value={svcForm.price} onChange={e => setSvcForm(f=>({...f,price:e.target.value}))} style={{width:130}} />
              <button onClick={saveService}>Add</button>
            </div>
            <table className="admin-table">
              <thead><tr><th>Emoji</th><th>Label</th><th>Description</th><th>Price</th><th></th></tr></thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id}>
                    <td>{s.emoji}</td><td>{s.label}</td><td>{s.desc}</td>
                    <td>KSh {s.price.toLocaleString()}</td>
                    <td><button className="del" onClick={() => deleteService(s.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ── PACKAGES ── */}
        {tab === 'packages' && (
          <section>
            <h2>Packages</h2>
            <div className="admin-form">
              <input placeholder="Name" value={pkgForm.name} onChange={e => setPkgForm(f=>({...f,name:e.target.value}))} />
              <input placeholder="Tag line" value={pkgForm.tag} onChange={e => setPkgForm(f=>({...f,tag:e.target.value}))} />
              <input placeholder="Price (KSh)" type="number" value={pkgForm.price} onChange={e => setPkgForm(f=>({...f,price:e.target.value}))} style={{width:130}} />
              <input placeholder="Items (comma separated)" value={pkgForm.items} onChange={e => setPkgForm(f=>({...f,items:e.target.value}))} style={{flex:2}} />
              <label className="admin-check">
                <input type="checkbox" checked={pkgForm.highlight} onChange={e => setPkgForm(f=>({...f,highlight:e.target.checked}))} />
                Popular
              </label>
              <button onClick={savePackage}>Add</button>
            </div>
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Tag</th><th>Price</th><th>Popular</th><th></th></tr></thead>
              <tbody>
                {packages.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td><td>{p.tag}</td>
                    <td>KSh {p.price.toLocaleString()}</td>
                    <td>
                      <button className={`toggle ${p.highlight ? 'on' : ''}`} onClick={() => toggleHighlight(p)}>
                        {p.highlight ? '★ Yes' : '☆ No'}
                      </button>
                    </td>
                    <td><button className="del" onClick={() => deletePackage(p.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ── HOURS ── */}
        {tab === 'hours' && (
          <section>
            <h2>Working Hours</h2>
            <div className="admin-form">
              <input placeholder="Days (e.g. Mon – Sat)" value={hrForm.days} onChange={e => setHrForm(f=>({...f,days:e.target.value}))} />
              <input placeholder="Time (e.g. 8:00 AM – 7:00 PM)" value={hrForm.time} onChange={e => setHrForm(f=>({...f,time:e.target.value}))} />
              <button onClick={saveHours}>Save</button>
            </div>
            <table className="admin-table">
              <thead><tr><th>Days</th><th>Time</th><th></th></tr></thead>
              <tbody>
                {hours.map(h => (
                  <tr key={h.id}>
                    <td>{h.days}</td><td>{h.time}</td>
                    <td><button className="del" onClick={() => deleteHours(h.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

      </main>
    </div>
  )
}
