// 50 Core Ingredients Database with Custom Icons
import { InventoryItem } from './types';

// Ingredient icon mapping
export const INGREDIENT_ICONS: Record<string, string> = {
    // Grains (곡류) - 7 items
    rice: '🍚',
    oatmeal: '🥣',
    glutinous_rice: '🍙',
    barley: '🌾',
    millet: '🌾',
    quinoa: '🌾',
    brown_rice: '🍚',

    // Vegetables (채소) - 18 items
    carrot: '🥕',
    broccoli: '🥦',
    spinach: '🥬',
    pumpkin: '🎃',
    potato: '🥔',
    sweet_potato: '🍠',
    cabbage: '🥬',
    bok_choy: '🥬',
    zucchini: '🥒',
    cucumber: '🥒',
    radish: '🥕',
    onion: '🧅',
    corn: '🌽',
    mushroom: '🍄',
    paprika: '🫑',
    tomato: '🍅',
    eggplant: '🍆',
    lettuce: '🥬',

    // Meat/Protein (고기/단백질) - 10 items
    beef: '🥩',
    chicken: '🍗',
    pork: '🥓',
    tofu: '🧈',
    egg: '🥚',
    white_fish: '🐟',
    salmon: '🐟',
    shrimp: '🦐',
    beans: '🫘',
    lentils: '🫘',

    // Fruits (과일) - 10 items
    apple: '🍎',
    banana: '🍌',
    pear: '🍐',
    watermelon: '🍉',
    melon: '🍈',
    strawberry: '🍓',
    grape: '🍇',
    orange: '🍊',
    blueberry: '🫐',
    kiwi: '🥝',

    // Dairy/Others (유제품/기타) - 5 items
    cheese: '🧀',
    yogurt: '🥛',
    seaweed: '🌿',
    sesame: '🌰',
    avocado: '🥑',
};

export const INGREDIENTS_DB: Record<string, Omit<InventoryItem, 'count' | 'allergyReacted'>> = {
    // Grains (곡류) - 7 items
    rice: { id: 'rice', name: 'Rice', nameKo: '쌀', category: 'grain' },
    oatmeal: { id: 'oatmeal', name: 'Oatmeal', nameKo: '오트밀', category: 'grain' },
    glutinous_rice: { id: 'glutinous_rice', name: 'Glutinous Rice', nameKo: '찹쌀', category: 'grain' },
    barley: { id: 'barley', name: 'Barley', nameKo: '보리', category: 'grain' },
    millet: { id: 'millet', name: 'Millet', nameKo: '조', category: 'grain' },
    quinoa: { id: 'quinoa', name: 'Quinoa', nameKo: '퀴노아', category: 'grain' },
    brown_rice: { id: 'brown_rice', name: 'Brown Rice', nameKo: '현미', category: 'grain' },

    // Vegetables (채소) - 18 items
    carrot: { id: 'carrot', name: 'Carrot', nameKo: '당근', category: 'veggie' },
    broccoli: { id: 'broccoli', name: 'Broccoli', nameKo: '브로콜리', category: 'veggie' },
    spinach: { id: 'spinach', name: 'Spinach', nameKo: '시금치', category: 'veggie' },
    pumpkin: { id: 'pumpkin', name: 'Pumpkin', nameKo: '단호박', category: 'veggie' },
    potato: { id: 'potato', name: 'Potato', nameKo: '감자', category: 'veggie' },
    sweet_potato: { id: 'sweet_potato', name: 'Sweet Potato', nameKo: '고구마', category: 'veggie' },
    cabbage: { id: 'cabbage', name: 'Cabbage', nameKo: '양배추', category: 'veggie' },
    bok_choy: { id: 'bok_choy', name: 'Bok Choy', nameKo: '청경채', category: 'veggie' },
    zucchini: { id: 'zucchini', name: 'Zucchini', nameKo: '애호박', category: 'veggie' },
    cucumber: { id: 'cucumber', name: 'Cucumber', nameKo: '오이', category: 'veggie' },
    radish: { id: 'radish', name: 'Radish', nameKo: '무', category: 'veggie' },
    onion: { id: 'onion', name: 'Onion', nameKo: '양파', category: 'veggie' },
    corn: { id: 'corn', name: 'Corn', nameKo: '옥수수', category: 'veggie' },
    mushroom: { id: 'mushroom', name: 'Mushroom', nameKo: '버섯', category: 'veggie' },
    paprika: { id: 'paprika', name: 'Paprika', nameKo: '파프리카', category: 'veggie' },
    tomato: { id: 'tomato', name: 'Tomato', nameKo: '토마토', category: 'veggie' },
    eggplant: { id: 'eggplant', name: 'Eggplant', nameKo: '가지', category: 'veggie' },
    lettuce: { id: 'lettuce', name: 'Lettuce', nameKo: '상추', category: 'veggie' },

    // Meat/Protein (고기/단백질) - 10 items
    beef: { id: 'beef', name: 'Beef', nameKo: '소고기', category: 'meat' },
    chicken: { id: 'chicken', name: 'Chicken', nameKo: '닭고기', category: 'meat' },
    pork: { id: 'pork', name: 'Pork', nameKo: '돼지고기', category: 'meat' },
    tofu: { id: 'tofu', name: 'Tofu', nameKo: '두부', category: 'meat' },
    egg: { id: 'egg', name: 'Egg', nameKo: '계란', category: 'meat' },
    white_fish: { id: 'white_fish', name: 'White Fish', nameKo: '흰살생선', category: 'meat' },
    salmon: { id: 'salmon', name: 'Salmon', nameKo: '연어', category: 'meat' },
    shrimp: { id: 'shrimp', name: 'Shrimp', nameKo: '새우', category: 'meat' },
    beans: { id: 'beans', name: 'Beans', nameKo: '콩', category: 'meat' },
    lentils: { id: 'lentils', name: 'Lentils', nameKo: '렌틸콩', category: 'meat' },

    // Fruits (과일) - 10 items
    apple: { id: 'apple', name: 'Apple', nameKo: '사과', category: 'fruit' },
    banana: { id: 'banana', name: 'Banana', nameKo: '바나나', category: 'fruit' },
    pear: { id: 'pear', name: 'Pear', nameKo: '배', category: 'fruit' },
    watermelon: { id: 'watermelon', name: 'Watermelon', nameKo: '수박', category: 'fruit' },
    melon: { id: 'melon', name: 'Melon', nameKo: '멜론', category: 'fruit' },
    strawberry: { id: 'strawberry', name: 'Strawberry', nameKo: '딸기', category: 'fruit' },
    grape: { id: 'grape', name: 'Grape', nameKo: '포도', category: 'fruit' },
    orange: { id: 'orange', name: 'Orange', nameKo: '오렌지', category: 'fruit' },
    blueberry: { id: 'blueberry', name: 'Blueberry', nameKo: '블루베리', category: 'fruit' },
    kiwi: { id: 'kiwi', name: 'Kiwi', nameKo: '키위', category: 'fruit' },

    // Dairy/Others (유제품/기타) - 5 items
    cheese: { id: 'cheese', name: 'Cheese', nameKo: '치즈', category: 'dairy' },
    yogurt: { id: 'yogurt', name: 'Yogurt', nameKo: '요거트', category: 'dairy' },
    seaweed: { id: 'seaweed', name: 'Seaweed', nameKo: '김', category: 'dairy' },
    sesame: { id: 'sesame', name: 'Sesame', nameKo: '참깨', category: 'dairy' },
    avocado: { id: 'avocado', name: 'Avocado', nameKo: '아보카도', category: 'dairy' },
};

export const INGREDIENT_IDS = Object.keys(INGREDIENTS_DB);

// Helper function to get ingredient icon
export function getIngredientIcon(ingredientId: string): string {
    return INGREDIENT_ICONS[ingredientId] || '🧊';
}
