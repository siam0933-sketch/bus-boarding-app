# 🚌 학원차 탑승관리 앱

학원 버스 기사님을 위한 모바일 탑승 관리 앱입니다.

## ✨ 주요 기능

- 📊 **Google Sheets 연동**: 학생 데이터를 Google Sheets에서 자동으로 불러옵니다
- 📅 **요일별 필터링**: 월~일요일 선택하여 해당 요일 학생만 표시
- 🚌 **노선별 관리**: 3시부/5시부 노선 구분
- ✅ **탑승 체크**: 터치로 간편하게 탑승 여부 체크
- 📝 **메모 기능**: 상단에 간단한 메모 작성 가능
- 🎯 **자동 요일 선택**: 앱 실행 시 오늘 요일 자동 선택
- 📱 **모바일 최적화**: 큰 글씨와 터치하기 쉬운 UI

## 🖼️ 스크린샷

```
┌─────────────────────────┐
│ 📝 메모 입력             │
├─────────────────────────┤
│ 월 화 수 목 금 토 일      │
├─────────────────────────┤
│  3시부  │  5시부         │
├─────────────────────────┤
│ ⏰ 15:00                 │
│ 📍 파밀리에(후) │ 김민성  │
│ 📍 파밀리에(정) │ 이우주  │
└─────────────────────────┘
```

## 🚀 설치 방법

### 1. Expo Go 앱 사용 (빠른 테스트)

1. App Store에서 **Expo Go** 다운로드
2. 터미널에서 실행:
   ```bash
   npm install
   npx expo start --tunnel
   ```
3. QR 코드 스캔

### 2. 독립 실행형 앱 빌드

```bash
npx eas build --platform ios
```

## 📋 Google Sheets 설정

1. Google Sheets를 공개로 설정:
   - "공유" → "링크가 있는 모든 사용자" → "뷰어"

2. 시트 ID를 `src/services/googleSheets.ts`에 입력:
   ```typescript
   const SPREADSHEET_ID = 'your-sheet-id';
   ```

3. 시트 구조:
   - A-C열: 월요일 (시간 | 정류장 | 이름)
   - D-F열: 화요일
   - G-I열: 수요일
   - J-L열: 목요일
   - M-O열: 금요일

## 🛠️ 기술 스택

- **React Native** + **Expo**
- **TypeScript**
- **React Native Paper** (UI)
- **Google Sheets API**

## 📦 주요 패키지

```json
{
  "expo": "~52.0.27",
  "react-native": "0.76.6",
  "react-native-paper": "^5.12.5",
  "@react-navigation/native": "^7.0.11"
}
```

## 🔧 개발 환경 설정

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npx expo start

# iOS 시뮬레이터
npx expo start --ios

# Android 에뮬레이터
npx expo start --android

# 웹 브라우저
npx expo start --web
```

## 📝 디렉토리 구조

```
src/
├── components/      # UI 컴포넌트
│   ├── DaySelector.tsx
│   ├── RouteSelector.tsx
│   └── StudentList.tsx
├── screens/         # 화면
│   └── MainScreen.tsx
├── context/         # 상태 관리
│   └── AppContext.tsx
├── services/        # API 서비스
│   └── googleSheets.ts
├── types/           # TypeScript 타입
│   └── index.ts
└── utils/           # 유틸리티
    └── mockData.ts
```

## 🎨 주요 컴포넌트

### DaySelector
요일 선택 UI (월~일)

### RouteSelector
노선 선택 UI (3시부/5시부)

### StudentList
학생 목록 및 탑승 체크 UI

### MainScreen
메인 화면 (메모 + 모든 컴포넌트 통합)

## 📱 사용 방법

1. **요일 선택**: 상단의 요일 버튼 터치
2. **노선 선택**: 3시부 또는 5시부 선택
3. **탑승 체크**: 학생 이름 터치 (초록색으로 변경)
4. **완료**: "탑승기록 완료" 버튼으로 초기화

## 🔐 보안

- Google Sheets는 읽기 전용으로만 접근
- API 키 없이 공개 시트 사용
- 탑승 기록은 로컬에만 저장 (앱 종료 시 삭제)

## 📄 라이선스

MIT License

## 👨‍💻 개발자

개발: Claude Code

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)
