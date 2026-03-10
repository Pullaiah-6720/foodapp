import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, ShoppingCart, Star, Plus, Minus, ChevronRight, Menu, ChefHat, Activity, Flame, TrendingUp, Target, Edit, Sparkles, Filter, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Draggable from 'react-draggable';

export default function CustomerDashboard() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    // State
    const [restaurants, setRestaurants] = useState([]);
    const [selectedRestaurant, setSelectedRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('rating');
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isDraggingCart, setIsDraggingCart] = useState(false);

    // Filter States
    const [filters, setFilters] = useState({
        minProtein: '',
        maxCalories: '',
        isVegetarian: false,
        isVegan: false,
        lowFat: false,
        lowCarb: false
    });

    // UI Scroll States
    const [showRestaurants, setShowRestaurants] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [menuLoading, setMenuLoading] = useState(false);
    const [orderPlacing, setOrderPlacing] = useState(false);
    const [hasOrdered, setHasOrdered] = useState(() => localStorage.getItem('nutrikart_has_ordered') === 'true');

    // MOCK DATA for layout testing
    const popularDishes = [
        { id: 'p1', name: 'Idly', restaurantName: 'Tiffin Wala', image_url: 'https://images.unsplash.com/photo-1589301760014-d929f39ce9b1?w=500&q=80', nutrients: { calories: 180, protein: 8 }, price: 69, tags: ['Vegetarian'] },
        { id: 'p2', name: 'Plain Dosa', restaurantName: 'Tiffin Wala', image_url: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=500&q=80', nutrients: { calories: 220, protein: 6 }, price: 89, tags: ['Vegetarian'] },
        { id: 'p3', name: 'Masala Dosa', restaurantName: 'Tiffin Wala', image_url: 'https://images.unsplash.com/photo-1630383244670-b98a4e8d89a2?w=500&q=80', nutrients: { calories: 320, protein: 8 }, price: 119, tags: ['Vegetarian'] },
        { id: 'p4', name: 'Chicken 65', restaurantName: 'Biryani House', image_url: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&q=80', nutrients: { calories: 420, protein: 32 }, price: 279, tags: ['Non-Veg'] },
        { id: 'p5', name: 'Green Detox Juice', restaurantName: 'Green Leaf Restaurant', image_url: 'https://images.unsplash.com/photo-1615486171448-4df2b0dbec7a?w=500&q=80', nutrients: { calories: 120, protein: 4 }, price: 179, tags: ['Vegan'] },
        { id: 'p6', name: 'Fish Fry', restaurantName: 'Biryani House', image_url: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=500&q=80', nutrients: { calories: 320, protein: 42 }, price: 399, tags: ['Non-Veg'] },
        { id: 'p7', name: 'Pathar ka Gosht', restaurantName: 'Biryani House', image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&q=80', nutrients: { calories: 540, protein: 48 }, price: 479, tags: ['Non-Veg'] },
        { id: 'p8', name: 'Tandoori Roti', restaurantName: 'Punjabi Dhaba', image_url: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=500&q=80', nutrients: { calories: 110, protein: 3 }, price: 49, tags: ['Vegetarian'] },
    ];

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 250) {
                setShowRestaurants(true);
            }
        };
        window.addEventListener('scroll', handleScroll);
        // Quick check in case page starts scrolled
        if (window.scrollY > 250) setShowRestaurants(true);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Fetch approved restaurants
    useEffect(() => {
        const fetchRestaurants = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('nutrikart_token') || localStorage.getItem('nutrikart_bypassed_user');
                const resData = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (resData.ok) {
                    const data = await resData.json();
                    setRestaurants(data.restaurants || data || []);
                } else {
                    setRestaurants([
                        { id: "mock-1", name: "Biryani House", cuisine_type: "Indian • Hyderabadi • Mughlai", restaurant_img_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80", rating: "4.9", review_count: 456, tags: ["Non-Veg"] },
                        { id: "mock-2", name: "Green Leaf Restaurant", cuisine_type: "Indian", restaurant_img_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80", rating: "4.9", review_count: 287, tags: ["Vegan"] },
                        { id: "mock-3", name: "Tulsi Pure Veg Restaurant", cuisine_type: "Indian • South Indian • North Indian", restaurant_img_url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80", rating: "4.8", review_count: 389, tags: ["Vegetarian"] }
                    ]);
                }
            } catch (err) {
                console.error("Error fetching restaurants", err);
                setRestaurants([
                    { id: "mock-1", name: "Biryani House", cuisine_type: "Indian • Hyderabadi • Mughlai", restaurant_img_url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&q=80", rating: "4.9", review_count: 456, tags: ["Non-Veg"] },
                    { id: "mock-2", name: "Green Leaf Restaurant", cuisine_type: "Indian", restaurant_img_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&q=80", rating: "4.9", review_count: 287, tags: ["Vegan"] },
                    { id: "mock-3", name: "Tulsi Pure Veg Restaurant", cuisine_type: "Indian • South Indian • North Indian", restaurant_img_url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=500&q=80", rating: "4.8", review_count: 389, tags: ["Vegetarian"] }
                ]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    const fetchMenu = async (restaurantId, shouldClearCart = false) => {
        setMenuLoading(true);
        if (shouldClearCart) setCart([]);
        try {
            const token = localStorage.getItem('nutrikart_token') || localStorage.getItem('nutrikart_bypassed_user');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/food/menu/${restaurantId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setMenuItems(data.data || []);
            } else {
                setMenuItems([
                    { id: 'f-1', name: 'Grilled Paneer Bowl', description: 'High protein grilled paneer with quinoa.', price: 299, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', nutrients: { calories: 350, protein: 30, carbs: 15, fat: 10, fiber: 5 }, tags: ['High Protein', 'Vegetarian'] }
                ]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setMenuLoading(false);
        }
    };

    const handleRestaurantSelect = (restaurant) => {
        setSelectedRestaurant(restaurant);
        fetchMenu(restaurant.id, false);
        setIsCartOpen(false);
    };

    useEffect(() => {
        if (user && selectedRestaurant && menuItems.length > 0) {
            const pendingItemStr = localStorage.getItem('nutrikart_pending_cart_item');
            if (pendingItemStr) {
                try {
                    const pendingItem = JSON.parse(pendingItemStr);
                    if (pendingItem.restaurantId === selectedRestaurant.id) {
                        const actualItem = menuItems.find(i => i.id === pendingItem.id);
                        if (actualItem) {
                            addToCart(actualItem);
                        }
                    }
                    localStorage.removeItem('nutrikart_pending_cart_item');
                } catch (e) {
                    console.error('Error parsing pending cart item:', e);
                    localStorage.removeItem('nutrikart_pending_cart_item');
                }
            }
        }
    }, [user, selectedRestaurant, menuItems]);

    const addToCart = (item) => {
        if (!user) {
            localStorage.setItem('nutrikart_pending_cart_item', JSON.stringify({ ...item, restaurantId: selectedRestaurant?.id || item.restaurantId, restaurantName: selectedRestaurant?.name || item.restaurantName }));
            toast.error('Please login to add items to your cart.');
            navigate('/login');
            return;
        }

        toast.success(`${item.name} added to cart!`);
        setCart(prev => {
            const rId = selectedRestaurant ? selectedRestaurant.id : item.restaurantId;
            const rName = selectedRestaurant ? selectedRestaurant.name : item.restaurantName;
            const existing = prev.find(i => i.id === item.id && i.restaurantId === rId);
            if (existing) {
                return prev.map(i => (i.id === item.id && i.restaurantId === rId) ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1, restaurantId: rId, restaurantName: rName }];
        });
    };

    const updateQty = (id, delta, restaurantId) => {
        setCart(prev => {
            const updated = prev.map(item => {
                if (item.id === id && item.restaurantId === restaurantId) {
                    return { ...item, qty: item.qty + delta };
                }
                return item;
            }).filter(i => i.qty > 0);
            return updated;
        });
    };

    const cartTotals = cart.reduce((acc, item) => {
        const qty = item.qty;
        acc.calories += (item.nutrients?.calories || 0) * qty;
        acc.protein += (item.nutrients?.protein || 0) * qty;
        acc.carbs += (item.nutrients?.carbs || 0) * qty;
        acc.fat += (item.nutrients?.fat || 0) * qty;
        acc.price += Number(item.price) * qty;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, price: 0 });

    const handlePlaceOrder = async () => {
        if (!user) { navigate('/login'); return; }
        if (cart.length === 0) return;
        setOrderPlacing(true);
        try {
            const token = localStorage.getItem('nutrikart_token') || localStorage.getItem('nutrikart_bypassed_user');
            const cartByRestaurant = cart.reduce((acc, item) => {
                const rid = item.restaurantId || 'rid123';
                if (!acc[rid]) acc[rid] = { items: [], total: 0 };
                acc[rid].items.push({ food_item_id: item.id, quantity: item.qty, price: item.price });
                acc[rid].total += item.price * item.qty;
                return acc;
            }, {});

            const orderPromises = Object.keys(cartByRestaurant).map(async (rid) => {
                const orderData = { restaurant_id: rid, total_amount: cartByRestaurant[rid].total, payment_type: 'COD', items: cartByRestaurant[rid].items };
                return fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/place`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(orderData)
                });
            });

            await Promise.all(orderPromises);
            toast.success('Orders placed successfully! (COD)');
            localStorage.setItem('nutrikart_has_ordered', 'true');
            setHasOrdered(true);
            setCart([]);
            setIsCartOpen(false);
            setSelectedRestaurant(null);
        } catch (err) {
            toast.error('Failed to place order.');
        } finally {
            setOrderPlacing(false);
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20 md:pb-0">
            <Toaster position="top-center" />

            {/* 1. TOP NAVBAR */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 flex items-center justify-between" style={{ height: '70px', padding: '0 20px' }}>
                <div className="flex items-center gap-6">
                    <div className="cursor-pointer" onClick={() => setSelectedRestaurant(null)}>
                        <div className="w-10 h-10 bg-[#0f1f1a] rounded flex items-center justify-center relative shadow-sm">
                            <div className="text-orange-400 border-[1.5px] border-orange-400 w-5 h-5 flex items-center justify-center flex-col relative mt-1" style={{ borderTopWidth: 0, borderBottomLeftRadius: '2px', borderBottomRightRadius: '2px' }}>
                                <div className="absolute -top-1 w-6 h-[1.5px] bg-orange-400"></div>
                                <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2 h-2 border-[1.5px] border-b-0 border-orange-400 rounded-t-[2px]"></div>
                            </div>
                            <span className="absolute top-1 left-1.5 text-green-500 text-[12px] leading-none">&#127807;</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-64 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search restaurants or food items" className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-gray-400" />
                    </div>

                    <div className="flex items-center gap-2 cursor-pointer group relative" onClick={() => { if (cart.length > 0) setIsCartOpen(true); else toast('Your cart is empty', { icon: '🛒' }); }}>
                        <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-orange-500 transition-colors" />
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#ea5f07] text-[10.5px] font-black text-white shadow ring-2 ring-white">
                                {cart.reduce((total, item) => total + item.qty, 0)}
                            </span>
                        )}
                    </div>

                    {user ? (
                        <div className="flex items-center gap-2 cursor-pointer ml-3 relative group">
                            <Menu className="w-6 h-6 text-gray-700 hover:text-gray-900" />
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <div className="p-3 border-b border-gray-100"><span className="block font-medium text-sm text-gray-900">{user?.full_name || 'Profile'}</span></div>
                                <div className="p-2"><button onClick={signOut} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium">Log out</button></div>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="ml-3 px-5 py-2.5 bg-[#ea5f07] text-white text-sm font-bold rounded-lg hover:bg-[#d65e20] transition-colors shadow-[0_4px_14px_0_rgba(234,95,7,0.39)]">
                            Login / Signup
                        </button>
                    )}
                </div>
            </header>

            {/* FULL WIDTH HERO SECTION */}
            {!selectedRestaurant && (
                <div className="relative w-full h-[380px] md:h-[450px] flex flex-col items-center justify-center text-center px-4 overflow-hidden shadow-inner">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#ff922b] to-[#ea5f07] z-0"></div>
                    <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1543362906-acfc16c67564?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'overlay' }}></div>

                    <div className="relative z-10 w-full max-w-3xl flex flex-col items-center pt-6">
                        <h1 className="text-[2.5rem] md:text-5xl font-bold text-white mb-6 flex items-center justify-center gap-2 tracking-wide" style={{ fontFamily: 'serif' }}>
                            <span className="text-xl md:text-2xl text-[#fde047] rotate-[-15deg] font-sans">✧</span>
                            NutriKart
                            <span className="text-xl md:text-2xl text-[#fde047] rotate-[15deg] font-sans">✧</span>
                        </h1>
                        <p className="text-white text-[1.1rem] md:text-lg font-semibold mb-10 max-w-[28rem] px-4 leading-relaxed" style={{ fontFamily: 'serif' }}>
                            Healthy meals delivered to your door. Track nutrition, plan meals, and eat better.
                        </p>

                        <div className="w-[95%] max-w-[34rem] bg-white rounded-[6px] px-4 py-3 md:py-[18px] flex items-center shadow-md mb-8">
                            <Search className="w-[18px] h-[18px] text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search for dishes or restaurants..."
                                className="w-full pl-3 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-sm md:text-[15px] font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-[95%] max-w-[34rem]">
                            <button className="flex-1 bg-white text-[#d65e20] font-bold text-[13px] md:text-sm py-[14px] px-6 rounded-[6px] shadow-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors uppercase tracking-wide">
                                <span className="opacity-90">🍽️</span> Browse Restaurants
                            </button>
                            <button
                                onClick={() => navigate('/customer/meal-planner')}
                                className="flex-1 bg-transparent border border-white/80 text-white font-bold text-[13px] md:text-sm py-[14px] px-6 rounded-[6px] hover:bg-white/10 transition-colors flex items-center justify-center gap-3 uppercase tracking-wide">
                                <span className="opacity-90">📅</span> Plan Your Meals
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 bg-[#faf9f6]">

                {!selectedRestaurant ? (
                    <>
                        {/* 0️⃣ Order our best food options (Circular Icons) */}
                        <div className="mb-14">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-[1.75rem] md:text-3xl font-bold text-[#111827]" style={{ fontFamily: 'serif' }}>Order our best food options</h2>
                                <div className="flex gap-3">
                                    <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300 transition-colors shadow-sm">
                                        <ChevronRight className="w-5 h-5 rotate-180" strokeWidth={1.5} />
                                    </button>
                                    <button className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-600 hover:border-gray-300 transition-colors shadow-sm">
                                        <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                                    </button>
                                </div>
                            </div>

                            <div className="flex overflow-x-auto pb-6 gap-6 md:gap-8 hide-scrollbar scroll-smooth px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                                {[
                                    { name: 'Biryani', img: 'https://i.postimg.cc/dsC6QWFj/image.png' },
                                    { name: 'Pizza', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop' },
                                    { name: 'Cake', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop' },
                                    { name: 'Ice Cream', img: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&h=200&fit=crop' },
                                    { name: 'Dosa', img: 'https://i.postimg.cc/w9s7GnQb/image.png' },
                                    { name: 'Pav Bhaji', img: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=200&h=200&fit=crop' },
                                    { name: 'Idli', img: 'https://i.postimg.cc/ZZTv57Jh/image.png' },
                                    { name: 'Burger', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop' },
                                    { name: 'Noodles', img: 'https://i.postimg.cc/dws2gQ7c/image.png' },
                                    { name: 'Thums Up', img: 'https://i.postimg.cc/nFKmwNpc/image.png' },
                                    { name: 'Shawarma', img: 'https://images.unsplash.com/photo-1644951666879-11c210d7e4ba?w=200&h=200' },
                                    { name: 'Chinese', img: 'https://images.unsplash.com/photo-1541658016709-8253a645c71a?w=200&h=200' },
                                    { name: 'Pastry', img: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&h=200' },
                                    { name: 'Kebab', img: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=200&h=200' },
                                    { name: 'North Indian', img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&h=200' },
                                    { name: 'Pasta', img: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200' }
                                ].map((cat, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-4 shrink-0 cursor-pointer group w-[80px] md:w-[110px]">
                                        <div className="w-[80px] h-[80px] md:w-[110px] md:h-[110px] rounded-full overflow-hidden shadow-sm group-hover:shadow-md transition-all border border-gray-100 relative bg-white">
                                            <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 p-0.5 rounded-full" />
                                        </div>
                                        <span className="font-bold text-gray-700 text-[12px] md:text-[14px] group-hover:text-[#ea5f07] transition-colors tracking-wide text-center" style={{ fontFamily: 'serif' }}>{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                            {/* Hide scrollbar styles embedded via tailwind extension or custom css in index.html, handled with inline styles here for ease */}
                            <style>{`
                                .hide-scrollbar::-webkit-scrollbar {
                                    display: none;
                                }
                            `}</style>
                        </div>

                        {/* 1️⃣ Browse by Category */}
                        <div className="mb-14">
                            <div className="flex items-center gap-3 mb-6">
                                <ChefHat className="w-7 h-7 text-[#ea5f07]" strokeWidth={2.5} />
                                <h2 className="text-[1.65rem] font-bold text-[#111827]">Browse by Category</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
                                {[
                                    { name: 'Breakfast', icon: '☀️', color: 'from-amber-200 to-orange-400' },
                                    { name: 'Lunch', icon: '🍱', color: 'from-emerald-200 to-green-500' },
                                    { name: 'Dinner', icon: '🌙', color: 'from-blue-300 to-indigo-500' },
                                    { name: 'Snacks', icon: '🍿', color: 'from-pink-300 to-rose-400' },
                                    { name: 'Desserts', icon: '🍰', color: 'from-purple-300 to-fuchsia-400' },
                                    { name: 'Beverages', icon: '🥤', color: 'from-cyan-200 to-blue-400' }
                                ].map((cat, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl bg-gradient-to-br ${cat.color} shadow-md text-white`}>{cat.icon}</div>
                                        <span className="font-bold text-gray-700 text-[14px]">{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 2️⃣ Popular Dishes */}
                        <div className="mb-14 min-h-[50vh]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                                <div className="flex items-center gap-2">
                                    <Flame className="w-7 h-7 text-[#ea5f07]" strokeWidth={2.5} />
                                    <h2 className="text-[1.65rem] font-bold text-[#111827]">Popular Dishes</h2>
                                </div>
                            </div>

                            {/* Filter Bar */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-semibold shrink-0">
                                    <Filter className="w-4 h-4" /> Filter Dishes
                                </div>
                                <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Sort by Price</label>
                                        <select className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors cursor-pointer">
                                            <option>Default (Most Popular)</option>
                                            <option>Price: Low to High</option>
                                            <option>Price: High to Low</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Nutrition Filter</label>
                                        <select className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-400 transition-colors cursor-pointer">
                                            <option>All Items</option>
                                            <option>High Protein</option>
                                            <option>Low Calorie</option>
                                            <option>Vegan Only</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Dishes Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {popularDishes.map((dish) => (
                                    <div key={dish.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                                        <div className="relative h-48 w-full shrink-0 overflow-hidden">
                                            <img src={dish.image_url} alt={dish.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className={`absolute top-3 right-3 px-2 py-1 rounded text-xs font-bold text-white shadow-md flex items-center gap-1.5 ${dish.tags.includes('Vegetarian') || dish.tags.includes('Vegan') ? 'bg-green-600' : 'bg-red-500'}`}>
                                                <div className="flex items-center justify-center w-3 h-3 bg-white rounded-sm border border-current">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${dish.tags.includes('Vegetarian') || dish.tags.includes('Vegan') ? 'bg-green-600' : 'bg-red-500'}`}></span>
                                                </div>
                                                {dish.tags.includes('Vegetarian') || dish.tags.includes('Vegan') ? 'Veg' : 'Non-Veg'}
                                            </div>
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col">
                                            <h3 className="text-[17px] font-bold text-gray-900 mb-0.5">{dish.name}</h3>
                                            <p className="text-gray-500 text-xs font-medium mb-3">{dish.restaurantName}</p>

                                            <div className="flex gap-4 mb-4 mt-auto">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase text-gray-400 font-bold">Cal</span>
                                                    <span className="text-sm font-black text-orange-500">{dish.nutrients.calories}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase text-gray-400 font-bold">Protein</span>
                                                    <span className="text-sm font-black text-orange-500">{dish.nutrients.protein}g</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                                                <span className="text-[20px] font-black text-gray-900">₹{dish.price}</span>
                                                <button onClick={() => addToCart(dish)} className="bg-orange-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 hover:bg-orange-700 transition-colors shadow-sm shadow-orange-500/30">
                                                    <Plus size={14} strokeWidth={3} /> Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 3️⃣ Top Rated Restaurants (Lazy rendered via state/scroll) */}
                        <div className={`mb-14 transition-opacity duration-1000 ${showRestaurants ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                            <div className="flex items-center gap-2 mb-8">
                                <Star className="w-7 h-7 fill-orange-500 text-orange-500" strokeWidth={0} />
                                <h2 className="text-[1.65rem] font-bold text-[#111827]">Top Rated Restaurants</h2>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(n => <div key={n} className="animate-pulse h-64 bg-gray-200 rounded-2xl"></div>)}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {restaurants.map(rest => (
                                        <div key={rest.id} onClick={() => handleRestaurantSelect(rest)} className="group cursor-pointer bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col">
                                            <div className="relative h-56 w-full overflow-hidden shrink-0">
                                                <img src={rest.restaurant_img_url} alt={rest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <h3 className="text-[1.3rem] font-bold text-gray-900 mb-1 leading-tight">{rest.name}</h3>
                                                <p className="text-gray-500 text-sm mb-4 line-clamp-1">{rest.cuisine_type}</p>

                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-700">
                                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                                        {rest.rating} <span className="text-gray-400 font-medium">({rest.review_count} reviews)</span>
                                                    </div>
                                                    <span className={`text-[11px] font-bold px-2 py-1 rounded bg-gray-100 border border-gray-200 ${rest.tags?.[0] === 'Vegetarian' || rest.tags?.[0] === 'Vegan' ? 'text-green-600' : 'text-gray-700'}`}>
                                                        {rest.tags?.[0] || 'Mixed'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* MENU SECTION (When Restaurant Selected) */
                    <div>
                        <button onClick={() => setSelectedRestaurant(null)} className="mb-6 flex items-center text-sm font-semibold text-gray-500 hover:text-orange-600 transition-colors">
                            <ChevronRight className="w-4 h-4 mr-1 rotate-180" /> Back to Restaurants
                        </button>

                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="flex-1">
                                <h1 className="text-3xl font-black mb-2">{selectedRestaurant.name}</h1>
                                <p className="text-gray-500 mb-8">{selectedRestaurant.cuisine_type}</p>

                                <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200">Menu Items</h2>

                                {menuLoading ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {[1, 2, 3].map(n => <div key={n} className="animate-pulse h-64 bg-gray-200 rounded-xl"></div>)}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {menuItems.map(item => (
                                            <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">
                                                <div className="relative h-[220px] w-full shrink-0">
                                                    <img src={item.image_url || `https://source.unsplash.com/400x400/?food,healthy&sig=${item.id}`} alt={item.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="p-4 flex-1 flex flex-col">
                                                    <h3 className="text-[17px] font-bold text-[#111827] mb-1.5">{item.name}</h3>
                                                    <p className="text-gray-500 text-[12px] line-clamp-2 h-[36px] mb-4">{item.description}</p>

                                                    <div className="flex items-center justify-between mt-auto border-t border-gray-50 pt-3">
                                                        <span className="text-[19px] font-black text-[#ea5f07]">₹{item.price}</span>
                                                        {cart.find(i => i.id === item.id && i.restaurantId === selectedRestaurant.id) ? (
                                                            <div className="flex items-center bg-[#ea5f07] rounded shadow-sm text-white font-bold h-[32px] overflow-hidden">
                                                                <button onClick={() => updateQty(item.id, -1, selectedRestaurant.id)} className="w-[32px] flex items-center justify-center hover:bg-black/10 transition-colors h-full"><Minus size={14} /></button>
                                                                <span className="w-6 text-center text-[13px]">{cart.find(i => i.id === item.id && i.restaurantId === selectedRestaurant.id).qty}</span>
                                                                <button onClick={() => updateQty(item.id, 1, selectedRestaurant.id)} className="w-[32px] flex items-center justify-center hover:bg-black/10 transition-colors h-full"><Plus size={14} /></button>
                                                            </div>
                                                        ) : (
                                                            <button onClick={() => addToCart(item)} className="px-4 py-[6px] bg-[#ea5f07] text-white font-bold text-[13px] rounded shadow-sm hover:bg-[#d65e20] transition-colors flex items-center gap-1.5"><Plus size={13} strokeWidth={3} /> Add</button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Cart Slider */}
                            {isCartOpen && (
                                <>
                                    <div className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
                                    <div className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[70] shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out flex flex-col">
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex justify-between items-center mb-6 pt-2">
                                                <h2 className="text-2xl font-black">Your Cart</h2>
                                                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-6 h-6 text-gray-500" /></button>
                                            </div>
                                            {cart.length === 0 ? (
                                                <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
                                                    <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                                    <p className="text-lg text-gray-400 font-bold">Cart is empty</p>
                                                </div>
                                            ) : (
                                                <div className="flex-1 flex flex-col">
                                                    <div className="space-y-4 mb-8 flex-1 overflow-y-auto pr-2">
                                                        {cart.map(item => (
                                                            <div key={item.id} className="flex items-center justify-between pb-4 border-b border-gray-100">
                                                                <div className="flex-1 pr-4">
                                                                    <h4 className="text-sm font-bold text-gray-900 leading-tight">{item.name}</h4>
                                                                    <span className="text-xs text-gray-500 font-semibold block mt-1">₹{item.price}</span>
                                                                </div>
                                                                <div className="flex items-center bg-white border border-gray-200 rounded-md text-gray-800 font-bold overflow-hidden h-8 shrink-0">
                                                                    <button onClick={() => updateQty(item.id, -1, item.restaurantId)} className="w-7 flex items-center justify-center"><Minus size={12} /></button>
                                                                    <span className="w-6 text-center text-xs">{item.qty}</span>
                                                                    <button onClick={() => updateQty(item.id, 1, item.restaurantId)} className="w-7 flex items-center justify-center text-green-600"><Plus size={12} /></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="mt-auto">
                                                        <div className="flex justify-between items-end mb-6">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Amount to pay</p>
                                                                <p className="text-2xl font-black text-gray-900">₹{cartTotals.price}</p>
                                                            </div>
                                                        </div>
                                                        <button onClick={handlePlaceOrder} disabled={orderPlacing} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-colors">
                                                            {orderPlacing ? 'Processing...' : 'Place Order (COD)'}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {cart.length > 0 && !isCartOpen && (
                <Draggable bounds="body" onDrag={() => setIsDraggingCart(true)} onStop={() => setTimeout(() => setIsDraggingCart(false), 150)}>
                    <div className="hidden lg:flex fixed top-1/2 right-6 z-[90] cursor-grab active:cursor-grabbing flex-col items-center justify-center bg-[#ea5f07] rounded-full shadow-2xl w-16 h-16 border border-orange-400">
                        <button onClick={() => { if (!isDraggingCart) setIsCartOpen(true); }} className="relative flex flex-col items-center justify-center w-full h-full">
                            <ShoppingCart className="w-6 h-6 text-white" />
                            <span className="absolute -top-1 -right-1 flex h-[22px] w-[22px] justify-center items-center rounded-full bg-white text-[11px] font-black text-orange-600 ring-2 ring-orange-500">{cart.reduce((a, b) => a + b.qty, 0)}</span>
                        </button>
                    </div>
                </Draggable>
            )}
        </div>
    );
}
