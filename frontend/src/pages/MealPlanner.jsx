import { useState } from 'react';
import { Calendar, Coffee, UtensilsCrossed, Moon, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function MealPlanner() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());

    const getWeekStart = (date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    };

    const weekStart = getWeekStart(currentDate);

    const days = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + i);
        return d;
    });

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const prevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };

    const nextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    const formatDateRange = (start, end) => {
        const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        return `${startStr} - ${endStr}`;
    };

    const getMealIcon = (mealType) => {
        switch (mealType) {
            case 'Breakfast': return <Coffee className="w-4 h-4 text-[#ea5f07]" strokeWidth={2} />;
            case 'Lunch': return <UtensilsCrossed className="w-4 h-4 text-[#ea5f07]" strokeWidth={2} />;
            case 'Dinner': return <Moon className="w-4 h-4 text-[#5c6ac4]" strokeWidth={2} />;
            default: return null;
        }
    };

    const meals = ['Breakfast', 'Lunch', 'Dinner'];

    return (
        <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans text-gray-900">
            {/* Header matches Dashboard */}
            <header className="sticky top-0 z-50 bg-white border-b border-gray-100 flex items-center justify-between" style={{ height: '70px', padding: '0 20px' }}>
                <div className="flex items-center gap-6">
                    <div className="cursor-pointer" onClick={() => navigate('/customer/dashboard')}>
                        <div className="brand-text" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#ea5f07', fontWeight: 'bold' }}>Nutri</span>Kart
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto w-full p-4 md:p-8">
                <button
                    onClick={() => navigate('/customer/dashboard')}
                    className="mb-6 text-sm font-semibold text-gray-500 hover:text-orange-600 transition-colors"
                >
                    &larr; Back to Dashboard
                </button>

                <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-8 h-8 text-[#ea5f07]" strokeWidth={2.5} />
                    <h1 className="text-3xl font-bold text-[#111827]">Weekly Meal Planner</h1>
                </div>
                <p className="text-gray-500 mb-8 font-medium font-sans">Plan your meals and track nutrition for the week</p>

                <div className="flex items-center justify-between mb-8">
                    <button onClick={prevWeek} className="px-5 py-2.5 bg-white border border-gray-200 rounded text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors text-gray-700">
                        Previous Week
                    </button>
                    <div className="text-lg font-bold text-gray-900 tracking-wide font-sans">
                        {formatDateRange(weekStart, weekEnd)}
                    </div>
                    <button onClick={nextWeek} className="px-5 py-2.5 bg-white border border-gray-200 rounded text-sm font-bold shadow-sm hover:bg-gray-50 transition-colors text-gray-700">
                        Next Week
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    {days.map((day, idx) => (
                        <div key={idx} className="bg-white rounded-[10px] border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] p-4 flex flex-col h-full hover:shadow-md transition-shadow">
                            <div className="text-center mb-4 border-b border-gray-100 pb-3">
                                <div className="text-gray-400 text-sm font-medium">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                                <div className="text-2xl font-black text-gray-900 mt-0.5">{day.getDate()}</div>
                            </div>

                            <div className="flex-1 space-y-3">
                                {meals.map((mealType, mIdx) => (
                                    <div key={mIdx} className="border border-gray-100 rounded-[8px] p-2.5 hover:border-orange-200 transition-colors group cursor-pointer bg-white">
                                        <div className={`flex items-center gap-1.5 mb-2`}>
                                            {getMealIcon(mealType)}
                                            <span className="font-bold text-[13px] text-gray-800">{mealType}</span>
                                        </div>
                                        <div className="text-gray-400 text-[13px] font-medium flex items-center gap-1 group-hover:text-gray-600 transition-colors">
                                            <span className="text-gray-300 text-[18px] leading-none mb-[2px] font-light">+</span> Add meal
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-5 pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-1.5 mb-2.5 font-bold text-gray-700 text-[13px]">
                                    <Activity className="w-3.5 h-3.5 text-gray-500" strokeWidth={2.5} /> Daily Total
                                </div>
                                <div className="grid grid-cols-2 gap-y-1.5 text-[12px] text-gray-500">
                                    <div>Cal: <span className="font-bold text-gray-800">0</span></div>
                                    <div>Pro: <span className="font-bold text-gray-800">0g</span></div>
                                    <div>Carbs: <span className="font-bold text-gray-800">0g</span></div>
                                    <div>Fats: <span className="font-bold text-gray-800">0g</span></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
