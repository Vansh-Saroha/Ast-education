import { APPROVED_HTML } from '../content/approved';
import { ApprovedHtml } from '../components/ApprovedHtml';
import FeaturedVideo from '../components/FeaturedVideo';
import AboutHighlights from '../components/AboutHighlights';
import HomeLeadershipPreview from '../components/HomeLeadershipPreview';
import MobileKnowledgeUniverse from '../components/MobileKnowledgeUniverse';

// Pages whose content is the approved copy from the original design.
export default function ApprovedPage({ name }: { name: keyof typeof APPROVED_HTML }) {
  if (name === 'home') {
    return (
      <div className="mobile-home-layout">
        <MobileKnowledgeUniverse />
        <ApprovedHtml html={APPROVED_HTML.home} />
        <HomeLeadershipPreview />
        <FeaturedVideo />
      </div>
    );
  }

  return (
    <>
      <ApprovedHtml html={APPROVED_HTML[name]} />
      {name === 'about' && <AboutHighlights />}
    </>
  );
}
