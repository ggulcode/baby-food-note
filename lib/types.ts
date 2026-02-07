// Type Definitions for Baby Food Note
export type IngredientCategory = 'grain' | 'veggie' | 'meat' | 'fruit' | 'dairy';

export interface UserProfile {
    id: string;
    name: string;
    theme: 'pastel-pink' | 'pastel-blue' | 'pastel-yellow';
    createdAt: number;
}

export interface InventoryItem {
    id: string;
    name: string;
    nameKo: string;
    count: number;
    category: IngredientCategory;
    allergyReacted: boolean;
}

export type Inventory = Record<string, InventoryItem>;

export interface MealIngredient {
    id: string;
    amount: number; // grams
}

export interface MealSession {
    ingredients: MealIngredient[];
    consumed: boolean;
}

export interface DayRecord {
    breakfast: MealSession;
    lunch: MealSession;
    dinner: MealSession;
}

export type DietRecord = Record<string, DayRecord>; // Key: YYYY-MM-DD
