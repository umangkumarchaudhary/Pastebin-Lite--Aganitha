import React, { useState } from 'react';
import './PasteForm.css';
import { createPaste } from '../api/config';
import type { PasteResponse } from '../api/types';

/**
 * Expiration presets for time-based expiration
 */
const EXPIRATION_OPTIONS = [
    { label: 'Never', value: '' },
    { label: '10 minutes', value: '10' },
    { label: '1 hour', value: '60' },
    { label: '1 day', value: '1440' },
    { label: '1 week', value: '10080' },
    { label: '1 month', value: '43200' },
];

/**
 * Max views presets for view-based expiration
 */
const MAX_VIEWS_OPTIONS = [
    { label: 'Unlimited', value: '' },
    { label: 'Burn after reading (1 view)', value: '1' },
    { label: '10 views', value: '10' },
    { label: '100 views', value: '100' },
    { label: '1,000 views', value: '1000' },
];

/**
 * Language options for syntax highlighting
 */
const LANGUAGE_OPTIONS = [
    { label: 'Plain Text', value: '' },
    { label: 'JavaScript', value: 'javascript' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'Python', value: 'python' },
    { label: 'Java', value: 'java' },
    { label: 'C++', value: 'cpp' },
    { label: 'C#', value: 'csharp' },
    { label: 'Go', value: 'go' },
    { label: 'Rust', value: 'rust' },
    { label: 'Ruby', value: 'ruby' },
    { label: 'PHP', value: 'php' },
    { label: 'HTML', value: 'html' },
    { label: 'CSS', value: 'css' },
    { label: 'JSON', value: 'json' },
    { label: 'SQL', value: 'sql' },
    { label: 'Bash', value: 'bash' },
    { label: 'Markdown', value: 'markdown' },
];

interface PasteFormProps {
    onSuccess?: (paste: PasteResponse) => void;
}

export function PasteForm({ onSuccess }: PasteFormProps) {
    // Form state
    const [content, setContent] = useState('');
    const [language, setLanguage] = useState('');
    const [expiresIn, setExpiresIn] = useState('');
    const [maxViews, setMaxViews] = useState('');

    // UI state
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<PasteResponse | null>(null);
    const [copied, setCopied] = useState(false);

    // Character count
    const charCount = content.length;
    const maxChars = 500000;
    const isOverLimit = charCount > maxChars;

    /**
     * Handle form submission
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessData(null);

        // Validation
        if (!content.trim()) {
            setError('Please enter some content');
            return;
        }

        if (isOverLimit) {
            setError('Content exceeds maximum size of 500KB');
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createPaste({
                content: content.trim(),
                language: language || undefined,
                expiresIn: expiresIn ? parseInt(expiresIn) : undefined,
                maxViews: maxViews ? parseInt(maxViews) : undefined,
            });

            if (result.success) {
                setSuccessData(result.data);
                onSuccess?.(result.data);
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Failed to create paste. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Copy URL to clipboard
     */
    const copyToClipboard = async () => {
        if (!successData) return;

        try {
            await navigator.clipboard.writeText(successData.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = successData.url;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    /**
     * Reset form for new paste
     */
    const handleNewPaste = () => {
        setContent('');
        setLanguage('');
        setExpiresIn('');
        setMaxViews('');
        setSuccessData(null);
        setError(null);
    };

    // Show success state
    if (successData) {
        return (
            <div className="paste-form-card glass animate-slide-up">
                <div className="success-container">
                    <div className="success-icon">✓</div>
                    <h2>Paste Created!</h2>
                    <p className="text-secondary">Your paste is ready to share</p>

                    <div className="success-url-container">
                        <input
                            type="text"
                            value={successData.url}
                            readOnly
                            className="success-url-input"
                        />
                        <button
                            onClick={copyToClipboard}
                            className="btn copy-btn"
                        >
                            {copied ? '✓ Copied!' : 'Copy'}
                        </button>
                    </div>

                    <div className="success-meta">
                        {successData.expiresAt && (
                            <span className="badge badge-warning">
                                ⏱ Expires: {new Date(successData.expiresAt).toLocaleString()}
                            </span>
                        )}
                        {successData.maxViews && (
                            <span className="badge">
                                👁 Max views: {successData.maxViews}
                            </span>
                        )}
                    </div>

                    <div className="success-actions">
                        <a
                            href={successData.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                        >
                            View Paste →
                        </a>
                        <button onClick={handleNewPaste} className="btn">
                            Create Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="paste-form-card glass animate-fade-in">
            <div className="paste-form-header">
                <h2>Create New Paste</h2>
                <p className="text-secondary">Share code and text instantly with optional expiration</p>
            </div>

            {/* Content Textarea */}
            <div className="form-group">
                <label htmlFor="content" className="form-label">
                    Content
                </label>
                <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Paste your code or text here..."
                    className={`form-textarea ${isOverLimit ? 'error' : ''}`}
                    disabled={isSubmitting}
                />
                <div className="char-counter">
                    <span className={isOverLimit ? 'text-error' : 'text-muted'}>
                        {charCount.toLocaleString()} / {maxChars.toLocaleString()} characters
                    </span>
                </div>
            </div>

            {/* Options Row */}
            <div className="options-grid">
                {/* Language Select */}
                <div className="form-group">
                    <label htmlFor="language" className="form-label">
                        Syntax Highlighting
                    </label>
                    <select
                        id="language"
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="form-select"
                        disabled={isSubmitting}
                    >
                        {LANGUAGE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Expiration Select */}
                <div className="form-group">
                    <label htmlFor="expiresIn" className="form-label">
                        Expires In
                    </label>
                    <select
                        id="expiresIn"
                        value={expiresIn}
                        onChange={(e) => setExpiresIn(e.target.value)}
                        className="form-select"
                        disabled={isSubmitting}
                    >
                        {EXPIRATION_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Max Views Select */}
                <div className="form-group">
                    <label htmlFor="maxViews" className="form-label">
                        Max Views
                    </label>
                    <select
                        id="maxViews"
                        value={maxViews}
                        onChange={(e) => setMaxViews(e.target.value)}
                        className="form-select"
                        disabled={isSubmitting}
                    >
                        {MAX_VIEWS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="error-container animate-fade-in">
                    <span className="error-icon">⚠</span>
                    <span>{error}</span>
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                className="btn btn-lg submit-btn"
                disabled={isSubmitting || !content.trim() || isOverLimit}
            >
                {isSubmitting ? (
                    <>
                        <span className="spinner"></span>
                        Creating...
                    </>
                ) : (
                    <>
                        Create Paste
                    </>
                )}
            </button>
        </form>
    );
}

export default PasteForm;
