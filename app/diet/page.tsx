'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserId, getInventory, getDietRecord, saveDietRecord, deductCube, restoreCube } from '@/lib/storage';
import { INGREDIENTS_DB } from '@/lib/ingredients';
import type { DietRecord, MealSession, Inventory } from '@/lib/types';

type MealType = 'breakfast' | 'lunch' | 'dinner';

export default function DietPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [dietRecord, setDietRecord] = useState<DietRecord>({});
    const [inventory, setInventory] = useState<Inventory>({});
    const [showMealModal, setShowMealModal] = useState(false);
    const [currentMeal, setCurrentMeal] = useState<MealType>('breakfast');

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

    const openMealModal = (meal: MealType) => {
        setCurrentMeal(meal);
        setShowMealModal(true);
    };

    const addIngredientToMeal = (ingredientId: string) => {
        if (!userId) return;

        const dayRecord = dietRecord[selectedDate] || {
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

    const dayRecord = dietRecord[selectedDate];
    const availableIngredients = Object.values(inventory).filter(item => item.count > 0);

    const mealConfig = {
        breakfast: { name: '아침', emoji: '🌅', color: 'from-orange-400 to-orange-500' },
        lunch: { name: '점심', emoji: '☀️', color: 'from-yellow-400 to-yellow-500' },
        dinner: { name: '저녁', emoji: '🌙', color: 'from-indigo-400 to-indigo-500' },
    };

    return (
        <div className="min-h-screen p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="card-pixel p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                        <div className="text-center sm:text-left">
                            <h1 className="pixel-font text-2xl sm:text-3xl gradient-text flex items-center gap-2 justify-center sm:justify-start">
                                <span>📅</span>
                                식단표
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">오늘의 식사 기록</p>
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className="btn-pixel bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 px-6"
                        >
                            ← 메인으로
                        </button>
                    </div>

                    {/* Date Picker */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold mb-2 pixel-font">날짜 선택</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="input-pixel w-full"
                        />
                    </div>

                    {/* Meals Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => {
                            const mealData = dayRecord?.[meal] || { ingredients: [], consumed: false };
                            const config = mealConfig[meal];

                            return (
                                <div key={meal} className="card-pixel p-4">
                                    {/* Meal Header */}
                                    <div className="text-center mb-4">
                                        <div className="text-4xl mb-2">{config.emoji}</div>
                                        <h2 className="pixel-font text-xl">{config.name}</h2>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {mealData.ingredients.length}/10 재료
                                        </p>
                                    </div>

                                    {/* Add Ingredient Button */}
                                    <button
                                        onClick={() => openMealModal(meal)}
                                        className={`btn-pixel w-full bg-gradient-to-r ${config.color} text-white mb-4`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <span>➕</span>
                                            <span>재료 추가</span>
                                        </div>
                                    </button>

                                    {/* Ingredients List */}
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                        {mealData.ingredients.length === 0 ? (
                                            <div className="text-center py-8 text-gray-400 text-sm">
                                                재료 없음
                                            </div>
                                        ) : (
                                            mealData.ingredients.map((ing, idx) => {
                                                const ingData = INGREDIENTS_DB[ing.id];
                                                return (
                                                    <div key={idx} className="card-pixel p-3">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <span className="font-bold text-sm">{ingData?.nameKo}</span>
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

            {/* Ingredient Selection Modal */}
            {showMealModal && (
                <div className="modal-overlay" onClick={() => setShowMealModal(false)}>
                    <div className="modal-content card-pixel p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="pixel-font text-2xl mb-6 gradient-text text-center">
                            재료 선택
                        </h2>

                        {availableIngredients.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="emoji-icon mb-4">📦</div>
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
                                    {availableIngredients.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => addIngredientToMeal(item.id)}
                                            className="grid-item-pixel"
                                        >
                                            <div className="text-4xl mb-2">🧊</div>
                                            <div className="font-bold text-sm">{item.nameKo}</div>
                                            <div className="text-xs text-gray-600">{item.name}</div>
                                            <div className="badge-pixel bg-blue-500 text-white mt-2 text-xs">
                                                x{item.count}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setShowMealModal(false)}
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
