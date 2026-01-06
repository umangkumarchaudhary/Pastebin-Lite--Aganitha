import './Hero.css';

export function Hero() {
    return (
        <section className="hero">
            <div className="hero-content container">
                <p className="hero-tagline animate-fade-in">
                    PASTEBIN
                </p>

                <h1 className="hero-title animate-slide-up">
                    Share Code Instantly
                </h1>

                <p className="hero-subtitle animate-slide-up">
                    Create shareable links for your code snippets and text.
                    Set expiration by time or views for secure sharing.
                </p>

                <div className="hero-stats animate-fade-in">
                    <div className="stat">
                        <span className="stat-value">500KB</span>
                        <span className="stat-label">Max Size</span>
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
