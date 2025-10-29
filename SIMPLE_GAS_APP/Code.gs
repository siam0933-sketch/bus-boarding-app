// ===== 설정 =====
// 본인의 Google Sheets ID를 여기에 입력하세요
const SPREADSHEET_ID = '1LRiMX6-q3E5Zyy12nZtkBW1ccG6HjpJLBieT-S55Jb4';

// 요일별 컬럼 매핑 (0-based)
const DAY_COLUMNS = {
  '월': 0,   // A열
  '화': 4,   // E열
  '수': 8,   // I열
  '목': 12,  // M열
  '금': 16,  // Q열
  '토': 20,  // U열
  '일': 24   // Y열
};

/**
 * 웹 앱 진입점 - HTML 페이지 반환
 */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('버스 탑승 관리')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * 모든 학생 데이터 가져오기
 */
function getAllStudents() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  const students = [];

  Object.keys(DAY_COLUMNS).forEach(day => {
    const baseCol = DAY_COLUMNS[day];
    const lastRow = sheet.getLastRow();

    // 4행부터 데이터 읽기 (빈 행이 있어도 lastRow까지 계속 읽음)
    for (let row = 4; row <= lastRow; row++) {
      const route = sheet.getRange(row, baseCol + 1).getValue();
      const time = sheet.getRange(row, baseCol + 2).getValue();
      const station = sheet.getRange(row, baseCol + 3).getValue();
      const name = sheet.getRange(row, baseCol + 4).getValue();

      if (!name) continue; // 이름 없으면 다음 행으로 (종료하지 않음)

      const nameStr = String(name);
      const statusMatch = nameStr.match(/\(([^)]+)\)/);
      const cleanName = nameStr.replace(/\s*\([^)]*\)\s*/g, '').trim();
      const status = statusMatch ? statusMatch[1] : null;

      students.push({
        id: day + '-' + cleanName + '-' + row,
        name: cleanName,
        route: String(route || ''),
        station: String(station || ''),
        time: formatTime(time),
        day: day,
        status: status
      });
    }
  });

  return students;
}

/**
 * 메모 가져오기
 */
function getMemo(day) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  const col = DAY_COLUMNS[day] + 1;




  return sheet.getRange(1, col).getValue() || '';
}

/**
 * 메모 저장
 */
function saveMemo(day, memo) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  const col = DAY_COLUMNS[day] + 1;
  sheet.getRange(1, col).setValue(memo || '');
  return '메모가 저장되었습니다.';
}

/**
 * 학생 상태 업데이트
 */
function updateStatus(studentName, status, day) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  const baseCol = DAY_COLUMNS[day];
  const nameCol = baseCol + 4;
  const lastRow = sheet.getLastRow();

  for (let row = 4; row <= lastRow; row++) {
    const cellValue = sheet.getRange(row, nameCol).getValue();
    const cleanName = String(cellValue).replace(/\s*\([^)]*\)\s*/g, '').trim();

    if (cleanName === studentName) {
      const newValue = status ? cleanName + '\n(' + status + ')' : cleanName;
      sheet.getRange(row, nameCol).setValue(newValue);
      return '상태가 변경되었습니다.';
    }
  }

  return '학생을 찾을 수 없습니다.';
}

/**
 * 학생 추가
 */
function addStudent(studentName, route, station, time, day) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  const baseCol = DAY_COLUMNS[day];

  // 빈 행 찾기
  let row = 4;
  while (sheet.getRange(row, baseCol + 4).getValue() !== '') {
    row++;
  }

  sheet.getRange(row, baseCol + 1).setValue(route || '');
  sheet.getRange(row, baseCol + 2).setValue(time || '');
  sheet.getRange(row, baseCol + 3).setValue(station || '');
  sheet.getRange(row, baseCol + 4).setValue(studentName);

  return studentName + '이(가) 추가되었습니다.';
}

/**
 * 학생 삭제
 */
function removeStudent(studentName, day) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  const baseCol = DAY_COLUMNS[day];
  const nameCol = baseCol + 4;
  const lastRow = sheet.getLastRow();

  for (let row = lastRow; row >= 4; row--) {
    const nameCell = sheet.getRange(row, nameCol).getValue();
    const cleanName = String(nameCell).replace(/\s*\([^)]*\)\s*/g, '').trim();

    if (cleanName === studentName) {
      sheet.deleteRow(row);
      return studentName + '이(가) 삭제되었습니다.';
    }
  }

  return '학생을 찾을 수 없습니다.';
}

/**
 * 학생 정보 수정
 */
function updateStudent(studentName, route, station, time, day) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
  const baseCol = DAY_COLUMNS[day];
  const lastRow = sheet.getLastRow();

  for (let row = 4; row <= lastRow; row++) {
    const nameCell = sheet.getRange(row, baseCol + 4).getValue();
    const cleanName = String(nameCell).replace(/\s*\([^)]*\)\s*/g, '').trim();

    if (cleanName === studentName) {
      if (route !== null) sheet.getRange(row, baseCol + 1).setValue(route);
      if (time !== null) sheet.getRange(row, baseCol + 2).setValue(time);
      if (station !== null) sheet.getRange(row, baseCol + 3).setValue(station);
      return studentName + '의 정보가 수정되었습니다.';
    }
  }

  return '학생을 찾을 수 없습니다.';
}

/**
 * 시간 포맷 변환
 */
function formatTime(time) {
  if (!time) return '';

  if (typeof time === 'string') return time;

  if (time instanceof Date) {
    const h = time.getHours().toString().padStart(2, '0');
    const m = time.getMinutes().toString().padStart(2, '0');
    return h + ':' + m;
  }

  return String(time);
}
