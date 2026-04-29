import React from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/images/logo (3).png";

/* ── Inline SVG icons ── */
const IconPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.68h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.1a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.46 17.5z"/>
  </svg>
);
const IconMail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconShield = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconApple = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);
const IconPlay = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IconFacebook = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const IconTwitter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);
const IconInstagram = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
  </svg>
);
const IconLinkedIn = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
  </svg>
);
const IconYouTube = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
  </svg>
);
const IconHeart = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="#f87171" stroke="#f87171" strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);

/* ── Sub-components ── */

const ContactItem = ({ icon, iconBg, primary, secondary }) => (
  <dl className="flex items-start gap-3">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
      style={{ backgroundColor: iconBg }}
    >
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-white">{primary}</p>
      <p className="text-xs text-gray-400 mt-0.5">{secondary}</p>
    </div>
  </dl>
);

const NavLink = ({ to, children }) => (
  <li>
    <Link
      to={to}
      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
    >
      {children}
    </Link>
  </li>
);

const SocialButton = ({ href, label, children }) => (
  <a
    href={href}
    aria-label={label}
    target="_blank"
    rel="noopener noreferrer"
    className="w-9 h-9 rounded-lg border border-white/15 bg-white/10 backdrop-blur-sm flex items-center justify-center text-blue-200 hover:text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200"
  >
    {children}
  </a>
);

const AppButton = ({ href, topLabel, bottomLabel, icon }) => (
  <a
    href={href}
    className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-white/15 bg-white/10 backdrop-blur-sm hover:bg-white/20 hover:border-white/25 transition-all duration-200 w-fit"
  >
    <span className="text-blue-200">{icon}</span>
    <span className="flex flex-col leading-tight">
      <span className="text-[10px] text-blue-300">{topLabel}</span>
      <span className="text-xs font-medium text-white">{bottomLabel}</span>
    </span>
  </a>
);

/* ── Main Footer ── */

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home",              path: "/"               },
    { label: "Service providers", path: "/serviceproviders"},
    { label: "How it works",      path: "/#how"           },
    { label: "About us",          path: "/about"          },
  ];

  const supportLinks = [
    { label: "Help center",    path: "/help"    },
    { label: "FAQs",           path: "/faqs"    },
    { label: "Contact us",     path: "/contact" },
    { label: "Privacy policy", path: "/privacy" },
    { label: "Terms of service", path: "/terms" },
  ];

  const socialLinks = [
    { Icon: IconFacebook,  href: "#", label: "Facebook"  },
    { Icon: IconTwitter,   href: "#", label: "Twitter"   },
    { Icon: IconInstagram, href: "#", label: "Instagram" },
    { Icon: IconLinkedIn,  href: "#", label: "LinkedIn"  },
    { Icon: IconYouTube,   href: "#", label: "YouTube"   },
  ];

  return (
    <footer className="relative overflow-hidden bg-gray-900">

      {/* Same dot/star pattern as Hero */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Same gradient orbs as Hero */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-600 rounded-full filter blur-3xl opacity-10 animate-blob pointer-events-none" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-800 rounded-full filter blur-3xl opacity-10 animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute bottom-10 left-1/2 w-72 h-72 bg-blue-700 rounded-full filter blur-3xl opacity-10 animate-blob pointer-events-none" style={{ animationDelay: '4s' }} />

      {/* Separator line at top */}
      <div className="absolute top-0 inset-x-0 h-px bg-white/10" />

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1.6fr] gap-10 lg:gap-12">

          {/* Brand column */}
          <div>
            <Link to="/" className="inline-block mb-5">
              {/* brightness-0 invert makes any logo white on dark bg */}
              <img src={logo} alt="HomeFix" className="h-9 w-auto brightness-0 invert" />
            </Link>

            <p className="text-sm text-gray-400 leading-relaxed max-w-xs mb-6">
              Connecting you with verified service providers in your city.
              Quality home services available 24/7.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/15 bg-white/10 text-blue-100 backdrop-blur-sm">
                <span className="text-emerald-400"><IconShield /></span>
                Verified providers
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-white/15 bg-white/10 text-blue-100 backdrop-blur-sm">
                <span className="text-blue-300"><IconCheck /></span>
                Secure payments
              </span>
            </div>

            {/* Social icons */}
            <div className="flex gap-2">
              {socialLinks.map(({ Icon, href, label }) => (
                <SocialButton key={label} href={href} label={label}>
                  <Icon />
                </SocialButton>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">
              Quick links
            </p>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <NavLink key={link.path} to={link.path}>{link.label}</NavLink>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">
              Support
            </p>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <NavLink key={link.path} to={link.path}>{link.label}</NavLink>
              ))}
            </ul>
          </div>

          {/* Contact + App download */}
          <div>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-4">
              Contact
            </p>

            <ul className="space-y-4 mb-6">
              <ContactItem
                icon={<IconPin />}
                iconBg="rgba(59,130,246,0.35)"
                primary="Multan, Pakistan"
                secondary="Head office"
              />
              <ContactItem
                icon={<IconPhone />}
                iconBg="rgba(34,197,94,0.35)"
                primary="+92 300 1234567"
                secondary="Mon–Sat, 9am–6pm"
              />
              <ContactItem
                icon={<IconMail />}
                iconBg="rgba(139,92,246,0.35)"
                primary="support@servicehub.pk"
                secondary="24/7 support"
              />
            </ul>

            <p className="text-xs font-semibold text-blue-400 uppercase tracking-widest mb-3">
              Download app
            </p>
            <div className="flex flex-col gap-2">
              <AppButton href="#" topLabel="Download on"  bottomLabel="App Store"   icon={<IconApple />} />
              <AppButton href="#" topLabel="Get it on"    bottomLabel="Google Play"  icon={<IconPlay />}  />
            </div>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">

          <p className="text-xs text-gray-500">
            © {currentYear} HomeFix. All rights reserved.
          </p>

          <div className="flex items-center gap-5">
            {supportLinks.slice(2).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-xs text-blue-300/60 hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <p className="text-xs text-blue-300/60 flex items-center gap-1">
            Made with <IconHeart /> in Pakistan
          </p>

        </div>
      </div>

      {/* Blob animation keyframes — identical to Hero */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%  { transform: translate(20px, -30px) scale(1.1); }
          50%  { transform: translate(-20px, 20px) scale(0.9); }
          75%  { transform: translate(30px, 30px) scale(1.05); }
        }
        .animate-blob { animation: blob 10s ease-in-out infinite; }
      `}</style>
    </footer>
  );
}