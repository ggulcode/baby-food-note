# P2. 식단표 (미식회 기록)

## 개요
날짜별 식단을 계획하고 기록하는 캘린더 형태의 페이지입니다. 창고(Inventory)와 연동되어 재료를 차감/복구합니다.

## 기능 명세

### 1. 캘린더 뷰
- 월별 달력 표시.
- 식단이 있는 날짜에 아이콘 또는 요약 표시.
- **날짜 클릭 시**: 해당 날짜의 "식단 상세 팝업" 오픈.

### 2. 식단 상세 팝업
- **섹션 구분**: 아침 / 점심 / 저녁 (3개 섹션).
- **섹션별 재료 추가**:
  - 각 섹션당 최대 10개의 재료 추가 가능.
  - '재료 추가' 버튼 클릭 시 창고(Inventory)의 '보유 재료' 목록 팝업 노출.
- **재료 선택 로직 (재고 연동)**:
  - 창고에 재고가 있는(수량 > 0) 재료만 선택 가능.
  - 선택 시: 식단에 추가되고, **창고 재고에서 1개 차감**.
- **재료 삭제 로직**:
  - 식단에 추가된 재료의 '삭제(X)' 버튼 클릭.
  - 삭제 시: 식단에서 제거되고, **창고 재고가 1개 복구됨**.
- **용량 입력**:
  - 각 추가된 재료 옆에 `g(그램)` 수 입력 필드 상시 노출.

## 데이터 구조
```typescript
interface MealRecord {
  date: string; // YYYY-MM-DD
  meals: {
    breakfast: IngredientUsage[];
    lunch: IngredientUsage[];
    dinner: IngredientUsage[];
  };
}

interface IngredientUsage {
  ingredientId: string;
  amount: number; // gram
}
```
