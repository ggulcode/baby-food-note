'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserId, getInventory, getDietRecord, saveDietRecord, deductCube, restoreCube } from '@/lib/storage';
import { INGREDIENTS_DB, getIngredientIcon } from '@/lib/ingredients';
import type { DietRecord, MealSession, Inventory, DayRecord } from '@/lib/types';

type MealType = 'breakfast' | 'lunch' | 'dinner';

export default function DietPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [dietRecord, setDietRecord] = useState<DietRecord>({});
    const [inventory, setInventory] = useState<Inventory>({});
    const [showDayModal, setShowDayModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [currentMeal, setCurrentMeal] = useState<MealType>('breakfast');
    const [showIngredientModal, setShowIngredientModal] = useState(false);

    useEffect(() => {
        const id = getCurrentUserId();
        if (!id) {
            router.push('/');
            return;
        }
        setUserId(id);
        loadData(id);
    }, [router]);

    const loadData = (id: string) => {
        setDietRecord(getDietRecord(id));
        setInventory(getInventory(id));
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        const days: (Date | null)[] = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(null);
        }

        // Add all days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            days.push(new Date(year, month, day));
        }

        return days;
    };

    const formatDateKey = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const openDayModal = (date: Date) => {
        const dateKey = formatDateKey(date);
        setSelectedDate(dateKey);
        setShowDayModal(true);
    };

    const addIngredientToMeal = (ingredientId: string) => {
        if (!userId) return;

        const dayRecord: DayRecord = dietRecord[selectedDate] || {
            breakfast: { ingredients: [], consumed: false },
            lunch: { ingredients: [], consumed: false },
            dinner: { ingredients: [], consumed: false },
        };

        const meal = dayRecord[currentMeal];

        if (meal.ingredients.length >= 10) {
            alert('한 끼당 최대 10개 재료만 추가할 수 있습니다.');
            return;
        }

        if (!deductCube(userId, ingredientId)) {
            alert('재고가 부족합니다!');
            return;
        }

        meal.ingredients.push({ id: ingredientId, amount: 0 });
        dietRecord[selectedDate] = dayRecord;
        saveDietRecord(userId, dietRecord);
        loadData(userId);
        setShowIngredientModal(false);
    };

    const removeIngredientFromMeal = (ingredientIndex: number) => {
        if (!userId) return;

        const dayRecord = dietRecord[selectedDate];
        if (!dayRecord) return;

        const meal = dayRecord[currentMeal];
        const ingredient = meal.ingredients[ingredientIndex];

        restoreCube(userId, ingredient.id);
        meal.ingredients.splice(ingredientIndex, 1);
        saveDietRecord(userId, dietRecord);
        loadData(userId);
    };

    const updateIngredientAmount = (ingredientIndex: number, amount: number) => {
        if (!userId) return;

        const dayRecord = dietRecord[selectedDate];
        if (!dayRecord) return;

        dayRecord[currentMeal].ingredients[ingredientIndex].amount = amount;
        saveDietRecord(userId, dietRecord);
        setDietRecord({ ...dietRecord });
    };

    const days = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
    const dayRecord = selectedDate ? dietRecord[selectedDate] : null;
    const availableIngredients = Object.values(inventory).filter(item => item.count > 0);

    const mealConfig = {
        breakfast: { name: '아침', emoji: '🌅', color: 'from-orange-400 to-orange-500' },
        lunch: { name: '점심', emoji: '☀️', color: 'from-yellow-400 to-yellow-500' },
        dinner: { name: '저녁', emoji: '🌙', color: 'from-indigo-400 to-indigo-500' },
    };

    const getMealCount = (date: Date): number => {
        const dateKey = formatDateKey(date);
        const record = dietRecord[dateKey];
        if (!record) return 0;

        let count = 0;
        if (record.breakfast.ingredients.length > 0) count++;
        if (record.lunch.ingredients.length > 0) count++;
        if (record.dinner.ingredients.length > 0) count++;
        return count;
    };

    return (
        <div className="min-h-screen p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="card-pixel p-4 sm:p-6 pixel-glow">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                        <div className="text-center sm:text-left">
                            <h1 className="pixel-font text-2xl sm:text-3xl gradient-text flex items-center gap-2 justify-center sm:justify-start retro-shadow">
                                <span className="float-animation">📅</span>
                                식단표
                            </h1>
                            <p className="text-sm text-gray-600 mt-1 pixel-font">달력으로 기록하기</p>
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className="btn-pixel bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 px-6"
                        >
                            ← 메인으로
                        </button>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                            className="btn-pixel bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 px-4 min-h-[48px]"
                        >
                            ◀
                        </button>
                        <h2 className="pixel-font text-xl sm:text-2xl retro-shadow">{monthName}</h2>
                        <button
                            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                            className="btn-pixel bg-gradient-to-r from-blue-400 to-blue-500 text-white hover:from-blue-500 hover:to-blue-600 px-4 min-h-[48px]"
                        >
                            ▶
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className="card-pixel p-4 mb-4">
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                                <div key={idx} className={`text-center pixel-font font-bold text-sm ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Days */}
                        <div className="grid grid-cols-7 gap-2">
                            {days.map((date, idx) => {
                                if (!date) {
                                    return <div key={`empty-${idx}`} className="aspect-square" />;
                                }

                                const isToday = formatDateKey(date) === formatDateKey(new Date());
                                const mealCount = getMealCount(date);
                                const dateKey = formatDateKey(date);
                                const hasRecord = dietRecord[dateKey];

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => openDayModal(date)}
                                        className={`
                      aspect-square card-pixel p-2 hover:scale-105 transition-transform
                      ${isToday ? 'pixel-glow border-pink-500' : ''}
                      ${hasRecord ? 'bg-gradient-to-br from-green-50 to-blue-50' : ''}
                    `}
                                    >
                                        <div className="text-sm pixel-font mb-1">{date.getDate()}</div>
                                        {mealCount > 0 && (
                                            <div className="flex justify-center gap-1">
                                                {Array.from({ length: mealCount }).map((_, i) => (
                                                    <div key={i} className="w-2 h-2 rounded-full bg-green-500" />
                                                ))}
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-4 text-xs pixel-font text-gray-600">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                            <span>식사 기록</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 border-2 border-pink-500 rounded" />
                            <span>오늘</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Day Detail Modal */}
            {showDayModal && selectedDate && (
                <div className="modal-overlay" onClick={() => setShowDayModal(false)}>
                    <div className="modal-content card-pixel p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto pixel-glow" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="pixel-font text-2xl gradient-text retro-shadow">
                                {new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })}
                            </h2>
                            <button
                                onClick={() => setShowDayModal(false)}
                                className="text-3xl hover:scale-110 transition-transform"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Meals Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => {
                                const mealData = dayRecord?.[meal] || { ingredients: [], consumed: false };
                                const config = mealConfig[meal];

                                return (
                                    <div key={meal} className="card-pixel p-4">
                                        <div className="text-center mb-4">
                                            <div className="text-3xl mb-2">{config.emoji}</div>
                                            <h3 className="pixel-font text-lg retro-shadow">{config.name}</h3>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {mealData.ingredients.length}/10 재료
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => {
                                                setCurrentMeal(meal);
                                                setShowIngredientModal(true);
                                            }}
                                            className={`btn-pixel w-full bg-gradient-to-r ${config.color} text-white mb-3 min-h-[48px]`}
                                        >
                                            ➕ 재료 추가
                                        </button>

                                        <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                            {mealData.ingredients.length === 0 ? (
                                                <div className="text-center py-6 text-gray-400 text-sm">
                                                    재료 없음
                                                </div>
                                            ) : (
                                                mealData.ingredients.map((ing, idx) => {
                                                    const ingData = INGREDIENTS_DB[ing.id];
                                                    const icon = getIngredientIcon(ing.id);
                                                    return (
                                                        <div key={idx} className="card-pixel p-2">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-2xl">{icon}</span>
                                                                    <span className="font-bold text-sm">{ingData?.nameKo}</span>
                                                                </div>
                                                                <button
                                                                    onClick={() => {
                                                                        setCurrentMeal(meal);
                                                                        removeIngredientFromMeal(idx);
                                                                    }}
                                                                    className="text-red-500 font-bold text-xl hover:scale-110 transition-transform"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    placeholder="g"
                                                                    value={ing.amount || ''}
                                                                    onChange={(e) => {
                                                                        setCurrentMeal(meal);
                                                                        updateIngredientAmount(idx, parseInt(e.target.value) || 0);
                                                                    }}
                                                                    className="input-pixel flex-1 text-sm min-h-[44px]"
                                                                />
                                                                <span className="text-xs text-gray-500">g</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Ingredient Selection Modal */}
            {showIngredientModal && (
                <div className="modal-overlay" onClick={() => setShowIngredientModal(false)}>
                    <div className="modal-content card-pixel p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto pixel-glow" onClick={(e) => e.stopPropagation()}>
                        <h2 className="pixel-font text-2xl mb-6 gradient-text text-center retro-shadow">
                            재료 선택
                        </h2>

                        {availableIngredients.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="emoji-icon mb-4 float-animation">📦</div>
                                <p className="text-gray-500 pixel-font mb-2">창고에 재료가 없습니다!</p>
                                <p className="text-sm text-gray-400">먼저 창고에서 큐브를 만들어주세요.</p>
                                <button
                                    onClick={() => router.push('/inventory')}
                                    className="btn-pixel bg-gradient-to-r from-green-400 to-green-500 text-white mt-4"
                                >
                                    창고로 이동
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {availableIngredients.map((item) => {
                                        const icon = getIngredientIcon(item.id);
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => addIngredientToMeal(item.id)}
                                                className="grid-item-pixel"
                                            >
                                                <div className="text-4xl mb-2">{icon}</div>
                                                <div className="font-bold text-sm pixel-font">{item.nameKo}</div>
                                                <div className="text-xs text-gray-600">{item.name}</div>
                                                <div className="badge-pixel bg-blue-500 text-white mt-2 text-xs">
                                                    x{item.count}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => setShowIngredientModal(false)}
                                    className="btn-pixel w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600"
                                >
                                    닫기
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
