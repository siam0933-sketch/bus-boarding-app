// 학생 정보 타입
export interface Student {
  id: string;
  name: string;
  grade: string;
  contact: string;
  station: string;
  expectedTime: string;
  route: string;
  days: string[]; // 요일 배열 (예: ['월', '수', '금'])
}

// 탑승 기록 타입
export interface BoardingRecord {
  studentId: string;
  isBoarded: boolean;
}

// 요일 타입
export type DayOfWeek = '월' | '화' | '수' | '목' | '금' | '토' | '일';

// 노선 타입
export interface Route {
  id: string;
  name: string;
}
