/**
 * 단순화된 Apps Script 서비스
 * 읽기/쓰기 모두 하나의 Apps Script 엔드포인트로 처리
 */

import { Student, DayOfWeek } from '../types';
import AsyncStorage from '../utils/storage';

const WEBHOOK_URL_KEY = '@apps_script_url';

// 기본 Apps Script URL (새로 배포한 URL로 변경)
const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyPmA80LqUB3WKW5mApPt8utHdIlX-2pXKvXgdK9dZ9acLlgZMeAB_mbujBFqjw1Lu3/exec';

/**
 * Apps Script URL 가져오기
 */
const getScriptUrl = async (): Promise<string> => {
  try {
    const saved = await AsyncStorage.getItem(WEBHOOK_URL_KEY);
    return saved || DEFAULT_SCRIPT_URL;
  } catch (error) {
    return DEFAULT_SCRIPT_URL;
  }
};

/**
 * Apps Script URL 저장
 */
export const saveScriptUrl = async (url: string): Promise<void> => {
  await AsyncStorage.setItem(WEBHOOK_URL_KEY, url);
};

/**
 * 모든 학생 데이터 가져오기 (GET 요청)
 */
export const fetchAllStudents = async (): Promise<Student[]> => {
  try {
    const url = await getScriptUrl();
    const fetchUrl = `${url}?action=getAll&t=${Date.now()}`; // 캐시 방지

    console.log('Fetching students from:', fetchUrl);

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '데이터 로드 실패');
    }

    console.log('Loaded students:', result.data.length);
    return result.data;

  } catch (error: any) {
    console.error('Failed to fetch students:', error);
    throw new Error(error.message || '학생 데이터를 불러올 수 없습니다.');
  }
};

/**
 * 메모 가져오기 (GET 요청)
 */
export const getMemoFromSheet = async (day: DayOfWeek): Promise<string> => {
  try {
    const url = await getScriptUrl();
    const fetchUrl = `${url}?action=getMemo&day=${day}&t=${Date.now()}`;

    console.log('Fetching memo from:', fetchUrl);

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '메모 로드 실패');
    }

    return result.data.memo || '';

  } catch (error: any) {
    console.error('Failed to fetch memo:', error);
    return '';
  }
};

/**
 * POST 요청 헬퍼
 */
const postToScript = async (data: any): Promise<string> => {
  try {
    const url = await getScriptUrl();

    console.log('Posting to Apps Script:', data);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || '작업 실패');
    }

    return result.message || '완료';

  } catch (error: any) {
    console.error('POST request failed:', error);
    throw new Error(error.message || '작업 실패');
  }
};

/**
 * 학생 추가
 */
export const addStudentToSheet = async (
  studentName: string,
  route: string,
  station: string,
  time: string,
  day: DayOfWeek
): Promise<string> => {
  return await postToScript({
    action: 'add',
    studentName,
    route,
    station,
    time,
    day,
  });
};

/**
 * 학생 제거
 */
export const removeStudentFromSheet = async (
  studentName: string,
  route?: string,
  day?: DayOfWeek
): Promise<string> => {
  return await postToScript({
    action: 'remove',
    studentName,
    day,
  });
};

/**
 * 학생 정보 수정
 */
export const updateStudentInSheet = async (
  studentName: string,
  updates: {
    station?: string;
    time?: string;
    route?: string;
    day?: DayOfWeek;
  }
): Promise<string> => {
  return await postToScript({
    action: 'update',
    studentName,
    ...updates,
  });
};

/**
 * 학생 상태 업데이트 (결석, 시간변경, 직접등원)
 */
export const updateStudentStatus = async (
  studentName: string,
  status: string | null,
  day: DayOfWeek
): Promise<string> => {
  return await postToScript({
    action: 'updateStatus',
    studentName,
    status: status || '',
    day,
  });
};

/**
 * 메모 저장
 */
export const saveMemoToSheet = async (day: DayOfWeek, memo: string): Promise<string> => {
  return await postToScript({
    action: 'saveMemo',
    day,
    memo,
  });
};
