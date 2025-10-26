import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Modal } from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import { useApp } from '../context/AppContext';

const ROW_HEIGHT = 66; // 행 높이 상수 (nameCell paddingVertical 21*2 + fontSize 23 + borderBottom 1)

export const StudentList: React.FC = () => {
  const { filteredStudents, boardingRecords, studentStatuses, toggleBoarding, setStudentStatus, resetBoardingRecords, loading, selectedRoute, selectedDay } = useApp();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // 노선이나 요일이 변경되면 스크롤을 맨 위로
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [selectedRoute, selectedDay]);

  const isBoarded = (studentId: string): boolean => {
    const record = boardingRecords.find((r) => r.studentId === studentId);
    return record?.isBoarded || false;
  };

  const getStudentStatus = (studentId: string): string | null => {
    const status = studentStatuses.find((s) => s.studentId === studentId);
    return status?.status || null;
  };

  const handleLongPress = (studentId: string) => {
    setSelectedStudentId(studentId);
    setMenuVisible(true);
  };

  const handleStatusSelect = (status: '결석' | '변경' | '직접') => {
    if (selectedStudentId) {
      setStudentStatus(selectedStudentId, status);
    }
    setMenuVisible(false);
    setSelectedStudentId(null);
  };

  // 같은 정류장과 시간의 첫 번째 학생인지 확인
  const isFirstInGroup = (currentIndex: number): boolean => {
    if (currentIndex === 0) return true;

    const currentStudent = filteredStudents[currentIndex];
    const previousStudent = filteredStudents[currentIndex - 1];

    return currentStudent.station !== previousStudent.station ||
           currentStudent.expectedTime !== previousStudent.expectedTime;
  };

  // 같은 정류장과 시간 그룹의 학생 수 계산
  const getGroupSize = (currentIndex: number): number => {
    const currentStudent = filteredStudents[currentIndex];
    let count = 1;

    // 같은 그룹의 이후 학생들 세기
    for (let i = currentIndex + 1; i < filteredStudents.length; i++) {
      const nextStudent = filteredStudents[i];
      if (nextStudent.station === currentStudent.station &&
          nextStudent.expectedTime === currentStudent.expectedTime) {
        count++;
      } else {
        break;
      }
    }

    return count;
  };

  // 그룹 내 모든 학생이 탑승했는지 확인
  const isGroupBoarded = (currentIndex: number): boolean => {
    const currentStudent = filteredStudents[currentIndex];

    // 현재 학생이 탑승하지 않았으면 false
    if (!isBoarded(currentStudent.id)) return false;

    // 같은 그룹의 이후 학생들 확인
    for (let i = currentIndex + 1; i < filteredStudents.length; i++) {
      const nextStudent = filteredStudents[i];
      if (nextStudent.station === currentStudent.station &&
          nextStudent.expectedTime === currentStudent.expectedTime) {
        if (!isBoarded(nextStudent.id)) return false;
      } else {
        break;
      }
    }

    return true;
  };

  // 그룹의 마지막 학생인지 확인
  const isLastInGroup = (currentIndex: number): boolean => {
    if (currentIndex === filteredStudents.length - 1) return true;

    const currentStudent = filteredStudents[currentIndex];
    const nextStudent = filteredStudents[currentIndex + 1];

    return currentStudent.station !== nextStudent.station ||
           currentStudent.expectedTime !== nextStudent.expectedTime;
  };

  // 시간 포맷팅 함수 (시:분만 표시)
  const formatTime = (time: string): string => {
    if (!time) return '';

    // 이미 HH:MM 형식이면 그대로 반환
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      return time;
    }

    // "15:00:00" 같은 형식이면 초 제거
    if (/^\d{1,2}:\d{2}:\d{2}$/.test(time)) {
      return time.substring(0, 5);
    }

    // 숫자만 있는 경우 (예: "1500" -> "15:00")
    if (/^\d{3,4}$/.test(time)) {
      const hours = time.length === 4 ? time.substring(0, 2) : time.substring(0, 1);
      const minutes = time.substring(time.length - 2);
      return `${hours}:${minutes}`;
    }

    return time;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Google Sheets에서 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.scrollView}>
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              이 요일과 노선에 등록된 학생이 없습니다.
            </Text>
          </View>
        ) : (
          <View>
            {filteredStudents.map((student, index) => {
              const boarded = isBoarded(student.id);
              const isFirst = isFirstInGroup(index);
              const isLast = isLastInGroup(index);
              const groupSize = isFirst ? getGroupSize(index) : 0;
              const mergedCellHeight = groupSize * ROW_HEIGHT;
              const groupBoarded = isFirst ? isGroupBoarded(index) : false;

              return (
                <View key={student.id} style={styles.rowWrapper}>
                  {isFirst && (
                    <>
                      <View style={[
                        styles.timeCell,
                        styles.mergedTimeCell,
                        groupBoarded && styles.cellBoarded,
                        { height: mergedCellHeight }
                      ]}>
                        <Text style={[styles.timeText, groupBoarded && styles.cellTextBoarded]}>
                          {formatTime(student.expectedTime)}
                        </Text>
                      </View>
                      <View style={[
                        styles.stationCell,
                        styles.mergedStationCell,
                        groupBoarded && styles.cellBoarded,
                        { height: mergedCellHeight }
                      ]}>
                        <Text
                          style={[styles.cellText, groupBoarded && styles.cellTextBoarded]}
                          adjustsFontSizeToFit={true}
                          numberOfLines={1}
                        >
                          {student.station}
                        </Text>
                      </View>
                    </>
                  )}
                  <View style={styles.studentRow}>
                    <View style={styles.timeCellPlaceholder} />
                    <View style={styles.stationCellPlaceholder} />
                    <TouchableOpacity
                      style={[
                        styles.nameCell,
                        boarded && styles.cellBoarded,
                        !isLast && styles.nameCellWithBorder,
                        isLast && styles.nameCellLastBorder
                      ]}
                      onPress={() => toggleBoarding(student.id)}
                      onLongPress={() => handleLongPress(student.id)}
                      delayLongPress={500}
                    >
                      <View>
                        <Text
                          style={[styles.cellText, boarded && styles.cellTextBoarded]}
                          adjustsFontSizeToFit={true}
                          numberOfLines={1}
                        >
                          {student.name}
                        </Text>
                        {getStudentStatus(student.id) && (
                          <Text style={styles.statusText}>
                            {getStudentStatus(student.id)}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* 상태 선택 팝업 메뉴 */}
      <Modal
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
        animationType="fade"
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleStatusSelect('결석')}
            >
              <Text style={styles.menuItemText}>결석</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleStatusSelect('변경')}
            >
              <Text style={styles.menuItemText}>변경</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleStatusSelect('직접')}
            >
              <Text style={styles.menuItemText}>직접</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {filteredStudents.length > 0 && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={resetBoardingRecords}
            style={styles.resetButton}
            buttonColor="#ffffff"
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
          >
            탑승 완료
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  rowWrapper: {
    position: 'relative',
  },
  studentRow: {
    flexDirection: 'row',
    minHeight: 66,
  },
  timeCell: {
    width: 80,
    paddingVertical: 14,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  mergedTimeCell: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 1,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  timeCellPlaceholder: {
    width: 80,
  },
  stationCell: {
    width: 150,
    paddingVertical: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  mergedStationCell: {
    position: 'absolute',
    left: 80,
    top: 0,
    zIndex: 1,
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  stationCellPlaceholder: {
    width: 150,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  nameCell: {
    flex: 1,
    paddingVertical: 21,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  nameCellWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  nameCellLastBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  cellBoarded: {
    backgroundColor: '#90EE90',
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  cellText: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#000',
  },
  cellTextBoarded: {
    fontWeight: 'bold',
    color: '#000',
  },
  statusText: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000',
    minWidth: 150,
    overflow: 'hidden',
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#000',
  },
  buttonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    backgroundColor: '#ffffff',
  },
  resetButton: {
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#000',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});
