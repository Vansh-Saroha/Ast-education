import { Fragment, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFacts } from '../lib/facts';
import { SOCIAL } from '../lib/site';
import ContactLearningUniverse from '../components/ContactLearningUniverse';

const AST_EDUCATION_ADDRESS = '244/A, Purvi Deen Dayal, Opposite Canara Bank, DAV Inter College Road, Roorkee, Haridwar, Uttarakhand 247667.';
const AST_EDUCATION_MAP_URL = 'https://www.google.com/maps/place/All+Studies+%26+Technical+Education(+AST+EDUCATION),+Roorkee/@29.8350945,77.9195146,13z/data=!4m9!1m2!2m1!1s244%2FA,+Purvi+Deen+Dayal,+Opposite+Canara+Bank,+DAV+Inter+College+Road,+Roorkee,+Haridwar,+Uttarakhand+247667.!3m5!1s0x390eb37f8f629fe5:0xcc3c34df09fec34d!8m2!3d29.8722079!4d77.8812569!16s%2Fg%2F11fswmxp6n?entry=ttu&g_ep=EgoyMDI2MTEwNC4wIKXMDSoASAFQAw%3D%3D';

export default function ContactPage() {
  // Contact channels come from verified facts; the location uses the address supplied for AST Education.
  const { facts, items, availability, snapshotDate } = useFacts();
  const [copyStatus, setCopyStatus] = useState('');
  const address = AST_EDUCATION_ADDRESS;
  const phone = facts.phone ?? '';
  const whatsapp = facts.whatsapp ?? '';
  const hours = facts.hours; // present only when verified on the server; never taken from the snapshot
  const digits = whatsapp.replace(/\D/g, '');
  const customFacts = items?.filter((fact) => fact.custom) ?? [];

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(address);
      setCopyStatus('Address copied.');
    } catch {
      setCopyStatus('Copy is not available here. Select the address and copy it manually.');
    }
  }

  return (
    <section className="wrap sec contact-page" aria-labelledby="h-contact">
      <h1 id="h-contact" className="contact-page__heading" tabIndex={-1}>Contact Us</h1>
      {availability === 'loading' && <p className="hint" role="status">Checking the latest contact details…</p>}
      {availability === 'fallback' && (
        <div className="note" role="status">
          We could not load the latest details. The details shown are approved details from {snapshotDate}. Please call us to confirm before you visit.
        </div>
      )}
      <div className="contact-layout">
        <div className="card contact-visit-card">
          <div className="contact-visit-card__details">
            <h2>Visit</h2>
            <p>AST Education<br />{address}</p>
            {customFacts.length > 0 && (
              <div className="contact-visit-card__verified">
                <h3>Verified institute details</h3>
                <dl className="facts">
                  {customFacts.map((fact) => (
                    <Fragment key={fact.key}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value} <span className="badge badge-admitted">Verified</span></dd>
                    </Fragment>
                  ))}
                </dl>
              </div>
            )}
          </div>

          <div className="contact-visit-card__visual" aria-label="AST Education in Roorkee, Uttarakhand">
            <span className="contact-visit-card__visual-label">VISIT OUR CENTER</span>
            <span className="contact-visit-card__visual-pin" aria-hidden="true">
              <svg viewBox="0 0 48 48" focusable="false">
                <path d="M24 43s15-14.2 15-26A15 15 0 0 0 9 17c0 11.8 15 26 15 26Z" />
                <circle cx="24" cy="17" r="5.5" />
              </svg>
            </span>
            <span className="contact-visit-card__visual-title">Find us in<br />Roorkee</span>
            <span className="contact-visit-card__visual-caption">All Studies &amp; Technical Education</span>
          </div>

          <div className="contact-visit-card__actions">
            <a className="btn btn-n" href={AST_EDUCATION_MAP_URL} target="_blank" rel="noopener noreferrer">
              Open in Google Maps <span aria-hidden="true">↗</span>
            </a>
            <button className="btn btn-g" type="button" onClick={copyAddress}>Copy address</button>
          </div>
          <p className="hint contact-visit-card__copy-status" aria-live="polite">{copyStatus}</p>
        </div>

        <div className="card contact-info-card">
          <h2>Contact Information</h2>
          {phone && <p><a href={`tel:${phone.replace(/\s/g, '')}`}>{phone}</a></p>}
          <div className="contact-info-card__actions">
            {phone && <a className="btn btn-n" href={`tel:${phone.replace(/\s/g, '')}`}>Call now</a>}
            {digits && <a className="btn btn-g" href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>}
          </div>
          <ContactLearningUniverse />
          {hours && (
            <>
              <h3 style={{ marginTop: 20 }}>Working hours</h3>
              <p>{hours}</p>
            </>
          )}
          <div className="contact-info-card__social-block">
            <h3>Social</h3>
            <div className="social contact-info-card__social">
              {SOCIAL.map((item) => (
                <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`AST Education on ${item.label} (opens in a new tab)`} title={item.label}>
                  <img src={item.icon} alt="" width={24} height={24} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
      <p className="contact-page__enquiry">Prefer to write? <Link to="/enquiry">Send an admission enquiry</Link>.</p>
    </section>
  );
}
