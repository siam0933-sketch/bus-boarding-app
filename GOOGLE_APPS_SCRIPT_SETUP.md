# Google Apps Script 설정 방법

앱에서 Google Sheets를 수정할 수 있도록 Google Apps Script 웹훅을 설정하는 방법입니다.

## 1. Google Sheets에서 Apps Script 열기

1. Google Sheets 파일 열기
2. 상단 메뉴 > **확장 프로그램** > **Apps Script** 클릭

## 2. 아래 코드 복사 & 붙여넣기

기존 코드를 모두 지우고 아래 코드를 붙여넣으세요:

```javascript
/**
 * 버스 탑승 관리 앱 - Google Apps Script 웹훅
 * POST 요청으로 학생 데이터를 추가/수정/삭제합니다
 */

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    let result;

    switch(data.action) {
      case 'add':
        result = addStudent(sheet, data);
        break;
      case 'remove':
        result = removeStudent(sheet, data);
        break;
      case 'update':
        result = updateStudent(sheet, data);
        break;
      case 'updateStatus':
        result = updateStudentStatus(sheet, data);
        break;
      case 'getMemo':
        result = getMemo(sheet, data);
        break;
      case 'saveMemo':
        result = saveMemo(sheet, data);
        break;
      default:
        throw new Error('Unknown action: ' + data.action);
    }

    // getMemo는 객체를 반환하므로 다르게 처리
    if (data.action === 'getMemo') {
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, data: result })
      ).setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService.createTextOutput(
        JSON.stringify({ success: true, message: result })
      ).setMimeType(ContentService.MimeType.JSON);
    }

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 학생 추가
 */
function addStudent(sheet, data) {
  const { studentName, route, station, time, day } = data;

  // 요일에 해당하는 컬럼 찾기
  const dayColumnMap = {
    '월': 1,  // A열
    '화': 5,  // E열
    '수': 9,  // I열
    '목': 13, // M열
    '금': 17  // Q열
  };

  const baseCol = dayColumnMap[day] || 1;

  // 빈 행 찾기 (4행부터 시작, 1=메모, 2=요일, 3=헤더)
  let row = 4;
  while (sheet.getRange(row, baseCol + 3).getValue() !== '') {
    row++;
  }

  // 데이터 입력: 노선 | 시간 | 정류장 | 이름
  sheet.getRange(row, baseCol).setValue(route || '');      // 노선
  sheet.getRange(row, baseCol + 1).setValue(time || '');   // 시간
  sheet.getRange(row, baseCol + 2).setValue(station || ''); // 정류장
  sheet.getRange(row, baseCol + 3).setValue(studentName);   // 이름

  return `${studentName} 학생을 ${day}요일 ${route} 노선에 추가했습니다.`;
}

/**
 * 학생 제거
 */
function removeStudent(sheet, data) {
  const { studentName, route, day } = data;

  const dayColumnMap = {
    '월': 1, '화': 5, '수': 9, '목': 13, '금': 17
  };

  const baseCol = dayColumnMap[day] || 1;
  const lastRow = sheet.getLastRow();
  let removed = false;

  // 역순으로 검색 (삭제 시 행 번호 변경 방지) - 4행부터
  for (let row = lastRow; row >= 4; row--) {
    const name = sheet.getRange(row, baseCol + 3).getValue();
    const routeValue = sheet.getRange(row, baseCol).getValue();

    if (name === studentName && (!route || routeValue === route)) {
      sheet.deleteRow(row);
      removed = true;
    }
  }

  if (removed) {
    return `${studentName} 학생을 ${day}요일${route ? ' ' + route : ''}에서 제거했습니다.`;
  } else {
    return `${studentName} 학생을 찾을 수 없습니다.`;
  }
}

/**
 * 학생 정보 수정
 */
function updateStudent(sheet, data) {
  const { studentName, station, time, route, day } = data;

  const dayColumnMap = {
    '월': 1, '화': 5, '수': 9, '목': 13, '금': 17
  };

  const baseCol = dayColumnMap[day] || 1;
  const lastRow = sheet.getLastRow();
  let updated = false;

  for (let row = 4; row <= lastRow; row++) {
    const name = sheet.getRange(row, baseCol + 3).getValue();

    if (name === studentName) {
      if (route) sheet.getRange(row, baseCol).setValue(route);
      if (time) sheet.getRange(row, baseCol + 1).setValue(time);
      if (station) sheet.getRange(row, baseCol + 2).setValue(station);
      updated = true;
    }
  }

  if (updated) {
    return `${studentName} 학생의 정보를 수정했습니다.`;
  } else {
    return `${studentName} 학생을 찾을 수 없습니다.`;
  }
}

/**
 * 학생 상태 업데이트
 */
function updateStudentStatus(sheet, data) {
  const { studentName, status, day } = data;

  const dayColumnMap = {
    '월': 1, '화': 5, '수': 9, '목': 13, '금': 17
  };

  const baseCol = dayColumnMap[day] || 1;
  const nameCol = baseCol + 3; // 이름 컬럼
  const lastRow = sheet.getLastRow();
  let updated = false;

  for (let row = 4; row <= lastRow; row++) {
    const cellValue = sheet.getRange(row, nameCol).getValue();

    // 기존 이름에서 상태 제거 (괄호 안의 내용 제거)
    const baseName = cellValue.replace(/\s*\([^)]*\)\s*$/g, '').trim();

    if (baseName === studentName) {
      let newValue;
      if (status && status !== '') {
        // 상태가 있으면 이름 뒤에 추가
        newValue = `${baseName}\n(${status})`;
      } else {
        // 상태가 없으면 이름만
        newValue = baseName;
      }

      sheet.getRange(row, nameCol).setValue(newValue);
      updated = true;
    }
  }

  if (updated) {
    if (status && status !== '') {
      return `${studentName} 학생의 상태를 (${status})로 변경했습니다.`;
    } else {
      return `${studentName} 학생의 상태를 초기화했습니다.`;
    }
  } else {
    return `${studentName} 학생을 찾을 수 없습니다.`;
  }
}

/**
 * 메모 읽기
 */
function getMemo(sheet, data) {
  const { day } = data;

  const dayColumnMap = {
    '월': 1, '화': 5, '수': 9, '목': 13, '금': 17
  };

  const baseCol = dayColumnMap[day] || 1;
  const memo = sheet.getRange(1, baseCol).getValue();

  return { memo: memo || '' };
}

/**
 * 메모 저장
 */
function saveMemo(sheet, data) {
  const { day, memo } = data;

  const dayColumnMap = {
    '월': 1, '화': 5, '수': 9, '목': 13, '금': 17
  };

  const baseCol = dayColumnMap[day] || 1;
  sheet.getRange(1, baseCol).setValue(memo || '');

  return `${day}요일 메모를 저장했습니다.`;
}

/**
 * GET 요청 테스트
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: 'ready', message: '웹훅이 정상 작동 중입니다.' })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

## 3. 배포하기

1. 상단의 **배포** 버튼 클릭 > **새 배포** 선택
2. **유형 선택** (⚙️ 아이콘) > **웹 앱** 선택
3. 설정:
   - **설명**: "버스 탑승 관리 웹훅"
   - **다음 계정으로 실행**: **나**
   - **액세스 권한**: **모든 사용자** (중요!)
4. **배포** 클릭
5. **액세스 승인** 클릭 > Google 계정 선택 > **고급** > **안전하지 않은 페이지로 이동** > **허용**
6. **웹 앱 URL** 복사 (예: `https://script.google.com/macros/s/AKfy...`)

## 4. 앱 설정에 URL 입력

1. 앱 실행 > 설정(⚙️) 버튼
2. "Apps Script 웹훅 URL" 입력란에 복사한 URL 붙여넣기
3. 저장

## 5. 테스트

AI 명령 입력:
- "김철수를 월요일 3시부 노선에 추가해줘"
- Google Sheets 확인

## 문제 해결

### 오류: "승인되지 않음"
- Apps Script 배포 시 **액세스 권한**을 **모든 사용자**로 설정했는지 확인

### 오류: "스크립트 함수를 찾을 수 없음"
- `doPost` 함수가 정확히 입력되었는지 확인
- Apps Script 저장 후 다시 배포

### 데이터가 추가되지 않음
- Google Sheets의 시트 구조 확인 (요일별 4칸 구조)
- Apps Script 실행 로그 확인 (상단 > **실행** 탭)
