import { useState, useMemo } from 'react'

const KARATS = [24, 22, 18, 14]
const inr = (n) => '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const blank = () => ({ id: crypto.randomUUID(), name: '', karat: 22, weight: '', making: 8 })

export default function App() {
  const [shop, setShop] = useState('Your Jewellers')
  const [customer, setCustomer] = useState({ name: '', phone: '' })
  const [rate24, setRate24] = useState('')
  const [gst, setGst] = useState(3)
  const [discount, setDiscount] = useState('')
  const [items, setItems] = useState([blank()])

  const billNo = useMemo(() => 'GB-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(100 + Math.random() * 900), [])
  const today = new Date().toLocaleDateString('en-IN')

  const rows = items.map((it) => {
    const rate = (Number(rate24) || 0) * it.karat / 24
    const gold = (Number(it.weight) || 0) * rate
    const making = gold * (Number(it.making) || 0) / 100
    return { ...it, rate, gold, making: making, makingPct: it.making, total: gold + making }
  })
  const subtotal = rows.reduce((s, r) => s + r.total, 0)
  const disc = Number(discount) || 0
  const taxable = Math.max(subtotal - disc, 0)
  const gstAmt = taxable * (Number(gst) || 0) / 100
  const grand = taxable + gstAmt

  const update = (id, k, v) => setItems(items.map((i) => (i.id === id ? { ...i, [k]: v } : i)))

  return (
    <div className="page">
      <header className="top no-print">
        <h1>Gold Bill</h1>
        <button className="btn" onClick={() => window.print()}>Print / Save PDF</button>
      </header>

      <section className="card no-print">
        <label>Shop name<input value={shop} onChange={(e) => setShop(e.target.value)} /></label>
        <label>Today's 24K rate (₹/gram)<input type="number" inputMode="decimal" value={rate24} onChange={(e) => setRate24(e.target.value)} placeholder="e.g. 7500" /></label>
        <label>Customer name<input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} /></label>
        <label>Phone<input type="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} /></label>
      </section>

      <section className="no-print">
        <h2>Items</h2>
        {items.map((it) => (
          <div className="item" key={it.id}>
            <input className="wide" placeholder="Item (e.g. Chain)" value={it.name} onChange={(e) => update(it.id, 'name', e.target.value)} />
            <label>Karat
              <select value={it.karat} onChange={(e) => update(it.id, 'karat', Number(e.target.value))}>
                {KARATS.map((k) => <option key={k} value={k}>{k}K</option>)}
              </select>
            </label>
            <label>Weight (g)<input type="number" inputMode="decimal" value={it.weight} onChange={(e) => update(it.id, 'weight', e.target.value)} /></label>
            <label>Making %<input type="number" inputMode="decimal" value={it.making} onChange={(e) => update(it.id, 'making', e.target.value)} /></label>
            {items.length > 1 && <button className="link" onClick={() => setItems(items.filter((i) => i.id !== it.id))}>Remove</button>}
          </div>
        ))}
        <button className="btn ghost" onClick={() => setItems([...items, blank()])}>Add item</button>
        <div className="card">
          <label>Discount (₹)<input type="number" inputMode="decimal" value={discount} onChange={(e) => setDiscount(e.target.value)} /></label>
          <label>GST %<input type="number" inputMode="decimal" value={gst} onChange={(e) => setGst(e.target.value)} /></label>
        </div>
      </section>

      <article className="bill">
        <div className="bill-head">
          <h2>{shop || 'Gold Bill'}</h2>
          <div><div>Bill no: {billNo}</div><div>Date: {today}</div></div>
        </div>
        <p className="to">Billed to: <strong>{customer.name || '—'}</strong>{customer.phone && ` · ${customer.phone}`}</p>
        <div className="scroll">
          <table>
            <thead><tr><th>Item</th><th>Purity</th><th>Wt (g)</th><th>Rate/g</th><th>Gold</th><th>Making</th><th>Amount</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name || '—'}</td><td>{r.karat}K</td><td>{Number(r.weight || 0).toFixed(3)}</td>
                  <td>{inr(r.rate)}</td><td>{inr(r.gold)}</td><td>{inr(r.making)} ({r.makingPct || 0}%)</td><td>{inr(r.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="totals">
          <dt>Subtotal</dt><dd>{inr(subtotal)}</dd>
          {disc > 0 && (<><dt>Discount</dt><dd>− {inr(disc)}</dd></>)}
          <dt>GST ({Number(gst) || 0}%)</dt><dd>{inr(gstAmt)}</dd>
          <dt className="grand">Total</dt><dd className="grand">{inr(grand)}</dd>
        </dl>
        <p className="sign">Authorised signature</p>
      </article>
    </div>
  )
}
