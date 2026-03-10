import { useState, useEffect } from 'react';
import { supabase, VITE_API_BASE_URL } from '../services/api';

export default function VendorDashboard() {
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('options'); // 'options', 'add_restaurant', 'menu_management'
    const [step, setStep] = useState(1);

    // Form States mapped strictly to requirements
    const [formData, setFormData] = useState({
        restaurant_name: '', restaurant_type: 'Restaurant', cuisine_type: '', description: '', opening_time: '', closing_time: '', prep_time: '',
        address: '', city: '', state: '', pincode: '', service_radius: '',
        owner_name: '', owner_phone: '', owner_email: '', owner_address: '',
        fssai_number: '', fssai_type: 'Basic', fssai_expiry: '', fssai_doc_url: '',
        trade_license_number: '', trade_authority: '', trade_license_expiry: '', trade_doc_url: '',
        restaurant_logo: '', restaurant_cover: '', kitchen_photo: '',
        food_category: 'Veg', allergen_info: '', cooking_oil_type: '',
        agreement_checked: false
    });

    const [foodData, setFoodData] = useState({ name: '', description: '', price: '', weight: '' });
    const [foodItems, setFoodItems] = useState([]);

    useEffect(() => {
        document.body.style.background = 'linear-gradient(135deg, #ff922b 0%, #f76b1c 100%)';
        document.body.style.backgroundAttachment = 'fixed';
        fetchMyRestaurant();
        return () => {
            document.body.style.background = '';
            document.body.style.backgroundAttachment = '';
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getAuthToken = async () => {
        const bypassedUser = localStorage.getItem('nutrikart_bypassed_user');
        if (bypassedUser) return JSON.parse(bypassedUser).token;
        const { data } = await supabase.auth.getSession();
        return data.session?.access_token || '';
    };

    const fetchMyRestaurant = async () => {
        try {
            const token = await getAuthToken();
            const res = await fetch(`${VITE_API_BASE_URL}/vendor/restaurants/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data) {
                setRestaurant(data);
                if (data.status === 'approved') fetchFoodItems(data.id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchFoodItems = async (restaurantId) => {
        try {
            const { data, error } = await supabase.from('food_items').select('*').eq('restaurant_id', restaurantId);
            if (!error && data) setFoodItems(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleNext = (e) => {
        e.preventDefault();
        setStep(prev => prev + 1);
    }
    const handlePrev = () => setStep(prev => prev - 1);

    const handleRestaurantSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await getAuthToken();

            // Only send fields that exist in the Supabase restaurants table
            // This prevents PGRST204 "column not found" errors from unrecognised keys
            const {
                restaurant_name,
                cuisine_type,
                address,
                city,
                state,
                pincode,
                fssai_number,
                opening_time,
                closing_time,
                owner_name,
                owner_phone,
                owner_email,
                fssai_doc_url,
                trade_doc_url,
                restaurant_cover
            } = formData;

            const safePayload = {
                restaurant_name,
                cuisine_type,
                address,
                city,
                state,
                pincode,
                fssai_number,
                opening_time,
                closing_time,
                owner_name,
                owner_phone,
                owner_email,
                fssai_doc_url,
                trade_doc_url,
                restaurant_cover
            };

            const res = await fetch(`${VITE_API_BASE_URL}/vendor/restaurants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(safePayload)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to submit');

            alert('Your restaurant application has been submitted for review. The admin will verify your details.');
            await fetchMyRestaurant();
            setView('dashboard'); // Redirect to dashboard tracking section
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddFood = async (e) => {
        e.preventDefault();
        try {
            const token = await getAuthToken();
            const res = await fetch(`${VITE_API_BASE_URL}/food/vendor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    name: foodData.name, description: foodData.description,
                    price: parseFloat(foodData.price), weight: parseFloat(foodData.weight)
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add food');

            alert('Food added successfully! Nutrition generated via Spoonacular.');
            setFoodData({ name: '', description: '', price: '', weight: '' });
            fetchFoodItems(restaurant.id);
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div style={{ padding: '20px', minHeight: 'calc(100vh - 80px)', color: 'white' }}>Loading Vendor Dashboard...</div>;

    const { restaurant_name, restaurant_type, cuisine_type, description, opening_time, closing_time, prep_time, address, city, state, pincode, service_radius, owner_name, owner_phone, owner_email, owner_address, fssai_number, fssai_type, fssai_expiry, fssai_doc_url, trade_license_number, trade_authority, trade_license_expiry, trade_doc_url, aadhaar_number, aadhaar_front_url, aadhaar_back_url, restaurant_logo, restaurant_cover, kitchen_photo, food_category, allergen_info, cooking_oil_type, agreement_checked } = formData;

    if (view === 'options' || view === 'dashboard') {
        return (
            <div style={{ minHeight: 'calc(100vh - 80px)', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h1 style={{ color: 'white', marginBottom: '40px', fontSize: '2.5rem', fontWeight: 'bold' }}>Vendor Dashboard</h1>

                {!restaurant ? (
                    <div
                        style={{ padding: '40px', backgroundColor: 'white', borderRadius: '12px', cursor: 'pointer', width: '300px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', marginTop: '10vh' }}
                        onClick={() => setView('add_restaurant')}
                    >
                        <div style={{ fontSize: '4rem', color: 'orange', lineHeight: '1', fontWeight: 'bold', marginBottom: '10px' }}>+</div>
                        <h2 style={{ color: 'orange', margin: 0, fontSize: '1.5rem', textAlign: 'center' }}>Add Restaurant</h2>
                    </div>
                ) : (
                    <div style={{ width: '100%', maxWidth: '800px', backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ color: '#333', marginTop: 0, marginBottom: '20px' }}>Restaurant Application Status</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '30px' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '10px 0', color: '#666' }}>Restaurant Name</th>
                                    <th style={{ padding: '10px 0', color: '#666' }}>Submitted On</th>
                                    <th style={{ padding: '10px 0', color: '#666' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '15px 0', color: '#333', fontWeight: 'bold' }}>{restaurant.name}</td>
                                    <td style={{ padding: '15px 0', color: '#333' }}>{new Date(restaurant.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                                    <td style={{ padding: '15px 0' }}>
                                        <span style={{
                                            padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                                            backgroundColor: restaurant.status === 'pending' ? '#fff3cd' : (restaurant.status === 'approved' ? '#d4edda' : '#f8d7da'),
                                            color: restaurant.status === 'pending' ? '#856404' : (restaurant.status === 'approved' ? '#155724' : '#721c24')
                                        }}>
                                            {restaurant.status === 'pending' ? 'Pending Review' : (restaurant.status === 'approved' ? 'Approved' : 'Rejected')}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <div style={{ padding: '20px', borderRadius: '8px', backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
                            {restaurant.status === 'pending' && (
                                <>
                                    <p style={{ margin: '0 0 15px 0', color: '#555', fontSize: '1.1rem' }}>Your restaurant application is under admin review.</p>
                                    <button disabled style={{ padding: '10px 20px', backgroundColor: '#ccc', color: '#666', border: 'none', borderRadius: '5px', cursor: 'not-allowed', fontWeight: 'bold' }}>Add Food Item</button>
                                </>
                            )}
                            {restaurant.status === 'approved' && (
                                <>
                                    <p style={{ margin: '0 0 15px 0', color: '#155724', fontSize: '1.1rem' }}>Your restaurant has been approved. You can now add menu items.</p>
                                    <button
                                        onClick={() => setView('menu_management')}
                                        style={{ padding: '10px 20px', backgroundColor: 'orange', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Add Menu Item
                                    </button>
                                </>
                            )}
                            {restaurant.status === 'rejected' && (
                                <>
                                    <p style={{ margin: '0 0 15px 0', color: '#721c24', fontSize: '1.1rem' }}>Your application was rejected. Please update the required details and resubmit.</p>
                                    <button
                                        onClick={() => {
                                            setView('add_restaurant');
                                            setStep(1); // Usually they would edit in a similar form
                                        }}
                                        style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        Edit Application
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ minHeight: 'calc(100vh - 80px)', padding: '20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button
                    onClick={() => setView('options')}
                    style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer', backgroundColor: 'white', color: 'orange', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}
                >
                    &larr; Back
                </button>

                {view === 'add_restaurant' && (
                    <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', color: '#333' }}>
                        {(!restaurant || restaurant.status === 'rejected') && (
                            <div>
                                <h3 style={{ color: 'orange', marginTop: 0 }}>Register Your Restaurant (Step {step} of 8)</h3>
                                <div style={{ background: '#eee', height: '8px', borderRadius: '4px', margin: '15px 0' }}>
                                    <div style={{ background: 'orange', height: '100%', width: `${(step / 8) * 100}%`, borderRadius: '4px', transition: '0.3s' }} />
                                </div>

                                <form onSubmit={step === 8 ? handleRestaurantSubmit : handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                                    {step === 1 && (
                                        <>
                                            <h4>Section 1 — Basic Restaurant Details</h4>
                                            <div><label className="form-label">Restaurant Name (3-100 chars)</label><input className="form-input" minLength="3" maxLength="100" value={restaurant_name} onChange={e => setFormData({ ...formData, restaurant_name: e.target.value })} required /></div>
                                            <div><label className="form-label">Restaurant Type</label>
                                                <select className="form-input" value={restaurant_type} onChange={e => setFormData({ ...formData, restaurant_type: e.target.value })} required>
                                                    <option>Restaurant</option><option>Cloud Kitchen</option><option>Home Chef</option>
                                                </select>
                                            </div>
                                            <div><label className="form-label">Cuisine Type (Multi-select via text)</label><input className="form-input" placeholder="e.g. Indian, Chinese" value={cuisine_type} onChange={e => setFormData({ ...formData, cuisine_type: e.target.value })} required /></div>
                                            <div><label className="form-label">Description (Max 500 chars)</label><textarea className="form-input" maxLength="500" value={description} onChange={e => setFormData({ ...formData, description: e.target.value })} required /></div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <div style={{ flex: 1 }}><label className="form-label">Opening Time</label><input type="time" className="form-input" value={opening_time} onChange={e => setFormData({ ...formData, opening_time: e.target.value })} required /></div>
                                                <div style={{ flex: 1 }}><label className="form-label">Closing Time</label><input type="time" className="form-input" value={closing_time} onChange={e => setFormData({ ...formData, closing_time: e.target.value })} required /></div>
                                            </div>
                                            <div><label className="form-label">Average Prep Time (minutes)</label><input type="number" min="5" max="120" className="form-input" value={prep_time} onChange={e => setFormData({ ...formData, prep_time: e.target.value })} required /></div>
                                        </>
                                    )}

                                    {step === 2 && (
                                        <>
                                            <h4>Section 2 — Restaurant Address</h4>
                                            <div><label className="form-label">Address Line</label><input className="form-input" value={address} onChange={e => setFormData({ ...formData, address: e.target.value })} required /></div>
                                            <div><label className="form-label">City</label><input className="form-input" value={city} onChange={e => setFormData({ ...formData, city: e.target.value })} required /></div>
                                            <div><label className="form-label">State</label><input className="form-input" value={state} onChange={e => setFormData({ ...formData, state: e.target.value })} required /></div>
                                            <div><label className="form-label">Pincode (6 digits)</label><input className="form-input" pattern="\d{6}" title="Must be exactly 6 digits" value={pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value })} required /></div>
                                            <div><label className="form-label">Service Radius (1-20 km)</label><input type="number" min="1" max="20" className="form-input" value={service_radius} onChange={e => setFormData({ ...formData, service_radius: e.target.value })} required /></div>
                                        </>
                                    )}

                                    {step === 3 && (
                                        <>
                                            <h4>Section 3 — Vendor Details</h4>
                                            <div><label className="form-label">Vendor Full Name</label><input className="form-input" value={owner_name} onChange={e => setFormData({ ...formData, owner_name: e.target.value })} required /></div>
                                            <div><label className="form-label">Mobile Number (10 digits)</label><input className="form-input" pattern="\d{10}" title="Must be exactly 10 digits" value={owner_phone} onChange={e => setFormData({ ...formData, owner_phone: e.target.value })} required /></div>
                                            <div><label className="form-label">Email</label><input type="email" className="form-input" value={owner_email} onChange={e => setFormData({ ...formData, owner_email: e.target.value })} required /></div>
                                            <div><label className="form-label">Vendor Address</label><input className="form-input" value={owner_address} onChange={e => setFormData({ ...formData, owner_address: e.target.value })} required /></div>
                                        </>
                                    )}

                                    {step === 4 && (
                                        <>
                                            <h4>Section 4 — Government Food License (FSSAI)</h4>
                                            <div><label className="form-label">FSSAI License Number (14 digits)</label><input className="form-input" pattern="\d{14}" title="Must be exactly 14 digits" value={fssai_number} onChange={e => setFormData({ ...formData, fssai_number: e.target.value })} required /></div>
                                            <div><label className="form-label">License Type</label>
                                                <select className="form-input" value={fssai_type} onChange={e => setFormData({ ...formData, fssai_type: e.target.value })} required>
                                                    <option>Basic</option><option>State</option><option>Central</option>
                                                </select>
                                            </div>
                                            <div><label className="form-label">Expiry Date</label><input type="date" className="form-input" value={fssai_expiry} onChange={e => setFormData({ ...formData, fssai_expiry: e.target.value })} required /></div>
                                            <div><label className="form-label">FSSAI Certificate URL</label><input type="url" placeholder="https://..." className="form-input" value={fssai_doc_url} onChange={e => setFormData({ ...formData, fssai_doc_url: e.target.value })} required /></div>
                                        </>
                                    )}

                                    {step === 5 && (
                                        <>
                                            <h4>Section 5 — Trade License</h4>
                                            <div><label className="form-label">Trade License Number (8-20 chars)</label><input className="form-input" minLength="8" maxLength="20" value={trade_license_number} onChange={e => setFormData({ ...formData, trade_license_number: e.target.value })} required /></div>
                                            <div><label className="form-label">Issuing Authority</label><input className="form-input" value={trade_authority} onChange={e => setFormData({ ...formData, trade_authority: e.target.value })} required /></div>
                                            <div><label className="form-label">Expiry Date</label><input type="date" className="form-input" value={trade_license_expiry} onChange={e => setFormData({ ...formData, trade_license_expiry: e.target.value })} required /></div>
                                            <div><label className="form-label">Trade License Cert URL</label><input type="url" placeholder="https://..." className="form-input" value={trade_doc_url} onChange={e => setFormData({ ...formData, trade_doc_url: e.target.value })} required /></div>
                                        </>
                                    )}

                                    {step === 6 && (
                                        <>
                                            <h4>Section 6 — Restaurant Media</h4>
                                            <div><label className="form-label">Restaurant Logo URL</label><input type="url" placeholder="https://..." className="form-input" value={restaurant_logo} onChange={e => setFormData({ ...formData, restaurant_logo: e.target.value })} required /></div>
                                            <div><label className="form-label">Restaurant Cover URL</label><input type="url" placeholder="https://..." className="form-input" value={restaurant_cover} onChange={e => setFormData({ ...formData, restaurant_cover: e.target.value })} required /></div>
                                            <div><label className="form-label">Kitchen Photo URL (Optional)</label><input type="url" placeholder="https://..." className="form-input" value={kitchen_photo} onChange={e => setFormData({ ...formData, kitchen_photo: e.target.value })} /></div>
                                        </>
                                    )}

                                    {step === 7 && (
                                        <>
                                            <h4>Section 7 — Food Information</h4>
                                            <div><label className="form-label">Food Category</label>
                                                <select className="form-input" value={food_category} onChange={e => setFormData({ ...formData, food_category: e.target.value })} required>
                                                    <option>Veg</option><option>Non-Veg</option><option>Both</option>
                                                </select>
                                            </div>
                                            <div><label className="form-label">Allergen Information (Optional)</label><input className="form-input" value={allergen_info} onChange={e => setFormData({ ...formData, allergen_info: e.target.value })} /></div>
                                            <div><label className="form-label">Cooking Oil Type (Optional)</label><input className="form-input" value={cooking_oil_type} onChange={e => setFormData({ ...formData, cooking_oil_type: e.target.value })} /></div>
                                        </>
                                    )}

                                    {step === 8 && (
                                        <>
                                            <h4>Section 8 — Agreement</h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '15px', background: '#fff5e6', borderRadius: '8px', border: '1px solid orange' }}>
                                                <input type="checkbox" id="agreement" checked={agreement_checked} onChange={e => setFormData({ ...formData, agreement_checked: e.target.checked })} required style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                                                <label htmlFor="agreement" style={{ cursor: 'pointer', margin: 0, color: '#333' }}>
                                                    I confirm that the information provided is accurate and I agree to the NutriKart vendor policies.
                                                </label>
                                            </div>
                                        </>
                                    )}


                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '20px' }}>
                                        {step > 1 ? (
                                            <button type="button" onClick={handlePrev} className="btn" style={{ background: '#eee', color: '#333' }}>Previous</button>
                                        ) : <div></div>}

                                        {step < 8 ? (
                                            <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'orange', color: 'white' }}>Next</button>
                                        ) : (
                                            <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'orange', color: 'white' }} disabled={!agreement_checked}>Submit Application</button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        )}

                        {view === 'menu_management' && restaurant?.status === 'approved' && (
                            <>
                                <div style={{ padding: '20px', borderLeft: '4px solid orange', marginBottom: '20px', backgroundColor: '#fff5e6' }}>
                                    <h2 style={{ margin: 0, color: 'orange' }}>{restaurant.name} (Approved)</h2>
                                    <p className="text-muted" style={{ margin: 0 }}>You can now access the Menu Management and add food items!</p>
                                </div>
                                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px', marginBottom: '20px' }}>
                                    <h3 style={{ color: '#333', marginTop: 0 }}>Add New Menu Item</h3>
                                    <form onSubmit={handleAddFood} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                                        <div style={{ flex: 1, minWidth: '150px' }}>
                                            <label className="form-label" style={{ color: '#555' }}>Name</label>
                                            <input className="form-input" style={{ backgroundColor: '#fff', border: '1px solid #ddd', color: '#000' }} value={foodData.name} onChange={e => setFoodData({ ...foodData, name: e.target.value })} required />
                                        </div>
                                        <div style={{ flex: 1, minWidth: '150px' }}>
                                            <label className="form-label" style={{ color: '#555' }}>Price (₹)</label>
                                            <input className="form-input" style={{ backgroundColor: '#fff', border: '1px solid #ddd', color: '#000' }} type="number" step="0.01" value={foodData.price} onChange={e => setFoodData({ ...foodData, price: e.target.value })} required />
                                        </div>
                                        <div style={{ flex: 1, minWidth: '150px' }}>
                                            <label className="form-label" style={{ color: '#555' }}>Weight (g)</label>
                                            <input className="form-input" style={{ backgroundColor: '#fff', border: '1px solid #ddd', color: '#000' }} type="number" value={foodData.weight} onChange={e => setFoodData({ ...foodData, weight: e.target.value })} required placeholder="For Nutrition Calc" />
                                        </div>
                                        <button type="submit" className="btn btn-primary" style={{ padding: '10px 20px', height: '42px', minWidth: '120px', backgroundColor: 'orange', border: 'none' }}>Add Food</button>
                                    </form>
                                </div>
                                <div style={{ padding: '20px', border: '1px solid #eee', borderRadius: '8px' }}>
                                    <h3 style={{ color: '#333', marginTop: 0 }}>Live Menu Items</h3>
                                    {foodItems.length === 0 ? <p className="text-muted">No items added yet.</p> : (
                                        <div style={{ display: 'grid', gap: '15px' }}>
                                            {foodItems.map(item => (
                                                <div key={item.id} style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px', border: '1px solid #eee' }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <h4 style={{ margin: 0, color: '#333' }}>{item.name}</h4>
                                                        <span style={{ color: 'orange', fontWeight: 'bold' }}>₹{item.price}</span>
                                                    </div>
                                                    <p style={{ fontSize: '0.85rem', color: '#666', margin: '5px 0' }}>Weight: {item.weight}g</p>
                                                    <p style={{ fontSize: '0.8rem', color: '#888', margin: 0 }}>
                                                        Nutrients: {item.nutrients && item.nutrients.length ? item.nutrients.map(n => `${n.name} (${n.amount}${n.unit})`).join(', ') : 'Not available'}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
