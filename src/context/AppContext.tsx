import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Student, DayOfWeek, BoardingRecord, Route } from '../types';
import { fetchAllStudents } from '../services/googleSheets';

interface AppContextType {
  students: Student[];
  selectedDay: DayOfWeek;
  selectedRoute: string;
  boardingRecords: BoardingRecord[];
  setSelectedDay: (day: DayOfWeek) => void;
  setSelectedRoute: (routeId: string) => void;
  toggleBoarding: (studentId: string) => void;
  resetBoardingRecords: () => void;
  filteredStudents: Student[];
  routes: Route[];
  loading: boolean;
  refreshStudents: () => Promise<void>;
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
  const [loading, setLoading] = useState<boolean>(true);

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

  // 앱 시작 시 데이터 로드
  useEffect(() => {
    refreshStudents();
  }, []);

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

  // 탑승 기록 초기화
  const resetBoardingRecords = () => {
    setBoardingRecords([]);
  };

  return (
    <AppContext.Provider
      value={{
        students,
        selectedDay,
        selectedRoute,
        boardingRecords,
        setSelectedDay,
        setSelectedRoute,
        toggleBoarding,
        resetBoardingRecords,
        filteredStudents,
        routes,
        loading,
        refreshStudents,
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
