import { useState } from 'react';
import { supabase } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export default function Auth({ isLogin }) {
    const { user, role } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [selectedRole, setSelectedRole] = useState('customer');
    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState('');

    if (user) {
        // Redirect to respective dashboard
        return <Navigate to={`/${role}/dashboard`} />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorText('');

        try {
            if (isLogin) {
                // Hardcoded Super Admin Bypass
                if (email === 'pullaiah@gmail.com' && password === 'Pullaiah') {
                    // Create a fake token/user to instantly bypass normal Supabase checks
                    localStorage.setItem('nutrikart_super_admin', 'true');
                    const bypassPayload = btoa(JSON.stringify({ sub: '056c7e42-a236-4088-8421-80a27cb4e8e4', email: 'pullaiah@gmail.com' }));
                    localStorage.setItem('nutrikart_admin_token', `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${bypassPayload}.dummy_signature`);
                    return window.location.href = '/admin/dashboard';
                }

                // Perform direct login using Express Backend API wrapper instead of Supabase directly if you prefer
                // For speed, logging in via API:
                const res = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                if (data.isBypassed) {
                    // Supabase blocked the normal session because "Email wasn't confirmed", but they validated the password!
                    // The backend has built us a custom bypass session token manually:
                    localStorage.setItem('nutrikart_bypassed_user', JSON.stringify({
                        id: data.user_id,
                        email: email,
                        token: data.token,
                        role: data.role
                    }));
                    return window.location.href = `/${data.role}/dashboard`;
                }

                // Set the Supabase Session explicitly to sync Context state if it wasn't a bypassed login!
                await supabase.auth.setSession({
                    access_token: data.token,
                    refresh_token: '' // Handled automatically by client ideally
                });

            } else {
                // Registration Workflow
                const res = await fetch('http://localhost:5000/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, full_name: fullName, phone_number: phone, role: selectedRole })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error);

                alert('Registration Successful! You can now log in.');
            }
        } catch (err) {
            setErrorText(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box glass-panel text-center">
                <h2 className="title-gradient mb-1">{isLogin ? 'Welcome Back!' : 'Join NutriKart'}</h2>
                <p className="text-muted mb-3">
                    {isLogin ? 'Login to access your dashboard' : 'Create an account to order or sell food'}
                </p>

                {errorText && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{errorText}</div>}

                <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Account Type</label>
                                <select
                                    className="form-input"
                                    value={selectedRole}
                                    onChange={e => setSelectedRole(e.target.value)}
                                >
                                    <option value="customer">Hungry Customer</option>
                                    <option value="vendor">Restaurant Vendor</option>
                                    <option value="delivery">Delivery Partner</option>
                                </select>
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            type="email"
                            className="form-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
                    </button>
                </form>

                <p className="mt-3 text-muted" style={{ fontSize: '0.9rem' }}>
                    {isLogin ? "Don't have an account?" : "Already requested access?"}
                    {' '}
                    <a
                        href={isLogin ? '/register' : '/login'}
                        style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}
                    >
                        {isLogin ? 'Sign up here' : 'Log in here'}
                    </a>
                </p>
            </div>
        </div>
    );
}
