import { useState, useEffect } from 'react';
import { supabase, VITE_API_BASE_URL } from '../services/api';

export default function AdminDashboard() {
    const [restaurants, setRestaurants] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [vendors, setVendors] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('restaurants'); // 'restaurants', 'customers', 'vendors'

    // Pagination & Filtering for Restaurants
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Modal state
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);

    const getAuthToken = async () => {
        if (localStorage.getItem('nutrikart_super_admin') === 'true') {
            return localStorage.getItem('nutrikart_admin_token');
        }
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || '';
    };

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const token = await getAuthToken();
            const res = await fetch(`${VITE_API_BASE_URL}/admin/restaurants?page=${page}&limit=10&search=${search}&status=${statusFilter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch restaurants');

            setRestaurants(data.data || []);
            setTotalPages(data.totalPages || 1);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const token = await getAuthToken();
            const headers = { 'Authorization': `Bearer ${token}` };

            const [custRes, vendRes] = await Promise.all([
                fetch(`${VITE_API_BASE_URL}/admin/customers`, { headers }),
                fetch(`${VITE_API_BASE_URL}/admin/vendors`, { headers })
            ]);

            const custData = await custRes.json();
            const vendData = await vendRes.json();

            setCustomers(custData || []);
            setVendors(vendData || []);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    useEffect(() => {
        if (activeTab === 'restaurants') {
            fetchRestaurants();
        } else {
            fetchUsers();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, page, statusFilter, search]);

    const handleAction = async (id, action) => {
        try {
            const token = await getAuthToken();
            const res = await fetch(`${VITE_API_BASE_URL}/admin/restaurants/${id}/${action}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || `Failed to ${action} restaurant`);

            alert(`Restaurant ${action}d successfully!`);
            fetchRestaurants(); // Refresh list
            if (selectedRestaurant && selectedRestaurant.id === id) {
                setSelectedRestaurant(null); // close modal on action
            }
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="dashboard-content" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
            <h1 className="title-gradient mb-2" style={{ fontSize: '2rem' }}>Platform Administration</h1>
            <p className="text-muted mb-4">Manage platform users and applications.</p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    className={`btn ${activeTab === 'restaurants' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => { setActiveTab('restaurants'); setPage(1); }}
                >
                    Restaurant Approval Requests
                </button>
                <button
                    className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('customers')}
                >
                    Customers
                </button>
                <button
                    className={`btn ${activeTab === 'vendors' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('vendors')}
                >
                    Vendors
                </button>
            </div>

            {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>{error}</div>}

            {activeTab === 'restaurants' && (
                <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                        <input
                            type="text"
                            placeholder="Search by restaurant name..."
                            className="form-input"
                            style={{ flex: 1, minWidth: '200px', maxWidth: '300px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        />
                        <select
                            className="form-input"
                            style={{ width: '200px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="all" style={{ color: 'black' }}>All Statuses</option>
                            <option value="pending" style={{ color: 'black' }}>Pending</option>
                            <option value="approved" style={{ color: 'black' }}>Approved</option>
                            <option value="rejected" style={{ color: 'black' }}>Rejected</option>
                        </select>
                    </div>

                    {loading ? (
                        <p>Loading applications...</p>
                    ) : restaurants.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No restaurants found.</p>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <th style={{ padding: '10px' }}>Restaurant Name</th>
                                        <th style={{ padding: '10px' }}>Vendor Name</th>
                                        <th style={{ padding: '10px' }}>FSSAI Number</th>
                                        <th style={{ padding: '10px' }}>Submitted Date</th>
                                        <th style={{ padding: '10px' }}>Status</th>
                                        <th style={{ padding: '10px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {restaurants.map(rest => (
                                        <tr key={rest.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '10px', fontWeight: 'bold' }}>{rest.name}</td>
                                            <td style={{ padding: '10px' }}>{rest.owner_name}</td>
                                            <td style={{ padding: '10px' }}>{rest.fssai_number}</td>
                                            <td style={{ padding: '10px' }}>{new Date(rest.created_at).toLocaleDateString()}</td>
                                            <td style={{ padding: '10px' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem',
                                                    backgroundColor: rest.status === 'pending' ? 'var(--warning)' : (rest.status === 'approved' ? 'var(--success)' : 'var(--danger)'),
                                                    color: rest.status === 'pending' ? '#000' : '#fff'
                                                }}>
                                                    {rest.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                                                <button className="btn btn-secondary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => setSelectedRestaurant(rest)}>View Details</button>
                                                {rest.status === 'pending' && (
                                                    <>
                                                        <button className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={() => handleAction(rest.id, 'approve')}>Approve</button>
                                                        <button className="btn" style={{ padding: '5px 10px', fontSize: '0.8rem', backgroundColor: 'var(--danger)', color: 'white' }} onClick={() => handleAction(rest.id, 'reject')}>Reject</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                            <button className="btn btn-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
                            <span style={{ padding: '10px' }}>Page {page} of {totalPages}</span>
                            <button className="btn btn-secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'customers' && (
                /* ... keep existing customers view ... */
                <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
                    <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Registered Customers</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '10px' }}>Name</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Phone</th>
                                <th style={{ padding: '10px' }}>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.length > 0 ? customers.map(cust => (
                                <tr key={cust.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px' }}>{cust.full_name || 'N/A'}</td>
                                    <td style={{ padding: '10px' }}>{cust.email}</td>
                                    <td style={{ padding: '10px' }}>{cust.phone_number || 'N/A'}</td>
                                    <td style={{ padding: '10px' }}>{new Date(cust.created_at).toLocaleDateString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No customers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'vendors' && (
                /* ... keep existing vendors view ... */
                <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
                    <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>Registered Vendors</h2>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ padding: '10px' }}>Name</th>
                                <th style={{ padding: '10px' }}>Email</th>
                                <th style={{ padding: '10px' }}>Phone</th>
                                <th style={{ padding: '10px' }}>Restaurants</th>
                                <th style={{ padding: '10px' }}>Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendors.length > 0 ? vendors.map(vend => (
                                <tr key={vend.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px' }}>{vend.full_name || 'N/A'}</td>
                                    <td style={{ padding: '10px' }}>{vend.email}</td>
                                    <td style={{ padding: '10px' }}>{vend.phone_number || 'N/A'}</td>
                                    <td style={{ padding: '10px' }}>
                                        {vend.restaurants && vend.restaurants.length > 0 ? (
                                            <ul>
                                                {vend.restaurants.map(r => (
                                                    <li key={r.id}>
                                                        {r.name} - <span style={{ color: r.status === 'approved' ? 'var(--success)' : (r.status === 'pending' ? 'var(--warning)' : 'var(--danger)') }}>{r.status}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : 'No Restaurants'}
                                    </td>
                                    <td style={{ padding: '10px' }}>{new Date(vend.created_at).toLocaleDateString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>No vendors found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for View Complete Details */}
            {selectedRestaurant && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-panel" style={{
                        width: '100%', maxWidth: '800px', maxHeight: '90vh',
                        overflowY: 'auto', padding: '30px', position: 'relative',
                        backgroundColor: '#1a1a2e' // deeper solid fallback
                    }}>
                        <button
                            onClick={() => setSelectedRestaurant(null)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}
                        >
                            &times;
                        </button>
                        <h2 style={{ color: 'var(--primary)', marginTop: 0 }}>Restaurant Details: {selectedRestaurant.name}</h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                            <div>
                                <h4 style={{ color: '#aaa', borderBottom: '1px solid #444', paddingBottom: '5px' }}>Basic Info</h4>
                                <p><strong>Type:</strong> {selectedRestaurant.restaurant_type}</p>
                                <p><strong>Cuisine:</strong> {selectedRestaurant.cuisine_type}</p>
                                <p><strong>Address:</strong> {selectedRestaurant.address}, {selectedRestaurant.city}, {selectedRestaurant.state} - {selectedRestaurant.pincode}</p>
                                <p><strong>Description:</strong> {selectedRestaurant.description}</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#aaa', borderBottom: '1px solid #444', paddingBottom: '5px' }}>Owner Details</h4>
                                <p><strong>Name:</strong> {selectedRestaurant.owner_name}</p>
                                <p><strong>Phone:</strong> {selectedRestaurant.contact_number}</p>
                                <p><strong>Email:</strong> {selectedRestaurant.vendor?.email || selectedRestaurant.owner_email}</p>
                            </div>
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <h4 style={{ color: '#aaa', borderBottom: '1px solid #444', paddingBottom: '5px' }}>Uploaded Documents</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
                                    <p style={{ margin: '0 0 10px 0' }}><strong>FSSAI License</strong></p>
                                    <p style={{ fontSize: '0.85rem', color: '#ccc' }}>No: {selectedRestaurant.fssai_number}</p>
                                    {selectedRestaurant.fssai_doc_url ? (
                                        <a href={selectedRestaurant.fssai_doc_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontSize: '0.9rem' }}>View FSSAI Certificate</a>
                                    ) : <span style={{ color: '#888', fontSize: '0.9rem' }}>No document linked</span>}
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '200px' }}>
                                    <p style={{ margin: '0 0 10px 0' }}><strong>Trade License</strong></p>
                                    <p style={{ fontSize: '0.85rem', color: '#ccc' }}>No: {selectedRestaurant.trade_license_number}</p>
                                    {selectedRestaurant.trade_doc_url ? (
                                        <a href={selectedRestaurant.trade_doc_url} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', textDecoration: 'underline', fontSize: '0.9rem' }}>View Trade License</a>
                                    ) : <span style={{ color: '#888', fontSize: '0.9rem' }}>No document linked</span>}
                                </div>
                            </div>
                        </div>

                        {selectedRestaurant.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '15px', marginTop: '30px', justifyContent: 'flex-end', borderTop: '1px solid #444', paddingTop: '20px' }}>
                                <button className="btn" style={{ padding: '10px 30px', backgroundColor: 'var(--danger)', color: 'white' }} onClick={() => handleAction(selectedRestaurant.id, 'reject')}>Reject Application</button>
                                <button className="btn btn-primary" style={{ padding: '10px 30px' }} onClick={() => handleAction(selectedRestaurant.id, 'approve')}>Approve Application</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
