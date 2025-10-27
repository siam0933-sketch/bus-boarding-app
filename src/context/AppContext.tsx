import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Student, DayOfWeek, BoardingRecord, Route } from '../types';
import { fetchAllStudents } from '../services/googleSheets';
import { getMemoFromSheet, saveMemoToSheet } from '../services/sheetsWebhook';

interface StudentStatus {
  studentId: string;
  status: '결석' | '시간변경' | '직접등원';
}

interface AppContextType {
  students: Student[];
  selectedDay: DayOfWeek;
  selectedRoute: string;
  boardingRecords: BoardingRecord[];
  studentStatuses: StudentStatus[];
  memo: string;
  setSelectedDay: (day: DayOfWeek) => void;
  setSelectedRoute: (routeId: string) => void;
  toggleBoarding: (studentId: string) => void;
  setStudentStatus: (studentId: string, status: '결석' | '시간변경' | '직접등원') => void;
  resetBoardingRecords: () => void;
  filteredStudents: Student[];
  routes: Route[];
  loading: boolean;
  refreshStudents: () => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => void;
  removeStudent: (studentName: string, route?: string, day?: DayOfWeek) => void;
  updateStudent: (studentName: string, updates: Partial<Student>) => void;
  setMemo: (memo: string) => void;
  saveMemo: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// 현재 요일 가져오기 함수
const getCurrentDay = (): DayOfWeek => {
  const dayIndex = new Date().getDay(); // 0(일) ~ 6(토)
  const dayMap: DayOfWeek[] = ['일', '월', '화', '수', '목', '금', '토'];
  return dayMap[dayIndex];
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getCurrentDay());
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [boardingRecords, setBoardingRecords] = useState<BoardingRecord[]>([]);
  const [studentStatuses, setStudentStatuses] = useState<StudentStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [memo, setMemoState] = useState<string>('');
  const [memoCache, setMemoCache] = useState<{ [key: string]: string }>({});

  // Google Sheets에서 학생 데이터 가져오기
  const refreshStudents = async () => {
    try {
      setLoading(true);
      const data = await fetchAllStudents();
      setStudents(data);
      console.log(`총 ${data.length}명의 학생 데이터를 불러왔습니다.`);
    } catch (error) {
      console.error('학생 데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 메모 로드
  const loadMemo = async (day: DayOfWeek) => {
    try {
      // 캐시에 있으면 캐시에서 가져오기
      if (memoCache[day]) {
        setMemoState(memoCache[day]);
        return;
      }

      // 없으면 서버에서 가져오기
      const memoText = await getMemoFromSheet(day);
      setMemoState(memoText);
      setMemoCache((prev) => ({ ...prev, [day]: memoText }));
    } catch (error) {
      console.error('메모 로드 실패:', error);
      setMemoState('');
    }
  };

  // 메모 저장
  const saveMemo = async () => {
    try {
      await saveMemoToSheet(selectedDay, memo);
      // 캐시 업데이트
      setMemoCache((prev) => ({ ...prev, [selectedDay]: memo }));
      console.log('메모 저장 완료');
    } catch (error) {
      console.error('메모 저장 실패:', error);
      throw error;
    }
  };

  // 메모 설정 (로컬 상태만 변경)
  const setMemo = (newMemo: string) => {
    setMemoState(newMemo);
  };

  // 앱 시작 시 데이터 로드
  useEffect(() => {
    refreshStudents();
  }, []);

  // 요일이 변경될 때 메모 로드
  useEffect(() => {
    loadMemo(selectedDay);
  }, [selectedDay]);

  // Google Sheets 데이터에서 노선 자동 감지
  const routes = useMemo(() => {
    // students에서 unique한 route 값 추출
    const uniqueRoutes = Array.from(new Set(students.map(s => s.route)))
      .filter(route => route) // 빈 값 제거
      .sort(); // 정렬

    return uniqueRoutes.map(route => ({ id: route, name: route }));
  }, [students]);

  // 첫 로드 시 또는 routes 변경 시 첫 번째 노선 선택
  useEffect(() => {
    if (routes.length > 0 && !selectedRoute) {
      setSelectedRoute(routes[0].id);
    }
  }, [routes, selectedRoute]);

  // 선택된 요일과 노선에 따라 학생 필터링
  const filteredStudents = students.filter(
    (student) =>
      student.days.includes(selectedDay) &&
      student.route === selectedRoute
  );

  // 탑승 기록 토글
  const toggleBoarding = (studentId: string) => {
    setBoardingRecords((prev) => {
      const existing = prev.find((record) => record.studentId === studentId);
      if (existing) {
        // 이미 기록이 있으면 토글
        return prev.map((record) =>
          record.studentId === studentId
            ? { ...record, isBoarded: !record.isBoarded }
            : record
        );
      } else {
        // 새로운 기록 추가
        return [...prev, { studentId, isBoarded: true }];
      }
    });
  };

  // 학생 상태 설정
  const setStudentStatus = (studentId: string, status: '결석' | '변경' | '직접') => {
    setStudentStatuses((prev) => {
      const existing = prev.find((s) => s.studentId === studentId);
      if (existing) {
        // 기존 상태 업데이트
        return prev.map((s) =>
          s.studentId === studentId ? { ...s, status } : s
        );
      } else {
        // 새로운 상태 추가
        return [...prev, { studentId, status }];
      }
    });
  };

  // 탑승 기록 초기화
  const resetBoardingRecords = () => {
    setBoardingRecords([]);
    setStudentStatuses([]);
  };

  // 학생 추가
  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: `manual-${Date.now()}-${Math.random()}`,
    };
    setStudents((prev) => [...prev, newStudent]);
    console.log('학생 추가:', newStudent);
  };

  // 학생 제거
  const removeStudent = (studentName: string, route?: string, day?: DayOfWeek) => {
    setStudents((prev) =>
      prev.filter((student) => {
        if (student.name !== studentName) return true;
        if (route && student.route !== route) return true;
        if (day && !student.days.includes(day)) return true;
        return false;
      })
    );
    console.log('학생 제거:', studentName, route, day);
  };

  // 학생 정보 수정
  const updateStudent = (studentName: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.name === studentName ? { ...student, ...updates } : student
      )
    );
    console.log('학생 정보 수정:', studentName, updates);
  };

  return (
    <AppContext.Provider
      value={{
        students,
        selectedDay,
        selectedRoute,
        boardingRecords,
        studentStatuses,
        memo,
        setSelectedDay,
        setSelectedRoute,
        toggleBoarding,
        setStudentStatus,
        resetBoardingRecords,
        filteredStudents,
        routes,
        loading,
        refreshStudents,
        addStudent,
        removeStudent,
        updateStudent,
        setMemo,
        saveMemo,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
