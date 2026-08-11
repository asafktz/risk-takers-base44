import { Link } from 'react-router-dom';

export default function LegalPageLayout({ eyebrow, title, effectiveDate, children }) {
  return (
    <main className="min-h-screen bg-[#F4F2ED] px-4 py-14 text-[#151515] sm:px-8 sm:py-20">
      <article className="mx-auto max-w-4xl">
        <header className="border-4 border-[#1F1F1F] bg-white p-6 shadow-[10px_10px_0_#1F1F1F] sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C0392B]">{eyebrow}</p>
          <h1 className="mt-3 text-4xl font-black uppercase leading-none tracking-tight sm:text-6xl">{title}</h1>
          <p className="mt-5 text-sm font-semibold text-[#6D665B]">Effective date: {effectiveDate}</p>
        </header>
        <div className="mt-12 space-y-10 border-2 border-[#1F1F1F]/15 bg-white p-6 sm:p-10">{children}</div>
        <nav aria-label="Legal pages" className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm font-bold">
          <Link to="/terms" className="text-[#C0392B] underline decoration-2 underline-offset-4">Terms &amp; Conditions</Link>
          <Link to="/privacy" className="text-[#C0392B] underline decoration-2 underline-offset-4">Privacy Policy</Link>
          <Link to="/contact" className="text-[#C0392B] underline decoration-2 underline-offset-4">Contact</Link>
        </nav>
      </article>
    </main>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="text-2xl font-black uppercase tracking-tight text-[#111111]">{title}</h2>
      <div className="mt-4 space-y-4 text-base leading-7 text-[#49443D]">{children}</div>
    </section>
  );
}

export function LegalList({ children }) {
  return <ul className="list-disc space-y-2 pl-6 marker:text-[#C0392B]">{children}</ul>;
}
