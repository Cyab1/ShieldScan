import { Link } from "react-router-dom";
import "./Privacy.css";

export default function Terms() {
  return (
    <main className="privacy">
      <div className="privacy-content">
        <div class="privacy-header">
          <Link to="/" className="back-link">
            ← Back to ShieldScan
          </Link>
          <h1>Terms of Use</h1>
          <p className="privacy-date">Last updated: October 2026</p>
        </div>

        <section>
          <h2>About ShieldScan</h2>
          <p>
            ShieldScan is a free website security audit tool operated by{" "}
            <strong>StackWise (Pty) Ltd</strong>, registration number
            2026/606439/07, a South African registered company based in
            Johannesburg, Gauteng. By using ShieldScan, you agree to these Terms
            of Use.
          </p>
        </section>

        <section>
          <h2>Acceptable use</h2>
          <p>
            You may only use ShieldScan to scan websites that you own or have
            explicit written permission to scan. By submitting a URL, you
            confirm that:
          </p>
          <ul>
            <li>You are the owner of the website, or</li>
            <li>
              You have been granted explicit authorisation by the website owner
              to perform a security scan
            </li>
            <li>
              You will not use ShieldScan for any unlawful, harmful, or
              malicious purpose
            </li>
            <li>
              You will not attempt to circumvent the daily scan limit or abuse
              the service
            </li>
            <li>
              You will not use ShieldScan to target government, financial, or
              critical infrastructure systems without proper authorisation
            </li>
          </ul>
        </section>

        <section>
          <h2>Nature of the service</h2>
          <p>
            ShieldScan performs automated, non-intrusive security checks on
            publicly accessible website information. It does not perform
            penetration testing, attempt to exploit vulnerabilities, or access
            any restricted or private systems.
          </p>
          <p>
            ShieldScan checks for common, publicly visible security indicators
            including HTTPS status, SSL certificate validity, HTTP security
            headers, redirect behaviour, robots.txt configuration, and server
            header disclosure.
          </p>
        </section>

        <section>
          <h2>No warranty</h2>
          <p>
            ShieldScan is provided <strong>"as is"</strong> and{" "}
            <strong>"as available"</strong> without any warranty of any kind,
            express or implied. StackWise (Pty) Ltd does not warrant that:
          </p>
          <ul>
            <li>
              The service will be uninterrupted, error-free, or available at all
              times
            </li>
            <li>Scan results are complete, accurate, or up to date</li>
            <li>A passing grade means your website is fully secure</li>
            <li>ShieldScan detects all security vulnerabilities</li>
          </ul>
          <p>
            ShieldScan results are intended as a starting point for security
            awareness, not a substitute for a professional security audit or
            penetration test.
          </p>
        </section>

        <section>
          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent permitted by South African law, StackWise
            (Pty) Ltd shall not be liable for any direct, indirect, incidental,
            special, or consequential damages arising from your use of
            ShieldScan, including but not limited to:
          </p>
          <ul>
            <li>Decisions made based on scan results</li>
            <li>Security incidents that occur despite a passing scan grade</li>
            <li>
              Any loss of data, revenue, or business arising from use or
              inability to use the service
            </li>
          </ul>
        </section>

        <section>
          <h2>Intellectual property</h2>
          <p>
            ShieldScan, including its design, branding, code, and reports, is
            the intellectual property of StackWise (Pty) Ltd. You may not
            reproduce, copy, resell, or distribute any part of ShieldScan
            without prior written permission.
          </p>
          <p>
            The StackWise name, logo, and ShieldScan brand are trademarks of
            StackWise (Pty) Ltd.
          </p>
        </section>

        <section>
          <h2>Rate limiting and fair use</h2>
          <p>
            ShieldScan is a free service limited to 5 scans per IP address per
            day. This limit exists to ensure fair access for all users and to
            prevent abuse. Users who require unlimited scans may contact us at{" "}
            <a href="mailto:stackwiseza@gmail.com">stackwiseza@gmail.com</a> to
            discuss access options.
          </p>
        </section>

        <section>
          <h2>Governing law</h2>
          <p>
            These Terms of Use are governed by the laws of the Republic of South
            Africa. Any disputes arising from the use of ShieldScan shall be
            subject to the jurisdiction of the South African courts.
          </p>
        </section>

        <section>
          <h2>Changes to these terms</h2>
          <p>
            StackWise (Pty) Ltd reserves the right to update these Terms of Use
            at any time. Continued use of ShieldScan after any changes
            constitutes acceptance of the updated terms. The date at the top of
            this page reflects when the terms were last updated.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
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
