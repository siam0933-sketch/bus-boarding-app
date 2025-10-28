# 단순화된 Google Apps Script 설정

읽기/쓰기를 모두 Apps Script로 처리하는 간단한 방식입니다.

## 1. Apps Script 코드

Google Sheets > 확장 프로그램 > Apps Script에 아래 코드를 붙여넣으세요:

```javascript
// 스프레드시트 ID
const SPREADSHEET_ID = '1LRiMX6-q3E5Zyy12nZtkBW1ccG6HjpJLBieT-S55Jb4';

// 요일별 컬럼 매핑
const DAY_COLUMN_MAP = {
  '월': 1,  // A열
  '화': 5,  // E열
  '수': 9,  // I열
  '목': 13, // M열
  '금': 17  // Q열
};

/**
 * GET 요청 - 데이터 읽기
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

    if (action === 'getAll') {
      return getAllStudents(sheet);
    } else if (action === 'getMemo') {
      return getMemo(sheet, e.parameter.day);
    } else if (action === 'test') {
      return ContentService.createTextOutput(
        JSON.stringify({ status: 'ok', message: 'Apps Script 작동 중' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    throw new Error('Unknown action: ' + action);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * POST 요청 - 데이터 쓰기
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();

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
      case 'saveMemo':
        result = saveMemo(sheet, data);
        break;
      default:
        throw new Error('Unknown action: ' + data.action);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: result })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 모든 학생 데이터 가져오기
 */
function getAllStudents(sheet) {
  const students = [];
  const days = ['월', '화', '수', '목', '금'];

  days.forEach(day => {
    const baseCol = DAY_COLUMN_MAP[day];
    const lastRow = sheet.getLastRow();

    // 4행부터 데이터 읽기 (1=메모, 2=요일, 3=헤더, 4=데이터)
    for (let row = 4; row <= lastRow; row++) {
      const route = sheet.getRange(row, baseCol).getValue();
      const time = sheet.getRange(row, baseCol + 1).getValue();
      const station = sheet.getRange(row, baseCol + 2).getValue();
      const name = sheet.getRange(row, baseCol + 3).getValue();

      if (!name) break; // 이름이 없으면 종료

      // 상태 추출 (이름\n(결석) 형식)
      const nameStr = String(name);
      const statusMatch = nameStr.match(/\(([^)]+)\)/);
      const cleanName = nameStr.replace(/\s*\([^)]*\)\s*/g, '').trim();
      const status = statusMatch ? statusMatch[1] : null;

      students.push({
        id: `${day}-${cleanName}-${row}`,
        name: cleanName,
        route: String(route || ''),
        station: String(station || ''),
        expectedTime: formatTime(time),
        day: day,
        status: status
      });
    }
  });

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, data: students })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 시간 포맷 변환
 */
function formatTime(time) {
  if (!time) return '';

  if (typeof time === 'string') {
    return time;
  }

  // Date 객체인 경우
  if (time instanceof Date) {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  return String(time);
}

/**
 * 메모 읽기
 */
function getMemo(sheet, day) {
  const baseCol = DAY_COLUMN_MAP[day] || 1;
  const memo = sheet.getRange(1, baseCol).getValue();

  return ContentService.createTextOutput(
    JSON.stringify({ success: true, data: { memo: memo || '' } })
  ).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 메모 저장
 */
function saveMemo(sheet, data) {
  const { day, memo } = data;
  const baseCol = DAY_COLUMN_MAP[day] || 1;

  sheet.getRange(1, baseCol).setValue(memo || '');
  return `${day}요일 메모가 저장되었습니다.`;
}

/**
 * 학생 추가
 */
function addStudent(sheet, data) {
  const { studentName, route, station, time, day } = data;
  const baseCol = DAY_COLUMN_MAP[day] || 1;

  // 빈 행 찾기
  let row = 4;
  while (sheet.getRange(row, baseCol + 3).getValue() !== '') {
    row++;
  }

  sheet.getRange(row, baseCol).setValue(route || '');
  sheet.getRange(row, baseCol + 1).setValue(time || '');
  sheet.getRange(row, baseCol + 2).setValue(station || '');
  sheet.getRange(row, baseCol + 3).setValue(studentName);

  return `${studentName}이(가) ${day}요일에 추가되었습니다.`;
}

/**
 * 학생 제거
 */
function removeStudent(sheet, data) {
  const { studentName, day } = data;
  const baseCol = DAY_COLUMN_MAP[day] || 1;
  const lastRow = sheet.getLastRow();

  for (let row = lastRow; row >= 4; row--) {
    const nameCell = sheet.getRange(row, baseCol + 3).getValue();
    const cleanName = String(nameCell).replace(/\s*\([^)]*\)\s*/g, '').trim();

    if (cleanName === studentName) {
      sheet.deleteRow(row);
      return `${studentName}이(가) ${day}요일에서 제거되었습니다.`;
    }
  }

  return `${studentName}을(를) 찾을 수 없습니다.`;
}

/**
 * 학생 정보 수정
 */
function updateStudent(sheet, data) {
  const { studentName, station, time, route, day } = data;
  const baseCol = DAY_COLUMN_MAP[day] || 1;
  const lastRow = sheet.getLastRow();

  for (let row = 4; row <= lastRow; row++) {
    const nameCell = sheet.getRange(row, baseCol + 3).getValue();
    const cleanName = String(nameCell).replace(/\s*\([^)]*\)\s*/g, '').trim();

    if (cleanName === studentName) {
      if (route) sheet.getRange(row, baseCol).setValue(route);
      if (time) sheet.getRange(row, baseCol + 1).setValue(time);
      if (station) sheet.getRange(row, baseCol + 2).setValue(station);
      return `${studentName}의 정보가 수정되었습니다.`;
    }
  }

  return `${studentName}을(를) 찾을 수 없습니다.`;
}

/**
 * 학생 상태 업데이트 (결석, 시간변경, 직접등원)
 */
function updateStudentStatus(sheet, data) {
  const { studentName, status, day } = data;
  const baseCol = DAY_COLUMN_MAP[day] || 1;
  const nameCol = baseCol + 3;
  const lastRow = sheet.getLastRow();

  for (let row = 4; row <= lastRow; row++) {
    const cellValue = sheet.getRange(row, nameCol).getValue();
    const cleanName = String(cellValue).replace(/\s*\([^)]*\)\s*/g, '').trim();

    if (cleanName === studentName) {
      const newValue = status ? `${cleanName}\n(${status})` : cleanName;
      sheet.getRange(row, nameCol).setValue(newValue);
      return status
        ? `${studentName}의 상태가 (${status})로 변경되었습니다.`
        : `${studentName}의 상태가 초기화되었습니다.`;
    }
  }

  return `${studentName}을(를) 찾을 수 없습니다.`;
}
```

## 2. 배포하기

1. **저장**: Ctrl+S
2. **배포**: 상단 **배포** > **새 배포**
3. **유형 선택**: 웹 앱
4. **설정**:
   - 다음 계정으로 실행: **나**
   - 액세스 권한: **모든 사용자**
5. **배포** 클릭
6. **웹 앱 URL** 복사

## 3. URL 형식

배포 후 받은 URL:
```
https://script.google.com/macros/s/AKfy.../exec
```

이 URL 하나로 모든 작업을 처리합니다!

## 4. 사용 예시

**데이터 읽기:**
```
GET https://script.google.com/macros/s/AKfy.../exec?action=getAll
```

**메모 읽기:**
```
GET https://script.google.com/macros/s/AKfy.../exec?action=getMemo&day=월
```

**데이터 쓰기:**
```
POST https://script.google.com/macros/s/AKfy.../exec
Body: {"action": "add", "studentName": "김철수", ...}
```
