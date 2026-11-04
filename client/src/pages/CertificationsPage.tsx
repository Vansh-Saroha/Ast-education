import { useRef, useState } from 'react';

// Details are copied from the certificates themselves. Do not edit them without checking the documents.
export default function CertificationsPage() {
  const viewer = useRef<HTMLDialogElement>(null);
  const [zoomed, setZoomed] = useState(false);

  return (
    <section className="wrap sec" aria-labelledby="h-cert">
      <h1 id="h-cert" tabIndex={-1}>Certifications &amp; Registrations</h1>
      <p className="note">Udyam registration and ISO 9001:2015 are different things. Udyam is a government business registration for micro enterprises. ISO 9001:2015 is a quality management certificate issued to SUMAN EDUCATIONAL TRUST. Neither is an educational accreditation.</p>
      <div className="cols" style={{ marginTop: 24 }}>
        <article className="card" aria-labelledby="c-udyam">
          <h2 id="c-udyam">Udyam Registration</h2>
          <dl>
            <dt>Enterprise name (as on certificate)</dt><dd>RKE ALLSTUDIES &amp; TECHNICAL EDUCATION (AST EDUCATION)</dd>
            <dt>Registration number</dt><dd>UDYAM-UK-06-0037585</dd>
            <dt>Registration date</dt><dd>27/12/2023</dd>
            <dt>Enterprise type</dt><dd>Micro</dd>
            <dt>Major activity (as printed)</dt><dd>Trading</dd>
          </dl>
          <p className="note" style={{ marginTop: 14 }}>The certificate scan is kept private because it shows personal contact details. It can be shown once the institute confirms a suitable version.</p>
        </article>

        <article className="card" aria-labelledby="c-iso">
          <h2 id="c-iso">ISO 9001:2015</h2>
          <p className="note">This certificate is issued to SUMAN EDUCATIONAL TRUST, the parent organisation. It is not a separate certificate issued to AST Education.</p>
          <dl>
            <dt>Certificate issued to</dt><dd>SUMAN EDUCATIONAL TRUST</dd>
            <dt>Certification body</dt><dd>ICV Assessments Pvt. Ltd.</dd>
            <dt>Certificate number</dt><dd>IN/55611996/3245</dd>
            <dt>Issue date</dt><dd>17/02/2024</dd>
            <dt>Re-certification date</dt><dd>16/02/2027</dd>
            <dt>Scope</dt><dd>Arts and Commerce Education; Medical Education; Design and Animation; Personality Development; Hospitality; Short-Term Courses; Business and Investment; Journalism; Law; Computer Courses; Academic Education.</dd>
          </dl>
          <button className="thumb" type="button" style={{ marginTop: 14 }} onClick={() => viewer.current?.showModal()} aria-label="View the ISO 9001:2015 certificate in a zoomable viewer">
            <img src="/assets/iso.webp" alt="ISO 9001:2015 certificate issued to SUMAN EDUCATIONAL TRUST by ICV Assessments Pvt. Ltd." loading="lazy" />
          </button>
          <p className="hint">Select the certificate to view it. Zoom is available in the viewer.</p>
        </article>
      </div>

      <dialog ref={viewer} aria-label="ISO 9001:2015 certificate viewer" style={{ border: 0, borderRadius: 12, padding: 0, width: 'min(760px, 94vw)' }}>
        <div style={{ padding: 24 }}>
          <button className="x" type="button" aria-label="Close certificate viewer" onClick={() => viewer.current?.close()}>×</button>
          <p className="row" style={{ margin: '0 0 12px' }}>
            <button className="btn btn-g" type="button" aria-pressed={zoomed} onClick={() => setZoomed((z) => !z)}>{zoomed ? 'Zoom out' : 'Zoom in'}</button>
          </p>
          <div className={`lb ${zoomed ? 'zoomed' : ''}`}>
            <img src="/assets/iso.webp" alt="ISO 9001:2015 certificate issued to SUMAN EDUCATIONAL TRUST" />
          </div>
        </div>
      </dialog>
    </section>
  );
}
