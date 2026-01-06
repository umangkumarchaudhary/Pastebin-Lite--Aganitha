import './Hero.css';

export function Hero() {
    return (
        <section className="hero">
            <div className="hero-content container">
                {/* Top bar with brand and portfolio link */}
                <div className="hero-topbar">
                    <span className="hero-brand">PASTEBIN</span>
                    <a
                        href="https://umangkumar.netlify.app"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hero-portfolio-link"
                    >
                        About Developer
                    </a>
                </div>

                <h1 className="hero-title animate-slide-up">
                    Share Code & Files
                </h1>

                <p className="hero-subtitle animate-slide-up">
                    Create shareable links instantly. Set expiration for secure sharing.
                </p>

                <div className="hero-stats animate-fade-in">
                    <div className="stat">
                        <span className="stat-value">5MB</span>
                        <span className="stat-label">Max</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat">
                        <span className="stat-value">17+</span>
                        <span className="stat-label">Languages</span>
                    </div>
                    <div className="stat-divider"></div>
                    <div className="stat">
                        <span className="stat-value">Free</span>
                        <span className="stat-label">Forever</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Hero;
