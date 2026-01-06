import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Highlight, themes } from 'prism-react-renderer';
import './FileViewer.css';
import { getUpload, type GetUploadResponse, type UploadedFile, API_ENDPOINTS } from '../api/config';

// Language detection from file extension
const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const langMap: Record<string, string> = {
        js: 'javascript',
        jsx: 'jsx',
        ts: 'typescript',
        tsx: 'tsx',
        py: 'python',
        java: 'java',
        cpp: 'cpp',
        c: 'c',
        cs: 'csharp',
        go: 'go',
        rs: 'rust',
        rb: 'ruby',
        php: 'php',
        html: 'html',
        css: 'css',
        json: 'json',
        sql: 'sql',
        sh: 'bash',
        md: 'markdown',
        yaml: 'yaml',
        yml: 'yaml',
        xml: 'xml',
    };
    return langMap[ext] || 'text';
};

// Check if file is text-based
const isTextFile = (type: string, name: string): boolean => {
    if (type.startsWith('text/')) return true;
    if (type.includes('json') || type.includes('javascript') || type.includes('xml')) return true;
    const textExtensions = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'c', 'cs', 'go', 'rs', 'rb', 'php', 'html', 'css', 'json', 'sql', 'sh', 'md', 'yaml', 'yml', 'xml', 'txt', 'env', 'gitignore', 'prisma'];
    const ext = name.split('.').pop()?.toLowerCase() || '';
    return textExtensions.includes(ext);
};

export function FileViewer() {
    const { id } = useParams<{ id: string }>();
    const [upload, setUpload] = useState<GetUploadResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

    useEffect(() => {
        if (!id) return;

        async function fetchUpload() {
            setLoading(true);
            const result = await getUpload(id!);

            if (result.success) {
                setUpload(result.data);
                // Select first text file by default
                const firstTextFile = result.data.files.find(f => isTextFile(f.type, f.name));
                if (firstTextFile) setSelectedFile(firstTextFile);
            } else {
                setError(result.error);
            }

            setLoading(false);
        }

        fetchUpload();
    }, [id]);

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

    // Decode base64 content
    const decodeContent = (content: string): string => {
        try {
            return atob(content);
        } catch {
            return 'Unable to decode file content';
        }
    };

    // Loading
    if (loading) {
        return (
            <div className="file-viewer-container">
                <div className="container">
                    <div className="file-viewer glass">
                        <div className="loading-state">
                            <div className="loading-text">LOADING</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error
    if (error) {
        return (
            <div className="file-viewer-container">
                <div className="container">
                    <div className="file-viewer glass">
                        <div className="error-state">
                            <h2>Upload Not Found</h2>
                            <p>{error}</p>
                            <Link to="/" className="btn">BACK TO HOME</Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!upload) return null;

    // Build file tree structure
    const buildTree = (files: UploadedFile[]) => {
        const tree: Record<string, UploadedFile[]> = { '/': [] };

        files.forEach(file => {
            const parts = file.path.split('/');
            if (parts.length === 1) {
                tree['/'].push(file);
            } else {
                const folder = parts.slice(0, -1).join('/');
                if (!tree[folder]) tree[folder] = [];
                tree[folder].push(file);
            }
        });

        return tree;
    };

    const tree = buildTree(upload.files);

    return (
        <div className="file-viewer-container">
            <div className="container">
                {/* Header */}
                <div className="file-header">
                    <div className="file-header-left">
                        <Link to="/" className="back-link">PASTEBIN</Link>
                        <span className="header-divider">/</span>
                        <span className="file-name">{upload.name}</span>
                    </div>
                    <div className="file-header-right">
                        <span className="meta-badge">{upload.fileCount} FILES</span>
                        <span className="meta-badge">{formatSize(upload.totalSize)}</span>
                    </div>
                </div>

                {/* Metadata */}
                <div className="file-meta">
                    <div className="meta-item">
                        <span className="meta-label">CREATED</span>
                        <span className="meta-value">{getTimeAgo(upload.createdAt)}</span>
                    </div>
                    <div className="meta-divider"></div>
                    <div className="meta-item">
                        <span className="meta-label">VIEWS</span>
                        <span className="meta-value">{upload.viewCount}</span>
                    </div>
                    {upload.expiresAt && (
                        <>
                            <div className="meta-divider"></div>
                            <div className="meta-item">
                                <span className="meta-label">EXPIRES</span>
                                <span className="meta-value">{new Date(upload.expiresAt).toLocaleString()}</span>
                            </div>
                        </>
                    )}
                </div>

                {/* Main Content */}
                <div className="file-content-grid">
                    {/* File Tree */}
                    <div className="file-tree glass">
                        <div className="tree-header">FILES</div>
                        {Object.entries(tree).map(([folder, files]) => (
                            <div key={folder} className="tree-folder">
                                {folder !== '/' && (
                                    <div className="folder-name">{folder}/</div>
                                )}
                                {files.map((file, idx) => (
                                    <div
                                        key={idx}
                                        className={`tree-file ${selectedFile?.path === file.path ? 'selected' : ''}`}
                                        onClick={() => setSelectedFile(file)}
                                    >
                                        <span className="file-icon">{isTextFile(file.type, file.name) ? '◇' : '◈'}</span>
                                        <span className="file-label">{file.name}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* File Preview */}
                    <div className="file-preview glass">
                        {selectedFile ? (
                            <>
                                <div className="preview-header">
                                    <span className="preview-filename">{selectedFile.path}</span>
                                    <span className="preview-size">{formatSize(selectedFile.size)}</span>
                                </div>
                                {isTextFile(selectedFile.type, selectedFile.name) ? (
                                    <div className="preview-code">
                                        <Highlight
                                            theme={themes.vsDark}
                                            code={decodeContent(selectedFile.content)}
                                            language={getLanguage(selectedFile.name) as any}
                                        >
                                            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                                                <pre className={className} style={{ ...style, background: 'transparent' }}>
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
                                ) : (
                                    <div className="preview-binary">
                                        <p>Binary file - cannot preview</p>
                                        <a
                                            href={`${API_ENDPOINTS.files}/${id}/download/${selectedFile.path}`}
                                            className="btn btn-sm"
                                            download
                                        >
                                            DOWNLOAD
                                        </a>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="preview-empty">Select a file to preview</div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="file-footer">
                    <Link to="/" className="btn btn-secondary">BACK TO HOME</Link>
                </div>
            </div>
        </div>
    );
}

export default FileViewer;
