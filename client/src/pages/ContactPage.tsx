import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useFacts } from '../lib/facts';

const SOCIAL = [
  { label: 'Instagram', href: 'https://www.instagram.com/asteducation/' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1HffKZQ1Bc/' },
  { label: 'YouTube', href: 'https://youtube.com/@asteducation1411' },
];

export default function ContactPage() {
  // Every business detail comes from verified facts. Fallback values are labelled as such.
  const { facts, availability, snapshotDate } = useFacts();
  const [copyStatus, setCopyStatus] = useState('');
  const address = facts.address ?? '';
  const phone = facts.phone ?? '';
  const whatsapp = facts.whatsapp ?? '';
  const hours = facts.hours; // present only when verified on the server; never taken from the snapshot
  const digits = whatsapp.replace(/\D/g, '');

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setCopyStatus('Address copied.');
    } catch {
      setCopyStatus('Copy is not available here. Select the address and copy it manually.');
    }
  }

  return (
    <section className="wrap sec" aria-labelledby="h-contact">
      <h1 id="h-contact" tabIndex={-1}>Contact Us</h1>
      {availability === 'loading' && <p className="hint" role="status">Checking the latest contact details…</p>}
      {availability === 'fallback' && (
        <div className="note" role="status">
          We could not load the latest details. The details shown are approved details from {snapshotDate}. Please call us to confirm before you visit.
        </div>
      )}
      <div className="cols" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Visit</h2>
          <p>AST Education<br />{address}</p>
          <div className="row">
            {address && <a className="btn btn-o" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`AST Education, ${address}`)}`} target="_blank" rel="noopener noreferrer">Get directions</a>}
            {address && <button className="btn btn-g" type="button" onClick={copyAddress}>Copy address</button>}
          </div>
          <p className="hint" aria-live="polite">{copyStatus}</p>
          <p className="hint">Directions open in Google Maps. Use the address above for text directions.</p>
        </div>

        <div className="card">
          <h2>Call or message</h2>
          {phone && <p><a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a></p>}
          <div className="row">
            {phone && <a className="btn btn-n" href={`tel:${phone.replace(/\s/g, '')}`}>Call now</a>}
            {digits && <a className="btn btn-g" href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          </div>
          {hours && (
            <>
              <h3 style={{ marginTop: 20 }}>Working hours</h3>
              <p>{hours}</p>
            </>
          )}
          <h3 style={{ marginTop: 20 }}>Social</h3>
          <div className="social">
            {SOCIAL.map((s) => (
              <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`AST Education on ${s.label} (opens in a new tab)`}>{s.label}</a>
            ))}
          </div>
        </div>
      </div>
      <p style={{ marginTop: 20 }}>Prefer to write? <Link to="/enquiry">Send an admission enquiry</Link>.</p>
    </section>
  );
}
