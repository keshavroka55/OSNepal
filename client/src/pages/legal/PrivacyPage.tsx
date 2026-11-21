import { Navbar } from '../../components/layout/Navbar';
import { ShieldCheck, Eye, Lock, Database, UserCheck, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const FONT_HEADING = "font-heading";
const FONT_BODY = "font-sans";

const CONTAINER = 'mx-auto w-full max-w-[880px] px-4 sm:px-6 lg:px-8';

const LAST_UPDATED = 'January 2025';

const SECTIONS = [
  {
    id: 'overview',
    icon: ShieldCheck,
    title: 'Overview',
    body: [
      'Your privacy matters to us. This policy explains what information Open Source Nepal collects, how we use it, and the choices you have.',
      'By using the platform, you agree to the practices described here.',
    ],
  },
  {
    id: 'information-we-collect',
    icon: Database,
    title: 'Information we collect',
    body: [
      'Account information: name, username, email, and profile details you provide when you register or update your profile.',
      'Product data: information about products you launch, including names, descriptions, links, media, and categories.',
      'Usage data: interactions such as upvotes, comments, bookmarks, follows, and connection requests.',
    ],
  },
  {
    id: 'how-we-use',
    icon: Eye,
    title: 'How we use your information',
    body: [
      'To operate the platform and provide features like product discovery, feedback, and founder connections.',
      'To personalize your experience, including recommended products and founders.',
      'To keep the community safe, prevent abuse, and enforce our terms.',
      'To communicate with you about your account, product activity, and important updates.',
    ],
  },
  {
    id: 'sharing',
    icon: UserCheck,
    title: 'What we share',
    body: [
      'Public information: your profile, products, comments, and upvotes are visible to other users as part of the community experience.',
      'We do not sell your personal information to third parties.',
      'We may share information when required by law, to protect users, or to operate the service with trusted providers.',
    ],
  },
  {
    id: 'security',
    icon: Lock,
    title: 'Security',
    body: [
      'We use industry-standard measures to protect your data, including encryption in transit and secure authentication.',
      'No system is completely secure. If you believe your account has been compromised, contact us immediately.',
    ],
  },
  {
    id: 'your-rights',
    icon: UserCheck,
    title: 'Your rights',
    body: [
      'You can access, update, or delete your account information at any time from your profile settings.',
      'You can control what appears publicly on your founder profile.',
      'You can request a copy of your data or ask us to delete it by contacting us.',
    ],
  },
  {
    id: 'contact',
    icon: Mail,
    title: 'Contact us',
    body: [
      'If you have questions about this Privacy Policy or how your data is handled, reach out to us.',
    ],
  },
];

export default function PrivacyPolicyPage() {
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
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Legal
            </div>

            <h1
              className={`${FONT_HEADING} mt-6 text-[34px] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-[44px] lg:text-[52px]`}
            >
              Privacy Policy
            </h1>

            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-text-muted sm:text-[16px] ">
              How Open Source Nepal collects, uses, and protects your information. Written in
              plain language, because you should be able to actually read it.
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
              to="/cookie"
              className="font-medium text-primary hover:underline"
            >
              Cookie Policy
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