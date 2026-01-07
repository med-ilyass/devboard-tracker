// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <span>© {new Date().getFullYear()} Devboard</span>
          <span className="footer-dot">•</span>
          <span>Built with React, Node & PostgreSQL</span>
        </div>

        <div className="footer-right">
          <a
            href="https://github.com/med-ilyass"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>

          <a
            href="https://github.com/med-ilyass/devboard-tracker"
            target="_blank"
            rel="noreferrer"
          >
            Project
          </a>

          <a
            href="https://www.linkedin.com/in/ilyassoudli/"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}