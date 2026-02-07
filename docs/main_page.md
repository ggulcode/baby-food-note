# P1. 메인 (로그인 및 관리)

## 개요
애플리케이션의 진입점으로, 사용자 식별과 데이터 관리를 담당합니다.

## 기능 명세

### 1. 사용자 로그인 (프로필 선택)
- **UI 요소**: 사용자 ID 입력 필드, '시작하기' 버튼.
- **로직**:
  - 사용자 ID 입력 시 `user_{ID}` 키를 사용하여 LocalStorage에 접근합니다.
  - 기존 데이터가 있으면 로드하고, 없으면 새로운 사용자 데이터를 초기화합니다.

### 2. 데이터 관리 (JSON Import/Export)
- **내보내기 (Export)**:
  - '데이터 백업' 버튼 클릭 시 실행.
  - 현재 로드된 전체 데이터(Inventory, Calendar 등)를 단일 JSON 파일로 생성하여 다운로드합니다.
  - 파일명 형식: `baby_food_backup_{Date}.json`
- **가져오기 (Import)**:
  - '데이터 복구' 버튼 클릭 -> 파일 선택 창 호출.
  - JSON 파일 선택 시 유효성 검사 수행.
  - **경고 모달**: "기존 데이터를 덮어쓰게 됩니다. 계속하시겠습니까?" 확인 후 덮어쓰기 실행.

## 데이터 구조 (Redux/State 예시)
```typescript
interface UserState {
  userId: string;
  lastLogin: string;
}
```
