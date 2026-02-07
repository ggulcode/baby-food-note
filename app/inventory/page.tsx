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

    // Group by category
    const groupedItems = inventoryItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {} as Record<string, typeof inventoryItems>);

    const categoryEmojis: Record<string, string> = {
        grain: '🌾',
        veggie: '🥬',
        meat: '🍖',
        fruit: '🍎',
        dairy: '🥛',
    };

    const categoryNames: Record<string, string> = {
        grain: '곡류',
        veggie: '채소',
        meat: '육류',
        fruit: '과일',
        dairy: '유제품',
    };

    return (
        <div className="min-h-screen p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
                <div className="card-pixel p-4 sm:p-6">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                        <div className="text-center sm:text-left">
                            <h1 className="pixel-font text-2xl sm:text-3xl gradient-text flex items-center gap-2 justify-center sm:justify-start">
                                <span>🎒</span>
                                창고 (인벤토리)
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                보유 재료: {inventoryItems.length}종
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/')}
                            className="btn-pixel bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600 px-6"
                        >
                            ← 메인으로
                        </button>
                    </div>

                    {/* Add Cube Button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="btn-pixel w-full bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600 mb-6"
                    >
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-2xl">➕</span>
                            <span className="pixel-font">큐브 만들기</span>
                        </div>
                    </button>

                    {/* Inventory Grid */}
                    {inventoryItems.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="emoji-icon mb-4">📦</div>
                            <p className="text-gray-500 pixel-font">보유한 재료가 없습니다</p>
                            <p className="text-sm text-gray-400 mt-2">큐브를 만들어보세요!</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedItems).map(([category, items]) => (
                                <div key={category}>
                                    <h3 className="pixel-font text-lg mb-3 flex items-center gap-2 text-gray-700">
                                        <span className="text-2xl">{categoryEmojis[category]}</span>
                                        {categoryNames[category]}
                                    </h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                        {items.map((item) => (
                                            <div
                                                key={item.id}
                                                className="grid-item-pixel"
                                            >
                                                <div className="emoji-icon text-5xl mb-2">🧊</div>
                                                <div className="font-bold text-sm">{item.nameKo}</div>
                                                <div className="text-xs text-gray-600">{item.name}</div>
                                                <div className="badge-pixel bg-green-500 text-white mt-2">
                                                    x{item.count}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Add Cube Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal-content card-pixel p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h2 className="pixel-font text-2xl mb-6 gradient-text text-center">
                            큐브 만들기
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-2 pixel-font">재료 선택</label>
                                <select
                                    value={selectedIngredient}
                                    onChange={(e) => setSelectedIngredient(e.target.value)}
                                    className="input-pixel w-full"
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
                                <label className="block text-sm font-bold mb-2 pixel-font">수량</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={cubeCount}
                                    onChange={(e) => setCubeCount(e.target.value)}
                                    className="input-pixel w-full"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button
                                    onClick={handleAddCubes}
                                    className="btn-pixel bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600"
                                >
                                    확인
                                </button>
                                <button
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setSelectedIngredient('');
                                        setCubeCount('1');
                                    }}
                                    className="btn-pixel bg-gradient-to-r from-gray-400 to-gray-500 text-white hover:from-gray-500 hover:to-gray-600"
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
