import { APPROVED_HTML } from '../content/approved';
import { ApprovedHtml } from '../components/ApprovedHtml';
import FeaturedVideo from '../components/FeaturedVideo';

// Pages whose content is the approved copy from the original design.
export default function ApprovedPage({ name }: { name: keyof typeof APPROVED_HTML }) {
  return <><ApprovedHtml html={APPROVED_HTML[name]} />{name === 'home' && <FeaturedVideo />}</>;
}
