import parse, { domToReact, Element, type HTMLReactParserOptions } from 'html-react-parser';
import { Link } from 'react-router-dom';
import { useFacts } from '../lib/facts';
import snapshot from '../seo/verified-facts.json';

const SNAPSHOT_PHONE = (snapshot as { phone: { value: string } }).phone.value;
const SNAPSHOT_PHONE_TEL = SNAPSHOT_PHONE.replace(/[^+\d]/g, '');

// Renders approved markup unchanged. Internal links become client-side navigation.
const options: HTMLReactParserOptions = {
  replace(node) {
    if (node instanceof Element && node.name === 'a' && node.attribs.href?.startsWith('/')) {
      const { href, class: className, ...rest } = node.attribs;
      return (
        <Link to={href} className={className} {...(rest.id ? { id: rest.id } : {})}>
          {domToReact(node.children as never, options)}
        </Link>
      );
    }
    return undefined;
  },
};

export function ApprovedHtml({ html }: { html: string }) {
  const { facts } = useFacts();
  const phone = facts.phone ?? '';
  const phoneTel = phone.replace(/[^+\d]/g, '');
  const whatsappValue = facts.whatsapp ?? '';
  const whatsapp = whatsappValue.replace(/\D/g, '');
  // Keep the approved copy while sourcing contact details from the verified facts API.
  // If a live response omits a fact, omit that contact action rather than showing stale data.
  const currentHtml = html
    .replaceAll(SNAPSHOT_PHONE, phone)
    .replaceAll(SNAPSHOT_PHONE_TEL, phoneTel)
    .replace(/<a\b[^>]*href="tel:[^"]+"[^>]*>[\s\S]*?<\/a>/g, (anchor) => phoneTel ? anchor.replace(/href="tel:[^"]+"/, `href="tel:${phoneTel}"`) : '')
    .replace(/<a\b[^>]*href="https:\/\/wa\.me\/\d+([^"]*)"[^>]*>[\s\S]*?<\/a>/g, (anchor, suffix: string) => whatsapp ? anchor.replace(/href="https:\/\/wa\.me\/\d+[^"]*"/, `href="https://wa.me/${whatsapp}${suffix}"`) : '');
  return <>{parse(currentHtml, options)}</>;
}
