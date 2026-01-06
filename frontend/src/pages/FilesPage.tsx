import { FileViewer } from '../components/FileViewer';
import { Footer } from '../components/Footer';
import './FilesPage.css';

export function FilesPage() {
    return (
        <div className="files-page">
            <FileViewer />
            <Footer />
        </div>
    );
}

export default FilesPage;
