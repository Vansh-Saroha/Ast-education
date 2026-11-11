// Run with: npm test. Renders real pages in each data state and checks what a visitor would read.
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import { FactsContext } from '../src/lib/facts';
import type { FactsState } from '../src/lib/dataState';
import ContactPage from '../src/pages/ContactPage';
import CoursesPage from '../src/pages/CoursesPage';
import VideosPage from '../src/pages/VideosPage';
import { ApprovedHtml } from '../src/components/ApprovedHtml';
import { APPROVED_HTML } from '../src/content/approved';

const page = (el: React.ReactElement, facts?: FactsState) => {
  const tree = <StaticRouter location="/test">{el}</StaticRouter>;
  // React separates adjacent text values with comment markers; remove them so the text reads as a visitor sees it.
  return renderToString(facts ? <FactsContext.Provider value={facts}>{tree}</FactsContext.Provider> : tree).replace(/<!-- -->/g, '');
};

const ADDRESS = '244/A, Purvi Deen Dayal, Opposite Canara Bank, DAV Inter College Road, Roorkee, Haridwar, Uttarakhand 247667';
const base = { facts: { address: ADDRESS, phone: '+91 89794 87215', whatsapp: '+91 96907 66514' }, snapshotDate: '2026-11-03' };

// 1. Courses page before the server answers: the approved list, labelled as being checked
const loadingCourses = page(<CoursesPage />);
assert.match(loadingCourses, /Checking the latest course list/, 'loading state is labelled');
assert.match(loadingCourses, /Tally/, 'approved list is present in the body');
assert.doesNotMatch(loadingCourses, /live course list is unavailable/, 'loading is not reported as a failure');

// 2. Contact page when the server could not be reached: approved details, clearly labelled with their date
const fallbackContact = page(<ContactPage />, { ...base, availability: 'fallback' });
assert.match(fallbackContact, /We could not load the latest details/, 'fallback notice is shown');
assert.match(fallbackContact, /approved details from 2026-11-03/, 'fallback carries the snapshot date');
assert.match(fallbackContact, /244\/A, Purvi Deen Dayal/, 'approved address is still available');
assert.doesNotMatch(fallbackContact, /Working hours/, 'hours are never shown from the fallback');

// 3. Contact page with live facts: no notice, and hours appear only because the server verified them
const liveContact = page(<ContactPage />, { ...base, availability: 'live' });
assert.doesNotMatch(liveContact, /could not load/, 'live data carries no fallback notice');
assert.doesNotMatch(liveContact, /Working hours/, 'no hours when the server did not supply them');

const liveWithHours = page(<ContactPage />, { ...base, facts: { ...base.facts, hours: 'Monday to Saturday, 7:00 AM to 7:00 PM' }, availability: 'live' });
assert.match(liveWithHours, /Working hours/, 'verified hours are shown');

// 4. A fact the server does not return is not displayed, even if the snapshot once had it
const hiddenAddress = page(<ContactPage />, { facts: { phone: '+91 89794 87215' }, availability: 'live', snapshotDate: '2026-11-03' });
assert.doesNotMatch(hiddenAddress, /Purvi Deen Dayal/, 'an address the server does not return is not shown');

console.log('All client render tests passed.');

// 5. Approved Home markup uses the same live verified contact facts as Contact and the footer.
const approvedHome = page(<ApprovedHtml html={APPROVED_HTML.home} />, { ...base, facts: { phone: '+91 88888 77777', whatsapp: '+91 99999 88888' }, availability: 'live' });
assert.match(approvedHome, /tel:\+918888877777/, 'approved call links use the live verified phone');
assert.match(approvedHome, /https:\/\/wa\.me\/919999988888/, 'approved WhatsApp links use the live verified number');
assert.match(approvedHome, /\+91 88888 77777/, 'approved visible phone text uses the live verified phone');
assert.doesNotMatch(approvedHome, /919690766514/, 'the old WhatsApp number is not left in approved markup');

const approvedHomeNoFacts = page(<ApprovedHtml html={APPROVED_HTML.home} />, { facts: {}, availability: 'live', snapshotDate: '2026-11-03' });
assert.doesNotMatch(approvedHomeNoFacts, /href="tel:/, 'missing live phone removes the approved call action');
assert.doesNotMatch(approvedHomeNoFacts, /href="https:\/\/wa\.me\//, 'missing live WhatsApp removes the approved message action');

// 6. Videos show a loading state until the request settles; the empty state is not shown prematurely.
const loadingVideos = page(<VideosPage />);
assert.match(loadingVideos, /Loading approved videos/, 'video loading state is visible');
assert.doesNotMatch(loadingVideos, /Videos will appear here/, 'empty state waits for a successful empty response');

