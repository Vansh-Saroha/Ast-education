import { useFacts } from '../lib/facts';

// Steps follow the enquiry form and the approved copy ("Course fees and detailed information are shared when you enquire").
const STEPS = [
  { title: 'Send your enquiry', text: 'Fill in the form above with your details and the course you are interested in.' },
  { title: 'We contact you', text: 'Our team reviews your enquiry and contacts you on the number you share, as the consent above describes.' },
  { title: 'Fees and course details', text: 'Course fees and detailed information are shared when you enquire.' },
  { title: 'Follow-up', text: 'Ask us anything else by phone or WhatsApp, and our team will guide you through the next steps.' },
];

export function AdmissionProcess() {
  return (
    <section className="admission-process" aria-labelledby="admission-process-title">
      <h2 id="admission-process-title">How the admission enquiry works</h2>
      <ol className="clay-timeline">
        {STEPS.map((step, index) => (
          <li key={step.title}>
            <span className="clay-milestone-dot" aria-hidden="true">{index + 1}</span>
            <article className="clay-milestone">
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

// Contact details come from verified facts, so a missing live value is simply not shown.
export function ContactAssistance() {
  const { facts } = useFacts();
  const digits = (facts.whatsapp ?? '').replace(/\D/g, '');
  const tel = (facts.phone ?? '').replace(/\s/g, '');
  return (
    <section className="card contact-assist" aria-labelledby="contact-assist-title">
      <h2 id="contact-assist-title">Need help before you enquire?</h2>
      <p>Call or WhatsApp our team if you have questions before you send the form.</p>
      <div className="row">
        {tel && <a className="btn btn-n" href={`tel:${tel}`}>Call {facts.phone}</a>}
        {digits && <a className="btn btn-g" href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer">WhatsApp us</a>}
      </div>
      {facts.hours && <p className="hint">Working hours: {facts.hours}</p>}
      {facts.address && <p className="hint">{facts.address}</p>}
    </section>
  );
}
