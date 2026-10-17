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
          <p className="privacy-date">
            StackWise (Pty) Ltd · Last updated: 17 October 2026
          </p>
        </div>

        <section>
          <h2>1. Who we are</h2>
          <p>
            ShieldScan is a product of <strong>StackWise (Pty) Ltd</strong>,
            registration number 2026/606439/07, a South African registered
            company based in Johannesburg, Gauteng. StackWise is the
            "responsible party" for your information under the Protection of
            Personal Information Act 4 of 2013 (POPIA). Our information officer
            is Siyabonga Ndlovu, who can be contacted at{" "}
            <a href="mailto:stackwiseza@gmail.com">stackwiseza@gmail.com</a>.
          </p>
        </section>

        <section>
          <h2>2. What information we collect</h2>
          <p>When you use ShieldScan, we collect and store:</p>
          <ul>
            <li>
              <strong>URLs you submit:</strong> the website address you enter
              for scanning.
            </li>
            <li>
              <strong>Scan results:</strong> the security findings for that URL.
            </li>
            <li>
              <strong>IP addresses:</strong> an IP address can be personal
              information. We use it to enforce our limit of 5 scans per IP
              address per day and to prevent abuse.
            </li>
            <li>
              <strong>Timestamps:</strong> the date and time each scan was
              performed.
            </li>
          </ul>
          <p>
            We do not ask for your name or email address. If you contact us, we
            receive whatever you send, such as your email address, and use it
            only to reply to you.
          </p>
        </section>

        <section>
          <h2>3. How we use your information</h2>
          <p>We use the information above to:</p>
          <ul>
            <li>perform the security scan you requested;</li>
            <li>generate and store your scan report with a shareable link;</li>
            <li>
              enforce the daily scan limit and prevent abuse of the service; and
            </li>
            <li>improve ShieldScan based on overall usage patterns.</li>
          </ul>
          <p>
            We do not use your information for any other purpose without telling
            you first.
          </p>
        </section>

        <section>
          <h2>4. Results pages can be viewed by anyone with the link</h2>
          <p>
            Each scan creates a results page with its own link. Anyone who has
            that link can view the page, including the website address that was
            scanned and the findings. Only share a results link with people you
            are comfortable seeing it, and do not scan websites whose address or
            findings you want to keep private.
          </p>
        </section>

        <section>
          <h2>5. Service providers and where your information is stored</h2>
          <p>
            We do not sell your information. We use service providers who
            process information on our behalf to run ShieldScan:
          </p>
          <ul>
            <li>
              <strong>Vercel</strong> hosts the ShieldScan website.{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noreferrer"
              >
                Vercel Privacy Policy
              </a>
            </li>
            <li>
              <strong>Render</strong> hosts the ShieldScan API and database.{" "}
              <a
                href="https://render.com/privacy"
                target="_blank"
                rel="noreferrer"
              >
                Render Privacy Policy
              </a>
            </li>
          </ul>
          <p>
            These providers may store or process information on servers outside
            South Africa. We take reasonable steps to make sure that they
            protect your information. We will also disclose information where
            the law requires us to.
          </p>
        </section>

        <section>
          <h2>6. How long we keep your information</h2>
          <ul>
            <li>
              <strong>Scan results:</strong> kept for 12 months from the scan
              date so that shared report links keep working, and then deleted.
            </li>
            <li>
              <strong>IP addresses:</strong> kept for 24 hours for rate
              limiting, and then deleted.
            </li>
            <li>
              <strong>Deletion on request:</strong> if you would like your scan
              data deleted sooner, contact us at{" "}
              <a href="mailto:stackwiseza@gmail.com">stackwiseza@gmail.com</a>{" "}
              and we will remove it within 7 business days. Deleting a scan also
              stops its shared link from working.
            </li>
          </ul>
        </section>

        <section>
          <h2>7. How we protect your information</h2>
          <p>
            We take reasonable technical and organisational measures to protect
            the information we hold. Information is sent over HTTPS, and access
            to our database is restricted to authorised people. No system is
            completely secure. If a security breach affects your personal
            information, we will notify the Information Regulator and the people
            affected, as POPIA requires.
          </p>
        </section>

        <section>
          <h2>8. Cookies and analytics</h2>
          <p>
            ShieldScan uses Google Analytics to measure website traffic and
            usage patterns. Google Analytics may collect anonymised data about
            your visit. We do not use tracking cookies for advertising purposes.
            For more information, see{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noreferrer"
            >
              Google's Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2>9. Your rights under POPIA</h2>
          <p>You have the right to:</p>
          <ul>
            <li>
              ask for access to the personal information we hold about you;
            </li>
            <li>ask us to correct inaccurate information;</li>
            <li>ask us to delete your personal information; and</li>
            <li>object to the processing of your personal information.</li>
          </ul>
          <p>
            To exercise any of these rights, contact us at{" "}
            <a href="mailto:stackwiseza@gmail.com">stackwiseza@gmail.com</a>. We
            will respond within a reasonable time.
          </p>
        </section>

        <section>
          <h2>10. Complaints</h2>
          <p>
            If you believe we have handled your information unlawfully, please
            contact us first at{" "}
            <a href="mailto:stackwiseza@gmail.com">stackwiseza@gmail.com</a> so
            that we can try to resolve it. You also have the right to lodge a
            complaint with the Information Regulator of South Africa at{" "}
            <a
              href="https://www.inforegulator.org.za"
              target="_blank"
              rel="noreferrer"
            >
              www.inforegulator.org.za
            </a>
            .
          </p>
        </section>

        <section>
          <h2>11. Children</h2>
          <p>
            ShieldScan is intended for website owners and developers and is not
            directed at children.
          </p>
        </section>

        <section>
          <h2>12. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The "Last
            updated" date at the top of this page shows when it last changed.
          </p>
        </section>

        <section>
          <h2>13. Contact</h2>
          <p>
            For any privacy-related questions or concerns, contact StackWise
            (Pty) Ltd at{" "}
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
