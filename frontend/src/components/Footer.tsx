import './Footer.css';

export function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-brand">
                        <span className="footer-logo">PASTEBIN</span>
                    </div>

                    <div className="footer-links">
                        <a
                            href="https://github.com/umangkumarchaudhary/Pastebin-Lite--Aganitha"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            GitHub
                        </a>

                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
