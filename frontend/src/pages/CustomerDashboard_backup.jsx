import { useState, useEffect } from 'react';
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

    const [isLoading, setIsLoading] = useState(true);
    const [menuLoading, setMenuLoading] = useState(false);
    const [orderPlacing, setOrderPlacing] = useState(false);
    const [hasOrdered, setHasOrdered] = useState(() => localStorage.getItem('nutrikart_has_ordered') === 'true');

    // Fetch approved restaurants
    useEffect(() => {
        const fetchRestaurants = async () => {
            setIsLoading(true);
            try {
                const token = localStorage.getItem('nutrikart_token') || localStorage.getItem('nutrikart_bypassed_user');

                // Supabase REST endpoint logic for restaurants
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/vendor/restaurants?status=approved`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // We actually want the public customer endpoint if one exists, otherwise fallback to direct access or a generic search.
                // Assuming we are fetching from our backend.
                const resData = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/restaurants`, { // Example public endpoint or you can reuse others if modified
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (resData.ok) {
                    const data = await resData.json();
                    setRestaurants(data.restaurants || data || []);
                } else {
                    // Fallback: If no dedicated customer endpoint yet, we mock or fetch from vendor endpoint logic if authorized
                    await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/restaurants/pending`, { headers: { 'Authorization': `Bearer ${token}` } });
                    // In a real app we'd fetch ONLY approved directly using a public route.
                    // We'll simulate fetching approved ones if the API isn't exactly matching yet.
                    setRestaurants([{
                        id: "mock-1",
                        name: "Healthy Bites",
                        cuisine_type: "Healthy Indian",
                        restaurant_img_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
                        rating: "4.5",
                        avgCalories: 320
                    },
                    {
                        id: "mock-2",
                        name: "Green Bowl Co.",
                        cuisine_type: "Salads & Vegan",
                        restaurant_img_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
                        rating: "4.8",
                        avgCalories: 250
                    }]);
                }
            } catch (err) {
                console.error("Error fetching restaurants", err);
                // Fallback mock data for styling demonstration if api is missing
                setRestaurants([{
                    id: "mock-1",
                    name: "Healthy Bites",
                    cuisine_type: "Healthy Indian",
                    restaurant_img_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
                    rating: "4.5",
                    avgCalories: 320
                },
                {
                    id: "mock-2",
                    name: "Green Bowl Co.",
                    cuisine_type: "Salads & Vegan",
                    restaurant_img_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
                    rating: "4.8",
                    avgCalories: 250
                }]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchRestaurants();
    }, []);

    // Fetch Menu Items when a restaurant is selected
    const fetchMenu = async (restaurantId, shouldClearCart = false) => {
        setMenuLoading(true);
        if (shouldClearCart) setCart([]); // Clear cart conditionally
        try {
            const token = localStorage.getItem('nutrikart_token') || localStorage.getItem('nutrikart_bypassed_user');
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/food/menu/${restaurantId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setMenuItems(data.data || []);
            } else {
                // Mock menu items for demonstration if the backend DB is empty
                if (restaurantId === 'mock-1') {
                    setMenuItems([
                        { id: 'f-1', name: 'Grilled Paneer Bowl', description: 'High protein grilled paneer with quinoa.', price: 299, image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500', nutrients: { calories: 350, protein: 30, carbs: 15, fat: 10, fiber: 5 }, tags: ['High Protein', 'Vegetarian'] },
                        { id: 'f-2', name: 'Chicken Salad', description: 'Lean chicken breast with fresh greens.', price: 349, image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', nutrients: { calories: 280, protein: 45, carbs: 10, fat: 8, fiber: 6 }, tags: ['High Protein', 'Low Carb'] }
                    ]);
                } else {
                    setMenuItems([
                        { id: 'f-3', name: 'Vegan Buddha Bowl', description: 'Tofu, sweet potato, and kale.', price: 250, image_url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500', nutrients: { calories: 400, protein: 18, carbs: 55, fat: 12, fiber: 14 }, tags: ['Vegan', 'High Fiber'] }
                    ]);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setMenuLoading(false);
        }
    };

    const handleRestaurantSelect = (restaurant) => {
        setSelectedRestaurant(restaurant);
        fetchMenu(restaurant.id, false); // Do not indiscriminately clear cart
        setIsCartOpen(false); // Close cart if we were viewing it
    };

    // Check for pending cart items after login
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, selectedRestaurant, menuItems]);

    // Cart Functions
    const addToCart = (item) => {
        if (!user) {
            localStorage.setItem('nutrikart_pending_cart_item', JSON.stringify({ ...item, restaurantId: selectedRestaurant?.id, restaurantName: selectedRestaurant?.name }));
            toast.error('Please login to add items to your cart.');
            navigate('/login');
            return;
        }

        toast.success(`${item.name} added to cart!`);
        setCart(prev => {
            const existing = prev.find(i => i.id === item.id && i.restaurantId === selectedRestaurant.id);
            if (existing) {
                return prev.map(i => (i.id === item.id && i.restaurantId === selectedRestaurant.id) ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { ...item, qty: 1, restaurantId: selectedRestaurant.id, restaurantName: selectedRestaurant.name }];
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

    // Calculations
    const cartTotals = cart.reduce((acc, item) => {
        const qty = item.qty;
        acc.calories += (item.nutrients?.calories || 0) * qty;
        acc.protein += (item.nutrients?.protein || 0) * qty;
        acc.carbs += (item.nutrients?.carbs || 0) * qty;
        acc.fat += (item.nutrients?.fat || 0) * qty;
        acc.price += Number(item.price) * qty;
        return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0, price: 0 });

    // Filtering Logic
    const filteredRestaurants = restaurants.filter(rest => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return rest.name.toLowerCase().includes(term) ||
            (rest.cuisine_type && rest.cuisine_type.toLowerCase().includes(term));
    });

    const filteredMenuItems = menuItems.filter(item => {
        let match = true;
        if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) match = false;
        if (filters.minProtein && (item.nutrients?.protein || 0) < Number(filters.minProtein)) match = false;
        if (filters.maxCalories && (item.nutrients?.calories || 9999) > Number(filters.maxCalories)) match = false;
        if (filters.isVegetarian && !item.tags?.includes('Vegetarian')) match = false;
        if (filters.isVegan && !item.tags?.includes('Vegan')) match = false;
        if (filters.lowFat && (item.nutrients?.fat || 999) > 15) match = false;
        if (filters.lowCarb && (item.nutrients?.carbs || 999) > 20) match = false;
        return match;
    });

    const handlePlaceOrder = async () => {
        if (!user) {
            toast.error('Please login to place an order.');
            navigate('/login');
            return;
        }
        if (cart.length === 0) return;
        setOrderPlacing(true);
        try {
            const token = localStorage.getItem('nutrikart_token') || localStorage.getItem('nutrikart_bypassed_user');

            // Group cart items by restaurant
            const cartByRestaurant = cart.reduce((acc, item) => {
                const rid = item.restaurantId;
                if (!acc[rid]) acc[rid] = { items: [], total: 0 };
                acc[rid].items.push({
                    food_item_id: item.id,
                    quantity: item.qty,
                    price: item.price
                });
                acc[rid].total += item.price * item.qty;
                return acc;
            }, {});

            const orderPromises = Object.keys(cartByRestaurant).map(async (rid) => {
                const orderData = {
                    restaurant_id: rid,
                    total_amount: cartByRestaurant[rid].total,
                    payment_type: 'COD',
                    items: cartByRestaurant[rid].items
                };

                return fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/place`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(orderData)
                });
            });

            await Promise.all(orderPromises);

            toast.success('Orders placed successfully! (COD)');
            localStorage.setItem('nutrikart_has_ordered', 'true');
            setHasOrdered(true);
            setCart([]);
            setIsCartOpen(false);
            setSelectedRestaurant(null); // Return to home
        } catch (err) {
            console.error(err);
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
                        {/* Custom Cart Logo matching screenshot */}
                        <div className="w-10 h-10 bg-[#0f1f1a] rounded flex items-center justify-center relative shadow-sm">
                            <div className="text-orange-400 border-[1.5px] border-orange-400 w-5 h-5 flex items-center justify-center flex-col relative mt-1" style={{ borderTopWidth: 0, borderBottomLeftRadius: '2px', borderBottomRightRadius: '2px' }}>
                                <div className="absolute -top-1 w-6 h-[1.5px] bg-orange-400"></div>
                                {/* Small handle */}
                                <div className="absolute -top-[5px] left-1/2 -translate-x-1/2 w-2 h-2 border-[1.5px] border-b-0 border-orange-400 rounded-t-[2px]"></div>
                            </div>
                            <span className="absolute top-1 left-1.5 text-green-500 text-[12px] leading-none">&#127807;</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    {/* Global Search (Nav) */}
                    <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-3 py-2 w-64 focus-within:ring-2 focus-within:ring-orange-500/20 transition-all">
                        <Search className="w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search restaurants or food items"
                            className="bg-transparent border-none outline-none text-sm ml-2 w-full placeholder:text-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div
                        className="flex items-center gap-2 cursor-pointer group relative"
                        onClick={() => {
                            if (cart.length > 0) {
                                setIsCartOpen(true);
                            } else if (cart.length === 0) {
                                toast('Your cart is empty', { icon: '🛒' });
                            }
                        }}
                    >
                        <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-orange-500 transition-colors" />
                        {cart.length > 0 && (
                            <span className="absolute -top-2 -right-2 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#ea5f07] text-[10.5px] font-black text-white shadow-[0_2px_4px_rgba(234,95,7,0.3)] ring-2 ring-white">
                                {cart.reduce((total, item) => total + item.qty, 0)}
                            </span>
                        )}
                    </div>

                    {user ? (
                        <div className="flex items-center gap-2 cursor-pointer ml-3 relative group">
                            <Menu className="w-6 h-6 text-gray-700 hover:text-gray-900" />

                            {/* Simple Dropdown Hover */}
                            <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <div className="p-3 border-b border-gray-100">
                                    <span className="block font-medium text-sm text-gray-900">{user?.full_name || 'Profile'}</span>
                                </div>
                                <div className="p-2">
                                    <button onClick={signOut} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md font-medium">Log out</button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/login')} className="ml-3 px-5 py-2.5 bg-[#ea5f07] text-white text-sm font-bold rounded-lg hover:bg-[#d65e20] transition-colors shadow-sm shadow-orange-500/20">
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

            <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 bg-[#faf9f6]">

                {/* NUTRITION TRACKER SECTION */}
                {(!selectedRestaurant && hasOrdered) && (
                    <div className="mb-14">
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <Activity className="w-8 h-8 text-[#ea5f07]" strokeWidth={2.5} />
                                    <h2 className="text-[1.6rem] md:text-3xl font-bold text-[#111827]">Nutrition Tracker</h2>
                                </div>
                                <p className="text-gray-500 text-sm font-medium">Monitor your daily nutrition intake</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-4 lg:mt-0">
                                <select
                                    className="border border-gray-200 rounded-lg px-3 py-[9px] text-[13px] font-bold text-gray-700 bg-white outline-none focus:ring-2 focus:ring-[#ea5f07]/20 cursor-pointer shadow-sm hover:border-gray-300 transition-colors"
                                    defaultValue="daily"
                                >
                                    <option value="daily">Daily View</option>
                                    <option value="weekly">Weekly View</option>
                                    <option value="monthly">Monthly View</option>
                                </select>
                                <button className="flex items-center gap-2 border border-orange-200 bg-white text-gray-800 font-bold text-[13px] px-4 py-[9px] rounded-lg hover:bg-orange-50 transition-colors shadow-sm">
                                    <Edit className="w-3.5 h-3.5" /> Set Goals
                                </button>
                                <button className="flex items-center gap-2 bg-[#ea5f07] text-white font-bold text-[13px] px-4 py-[9px] rounded-lg hover:bg-[#d65e20] transition-colors shadow-sm shadow-orange-500/30">
                                    <Sparkles className="w-3.5 h-3.5" /> AI Suggestions
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Calories */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 font-black text-[14px] text-gray-800">
                                        <Flame className="w-4 h-4 text-[#ea5f07]" strokeWidth={2.5} /> Calories
                                    </div>
                                    <div className="text-[10px] font-black text-gray-700 bg-gray-100 px-2 py-[3px] border border-gray-200 rounded">0 / 2000</div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-[5px] mb-2.5 overflow-hidden">
                                    <div className="bg-[#ea5f07] h-full rounded-full" style={{ width: '0%' }}></div>
                                </div>
                                <p className="text-[11px] text-gray-500 font-bold">2000 remaining</p>
                            </div>

                            {/* Protein */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 font-black text-[14px] text-gray-800">
                                        <Activity className="w-4 h-4 text-[#3b82f6]" strokeWidth={2.5} /> Protein
                                    </div>
                                    <div className="text-[10px] font-black text-gray-700 bg-gray-100 px-2 py-[3px] border border-gray-200 rounded">0g / 150g</div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-[5px] mb-2.5 overflow-hidden">
                                    <div className="bg-[#3b82f6] h-full rounded-full" style={{ width: '0%' }}></div>
                                </div>
                                <p className="text-[11px] text-gray-500 font-bold">150g remaining</p>
                            </div>

                            {/* Carbs */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 font-black text-[14px] text-gray-800">
                                        <TrendingUp className="w-4 h-4 text-[#eab308]" strokeWidth={2.5} /> Carbs
                                    </div>
                                    <div className="text-[10px] font-black text-gray-700 bg-gray-100 px-2 py-[3px] border border-gray-200 rounded">0g / 200g</div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-[5px] mb-2.5 overflow-hidden">
                                    <div className="bg-[#eab308] h-full rounded-full" style={{ width: '0%' }}></div>
                                </div>
                                <p className="text-[11px] text-gray-500 font-bold">200g remaining</p>
                            </div>

                            {/* Fats */}
                            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 font-black text-[14px] text-gray-800">
                                        <Target className="w-4 h-4 text-[#22c55e]" strokeWidth={2.5} /> Fats
                                    </div>
                                    <div className="text-[10px] font-black text-gray-700 bg-gray-100 px-2 py-[3px] border border-gray-200 rounded">0g / 65g</div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-[5px] mb-2.5 overflow-hidden">
                                    <div className="bg-[#22c55e] h-full rounded-full" style={{ width: '0%' }}></div>
                                </div>
                                <p className="text-[11px] text-gray-500 font-bold">65g remaining</p>
                            </div>
                        </div>
                    </div>
                )}

                {!selectedRestaurant && (
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

                        <div className="flex overflow-x-auto pb-6 gap-6 md:gap-8 hide-scrollbar scroll-smooth px-2">
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
                                { name: 'Thums Up', img: 'https://i.postimg.cc/nFKmwNpc/image.png' }
                            ].map((cat, idx) => (
                                <div key={idx} className="flex flex-col items-center gap-4 shrink-0 cursor-pointer group w-[100px] md:w-[130px]">
                                    <div className="w-[100px] h-[100px] md:w-[130px] md:h-[130px] rounded-full overflow-hidden shadow-md group-hover:shadow-xl transition-all border-0 relative">
                                        <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    </div>
                                    <span className="font-bold text-gray-800 text-[15px] group-hover:text-[#ea5f07] transition-colors tracking-wide" style={{ fontFamily: 'serif' }}>{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* BROWSE BY CATEGORY SECTION */}
                {!selectedRestaurant && (
                    <div className="mb-14">
                        <div className="flex items-center gap-2.5 mb-8">
                            <ChefHat className="w-7 h-7 text-[#ea5f07]" strokeWidth={2.5} />
                            <h2 className="text-[1.5rem] md:text-[1.65rem] font-bold text-[#111827]">Browse by Category</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {[
                                { name: 'Breakfast', emoji: '☀️', gradient: 'from-amber-300 to-orange-400', shadow: 'shadow-orange-200' },
                                { name: 'Lunch', emoji: '🍱', gradient: 'from-emerald-300 to-green-500', shadow: 'shadow-green-200' },
                                { name: 'Dinner', emoji: '🌙', gradient: 'from-blue-400 to-indigo-500', shadow: 'shadow-indigo-200' },
                                { name: 'Snacks', emoji: '🍿', gradient: 'from-pink-400 to-rose-500', shadow: 'shadow-pink-200' },
                                { name: 'Desserts', emoji: '🍰', gradient: 'from-purple-400 to-fuchsia-400', shadow: 'shadow-purple-200' },
                                { name: 'Beverages', emoji: '🥤', gradient: 'from-cyan-300 to-blue-400', shadow: 'shadow-cyan-200' }
                            ].map((cat, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all duration-300 hover:-translate-y-1">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br ${cat.gradient} shadow-md ${cat.shadow} text-white`}>
                                        {cat.emoji}
                                    </div>
                                    <span className="font-medium text-gray-800 text-[13px] tracking-wide">{cat.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )
                }

                {/* Dynamic Content Area */}
                {
                    !selectedRestaurant ? (
                        /* 3. DISCOVER RESTAURANTS SECTION */
                        <>
                            <div className="mb-4 w-full">
                                <div className="mb-6">
                                    <h2 className="text-[2rem] font-bold text-[#111827] mb-1">Discover Restaurants</h2>
                                    <p className="text-gray-500 text-[14.5px]">Find healthy, nutritious meals near you</p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
                                    <div className="flex flex-col md:flex-row gap-4 mb-5">
                                        {/* Search Bar */}
                                        <div className="flex-1 relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Search className="h-[18px] w-[18px] text-gray-300 group-focus-within:text-orange-400 transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md outline-none focus:border-orange-400 text-[13.5px] text-gray-800 placeholder-gray-400"
                                                placeholder="Search restaurants or cuisine..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                            />
                                        </div>

                                        {/* Cuisines Dropdown */}
                                        <div className="w-full md:w-[240px]">
                                            <select className="w-full px-3.5 py-2 border border-gray-200 rounded-md outline-none text-[13.5px] focus:border-orange-400 text-gray-800 cursor-pointer bg-white">
                                                <option value="">All Cuisines</option>
                                                <option value="indian">Indian</option>
                                                <option value="chinese">Chinese</option>
                                                <option value="italian">Italian</option>
                                                <option value="mexican">Mexican</option>
                                                <option value="continental">Continental</option>
                                            </select>
                                        </div>

                                        {/* Options Dropdown */}
                                        <div className="w-full md:w-[240px]">
                                            <select className="w-full px-3.5 py-2 border border-gray-200 rounded-md outline-none text-[13.5px] focus:border-orange-400 text-gray-800 cursor-pointer bg-white hidden sm:block">
                                                <option value="">All Options</option>
                                                <option value="veg">Vegetarian</option>
                                                <option value="non-veg">Non-Vegetarian</option>
                                                <option value="vegan">Vegan</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Sort & Filters row */}
                                    <div className="flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={2} />
                                        <span className="text-[13px] text-gray-500 font-medium mr-1 shrink-0">Sort by:</span>

                                        <button
                                            onClick={() => setSortBy('rating')}
                                            className={`px-4 py-[5px] text-[12.5px] font-bold rounded shadow-sm transition-colors shrink-0 ${sortBy === 'rating' ? 'bg-[#ea5f07] text-white hover:bg-[#d65e20]' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            Rating
                                        </button>

                                        <button
                                            onClick={() => setSortBy('reviews')}
                                            className={`px-4 py-[5px] text-[12.5px] font-bold rounded shadow-sm transition-colors shrink-0 ${sortBy === 'reviews' ? 'bg-[#ea5f07] text-white hover:bg-[#d65e20]' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                                        >
                                            Reviews
                                        </button>
                                    </div>
                                </div>

                                <div className="text-gray-500 mb-5 text-[14px]">
                                    {filteredRestaurants.length} restaurants found
                                </div>
                            </div>

                            {isLoading ? (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map(n => (
                                        <div key={n} className="animate-pulse bg-white rounded-2xl p-3 border border-gray-100">
                                            <div className="w-full h-40 bg-gray-200 rounded-xl mb-4"></div>
                                            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredRestaurants.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">No restaurants found</h3>
                                    <p className="text-gray-500">We couldn&apos;t find any approved restaurants right now.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {[...filteredRestaurants].sort((a, b) => {
                                        const aRating = a.rating || 4.5;
                                        const bRating = b.rating || 4.5;
                                        const aReviews = a.review_count !== undefined ? a.review_count : 456;
                                        const bReviews = b.review_count !== undefined ? b.review_count : 456;
                                        if (sortBy === 'rating') return bRating - aRating;
                                        return bReviews - aReviews;
                                    }).map(rest => (
                                        <div
                                            key={rest.id}
                                            onClick={() => handleRestaurantSelect(rest)}
                                            className="group cursor-pointer bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                                        >
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={rest.restaurant_img_url || `https://source.unsplash.com/500x300/?restaurant,food&sig=${rest.id}`}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    alt={rest.name}
                                                />
                                                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm">
                                                    ~{rest.avgCalories || '300'} kcal / meal
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="text-lg font-bold text-gray-900 truncate pr-2">{rest.name}</h3>
                                                    <div className="bg-green-600 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center shrink-0">
                                                        <Star className="w-3 h-3 mr-0.5 fill-current" />
                                                        {rest.rating || '4.5'}
                                                    </div>
                                                </div>
                                                <p className="text-gray-500 text-sm mb-3 truncate">{rest.cuisine_type || 'Healthy Foods'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        /* 4. RESTAURANT MENU + 5. CART PANEL */
                        <div>
                            <button
                                onClick={() => setSelectedRestaurant(null)}
                                className="mb-6 flex items-center text-sm font-semibold text-gray-500 hover:text-orange-600 transition-colors"
                            >
                                <ChevronRight className="w-4 h-4 mr-1 rotate-180" />
                                Back to Restaurants
                            </button>

                            <div className="flex flex-col lg:flex-row gap-8">

                                {/* Left Col: Menu */}
                                <div className="flex-1">
                                    <h1 className="text-3xl font-black mb-2">{selectedRestaurant.name}</h1>
                                    <p className="text-gray-500 mb-8">{selectedRestaurant.cuisine_type}</p>

                                    <h2 className="text-xl font-bold mb-6 pb-2 border-b border-gray-200">Menu Items</h2>

                                    {menuLoading ? (
                                        <div className="space-y-6">
                                            {[1, 2].map(n => (
                                                <div key={n} className="animate-pulse flex p-4 bg-white rounded-2xl border border-gray-100">
                                                    <div className="w-32 h-32 bg-gray-200 rounded-xl"></div>
                                                    <div className="ml-4 flex-1">
                                                        <div className="h-6 bg-gray-200 w-1/3 mb-2 rounded"></div>
                                                        <div className="h-4 bg-gray-200 w-1/4 mb-4 rounded"></div>
                                                        <div className="grid grid-cols-4 gap-2">
                                                            <div className="h-12 bg-gray-200 rounded"></div>
                                                            <div className="h-12 bg-gray-200 rounded"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : filteredMenuItems.length === 0 ? (
                                        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                                            <p className="text-gray-500 font-medium">No items match your nutrition filters.</p>
                                            <button onClick={() => setFilters({ minProtein: '', maxCalories: '', isVegetarian: false, isVegan: false, lowFat: false, lowCarb: false })} className="mt-4 text-orange-600 font-bold text-sm">Clear Filters</button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {filteredMenuItems.map(item => (
                                                <div key={item.id} className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col">

                                                    {/* Image & Tags */}
                                                    <div className="relative h-[220px] w-full shrink-0">
                                                        <img
                                                            src={item.image_url || `https://source.unsplash.com/400x400/?food,healthy&sig=${item.id}`}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <div className={`absolute top-3 right-3 px-2 py-[2px] rounded text-[11px] font-bold text-white shadow-sm flex items-center gap-1.5 leading-none
                                                            ${(item.tags?.includes('Vegetarian') || item.tags?.includes('Vegan')) ? 'bg-green-600' : 'bg-[#e25447]'}`}>
                                                            {/* Veg/Nonveg square dot icon */}
                                                            <div className="flex items-center justify-center w-3 h-3 bg-white rounded-[2px] border border-current">
                                                                <span className={`w-[5px] h-[5px] rounded-full ${(item.tags?.includes('Vegetarian') || item.tags?.includes('Vegan')) ? 'bg-green-600' : 'bg-[#e25447]'}`}></span>
                                                            </div>
                                                            {(item.tags?.includes('Vegetarian') || item.tags?.includes('Vegan')) ? 'Veg' : 'Non-Veg'}
                                                        </div>
                                                    </div>

                                                    {/* Details & Nutrition */}
                                                    <div className="p-4 flex-1 flex flex-col">
                                                        <h3 className="text-[17px] font-bold text-[#111827] mb-1.5">{item.name}</h3>
                                                        <p className="text-gray-500 text-[12px] line-clamp-2 leading-relaxed h-[36px] mb-4">{item.description}</p>

                                                        {/* Nutrition Box - Beige/Orange tinted */}
                                                        <div className="bg-[#fcf8f3] rounded border border-[#faecd9] p-3 grid grid-cols-2 gap-y-3 gap-x-2 mb-5 mx-0.5">
                                                            <div className="text-center">
                                                                <div className="text-[9px] text-gray-500 font-bold mb-0.5">Calories</div>
                                                                <div className="text-[15px] font-bold text-[#ea5f07]">{item.nutrients?.calories || 0}</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-[9px] text-gray-500 font-bold mb-0.5">Protein</div>
                                                                <div className="text-[15px] font-bold text-[#ea5f07]">{item.nutrients?.protein || 0}g</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-[9px] text-gray-500 font-bold mb-0.5">Carbs</div>
                                                                <div className="text-[15px] font-bold text-[#ea5f07]">{item.nutrients?.carbs || 0}g</div>
                                                            </div>
                                                            <div className="text-center">
                                                                <div className="text-[9px] text-gray-500 font-bold mb-0.5">Fats</div>
                                                                <div className="text-[15px] font-bold text-[#ea5f07]">{item.nutrients?.fat || 0}g</div>
                                                            </div>
                                                        </div>

                                                        {/* Bottom Row: Price & Add Button */}
                                                        <div className="flex items-center justify-between mt-auto">
                                                            <span className="text-[19px] font-black text-[#ea5f07]">₹{item.price}</span>

                                                            {cart.find(i => i.id === item.id && i.restaurantId === selectedRestaurant.id) ? (
                                                                <div className="flex items-center bg-[#ea5f07] rounded shadow-sm text-white font-bold h-[32px] overflow-hidden">
                                                                    <button onClick={() => updateQty(item.id, -1, selectedRestaurant.id)} className="w-[32px] flex items-center justify-center hover:bg-black/10 transition-colors h-full"><Minus size={14} strokeWidth={2.5} /></button>
                                                                    <span className="w-6 text-center text-[13px]">{cart.find(i => i.id === item.id && i.restaurantId === selectedRestaurant.id).qty}</span>
                                                                    <button onClick={() => updateQty(item.id, 1, selectedRestaurant.id)} className="w-[32px] flex items-center justify-center hover:bg-black/10 transition-colors h-full"><Plus size={14} strokeWidth={2.5} /></button>
                                                                </div>
                                                            ) : (
                                                                <button
                                                                    onClick={() => addToCart(item)}
                                                                    className="px-4 py-[6px] bg-[#ea5f07] text-white font-bold text-[13px] rounded shadow-sm hover:bg-[#d65e20] transition-colors flex items-center gap-1.5 focus:outline-none"
                                                                >
                                                                    <Plus size={13} strokeWidth={3} /> Add
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Right Col: Cart Panel (Now a Slide-Out Drawer) */}
                                {isCartOpen && (
                                    <>
                                        {/* Backdrop */}
                                        <div
                                            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm transition-opacity"
                                            onClick={() => setIsCartOpen(false)}
                                        ></div>

                                        {/* Slide Panel */}
                                        <div className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[70] shadow-2xl overflow-y-auto transform transition-transform duration-300 ease-in-out flex flex-col">
                                            <div className="p-6 flex-1 flex flex-col">
                                                <div className="flex justify-between items-center mb-6 pt-2">
                                                    <h2 className="text-2xl font-black">Your Cart</h2>
                                                    <button
                                                        onClick={() => setIsCartOpen(false)}
                                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        <X className="w-6 h-6 text-gray-500" />
                                                    </button>
                                                </div>

                                                {cart.length === 0 ? (
                                                    <div className="flex-1 flex flex-col justify-center items-center text-center py-12">
                                                        <ShoppingCart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                                        <p className="text-lg text-gray-400 font-bold">Cart is empty</p>
                                                        <p className="text-sm text-gray-400 mt-2 max-w-[200px]">Add items from the menu to build your meal.</p>
                                                        <button
                                                            onClick={() => setIsCartOpen(false)}
                                                            className="mt-6 px-6 py-2 bg-gray-100 font-semibold text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                                                        >
                                                            Browse Menu
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex-1 flex flex-col">
                                                        {/* Cart Items */}
                                                        <div className="space-y-4 mb-8 flex-1 overflow-y-auto pr-2">
                                                            {cart.map(item => (
                                                                <div key={item.id} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                                                                    <div className="flex-1 pr-4">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span className="w-3 h-3 border border-green-600 flex items-center justify-center p-0.5 rounded-sm shrink-0">
                                                                                <span className="w-1.5 h-1.5 bg-green-600 rounded-full"></span>
                                                                            </span>
                                                                            <h4 className="text-sm font-bold text-gray-900 leading-tight">{item.name}</h4>
                                                                        </div>
                                                                        <span className="text-[10px] text-gray-400 font-medium block mb-0.5 mt-[-2px]">from {item.restaurantName}</span>
                                                                        <span className="text-xs text-gray-500 font-semibold block">₹{item.price}</span>
                                                                    </div>

                                                                    <div className="flex items-center bg-white border border-gray-200 rounded-md text-gray-800 font-bold overflow-hidden h-8 shrink-0">
                                                                        <button onClick={() => updateQty(item.id, -1, item.restaurantId)} className="w-7 flex items-center justify-center hover:bg-gray-50 transition-colors h-full"><Minus size={12} /></button>
                                                                        <span className="w-6 text-center text-xs">{item.qty}</span>
                                                                        <button onClick={() => updateQty(item.id, 1, item.restaurantId)} className="w-7 flex items-center justify-center hover:bg-gray-50 transition-colors h-full text-green-600"><Plus size={12} /></button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Bottom Section */}
                                                        <div className="mt-auto">
                                                            {/* Nutrition Summary */}
                                                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Meal Nutrition Summary</h4>
                                                                <div className="space-y-2">
                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="font-semibold text-gray-600">Total Calories</span>
                                                                        <span className="font-black text-gray-900">{cartTotals.calories.toFixed(0)} kcal</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="font-semibold text-gray-600">Protein</span>
                                                                        <span className="font-black text-green-600">{cartTotals.protein.toFixed(1)}g</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="font-semibold text-gray-600">Carbs</span>
                                                                        <span className="font-black text-blue-600">{cartTotals.carbs.toFixed(1)}g</span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="font-semibold text-gray-600">Fat</span>
                                                                        <span className="font-black text-orange-500">{cartTotals.fat.toFixed(1)}g</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Price & Checkout */}
                                                            <div className="flex justify-between items-end mb-6">
                                                                <div>
                                                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Amount to pay</p>
                                                                    <p className="text-2xl font-black text-gray-900">₹{cartTotals.price}</p>
                                                                </div>
                                                            </div>

                                                            <button
                                                                onClick={handlePlaceOrder}
                                                                disabled={orderPlacing}
                                                                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-xl transition-colors flex justify-center items-center disabled:opacity-70"
                                                            >
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
                    )
                }
            </main >

            {/* Draggable Desktop Floating Cart Button */}
            {
                cart.length > 0 && !isCartOpen && (
                    <Draggable
                        bounds="body"
                        onDrag={() => setIsDraggingCart(true)}
                        onStop={() => {
                            // Give it a tiny delay to ignore the click event triggering upon stop
                            setTimeout(() => setIsDraggingCart(false), 150);
                        }}
                    >
                        <div className="hidden lg:flex fixed top-1/2 right-6 z-[90] cursor-grab active:cursor-grabbing flex-col items-center justify-center bg-[#ea5f07] rounded-full shadow-2xl w-16 h-16 hover:bg-[#d65e20] transition-colors shadow-orange-500/40 border border-orange-400">
                            <button
                                onClick={() => {
                                    if (!isDraggingCart) {
                                        setIsCartOpen(true);
                                    }
                                }}
                                className="relative flex flex-col items-center justify-center outline-none w-full h-full"
                            >
                                <ShoppingCart className="w-6 h-6 text-white" />
                                <span className="absolute -top-1 -right-1 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[11px] font-black text-orange-600 shadow-md ring-2 ring-orange-500">
                                    {cart.reduce((total, item) => total + item.qty, 0)}
                                </span>
                            </button>
                        </div>
                    </Draggable>
                )
            }

            {/* Mobile Cart Floating Button (Shows only when cart has items and not in menu view or scrolling past) - Simplified for demo */}
            {
                cart.length > 0 && selectedRestaurant && (
                    <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-50 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-semibold text-gray-500">{cart.reduce((a, b) => a + b.qty, 0)} items</p>
                            <p className="text-lg font-black">₹{cartTotals.price}</p>
                        </div>
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="bg-orange-600 text-white px-8 py-3 rounded-xl font-bold text-sm"
                        >
                            Open Cart
                        </button>
                    </div>
                )
            }

        </div >
    );
}
