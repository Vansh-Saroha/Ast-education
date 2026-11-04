import { Link } from 'react-router-dom';
import { useFacts } from '../lib/facts';

export function PrivacyPage() {
  const { facts } = useFacts();
  return (
    <section className="wrap sec" aria-labelledby="h-priv">
      <div className="narrow">
        <h1 id="h-priv" tabIndex={-1}>Privacy Policy</h1>
        <h2>What we collect</h2>
        <p>When you send an admission enquiry we store the student name, mobile number, email address (if you give one), qualification, the course you are interested in, any message you write, the time you gave consent, and the page you sent the enquiry from. We do not store your IP address with the enquiry.</p>
        <h2>Why we use it</h2>
        <p>We use these details to respond to your admission enquiry and, if you have agreed, to contact you about it. We do not use them for advertising.</p>
        <h2>Who can see it</h2>
        <p>Only authorised staff of AST Education can see enquiries, through a password-protected admin area. Enquiries are never published on this website.</p>
        <h2>Where it is stored</h2>
        <p>Enquiries are stored in the institute’s MongoDB database. The institute must publish the database hosting provider, encryption controls and backup arrangements once its production provider and configuration have been selected. Do not submit sensitive identity or payment information through this form.</p>
        <h2>How long we keep it</h2>
        <p>Enquiries are retained only for as long as needed to respond and for applicable legal or record-keeping requirements. The institute must set and publish a specific retention and deletion schedule before collecting enquiries on the production website. You may request deletion using the contact number on our Contact page, subject to any legal record-keeping requirement.</p>
        <h2>Your choices</h2>
        <p>You can ask us to correct your details, withdraw your consent, or delete your enquiry. Contact us on {facts.phone ?? 'the number on our Contact page'}.</p>
        <h2>Cookies</h2>
        <p>The public website does not use analytics or advertising cookies. Staff who sign in to the admin area receive one essential session cookie.</p>
        <h2>Embedded videos</h2>
        <p>Some videos are embedded from YouTube using its privacy-enhanced player. Video thumbnails are loaded from YouTube when the page displays them; the video player itself loads only when you choose to play a video. YouTube/Google may receive technical information such as your IP address, browser and device details, and may process data under its own privacy policy. AST Education does not control YouTube's data practices.</p>
        <h2>Changes to this policy</h2>
        <p>Last reviewed: 4 November 2026. This policy must be reviewed whenever the enquiry form, data processors or retention practices change.</p>
        <p><Link to="/enquiry">Back to the admission enquiry</Link></p>
      </div>
    </section>
  );
}

export function TermsPage() {
  return (
    <section className="wrap sec" aria-labelledby="h-terms">
      <div className="narrow">
        <h1 id="h-terms" tabIndex={-1}>Terms of Use</h1>
        <p>Information on this website describes AST Education for general information. Course fees and detailed information are shared when you enquire.</p>
        <p>AST Education provides coaching, academic support, computer and technical training, and personality development. It does not award university degrees.</p>
        <h2>Using this website</h2>
        <p>You may use this website to learn about AST Education and submit genuine course enquiries. Do not attempt to disrupt the website, bypass access controls, upload harmful material or use another person’s information without permission.</p>
        <h2>Course information</h2>
        <p>Course availability, schedules, fees, eligibility and duration may change. They are confirmed by the institute when you enquire or enrol. A website enquiry is not an admission, booking or guarantee of a place.</p>
        <h2>Intellectual property</h2>
        <p>Unless otherwise stated, the website’s text, branding, graphics and original materials belong to AST Education or their respective rights holders. You may not reproduce or commercially reuse them without permission.</p>
        <h2>External services</h2>
        <p>This website may link to third-party services such as YouTube, Google Maps and WhatsApp. Those services operate under their own terms and privacy policies; AST Education does not control their availability or practices.</p>
        <h2>Availability and changes</h2>
        <p>We aim to keep information accurate and the website available, but do not guarantee uninterrupted access or that every page is error-free. We may update website content and these terms when needed.</p>
        <h2>Contact</h2>
        <p>For questions about these terms, contact AST Education using the details on our Contact page. These terms should be reviewed by the institute before production publication.</p>
      </div>
    </section>
  );
}

export function NotFoundPage() {
  return (
    <section className="wrap sec" aria-labelledby="h-404">
      <div className="narrow">
        <h1 id="h-404" tabIndex={-1}>Page not found</h1>
        <p>This page does not exist. Go back to the home page, or browse our courses.</p>
        <div className="row"><Link className="btn btn-o" to="/">Home</Link><Link className="btn btn-g" to="/courses">Browse courses</Link></div>
      </div>
    </section>
  );
}
