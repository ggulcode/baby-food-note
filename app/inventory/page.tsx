'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserId, getInventory, addCubes } from '@/lib/storage';
import { INGREDIENTS_DB, INGREDIENT_IDS } from '@/lib/ingredients';
import type { Inventory } from '@/lib/types';

export default function InventoryPage() {
    const router = useRouter();
    const [userId, setUserId] = useState<string | null>(null);
    const [inventory, setInventory] = useState<Inventory>({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedIngredient, setSelectedIngredient] = useState('');
    const [cubeCount, setCubeCount] = useState('1');

    useEffect(() => {
        const id = getCurrentUserId();
        if (!id) {
            router.push('/');
            return;
        }
        setUserId(id);
        loadInventory(id);
    }, [router]);

    const loadInventory = (id: string) => {
        const inv = getInventory(id);
        setInventory(inv);
    };

    const handleAddCubes = () => {
        if (!userId || !selectedIngredient) return;

        const count = parseInt(cubeCount);
        if (isNaN(count) || count <= 0) {
            alert('올바른 수량을 입력해주세요.');
            return;
        }

        addCubes(userId, selectedIngredient, count);
        loadInventory(userId);
        setShowAddModal(false);
        setSelectedIngredient('');
        setCubeCount('1');
    };

    const inventoryItems = Object.values(inventory).filter(item => item.count > 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-100 to-yellow-100 p-4">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border-4 border-green-300">
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-3xl font-bold text-green-600">🎒 창고 (인벤토리)</h1>
                        <button
                            onClick={() => router.push('/')}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                        >
                            ← 메인으로
                        </button>
                    </div>

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition mb-6"
                    >
                        ➕ 큐브 만들기
                    </button>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {inventoryItems.length === 0 ? (
                            <div className="col-span-full text-center text-gray-500 py-12">
                                보유한 재료가 없습니다. 큐브를 만들어보세요!
                            </div>
                        ) : (
                            inventoryItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-gradient-to-br from-white to-gray-100 border-4 border-green-400 rounded-xl p-4 text-center hover:shadow-lg transition"
                                >
                                    <div className="text-4xl mb-2">🧊</div>
                                    <div className="font-bold text-sm">{item.nameKo}</div>
                                    <div className="text-xs text-gray-600">{item.name}</div>
                                    <div className="mt-2 bg-green-500 text-white rounded-full px-3 py-1 text-sm font-bold">
                                        x{item.count}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full border-4 border-green-300">
                        <h2 className="text-2xl font-bold mb-4 text-green-600">큐브 만들기</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2">재료 선택</label>
                                <select
                                    value={selectedIngredient}
                                    onChange={(e) => setSelectedIngredient(e.target.value)}
                                    className="w-full border-2 border-green-300 rounded-lg p-2"
                                >
                                    <option value="">재료를 선택하세요</option>
                                    {INGREDIENT_IDS.map((id) => {
                                        const ing = INGREDIENTS_DB[id];
                                        return (
                                            <option key={id} value={id}>
                                                {ing.nameKo} ({ing.name})
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold mb-2">수량</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={cubeCount}
                                    onChange={(e) => setCubeCount(e.target.value)}
                                    className="w-full border-2 border-green-300 rounded-lg p-2"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddCubes}
                                    className="flex-1 bg-green-500 text-white py-2 rounded-lg font-bold hover:bg-green-600"
                                >
                                    확인
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setSelectedIngredient('');
                                        setCubeCount('1');
                                    }}
                                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-bold hover:bg-gray-600"
                                >
                                    취소
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
