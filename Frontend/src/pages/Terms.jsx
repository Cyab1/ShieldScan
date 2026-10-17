import { Link } from "react-router-dom";
import "./Privacy.css";

export default function Terms() {
  return (
    <main className="privacy">
      <div className="privacy-content">
        <div className="privacy-header">
          <Link to="/" className="back-link">
            ← Back to ShieldScan
          </Link>
          <h1>Terms of Use</h1>
          <p className="privacy-date">
            StackWise (Pty) Ltd · Last updated: 17 October 2026
          </p>
        </div>

        <section>
          <h2>1. About ShieldScan</h2>
          <p>
            ShieldScan is a free website security audit tool operated by{" "}
            <strong>StackWise (Pty) Ltd</strong>, registration number
            2026/606439/07, a South African registered company based in
            Johannesburg, Gauteng. By using ShieldScan, you agree to these Terms
            of Use. If you do not agree, please do not use ShieldScan.
          </p>
        </section>

        <section>
          <h2>2. Acceptable use</h2>
          <p>
            You may only use ShieldScan to scan websites that you own or have
            explicit written permission to scan. By submitting a URL, you
            confirm that:
          </p>
          <ul>
            <li>
              you are the owner of the website, or you have been granted
              explicit authorisation by the website owner to perform a security
              scan;
            </li>
            <li>
              you will not use ShieldScan for any unlawful, harmful or malicious
              purpose;
            </li>
            <li>
              you will not attempt to circumvent the daily scan limit or
              otherwise abuse the service, including by using bots or automated
              scripts to submit scans; and
            </li>
            <li>
              you will not use ShieldScan to target government, financial or
              critical infrastructure systems without proper authorisation.
            </li>
          </ul>
          <p>
            We may block or limit access for anyone who breaches these Terms.
          </p>
        </section>

        <section>
          <h2>3. Nature of the service</h2>
          <p>
            ShieldScan performs automated, non-intrusive security checks on
            publicly accessible website information. It does not perform
            penetration testing, attempt to exploit vulnerabilities, or access
            any restricted or private systems.
          </p>
          <p>
            ShieldScan checks for common, publicly visible security indicators,
            including HTTPS status, SSL certificate validity, HTTP security
            headers, redirect behaviour, robots.txt configuration and server
            header disclosure.
          </p>
          <p>
            Scans originate from ShieldScan's servers and may appear in the
            access logs of the website being scanned.
          </p>
        </section>

        <section>
          <h2>4. Scan results and reports</h2>
          <p>
            Each scan produces a results page with its own link, and a
            downloadable PDF report. Anyone who has a results link can view that
            results page, so please share links carefully. A report reflects the
            website only at the moment it was scanned.
          </p>
          <p>
            You may download and share reports generated for websites that you
            own or are authorised to assess, for your own business purposes, for
            example with your team, board, developer or clients. You may not
            resell reports or remove ShieldScan's branding from them.
          </p>
        </section>

        <section>
          <h2>5. No warranty</h2>
          <p>
            ShieldScan is provided "as is" and "as available" without any
            warranty of any kind, express or implied. StackWise (Pty) Ltd does
            not warrant that:
          </p>
          <ul>
            <li>
              the service will be uninterrupted, error-free or available at all
              times;
            </li>
            <li>scan results are complete, accurate or up to date;</li>
            <li>a passing grade means your website is fully secure; or</li>
            <li>ShieldScan detects all security vulnerabilities.</li>
          </ul>
          <p>
            ShieldScan results are intended as a starting point for security
            awareness, not a substitute for a professional security audit or
            penetration test.
          </p>
        </section>

        <section>
          <h2>6. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by South African law, StackWise
            (Pty) Ltd shall not be liable for any direct, indirect, incidental,
            special or consequential damages arising from your use of
            ShieldScan, including but not limited to:
          </p>
          <ul>
            <li>decisions made based on scan results;</li>
            <li>
              security incidents that occur despite a passing scan grade; and
            </li>
            <li>
              any loss of data, revenue or business arising from use or
              inability to use the service.
            </li>
          </ul>
          <p>
            Nothing in these Terms excludes or limits any liability that cannot
            be excluded or limited under South African law, including under the
            Consumer Protection Act 68 of 2008 where it applies.
          </p>
        </section>

        <section>
          <h2>7. Intellectual property</h2>
          <p>© 2026 StackWise (Pty) Ltd. All rights reserved.</p>
          <p>
            ShieldScan, including its design, branding, source code and
            software, is the intellectual property of StackWise (Pty) Ltd.
            Except for sharing reports as described in section 4, you may not
            copy, reproduce, resell, reverse-engineer or distribute ShieldScan
            or any part of it without our prior written permission.
          </p>
          <p>
            The ShieldScan name and the StackWise logo are trademarks of
            StackWise (Pty) Ltd. You may not use them without our prior written
            permission.
          </p>
        </section>

        <section>
          <h2>8. Privacy</h2>
          <p>
            Our Privacy Policy explains what information we collect, why, and
            how we protect it. By using ShieldScan, you acknowledge that policy.{" "}
            <Link to="/privacy">View Privacy Policy</Link>.
          </p>
        </section>

        <section>
          <h2>9. Rate limiting and fair use</h2>
          <p>
            ShieldScan is a free service limited to 5 scans per IP address per
            day. This limit exists to ensure fair access for all users and to
            prevent abuse. If you need more scans, contact us at{" "}
            <a href="mailto:stackwiseza@gmail.com">stackwiseza@gmail.com</a> to
            discuss access options.
          </p>
        </section>

        <section>
          <h2>10. Suspension and termination</h2>
          <p>
            We may suspend or end access to ShieldScan at any time, including if
            we believe these Terms have been breached or the service is being
            abused.
          </p>
        </section>

        <section>
          <h2>11. Governing law</h2>
          <p>
            These Terms of Use are governed by the laws of the Republic of South
            Africa. Any disputes arising from the use of ShieldScan are subject
            to the jurisdiction of the South African courts.
          </p>
        </section>

        <section>
          <h2>12. Changes to these terms</h2>
          <p>
            StackWise (Pty) Ltd may update these Terms of Use from time to time.
            Continued use of ShieldScan after a change means you accept the
            updated terms. The "Last updated" date at the top of this page shows
            when the terms last changed.
          </p>
        </section>

        <section>
          <h2>13. Contact</h2>
          <p>
            For any questions about these Terms of Use, contact StackWise (Pty)
            Ltd at{" "}
            <a href="mailto:stackwiseza@gmail.com">stackwiseza@gmail.com</a> or
            visit{" "}
            <a
              href="https://www.stackwiseza.co.za"
              target="_blank"
              rel="noreferrer"
            >
              www.stackwiseza.co.za
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
