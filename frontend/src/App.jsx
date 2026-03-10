import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import VendorDashboard from './pages/VendorDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import MealPlanner from './pages/MealPlanner';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, role, loading } = useAuth();

    if (loading) return <div>Auth Checking...</div>;

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" />; // Or generic forbidden
    }

    return children;
};

const AppContent = () => {
    const { signOut, user } = useAuth();
    const location = useLocation();

    // Hide the global navbar on Customer routes because CustomerDashboard has its own navbar
    const hideGlobalNav = ['/', '/home', '/restaurants', '/menu', '/search', '/food-details', '/cart', '/checkout', '/orders', '/profile'].includes(location.pathname) || location.pathname.startsWith('/customer');

    return (
        <>
            {/* Dynamic Navbar */}
            {!hideGlobalNav && (
                <nav className="navbar">
                    <div className="brand-text" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ color: 'white' }}>Nutri</span>Kart
                    </div>
                    <div className="nav-links">
                        {user ? (
                            <button
                                onClick={signOut}
                                className="btn btn-secondary"
                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            >
                                Sign Out
                            </button>
                        ) : (
                            <>
                                <a href="/login" className="nav-link">Log In</a>
                                <a href="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Sign Up</a>
                            </>
                        )}
                    </div>
                </nav>
            )}

            {/* Logic Router mapping */}
            <Routes>
                {/* Public Customer Routes */}
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/home" element={<CustomerDashboard />} />
                <Route path="/restaurants" element={<CustomerDashboard />} />
                <Route path="/menu" element={<CustomerDashboard />} />
                <Route path="/search" element={<CustomerDashboard />} />
                <Route path="/food-details" element={<CustomerDashboard />} />

                {/* Auth Routes */}
                <Route path="/login" element={<Auth isLogin={true} />} />
                <Route path="/register" element={<Auth isLogin={false} />} />

                {/* Legacy Customer Dashboard route -> redirect to home */}
                <Route
                    path="/customer/dashboard"
                    element={<Navigate to="/home" />}
                />

                {/* Protected Customer Routes pointing back to CustomerDashboard (single page app structure) */}
                <Route path="/cart" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/orders" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>} />

                <Route
                    path="/customer/order"
                    element={<ProtectedRoute allowedRoles={['customer']}><CustomerDashboard /></ProtectedRoute>}
                />
                <Route
                    path="/customer/meal-planner"
                    element={<ProtectedRoute allowedRoles={['customer']}><MealPlanner /></ProtectedRoute>}
                />

                {/* Other Dashboards */}
                <Route
                    path="/vendor/dashboard"
                    element={<ProtectedRoute allowedRoles={['vendor']}><VendorDashboard /></ProtectedRoute>}
                />
                <Route
                    path="/admin/dashboard"
                    element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>}
                />
                <Route
                    path="/delivery/dashboard"
                    element={<ProtectedRoute allowedRoles={['delivery']}><DeliveryDashboard /></ProtectedRoute>}
                />
            </Routes>
        </>
    );
};

export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
