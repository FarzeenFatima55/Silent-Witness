import { Shield, X, GitFork, Globe } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "How It Works", href: "#how-it-works" },
    { label: "Privacy First", href: "#privacy" },
    { label: "Features", href: "#features" },
    { label: "FAQ", href: "#faq" },
  ],
  Resources: [
    { label: "PECA 2016 Guide", href: "#" },
    { label: "NCCIA Filing Info", href: "#" },
    { label: "What Is Cyber Harassment?", href: "#" },
    { label: "Support & Help", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Data Deletion", href: "#" },
  ],
};

const socialLinks = [
  { icon: X,       label: "X (Twitter)",  href: "#" },
  { icon: GitFork, label: "GitHub",        href: "#" },
  { icon: Globe,   label: "LinkedIn",      href: "#" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy text-cream relative overflow-hidden" aria-label="Site footer">
      {/* Subtle top gradient border */}
      <div
        className="h-px w-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(143,169,139,0.4), rgba(201,166,107,0.3), transparent)",
        }}
        aria-hidden="true"
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            {/* Logo */}
            <a
              href="#"
              className="flex items-center gap-2.5 mb-4 group"
              aria-label="Silent Witness — home"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
                <Shield className="w-4 h-4 text-sage" strokeWidth={1.5} />
              </div>
              <span className="font-bold text-lg tracking-tight">
                Silent<span className="text-sage">Witness</span>
              </span>
            </a>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-[220px]">
              Cyber harassment evidence documentation and PECA 2016 complaint drafting for Pakistan. Your evidence. Your case.
            </p>

            {/* Privacy badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage/12 border border-sage/25 text-xs font-semibold text-sage mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-sage animate-pulse" />
              Privacy Certified
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/6 border border-white/10 flex items-center justify-center text-slate-400 hover:text-cream hover:bg-white/12 transition-all duration-150"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">
                {category}
              </h3>
              <ul className="space-y-3" role="list">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-400 hover:text-cream transition-colors duration-150"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/8"
        >
          <div className="text-xs text-slate-500 text-center sm:text-left space-y-1.5">
            <p>&copy; {currentYear} Silent Witness. All rights reserved.</p>
            <p className="max-w-md text-slate-600 leading-relaxed">
              Silent Witness provides evidence documentation and AI-assisted drafting support.
              It does not provide legal advice and does not guarantee case outcomes.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-sage" />
              Systems operational
            </span>
            <span>·</span>
            <span>PECA 2016</span>
            <span>·</span>
            <span>Pakistan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
