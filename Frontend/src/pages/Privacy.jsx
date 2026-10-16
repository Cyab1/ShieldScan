import { Link } from "react-router-dom";
import "./Privacy.css";

export default function Privacy() {
  return (
    <main className="privacy">
      <div className="privacy-content">
        <div className="privacy-header">
          <Link to="/" className="back-link">
            ← Back to ShieldScan
          </Link>
          <h1>Privacy Policy</h1>
          <p className="privacy-date">Last updated: October 2026</p>
        </div>

        <section>
          <h2>Who we are</h2>
          <p>
            ShieldScan is a product of <strong>StackWise (Pty) Ltd</strong>,
            registration number 2026/606439/07, a South African registered
            company based in Johannesburg, Gauteng. We can be contacted at{" "}
            <a href="mailto:stackwiseza@gmail.com">stackwiseza@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2>What information we collect</h2>
          <p>When you use ShieldScan, we collect and store the following:</p>
          <ul>
            <li>
              <strong>URLs you submit</strong> — the website address you enter
              for scanning
            </li>
            <li>
              <strong>Scan results</strong> — the security findings for that URL
            </li>
            <li>
              <strong>IP addresses</strong> — used solely to enforce our daily
              scan limit of 5 scans per day per user
            </li>
            <li>
              <strong>Timestamps</strong> — the date and time each scan was
              performed
            </li>
          </ul>
          <p>
            We do not collect your name, email address, or any other personal
            information unless you contact us directly.
          </p>
        </section>

        <section>
          <h2>How we use your information</h2>
          <ul>
            <li>To perform the security scan you requested</li>
            <li>
              To generate and store your scan report with a shareable link
            </li>
            <li>
              To enforce our daily scan limit and prevent abuse of the service
            </li>
            <li>To improve ShieldScan based on usage patterns</li>
          </ul>
        </section>

        <section>
          <h2>POPIA compliance</h2>
          <p>
            StackWise is committed to complying with the Protection of Personal
            Information Act (POPIA), Act 4 of 2013. As the responsible party, we
            take reasonable steps to protect any personal information we
            process. We do not sell, share, or disclose your personal
            information to third parties except where required by law.
          </p>
        </section>

        <section>
          <h2>How long we keep your data</h2>
          <p>
            Scan results are stored indefinitely to support shareable report
            links. IP addresses used for rate limiting are stored temporarily.
            If you would like your scan data deleted, contact us at{" "}
            <a href="mailto:stackwiseza@gmail.com">stackwiseza@gmail.com</a> and
            we will remove it within 7 business days.
          </p>
        </section>

        <section>
          <h2>Third party services</h2>
          <p>ShieldScan uses the following third party services to operate:</p>
          <ul>
            <li>
              <strong>Vercel</strong> — hosts the ShieldScan frontend.{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noreferrer"
              >
                Vercel Privacy Policy
              </a>
            </li>
            <li>
              <strong>Render</strong> — hosts the ShieldScan API and database.{" "}
              <a
                href="https://render.com/privacy"
                target="_blank"
                rel="noreferrer"
              >
                Render Privacy Policy
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2>Your rights under POPIA</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Request access to personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your personal information</li>
            <li>Object to the processing of your personal information</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:stackwiseza@gmail.com">stackwiseza@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For any privacy related questions or concerns, contact StackWise at{" "}
            <a href="mailto:stackwiseza@gmail.com">stackwiseza@gmail.com</a>.
          </p>
        </section>
      </div>
    </main>
  );
}
