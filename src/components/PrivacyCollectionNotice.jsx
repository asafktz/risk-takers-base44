import { Link } from 'react-router-dom';

export default function PrivacyCollectionNotice({ className = '' }) {
  return (
    <p className={`text-xs font-semibold leading-5 text-[#6D665B] ${className}`}>
      Risk Takers is a LinkedOtter LLC media business. We may provide your business-contact,
      registration, and engagement information to event sponsors and other commercial partners
      for their own marketing and sales, as described in our{' '}
      <Link className="font-black underline" to="/privacy">Privacy Policy</Link>. You may{' '}
      <Link className="font-black underline" to="/privacy-choices">opt out of sale or sharing</Link>.
    </p>
  );
}
