import './PastePage.css';
import { PasteViewer } from '../components/PasteViewer';
import { Footer } from '../components/Footer';

export function PastePage() {
    return (
        <div className="paste-page">
            <PasteViewer />
            <Footer />
        </div>
    );
}

export default PastePage;
