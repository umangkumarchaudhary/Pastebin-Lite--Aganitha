/// <reference types="vite/client" />

interface ImportMetaEnv {
    /**
     * Backend API URL
     * @example "https://your-backend.onrender.com"
     */
    readonly VITE_API_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
