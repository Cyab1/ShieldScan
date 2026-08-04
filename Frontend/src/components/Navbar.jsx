import { Link } from "react-router-dom";
import "./Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="navbar-brand-icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
            <rect x="8" y="3" width="6" height="4" rx="2" fill="#5DCAA5" />
            <rect
              x="4"
              y="9"
              width="14"
              height="4"
              rx="2"
              fill="#5DCAA5"
              opacity="0.75"
            />
            <rect
              x="1"
              y="15"
              width="20"
              height="4"
              rx="2"
              fill="#5DCAA5"
              opacity="0.5"
            />
          </svg>
        </span>
        <span className="navbar-name">StackWise</span>
        <span className="navbar-divider">|</span>
        <span className="navbar-product">ShieldScan</span>
      </Link>
      <span className="navbar-tagline">Website Security Audit</span>
    </nav>
  );
}
