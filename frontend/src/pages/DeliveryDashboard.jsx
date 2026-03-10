import { useState, useEffect } from 'react';
import { supabase, VITE_API_BASE_URL } from '../services/api';

export default function DeliveryDashboard() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            // In a real app we'd fetch only active ones matching certain zones
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, total_amount, payment_type, status, created_at,
                    customer:users!customer_id(full_name, phone_number),
                    restaurant:restaurants(name, city, address)
                `)
                .neq('status', 'delivered')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error('Fetch Orders Error:', err.message);
        } finally {
            setLoading(false);
        }
    };

    const getAuthToken = async () => {
        const bypassedUser = localStorage.getItem('nutrikart_bypassed_user');
        if (bypassedUser) {
            return JSON.parse(bypassedUser).token;
        }
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || '';
    };

    const updateStatus = async (orderId, newStatus) => {
        try {
            const token = await getAuthToken();
            const res = await fetch(`${VITE_API_BASE_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update order');

            alert(`Order status updated to ${newStatus}!`);
            fetchOrders();
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div style={{ padding: '20px' }}>Loading Delivery Dashboard...</div>;

    return (
        <div className="dashboard-content" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 className="title-gradient mb-3">Delivery Partner Dashboard</h1>

            <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ marginBottom: '15px', color: 'var(--primary)' }}>Active Deliveries</h3>

                {orders.length === 0 ? <p className="text-muted">No active orders right now.</p> : (
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {orders.map(order => (
                            <div key={order.id} style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ flex: 2, minWidth: '300px' }}>
                                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        Order #{order.id.split('-')[0]}
                                        <span className="badge" style={{ background: order.status === 'placed' ? 'var(--warning)' : 'var(--primary)', color: '#000', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </h4>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>Pickup From:</strong></p>
                                            <p style={{ margin: 0, fontSize: '1rem' }}>{order.restaurant?.name}</p>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{order.restaurant?.address}, {order.restaurant?.city}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}><strong>Deliver To:</strong></p>
                                            <p style={{ margin: 0, fontSize: '1rem' }}>{order.customer?.full_name}</p>
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Phone: {order.customer?.phone_number}</p>
                                        </div>
                                    </div>

                                    <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px dotted rgba(255,255,255,0.1)' }}>
                                        <p style={{ margin: 0 }}><strong>Amount to Collect:</strong> ₹{order.total_amount} ({order.payment_type})</p>
                                    </div>
                                </div>

                                <div style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
                                    {order.status === 'placed' && (
                                        <button className="btn btn-primary" onClick={() => updateStatus(order.id, 'confirmed')}>Accept Order</button>
                                    )}
                                    {order.status === 'confirmed' && (
                                        <button className="btn btn-warning" onClick={() => updateStatus(order.id, 'picked')} style={{ color: '#000', fontWeight: 'bold' }}>Mark Picked Up</button>
                                    )}
                                    {order.status === 'picked' && (
                                        <button className="btn btn-success" onClick={() => updateStatus(order.id, 'delivered')} style={{ background: '#2ecc71', color: '#fff' }}>Confirm Delivered</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
