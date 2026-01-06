import '../App.css';
import { Hero } from '../components/Hero';
import { PasteForm } from '../components/PasteForm';
import { FileUploadForm } from '../components/FileUploadForm';
import { Footer } from '../components/Footer';
import { useState } from 'react';

type TabType = 'paste' | 'files';

export function HomePage() {
    const [activeTab, setActiveTab] = useState<TabType>('paste');

    return (
        <div className="app">
            {/* Hero Section */}
            <Hero />

            {/* Main Content */}
            <main className="main-content">
                <div className="container">
                    {/* Tab Navigation */}
                    <div className="tab-nav">
                        <button
                            className={`tab-btn ${activeTab === 'paste' ? 'active' : ''}`}
                            onClick={() => setActiveTab('paste')}
                        >
                            PASTE CODE
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
                            onClick={() => setActiveTab('files')}
                        >
                            UPLOAD FILES
                        </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'paste' ? <PasteForm /> : <FileUploadForm />}
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
                                <h3>File Sharing</h3>
                                <p>Upload folders and files to share project snippets with your team.</p>
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
