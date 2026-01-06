import '../App.css';
import { Hero } from '../components/Hero';
import { PasteForm } from '../components/PasteForm';
import { Footer } from '../components/Footer';

export function HomePage() {
    return (
        <div className="app">
            {/* Hero Section */}
            <Hero />

            {/* Main Content */}
            <main className="main-content">
                <div className="container">
                    <PasteForm />
                </div>

                {/* Features Section */}
                <section className="features-section">
                    <div className="container">
                        <div className="features-grid">
                            <div className="feature-card glass animate-slide-up">
                                <h3>Lightning Fast</h3>
                                <p>Create and share pastes in seconds. No signup required.</p>
                            </div>

                            <div className="feature-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                <h3>Auto-Expire</h3>
                                <p>Set time-based or view-based expiration for secure sharing.</p>
                            </div>

                            <div className="feature-card glass animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                <h3>Syntax Highlighting</h3>
                                <p>Support for 17+ programming languages with clean formatting.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    );
}

export default HomePage;
