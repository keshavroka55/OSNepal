import { Navbar } from '../../components/layout/Navbar';
import { FileText, UserCheck, Upload, MessageSquare, AlertTriangle, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const FONT_HEADING = "font-heading";
const FONT_BODY = "font-sans";

const CONTAINER = 'mx-auto w-full max-w-[880px] px-4 sm:px-6 lg:px-8';

const LAST_UPDATED = 'January 2025';

const SECTIONS = [
  {
    id: 'acceptance',
    icon: FileText,
    title: 'Acceptance of terms',
    body: [
      'By creating an account or using Open Source Nepal, you agree to these Terms of Service. If you do not agree, please do not use the platform.',
      'We may update these terms from time to time. Continued use after updates means you accept the revised terms.',
    ],
  },
  {
    id: 'accounts',
    icon: UserCheck,
    title: 'Your account',
    body: [
      'You are responsible for the accuracy of the information on your account and for keeping your credentials secure.',
      'You must be at least 13 years old to use Open Source Nepal.',
      'One person, one account. Do not impersonate others or create accounts for the purpose of manipulation.',
    ],
  },
  {
    id: 'products',
    icon: Upload,
    title: 'Launching products',
    body: [
      'You must own or have permission to share any product you launch on Open Source Nepal.',
      'Do not submit products that are spam, misleading, or violate the rights of others.',
      'We may remove products that break these rules or harm the community.',
    ],
  },
  {
    id: 'community',
    icon: MessageSquare,
    title: 'Community conduct',
    body: [
      'Be respectful. Harassment, hate speech, and personal attacks are not allowed.',
      'Feedback should be honest and constructive. Do not manipulate upvotes, comments, or rankings.',
      'Do not use the platform to distribute malware, phishing links, or illegal content.',
    ],
  },
  {
    id: 'liability',
    icon: AlertTriangle,
    title: 'Liability',
    body: [
      'Open Source Nepal is provided "as is." We do not guarantee that any product listed on the platform is accurate, safe, or suitable for your needs.',
      'We are not responsible for interactions, investments, or agreements made between users, founders, or third parties through the platform.',
    ],
  },
  {
    id: 'termination',
    icon: AlertTriangle,
    title: 'Termination',
    body: [
      'You can delete your account at any time. We may suspend or terminate accounts that violate these terms.',
      'Content you have posted publicly may remain visible in cached or archived form after account deletion.',
    ],
  },
  {
    id: 'contact',
    icon: Mail,
    title: 'Contact',
    body: [
      'For questions about these terms, reach out to us.',
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <>
      <Navbar />

      <main
        className={`${FONT_BODY} min-h-screen bg-card text-text  `}
      >
        {/* Header */}
        <section className="relative overflow-hidden border-b border-border ">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-[-200px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-primary/[0.05] blur-3xl /[0.08]" />
          </div>

          <div className={`${CONTAINER} pb-14 pt-28 sm:pb-16 sm:pt-32 lg:pt-36`}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-text   ">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Legal
            </div>

            <h1
              className={`${FONT_HEADING} mt-6 text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]`}
            >
              Terms of Service
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-muted sm:text-[16px] ">
              The rules of the road for using Open Source Nepal — for founders, users, and
              everyone in between.
            </p>

            <p className="mt-6 text-[12px] font-medium uppercase tracking-wider text-text-muted ">
              Last updated · {LAST_UPDATED}
            </p>
          </div>
        </section>

        {/* Body */}
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
                        <a
                          href="mailto:os-nepal@gmail.com?subject=Question%20about%20Open Source Nepal&body=Hi%20Open Source Nepal%20team%2C%0A%0A"
                          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 "
                        >
                          <Mail className="h-4 w-4" />
                          Contact us
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Cross-links */}
          <div className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border pt-6 text-[13px] ">
            <span className="text-text-muted ">Related</span>
            <Link
              to="/privacy-policy"
              className="font-medium text-primary hover:underline"
            >
              Privacy Policy
            </Link>
            <Link
              to="/cookie"
              className="font-medium text-primary hover:underline"
            >
              Cookie Policy
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}