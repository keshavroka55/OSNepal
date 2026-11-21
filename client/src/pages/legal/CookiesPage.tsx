import { Navbar } from '../../components/layout/Navbar';
import { Cookie, Mail, ShieldCheck, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const FONT_HEADING = "font-heading";
const FONT_BODY = "font-sans";

const CONTAINER = 'mx-auto w-full max-w-[880px] px-4 sm:px-6 lg:px-8';

const LAST_UPDATED = 'January 2025';

const SECTIONS = [
  {
    id: 'what-are-cookies',
    icon: Cookie,
    title: 'What are cookies?',
    body: [
      'Cookies are small text files stored on your device when you visit a website. They help the site remember your preferences, keep you signed in, and understand how the platform is used.',
      'We use cookies and similar technologies (such as local storage) to operate Open Source Nepal, improve your experience, and keep the platform secure.',
    ],
  },
  {
    id: 'how-we-use',
    icon: Settings,
    title: 'How we use cookies',
    body: [
      'Essential cookies keep you signed in, protect against unauthorized access, and enable core functionality like voting, commenting, and submitting products.',
      'Preference cookies remember your settings such as theme (light or dark mode) and language.',
      'Analytics cookies help us understand which parts of the platform are used so we can improve them.',
    ],
  },
  {
    id: 'your-choices',
    icon: ShieldCheck,
    title: 'Your choices',
    body: [
      'You can control or delete cookies through your browser settings at any time. Disabling essential cookies may affect how Open Source Nepal works.',
      'Because we respect your privacy, we do not sell cookie data to third parties.',
    ],
  },
  {
    id: 'contact',
    icon: Mail,
    title: 'Contact us',
    body: [
      'If you have questions about this Cookie Policy, reach out to us and we will get back to you.',
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <>
      <Navbar />

      <main
        className={`${FONT_BODY} min-h-screen bg-card text-text  `}
      >
        {/* ---------------------------------------------------------- */}
        {/*  Header                                                     */}
        {/* ---------------------------------------------------------- */}
        <section className="relative overflow-hidden border-b border-border ">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-200px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/[0.05] blur-3xl /[0.08]" />
          </div>

          <div className={`${CONTAINER} pb-14 pt-28 sm:pb-16 sm:pt-32 lg:pt-36`}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text   ">
              <Cookie className="h-3.5 w-3.5 text-primary" />
              Legal
            </div>

            <h1
              className={`${FONT_HEADING} mt-6 text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]`}
            >
              Cookie Policy
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-muted sm:text-[16px] ">
              This policy explains how Open Source Nepal uses cookies and similar
              technologies to keep the platform working and improve your experience.
            </p>

            <p className="mt-6 text-[12px] font-medium uppercase tracking-wider text-text-muted ">
              Last updated · {LAST_UPDATED}
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------- */}
        {/*  Body                                                       */}
        {/* ---------------------------------------------------------- */}
        <section className={`${CONTAINER} py-14 sm:py-16 lg:py-20`}>
          <div className="space-y-10 sm:space-y-12">
            {SECTIONS.map((section, i) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-24 border-b border-border pb-10 last:border-0 last:pb-0 "
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/[0.08] text-primary /[0.15]">
                    <section.icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-text-muted ">
                      Section {String(i + 1).padStart(2, '0')}
                    </div>

                    <h2
                      className={`${FONT_HEADING} text-[22px] font-bold tracking-[-0.01em] sm:text-[26px]`}
                    >
                      {section.title}
                    </h2>

                    <div className="mt-4 space-y-4">
                      {section.body.map((paragraph, idx) => (
                        <p
                          key={idx}
                          className="text-[15px] leading-[1.75] text-text-muted "
                        >
                          {paragraph}
                        </p>
                      ))}

                      {section.id === 'contact' && (
                        <Link
                          to="/connect"
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 "
                        >
                          <Mail className="h-4 w-4" />
                          Contact us
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom cross-links */}
          <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6 text-[13px] ">
            <span className="text-text-muted ">Related</span>
            <Link
              to="/privacy-policy"
              className="font-medium text-primary hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="font-medium text-primary hover:underline"
            >
              Terms of Service
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}