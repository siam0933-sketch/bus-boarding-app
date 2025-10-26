import { Student, DayOfWeek } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Google Sheets API 연동 서비스
 *
 * 시트 구조 (4칸 구조):
 * - 1행: 요일 (월요일, 화요일, 수요일, 목요일, 금요일)
 * - 2행부터: 노선 | 시간 | 정류장 | 이름
 *   예: 3시부 | 15:00 | 학교앞 | 김철수
 *       5시부 | 17:00 | 마트 | 최지민
 *       7시부 | 19:00 | 공원 | 홍길동
 *
 * 노선 추가 방법:
 * - A열(첫 번째 열)에 노선명을 입력하면 자동으로 감지
 * - 예: "7시부", "아침반", "저녁반" 등 자유롭게 사용 가능
 *
 * 시트가 공개 설정되어 있어야 합니다:
 * 1. Google Sheets에서 "공유" 클릭
 * 2. "링크가 있는 모든 사용자" 권한을 "뷰어"로 설정
 */

const DEFAULT_SPREADSHEET_ID = '1LRiMX6-q3E5Zyy12nZtkBW1ccG6HjpJLBieT-S55Jb4';
const GOOGLE_SHEETS_API_KEY = ''; // API 키 없이도 공개 시트는 작동
const SHEET_URL_KEY = '@sheet_url';

/**
 * Google Sheets URL에서 Spreadsheet ID 추출
 */
const extractSpreadsheetId = (url: string): string | null => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

/**
 * 저장된 시트 URL에서 Spreadsheet ID 가져오기
 */
const getSpreadsheetId = async (): Promise<string> => {
  try {
    const savedUrl = await AsyncStorage.getItem(SHEET_URL_KEY);
    if (savedUrl) {
      const id = extractSpreadsheetId(savedUrl);
      if (id) {
        console.log('Using saved spreadsheet ID:', id);
        return id;
      }
    }
  } catch (error) {
    console.error('Failed to load saved sheet URL:', error);
  }
  console.log('Using default spreadsheet ID:', DEFAULT_SPREADSHEET_ID);
  return DEFAULT_SPREADSHEET_ID;
};

// 요일과 컬럼 매핑 (4칸 구조: 노선, 시간, 정류장, 이름)
const DAY_COLUMN_MAP: { [key: string]: number } = {
  '월': 0,  // A열부터 시작 (월요일)
  '화': 4,  // E열 (화요일)
  '수': 8,  // I열 (수요일)
  '목': 12, // M열 (목요일)
  '금': 16, // Q열 (금요일)
};

/**
 * Google Sheets에서 모든 데이터 가져오기
 */
export const fetchAllStudents = async (): Promise<Student[]> => {
  try {
    const spreadsheetId = await getSpreadsheetId();
    const apiKey = GOOGLE_SHEETS_API_KEY ? `&key=${GOOGLE_SHEETS_API_KEY}` : '';
    // 시트 이름을 지정하지 않으면 첫 번째 시트를 가져옴
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json${apiKey}`;

    console.log('Fetching data from Google Sheets...');

    const response = await fetch(url);
    const text = await response.text();

    // Google Visualization API는 JSONP 형식으로 반환
    const jsonText = text.substring(47).slice(0, -2);
    const data = JSON.parse(jsonText);

    const students: Student[] = [];
    const rows = data.table.rows;

    // 각 요일별로 데이터 파싱
    const days: DayOfWeek[] = ['월', '화', '수', '목', '금'];

    days.forEach((day) => {
      const baseCol = DAY_COLUMN_MAP[day];

      console.log(`\n========== ${day}요일 데이터 파싱 시작 ==========`);

      // 데이터 파싱 - Row 0부터 시작
      let rowIndex = 0;
      let lastValidTime = '';

      while (rowIndex < rows.length) {
        const row = rows[rowIndex];
        if (!row || !row.c) {
          break;
        }

        // 4칸 구조: 노선 | 시간 | 정류장 | 이름
        const routeCell = row.c[baseCol];       // A열: 노선
        const timeCell = row.c[baseCol + 1];    // B열: 시간
        const stationCell = row.c[baseCol + 2]; // C열: 정류장
        const nameCell = row.c[baseCol + 3];    // D열: 이름

        console.log(`Row ${rowIndex}: route=${routeCell?.v}, time=${timeCell?.v || timeCell?.f}, station=${stationCell?.v}, name=${nameCell?.v}`);

        // 이름이 없으면 건너뛰기
        if (!nameCell || !nameCell.v) {
          rowIndex++;
          continue;
        }

        const nameString = String(nameCell.v).trim();

        // 헤더 행 건너뛰기 (정류장, 탑승객, 시간, 이름, 노선 등)
        if (nameString === '탑승객' || nameString === '정류장' || nameString === '이름' || nameString === '시간' || nameString.includes('요일')) {
          console.log(`Row ${rowIndex}: 헤더 행 건너뛰기`);
          rowIndex++;
          continue;
        }

        // 시간 데이터를 시:분 형식으로 변환
        let time = '';
        if (timeCell && timeCell.v) {
          // f 속성(포맷된 값)이 있으면 우선 사용
          if (timeCell.f) {
            time = String(timeCell.f).trim();
            lastValidTime = time; // 다음 행을 위해 저장
          } else if (typeof timeCell.v === 'string') {
            time = timeCell.v.trim();
            lastValidTime = time;
          } else if (timeCell.v) {
            // Date 객체인 경우 시:분 형식으로 변환
            const cellString = String(timeCell.v);
            const dateMatch = cellString.match(/Date\((\d+),(\d+),(\d+),(\d+),(\d+)/);
            if (dateMatch) {
              const hours = dateMatch[4].padStart(2, '0');
              const minutes = dateMatch[5].padStart(2, '0');
              time = `${hours}:${minutes}`;
              lastValidTime = time;
            } else {
              time = cellString.trim();
              lastValidTime = time;
            }
          }
        } else if (lastValidTime) {
          // 시간 셀이 비어있으면 이전 시간 재사용 (병합된 셀)
          time = lastValidTime;
        }

        const station = String(stationCell?.v || '').trim();

        // A열에서 노선 직접 읽기
        const route = String(routeCell?.v || '').trim() || '3시부';

        console.log(`Row ${rowIndex}: 최종 time="${time}", lastValidTime="${lastValidTime}", station="${station}", names="${nameString}", route="${route}"`);

        // 세미콜론으로 구분된 이름들 분리
        const names = nameString.split(';').map(n => n.trim()).filter(n => n);
        names.forEach((name, nameIndex) => {
          console.log(`  -> 학생 추가: ${name}, 시간: ${time}, 정류장: ${station}, 노선: ${route}`);
          students.push({
            id: `${day}-${route}-${rowIndex}-${nameIndex}`,
            name: name,
            grade: '',
            contact: '',
            station: station,
            expectedTime: time,
            route: route,
            days: [day],
          });
        });

        rowIndex++;
      }
    });

    console.log(`총 ${students.length}명의 학생 데이터를 불러왔습니다.`);
    return students;

  } catch (error) {
    console.error('Google Sheets 데이터 가져오기 실패:', error);
    return [];
  }
};

/**
 * Google Sheets에서 학생 데이터 가져오기 (레거시 함수 - 호환성 유지)
 */
export const fetchStudentsFromSheet = async (): Promise<Student[]> => {
  return fetchAllStudents();
};

/**
 * Google Sheets에 학생 데이터 추가
 */
export const addStudentToSheet = async (student: Omit<Student, 'id'>): Promise<void> => {
  try {
    // TODO: Google Sheets API 호출 구현
    console.log('Google Sheets에 학생 추가:', student);

    // const response = await fetch(
    //   `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1:append?valueInputOption=RAW&key=${GOOGLE_SHEETS_API_KEY}`,
    //   {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       values: [[
    //         student.name,
    //         student.grade,
    //         student.contact,
    //         student.station,
    //         student.expectedTime,
    //         student.route,
    //         student.days.join(',')
    //       ]]
    //     })
    //   }
    // );
  } catch (error) {
    console.error('Google Sheets 학생 추가 실패:', error);
    throw error;
  }
};

/**
 * Google Sheets에서 학생 데이터 업데이트
 */
export const updateStudentInSheet = async (student: Student): Promise<void> => {
  try {
    // TODO: Google Sheets API 호출 구현
    console.log('Google Sheets 학생 정보 업데이트:', student);
  } catch (error) {
    console.error('Google Sheets 학생 업데이트 실패:', error);
    throw error;
  }
};

/**
 * Google Sheets에서 학생 데이터 삭제
 */
export const deleteStudentFromSheet = async (studentId: string): Promise<void> => {
  try {
    // TODO: Google Sheets API 호출 구현
    console.log('Google Sheets 학생 삭제:', studentId);
  } catch (error) {
    console.error('Google Sheets 학생 삭제 실패:', error);
    throw error;
  }
};
