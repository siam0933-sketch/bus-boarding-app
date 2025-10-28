/**
 * Google Apps Script 웹훅 서비스
 * Google Sheets에 데이터를 추가/수정/삭제합니다
 */

import AsyncStorage from '../utils/storage';

const WEBHOOK_URL_KEY = '@apps_script_webhook_url';

// 기본 웹훅 URL (보안 주의: GitHub에 공개됨)
const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbzMYffx03UjnqlQxqvACcxuXYh_lG238iPvz8UkuYj5ko3NNUK71E1GWfoSx8icglmh/exec';

/**
 * 저장된 웹훅 URL 가져오기
 */
export const getWebhookUrl = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(WEBHOOK_URL_KEY);
  } catch (error) {
    console.error('Failed to get webhook URL:', error);
    return null;
  }
};

/**
 * 웹훅 URL 저장
 */
export const saveWebhookUrl = async (url: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(WEBHOOK_URL_KEY, url);
  } catch (error) {
    console.error('Failed to save webhook URL:', error);
    throw error;
  }
};

/**
 * 웹훅 호출
 */
const callWebhook = async (data: any): Promise<any> => {
  // 항상 최신 DEFAULT_WEBHOOK_URL 사용 (설정보다 우선)
  const webhookUrl = DEFAULT_WEBHOOK_URL;
  console.log('Using webhook URL:', webhookUrl);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Google Sheets 업데이트 실패');
    }

    return result;
  } catch (error: any) {
    console.error('Webhook call failed:', error);
    throw new Error(error.message || 'Google Sheets 업데이트 실패');
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
  day: string
): Promise<string> => {
  const result = await callWebhook({
    action: 'add',
    studentName,
    route,
    station,
    time,
    day,
  });

  return result.message || '학생이 추가되었습니다.';
};

/**
 * 학생 제거
 */
export const removeStudentFromSheet = async (
  studentName: string,
  route?: string,
  day?: string
): Promise<string> => {
  const result = await callWebhook({
    action: 'remove',
    studentName,
    route,
    day,
  });

  return result.message || '학생이 제거되었습니다.';
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
    day?: string;
  }
): Promise<string> => {
  const result = await callWebhook({
    action: 'update',
    studentName,
    ...updates,
  });

  return result.message || '학생 정보가 수정되었습니다.';
};

/**
 * 학생 상태 업데이트 (결석, 시간변경, 직접등원)
 */
export const updateStudentStatus = async (
  studentName: string,
  status: string | null,
  day: string
): Promise<string> => {
  const result = await callWebhook({
    action: 'updateStatus',
    studentName,
    status: status || '',
    day,
  });

  return result.message || '학생 상태가 업데이트되었습니다.';
};

/**
 * 메모 가져오기
 */
export const getMemoFromSheet = async (day: string): Promise<string> => {
  const result = await callWebhook({
    action: 'getMemo',
    day,
  });

  return result.data?.memo || '';
};

/**
 * 메모 저장
 */
export const saveMemoToSheet = async (day: string, memo: string): Promise<string> => {
  const result = await callWebhook({
    action: 'saveMemo',
    day,
    memo,
  });

  return result.message || '메모가 저장되었습니다.';
};
