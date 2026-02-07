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
    const currentMealData = dayRecord?.[currentMeal] || { ingredients: [], consumed: false };
    const availableIngredients = Object.values(inventory).filter(item => item.count > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-yellow-100 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-blue-300">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-blue-600">📅 식단표</h1>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                            ← 메인으로
                        </button>
                    </div>

                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full border-2 border-blue-300 rounded-lg p-3 mb-6 text-lg"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {(['breakfast', 'lunch', 'dinner'] as MealType[]).map((meal) => {
                            const mealData = dayRecord?.[meal] || { ingredients: [], consumed: false };
                            const mealNames = { breakfast: '🌅 아침', lunch: '☀️ 점심', dinner: '🌙 저녁' };

                            return (
                                <div key={meal} className="border-4 border-blue-400 rounded-xl p-4 bg-gradient-to-br from-white to-blue-50">
                                    <h2 className="text-xl font-bold mb-3 text-center">{mealNames[meal]}</h2>
                                    <button
                                        onClick={() => openMealModal(meal)}
                                        className="w-full bg-blue-500 text-white py-2 rounded-lg font-bold hover:bg-blue-600 mb-3"
                                    >
                                        ➕ 재료 추가
                                    </button>
                                    <div className="space-y-2">
                                        {mealData.ingredients.length === 0 ? (
                                            <div className="text-center text-gray-400 py-4 text-sm">재료 없음</div>
                                        ) : (
                                            mealData.ingredients.map((ing, idx) => {
                                                const ingData = INGREDIENTS_DB[ing.id];
                                                return (
                                                    <div key={idx} className="bg-white border-2 border-blue-300 rounded-lg p-2 text-sm">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="font-bold">{ingData?.nameKo}</span>
                                                            <button
                                                                onClick={() => {
                                                                    setCurrentMeal(meal);
                                                                    removeIngredientFromMeal(idx);
                                                                }}
                                                                className="text-red-500 font-bold"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            placeholder="g"
                                                            value={ing.amount || ''}
                                                            onChange={(e) => {
                                                                setCurrentMeal(meal);
                                                                updateIngredientAmount(idx, parseInt(e.target.value) || 0);
                                                            }}
                                                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                                                        />
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

            {showMealModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[80vh] overflow-y-auto border-4 border-blue-300">
                        <h2 className="text-2xl font-bold mb-4 text-blue-600">재료 선택</h2>

                        {availableIngredients.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                창고에 재료가 없습니다!<br />
                                먼저 창고에서 큐브를 만들어주세요.
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {availableIngredients.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => addIngredientToMeal(item.id)}
                                        className="border-2 border-blue-400 rounded-lg p-3 hover:bg-blue-50 transition"
                                    >
                                        <div className="text-2xl mb-1">🧊</div>
                                        <div className="font-bold text-sm">{item.nameKo}</div>
                                        <div className="text-xs text-gray-600">x{item.count}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <button
                            onClick={() => setShowMealModal(false)}
                            className="w-full bg-gray-500 text-white py-2 rounded-lg font-bold hover:bg-gray-600"
                        >
                            닫기
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
