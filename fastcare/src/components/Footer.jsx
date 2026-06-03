import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-t border-[#1f2d1f] bg-gradient-to-br from-[#0a0a0a] via-black to-[#050a07]">
      <div className="max-w-7xl mx-auto px-6 py-14">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="md:col-span-2">

            <h2 className="text-3xl font-bold gradient-title">
              FastCare
            </h2>

            <p className="mt-4 text-[#6b7280] max-w-md leading-relaxed">
              AI-powered medical record intelligence platform that transforms
              fragmented patient histories into structured clinical insights
              for faster emergency care decisions.
            </p>

          </div>

          {/* Quick Links */}
          <div>

            <h3 className="text-white font-semibold text-lg mb-4">
              Quick Links
            </h3>

            <ul className="space-y-3 text-[#6b7280]">

              <li>
                <Link
                  href="/"
                  className="hover:text-green-400 transition"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-green-400 transition"
                >
                  Dashboard
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="hover:text-green-400 transition"
                >
                  Features
                </Link>
              </li>

              <li>
                <Link
                  href="/"
                  className="hover:text-green-400 transition"
                >
                  Testimonials
                </Link>
              </li>

            </ul>

          </div>

          {/* Technologies */}
          <div>

            <h3 className="text-white font-semibold text-lg mb-4">
              Technologies
            </h3>

            <ul className="space-y-3 text-[#6b7280]">
              <li>Next.js</li>
              <li>MongoDB</li>
              <li>NextAuth</li>
              <li>RAG + NLP</li>
            </ul>

          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-[#1f2d1f] flex flex-col md:flex-row items-center justify-between gap-4">

          <p className="text-sm text-[#6b7280]">
            © 2026 FastCare. All rights reserved.
          </p>

          <div className="flex items-center gap-6 text-sm text-[#6b7280]">

            <Link
              href="/"
              className="hover:text-green-400 transition"
            >
              Privacy Policy
            </Link>

            <Link
              href="/"
              className="hover:text-green-400 transition"
            >
              Terms of Service
            </Link>

          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;