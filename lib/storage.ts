// LocalStorage Data Layer (@Data_Integrity Agent)
import { UserProfile, Inventory, DietRecord, InventoryItem } from './types';
import { INGREDIENTS_DB } from './ingredients';

const STORAGE_KEYS = {
    currentUser: 'baby_food_current_user',
    userProfile: (id: string) => `user_${id}`,
    inventory: (id: string) => `inventory_${id}`,
    diet: (id: string) => `diet_${id}`,
};

// User Management
export function getCurrentUserId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.currentUser);
}

export function setCurrentUserId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.currentUser, id);
}

export function getUserProfile(id: string): UserProfile | null {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.userProfile(id));
    return data ? JSON.parse(data) : null;
}

export function saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.userProfile(profile.id), JSON.stringify(profile));
    setCurrentUserId(profile.id);
}

// Inventory Management
export function getInventory(userId: string): Inventory {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEYS.inventory(userId));
    return data ? JSON.parse(data) : {};
}

export function saveInventory(userId: string, inventory: Inventory): void {
    localStorage.setItem(STORAGE_KEYS.inventory(userId), JSON.stringify(inventory));
}

export function addCubes(userId: string, ingredientId: string, count: number): void {
    const inventory = getInventory(userId);
    const ingredientData = INGREDIENTS_DB[ingredientId];

    if (!ingredientData) throw new Error('Invalid ingredient ID');

    if (inventory[ingredientId]) {
        inventory[ingredientId].count += count;
    } else {
        inventory[ingredientId] = {
            ...ingredientData,
            count,
            allergyReacted: false,
        };
    }

    saveInventory(userId, inventory);
}

export function deductCube(userId: string, ingredientId: string): boolean {
    const inventory = getInventory(userId);

    if (!inventory[ingredientId] || inventory[ingredientId].count <= 0) {
        return false; // Not enough stock
    }

    inventory[ingredientId].count -= 1;
    saveInventory(userId, inventory);
    return true;
}

export function restoreCube(userId: string, ingredientId: string): void {
    const inventory = getInventory(userId);

    if (inventory[ingredientId]) {
        inventory[ingredientId].count += 1;
    }

    saveInventory(userId, inventory);
}

// Diet Record Management
export function getDietRecord(userId: string): DietRecord {
    if (typeof window === 'undefined') return {};
    const data = localStorage.getItem(STORAGE_KEYS.diet(userId));
    return data ? JSON.parse(data) : {};
}

export function saveDietRecord(userId: string, record: DietRecord): void {
    localStorage.setItem(STORAGE_KEYS.diet(userId), JSON.stringify(record));
}

// Backup & Restore (Import/Export)
export interface BackupData {
    version: string;
    exportDate: string;
    userProfile: UserProfile;
    inventory: Inventory;
    dietRecord: DietRecord;
}

export function exportData(userId: string): BackupData {
    const userProfile = getUserProfile(userId);
    if (!userProfile) throw new Error('User not found');

    return {
        version: '1.0',
        exportDate: new Date().toISOString(),
        userProfile,
        inventory: getInventory(userId),
        dietRecord: getDietRecord(userId),
    };
}

export function importData(data: BackupData): void {
    // Validation
    if (!data.version || !data.userProfile) {
        throw new Error('Invalid backup file format');
    }

    const userId = data.userProfile.id;

    saveUserProfile(data.userProfile);
    saveInventory(userId, data.inventory || {});
    saveDietRecord(userId, data.dietRecord || {});
}
