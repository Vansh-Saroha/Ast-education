import { useEffect, useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { COURSE_OPTIONS, QUALIFICATIONS, buildWhatsAppUrl, enquirySchema, type EnquiryForm } from '../lib/enquiry';
import { publicGet } from '../lib/publicApi';
import { useFacts } from '../lib/facts';
import { AdmissionProcess, ContactAssistance } from '../components/AdmissionGuide';

const EMPTY: EnquiryForm = {
  studentName: '', mobile: '', email: '', qualification: '', course: '', message: '', consent: false, website: '',
};
const COOLDOWN_MS = 20_000;

function Field({ id, label, error, hint, children }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="err" id={`${id}-error`} role="alert">{error}</p>}
    </div>
  );
}

export default function EnquiryPage() {
  const { facts } = useFacts();
  const whatsapp = facts.whatsapp ?? '';
  const whatsappDigits = whatsapp.replace(/\D/g, '');
  // A course chosen on the Courses page arrives as navigation state, so the form starts pre-selected.
  const presetCourse = (useLocation().state as { course?: string } | null)?.course ?? '';
  const {
    register, handleSubmit, setError, formState: { errors, isSubmitting },
  } = useForm<EnquiryForm>({ resolver: zodResolver(enquirySchema), defaultValues: { ...EMPTY, course: presetCourse }, mode: 'onTouched' });

  const [done, setDone] = useState<{ waUrl: string } | null>(null);
  const [cooling, setCooling] = useState(false);
  const [formError, setFormError] = useState('');
  const [courseOptions, setCourseOptions] = useState(COURSE_OPTIONS);

  useEffect(() => {
    publicGet<{ items: Array<{ name: string }> }>('/courses')
      .then(({ items }) => setCourseOptions(Array.from(new Set([...items.map((course) => course.name), 'Not sure yet']))))
      .catch(() => setCourseOptions(COURSE_OPTIONS));
  }, []);

  const describe = (k: keyof EnquiryForm) => (errors[k] ? `${String(k)}-error` : undefined);

  async function onSubmit(data: EnquiryForm) {
    setFormError('');
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, sourcePage: '/enquiry' }),
      });
      const body = await res.json().catch(() => null);

      if (res.ok) {
        setDone({ waUrl: buildWhatsAppUrl(data, whatsappDigits) });
        setCooling(true);
        window.setTimeout(() => setCooling(false), COOLDOWN_MS);
        return;
      }
      if (res.status === 400 && body?.error?.fields) {
        Object.entries(body.error.fields as Record<string, string[]>).forEach(([field, msgs]) =>
          setError(field as keyof EnquiryForm, { message: msgs[0] }),
        );
        setFormError('Please check the highlighted fields.');
        return;
      }
      setFormError(body?.error?.message ?? 'We could not record your enquiry. Please try again.');
    } catch {
      setFormError('We could not reach the server. Please try again.');
    }
  }

  if (done) {
    return (
      <section className="wrap sec" aria-labelledby="h-enq">
        <div className="narrow">
          <h1 id="h-enq" tabIndex={-1}>Admission Enquiry</h1>
          <div className="note" role="status">
            <p><strong>Thank you. Your enquiry has been recorded.</strong> Our team may contact you on the number you provided.</p>
            {done.waUrl && <p>You can also message us on WhatsApp with your details already filled in.</p>}
            <div className="row">
              {done.waUrl && <a className="btn btn-o" href={done.waUrl} target="_blank" rel="noopener noreferrer">Open WhatsApp</a>}
              <button className="btn btn-g" type="button" disabled={cooling} onClick={() => setDone(null)}>
                {cooling ? 'Please wait a moment' : 'Send another enquiry'}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="wrap sec" aria-labelledby="h-enq">
      <div className="narrow">
        <h1 id="h-enq" tabIndex={-1}>Admission Enquiry</h1>
        <p>Share your details and our team will contact you. We store enquiries securely so we can respond. Read our <a href="/privacy">Privacy Policy</a>.</p>

        <form noValidate onSubmit={handleSubmit(onSubmit)}>
          <Field id="studentName" label="Student name" error={errors.studentName?.message}>
            <input id="studentName" autoComplete="name" maxLength={80} aria-invalid={!!errors.studentName} aria-describedby={describe('studentName')} {...register('studentName')} />
          </Field>

          <Field id="mobile" label="Mobile number" hint="10-digit Indian mobile number. +91 is optional." error={errors.mobile?.message}>
            <input id="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={16} aria-invalid={!!errors.mobile} aria-describedby={describe('mobile') ?? 'mobile-hint'} {...register('mobile')} />
          </Field>

          <Field id="email" label="Email address (optional)" error={errors.email?.message}>
            <input id="email" type="email" autoComplete="email" maxLength={120} aria-invalid={!!errors.email} aria-describedby={describe('email')} {...register('email')} />
          </Field>

          <Field id="qualification" label="Qualification" error={errors.qualification?.message}>
            <select id="qualification" aria-invalid={!!errors.qualification} aria-describedby={describe('qualification')} {...register('qualification')}>
              <option value="">Select a qualification</option>
              {QUALIFICATIONS.map((q) => <option key={q} value={q}>{q}</option>)}
            </select>
          </Field>

          <Field id="course" label="Interested course" error={errors.course?.message}>
            <select id="course" aria-invalid={!!errors.course} aria-describedby={describe('course')} {...register('course')}>
              <option value="">Select a course</option>
              {courseOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field id="message" label="Message (optional)" hint="Up to 500 characters." error={errors.message?.message}>
            <textarea id="message" rows={4} maxLength={500} aria-invalid={!!errors.message} aria-describedby={describe('message') ?? 'message-hint'} {...register('message')} />
          </Field>

          <div className="check">
            <input id="consent" type="checkbox" aria-invalid={!!errors.consent} aria-describedby={describe('consent')} {...register('consent')} />
            <label htmlFor="consent">
              I agree that AST Education may contact me about this enquiry. I have read the <a href="/privacy">Privacy Policy</a>.
            </label>
          </div>
          {errors.consent && <p className="err" id="consent-error" role="alert">{errors.consent.message}</p>}

          {/* Honeypot: hidden from people; bots that fill it are accepted silently and store nothing. */}
          <div className="hp" aria-hidden="true">
            <label htmlFor="website">Leave this field empty</label>
            <input id="website" tabIndex={-1} autoComplete="off" {...register('website')} />
          </div>

          <div className="row">
            <button className="btn btn-o" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send enquiry'}
            </button>
          </div>

          {formError && (
            <div className="note" role="alert" style={{ marginTop: 16 }}>
              <p>{formError}</p>
              {whatsappDigits && <p>You can also message us on WhatsApp: <a href={`https://wa.me/${whatsappDigits}`} target="_blank" rel="noopener noreferrer">{whatsapp}</a>.</p>}
            </div>
          )}
        </form>
      </div>
      <div className="narrow">
        <AdmissionProcess />
        <ContactAssistance />
      </div>
    </section>
  );
}
