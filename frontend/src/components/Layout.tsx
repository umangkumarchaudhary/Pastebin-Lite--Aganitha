import { Outlet } from 'react-router-dom';
import './Layout.css';

export function Layout() {
    return (
        <div className="layout">
            <Outlet />
        </div>
    );
}

export default Layout;
