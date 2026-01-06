import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Highlight, themes } from 'prism-react-renderer';
import './PasteViewer.css';
import { getPaste } from '../api/config';
import type { GetPasteResponse } from '../api/types';

export function PasteViewer() {
    const { id } = useParams<{ id: string }>();
    const [paste, setPaste] = useState<GetPasteResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!id) return;

        async function fetchPaste() {
            setLoading(true);
            setError(null);

            const result = await getPaste(id!);

            if (result.success) {
                setPaste(result.data);
            } else {
                setError(result.error);
            }

            setLoading(false);
        }

        fetchPaste();
    }, [id]);

    const copyToClipboard = async () => {
        if (!paste) return;

        try {
            await navigator.clipboard.writeText(paste.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = paste.content;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const copyUrl = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const getTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    // Loading State
    if (loading) {
        return (
            <div className="paste-viewer-container">
                <div className="container">
                    <div className="paste-viewer glass">
                        <div className="loading-state">
                            <div className="loading-text">LOADING</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="paste-viewer-container">
                <div className="container">
                    <div className="paste-viewer glass">
                        <div className="error-state">
                            <h2>Paste Not Found</h2>
                            <p>{error}</p>
                            <Link to="/" className="btn">
                                CREATE NEW PASTE
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!paste) return null;

    const language = paste.language || 'text';

    return (
        <div className="paste-viewer-container">
            <div className="container">
                {/* Header */}
                <div className="paste-header">
                    <div className="paste-header-left">
                        <Link to="/" className="back-link">
                            PASTEBIN
                        </Link>
                        <span className="header-divider">/</span>
                        <span className="paste-id">{paste.id}</span>
                    </div>
                    <div className="paste-header-right">
                        <button onClick={copyUrl} className="btn btn-secondary btn-sm">
                            COPY URL
                        </button>
                        <button onClick={copyToClipboard} className="btn btn-sm">
                            {copied ? 'COPIED' : 'COPY CODE'}
                        </button>
                    </div>
                </div>

                {/* Metadata */}
                <div className="paste-meta">
                    <div className="meta-item">
                        <span className="meta-label">CREATED</span>
                        <span className="meta-value">{getTimeAgo(paste.createdAt)}</span>
                    </div>
                    <div className="meta-divider"></div>
                    <div className="meta-item">
                        <span className="meta-label">LANGUAGE</span>
                        <span className="meta-value">{language.toUpperCase()}</span>
                    </div>
                    <div className="meta-divider"></div>
                    <div className="meta-item">
                        <span className="meta-label">VIEWS</span>
                        <span className="meta-value">
                            {paste.viewCount}
                            {paste.maxViews && ` / ${paste.maxViews}`}
                        </span>
                    </div>
                    {paste.expiresAt && (
                        <>
                            <div className="meta-divider"></div>
                            <div className="meta-item">
                                <span className="meta-label">EXPIRES</span>
                                <span className="meta-value">{formatDate(paste.expiresAt)}</span>
                            </div>
                        </>
                    )}
                    {paste.remainingViews !== null && paste.remainingViews > 0 && (
                        <>
                            <div className="meta-divider"></div>
                            <div className="meta-item warning">
                                <span className="meta-label">REMAINING</span>
                                <span className="meta-value">{paste.remainingViews} VIEWS</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Code Block */}
                <div className="paste-code-container glass">
                    <Highlight
                        theme={themes.vsDark}
                        code={paste.content}
                        language={language as any}
                    >
                        {({ className, style, tokens, getLineProps, getTokenProps }) => (
                            <pre className={`${className} paste-code`} style={{ ...style, background: 'transparent' }}>
                                {tokens.map((line, i) => (
                                    <div key={i} {...getLineProps({ line })} className="code-line">
                                        <span className="line-number">{i + 1}</span>
                                        <span className="line-content">
                                            {line.map((token, key) => (
                                                <span key={key} {...getTokenProps({ token })} />
                                            ))}
                                        </span>
                                    </div>
                                ))}
                            </pre>
                        )}
                    </Highlight>
                </div>

                {/* Footer Actions */}
                <div className="paste-footer">
                    <Link to="/" className="btn btn-secondary">
                        CREATE NEW PASTE
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default PasteViewer;
