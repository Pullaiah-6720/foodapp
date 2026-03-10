import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and get the role
        const getSession = async () => {
            // Hardcoded bypass check
            if (localStorage.getItem('nutrikart_super_admin') === 'true') {
                setUser({ id: 'super-admin-uuid', email: 'pullaiah@gmail.com' });
                setRole('admin');
                setLoading(false);
                return;
            }

            // Normal User Email-Confirmation Bypass Check
            const bypassedUser = localStorage.getItem('nutrikart_bypassed_user');
            if (bypassedUser) {
                const parsedUser = JSON.parse(bypassedUser);
                setUser({ id: parsedUser.id, email: parsedUser.email });
                setRole(parsedUser.role);
                setLoading(false);
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                setUser(session.user);
                // Fetch strict DB role if using public.users mapping
                const { data: userData } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', session.user.id)
                    .single();

                if (userData) setRole(userData.role);
            }
            setLoading(false);
        };

        getSession();

        // Listen for Auth changes
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                // Ignore listener events if running as bypassed hardcoded admin OR bypassed unconfirmed user
                if (localStorage.getItem('nutrikart_super_admin') === 'true' || localStorage.getItem('nutrikart_bypassed_user')) {
                    return;
                }

                if (session) {
                    setUser(session.user);
                    const { data: userData } = await supabase
                        .from('users')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();

                    if (userData) setRole(userData.role);
                } else {
                    setUser(null);
                    setRole(null);
                }
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const value = {
        user,
        role,
        loading,
        signOut: () => {
            if (localStorage.getItem('nutrikart_super_admin') === 'true') {
                localStorage.removeItem('nutrikart_super_admin');
                localStorage.removeItem('nutrikart_admin_token');
                setUser(null);
                setRole(null);
                window.location.href = '/login';
            } else if (localStorage.getItem('nutrikart_bypassed_user')) {
                localStorage.removeItem('nutrikart_bypassed_user');
                setUser(null);
                setRole(null);
                window.location.href = '/login';
            } else {
                supabase.auth.signOut();
            }
        }
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
