import parse, { domToReact, Element, type HTMLReactParserOptions } from 'html-react-parser';
import { Link } from 'react-router-dom';
import { useFacts } from '../lib/facts';
import snapshot from '../seo/verified-facts.json';
import ASTBubbleUniverse from './ASTBubbleUniverse';

const SNAPSHOT_PHONE = (snapshot as { phone: { value: string } }).phone.value;
const SNAPSHOT_PHONE_TEL = SNAPSHOT_PHONE.replace(/[^+\d]/g, '');

// Renders approved markup unchanged. Internal links become client-side navigation.
const options: HTMLReactParserOptions = {
  replace(node) {
    if (node instanceof Element && node.name === 'img' && node.attribs.src === '/assets/logo.webp') {
      return <ASTBubbleUniverse />;
    }
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
  let currentHtml = html;
  if (!phoneTel) {
    currentHtml = currentHtml.replace(/<a\b[^>]*href="tel:[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '');
  } else {
    currentHtml = currentHtml.replace(/href="tel:[^"]*"/g, `href="tel:${phoneTel}"`);
  }
  if (!whatsapp) {
    currentHtml = currentHtml.replace(/<a\b[^>]*href="https:\/\/wa\.me\/[^" ]*"[^>]*>[\s\S]*?<\/a>/gi, '');
  } else {
    currentHtml = currentHtml.replace(/https:\/\/wa\.me\/\d+/g, `https://wa.me/${whatsapp}`);
  }
  currentHtml = currentHtml
    .replaceAll(SNAPSHOT_PHONE, phone)
    .replaceAll(SNAPSHOT_PHONE_TEL, phoneTel);

  return <>{parse(currentHtml, options)}</>;
}
