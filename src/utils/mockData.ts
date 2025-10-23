import { Student, Route } from '../types';

// 목 데이터 - 나중에 Google Sheets에서 가져올 데이터
export const mockStudents: Student[] = [
  {
    id: '1',
    name: '김철수',
    grade: '초3',
    contact: '010-1234-5678',
    station: '학교앞 정류장',
    expectedTime: '08:00',
    route: '1',
    days: ['월', '수', '금']
  },
  {
    id: '2',
    name: '이영희',
    grade: '초4',
    contact: '010-2345-6789',
    station: '도서관 앞',
    expectedTime: '08:10',
    route: '1',
    days: ['월', '수', '금']
  },
  {
    id: '3',
    name: '박민수',
    grade: '초5',
    contact: '010-3456-7890',
    station: '공원 입구',
    expectedTime: '08:20',
    route: '1',
    days: ['화', '목']
  },
  {
    id: '4',
    name: '최지민',
    grade: '초3',
    contact: '010-4567-8901',
    station: '마트 앞',
    expectedTime: '08:05',
    route: '2',
    days: ['월', '화', '수', '목', '금']
  },
  {
    id: '5',
    name: '정수진',
    grade: '초4',
    contact: '010-5678-9012',
    station: '아파트 정문',
    expectedTime: '08:15',
    route: '2',
    days: ['월', '화', '수', '목', '금']
  }
];

export const mockRoutes: Route[] = [
  { id: '3시부', name: '3시부' },
  { id: '5시부', name: '5시부' }
];
