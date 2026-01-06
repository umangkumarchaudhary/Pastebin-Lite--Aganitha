import { useState, useRef, useCallback } from 'react';
import './FileUploadForm.css';
import { createUpload, type UploadedFile, type UploadResponse } from '../api/config';

interface FileUploadFormProps {
    onSuccess?: (upload: UploadResponse) => void;
}

export function FileUploadForm({ onSuccess }: FileUploadFormProps) {
    const [name, setName] = useState('');
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [expiresIn, setExpiresIn] = useState('1440'); // Default to 1 day
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<UploadResponse | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB
    const MAX_FILE_COUNT = 20;

    // Convert file to base64
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = reader.result as string;
                const base64 = result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    };

    // Process uploaded files
    const processFiles = useCallback(async (fileList: FileList | File[]) => {
        const filesArray = Array.from(fileList);

        if (files.length + filesArray.length > MAX_FILE_COUNT) {
            setError(`Maximum ${MAX_FILE_COUNT} files allowed`);
            return;
        }

        const newFiles: UploadedFile[] = [];
        let totalSize = files.reduce((sum, f) => sum + f.size, 0);

        for (const file of filesArray) {
            if (totalSize + file.size > MAX_TOTAL_SIZE) {
                setError('Total size exceeds 5MB limit');
                return;
            }

            const content = await fileToBase64(file);
            const relativePath = (file as any).webkitRelativePath || file.name;

            newFiles.push({
                path: relativePath,
                name: file.name,
                content,
                size: file.size,
                type: file.type || 'application/octet-stream',
            });

            totalSize += file.size;
        }

        setFiles(prev => [...prev, ...newFiles]);
        setError(null);
    }, [files]);

    // Handle drag events
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const items = e.dataTransfer.items;
        const fileList: File[] = [];

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) fileList.push(file);
            }
        }

        await processFiles(fileList);
    };

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            await processFiles(e.target.files);
        }
    };

    // Remove file
    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Format file size
    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Calculate total size
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);

    // Handle submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!name.trim()) {
            setError('Please enter a name for this upload');
            setIsSubmitting(false);
            return;
        }

        if (files.length === 0) {
            setError('Please add at least one file');
            setIsSubmitting(false);
            return;
        }

        const result = await createUpload({
            name: name.trim(),
            files,
            expiresIn: expiresIn ? parseInt(expiresIn) : undefined,
        });

        if (result.success) {
            setSuccessData(result.data);
            onSuccess?.(result.data);
        } else {
            setError(result.error);
        }

        setIsSubmitting(false);
    };

    // Reset form
    const handleNewUpload = () => {
        setSuccessData(null);
        setFiles([]);
        setName('');
        setExpiresIn('1440');
        setError(null);
    };

    // Success state
    if (successData) {
        return (
            <div className="file-upload-form glass animate-fade-in">
                <div className="upload-success">
                    <div className="success-icon">✓</div>
                    <h2>Upload Complete!</h2>
                    <p>Your files are ready to share</p>

                    <div className="upload-stats">
                        <span className="badge">{successData.fileCount} FILES</span>
                        <span className="badge">{formatSize(successData.totalSize)}</span>
                    </div>

                    <div className="success-actions">
                        <a href={`/files/${successData.id}`} className="btn btn-secondary">
                            VIEW FILES
                        </a>
                        <button onClick={handleNewUpload} className="btn">
                            UPLOAD MORE
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="file-upload-form glass animate-fade-in">
            <div className="form-header">
                <h2>Upload Files</h2>
                <p className="text-secondary">Share folders and files with your team</p>
            </div>

            {/* Name Input */}
            <div className="form-group">
                <label htmlFor="upload-name" className="form-label">NAME</label>
                <input
                    id="upload-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Project Components, API Routes..."
                    className="form-input"
                />
            </div>

            {/* Drop Zone */}
            <div
                className={`drop-zone ${isDragOver ? 'drag-over' : ''} ${files.length > 0 ? 'has-files' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />

                {files.length === 0 ? (
                    <div className="drop-zone-content">
                        <div className="drop-icon">+</div>
                        <p>Drop files here or click to browse</p>
                        <span className="drop-hint">Max 5MB total, 20 files</span>
                    </div>
                ) : (
                    <div className="file-list">
                        {files.map((file, index) => (
                            <div key={index} className="file-item">
                                <span className="file-name">{file.path}</span>
                                <span className="file-size">{formatSize(file.size)}</span>
                                <button
                                    type="button"
                                    className="file-remove"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(index);
                                    }}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                        <div className="add-more">+ Add more files</div>
                    </div>
                )}
            </div>

            {/* File Count & Size */}
            {files.length > 0 && (
                <div className="upload-info">
                    <span>{files.length} / {MAX_FILE_COUNT} files</span>
                    <span>{formatSize(totalSize)} / 5 MB</span>
                </div>
            )}

            {/* Expiration */}
            <div className="form-group">
                <label htmlFor="expires-in" className="form-label">EXPIRES IN</label>
                <select
                    id="expires-in"
                    value={expiresIn}
                    onChange={(e) => setExpiresIn(e.target.value)}
                    className="form-select"
                >
                    <option value="10">10 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="1440">1 day</option>
                    <option value="10080">1 week</option>
                </select>
            </div>

            {/* Error */}
            {error && (
                <div className="error-message">{error}</div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isSubmitting || files.length === 0}
                className="btn submit-btn"
            >
                {isSubmitting ? 'UPLOADING...' : 'SHARE FILES'}
            </button>
        </form>
    );
}

export default FileUploadForm;
