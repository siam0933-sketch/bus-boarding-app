import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text, Modal, TextInput, Alert } from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import { useApp } from '../context/AppContext';
import { Student } from '../types';
import { addStudentToSheet, removeStudentFromSheet, updateStudentInSheet } from '../services/sheetsWebhook';

interface StudentListProps {
  isEditMode: boolean;
}

export const StudentList: React.FC<StudentListProps> = ({ isEditMode }) => {
  const { filteredStudents, boardingRecords, studentStatuses, toggleBoarding, setStudentStatus, resetBoardingRecords, loading, selectedRoute, selectedDay, addStudent, removeStudent, updateStudent, refreshStudents } = useApp();
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // 편집 모드용 로컬 학생 데이터
  const [editableStudents, setEditableStudents] = useState<Student[]>([]);
  const [originalStudents, setOriginalStudents] = useState<Student[]>([]);
  const prevEditMode = useRef(isEditMode);

  // 노선이나 요일이 변경되면 스크롤을 맨 위로
  useEffect(() => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  }, [selectedRoute, selectedDay]);

  // 편집 모드 진입 시 로컬 데이터 초기화
  useEffect(() => {
    if (isEditMode && !prevEditMode.current) {
      // 편집 모드 진입
      setEditableStudents([...filteredStudents]);
      setOriginalStudents([...filteredStudents]);
    } else if (!isEditMode && prevEditMode.current) {
      // 편집 모드 종료 - 저장 처리
      saveEditedStudents();
    }
    prevEditMode.current = isEditMode;
  }, [isEditMode]);

  // 편집된 학생 데이터 저장
  const saveEditedStudents = async () => {
    try {
      // 빈 학생 (이름이 없는 행) 제거
      const validStudents = editableStudents.filter(s => s.name.trim() !== '');

      // 삭제된 학생 찾기 (원본에는 있지만 편집본에는 없는 학생)
      const deletedStudents = originalStudents.filter(
        original => !validStudents.some(edited => edited.id === original.id)
      );

      // 추가된 학생 찾기 (temp- ID를 가진 학생)
      const addedStudents = validStudents.filter(s => s.id.startsWith('temp-'));

      // 수정된 학생 찾기 (ID는 같지만 내용이 다른 학생)
      const updatedStudents = validStudents.filter(edited => {
        if (edited.id.startsWith('temp-')) return false;
        const original = originalStudents.find(o => o.id === edited.id);
        if (!original) return false;
        return original.name !== edited.name ||
               original.station !== edited.station ||
               original.expectedTime !== edited.expectedTime;
      });

      // 변경사항이 없으면 알림 후 종료
      if (deletedStudents.length === 0 && addedStudents.length === 0 && updatedStudents.length === 0) {
        Alert.alert('알림', '변경된 내용이 없습니다.');
        return;
      }

      // Google Sheets 업데이트
      let messages: string[] = [];
      let errors: string[] = [];

      // 삭제 처리
      for (const student of deletedStudents) {
        try {
          await removeStudentFromSheet(student.name, student.route, selectedDay);
          removeStudent(student.name, student.route, selectedDay);
          messages.push(`✓ ${student.name} 삭제`);
        } catch (e: any) {
          console.error('Delete failed:', e);
          errors.push(`✗ ${student.name} 삭제 실패: ${e.message}`);
        }
      }

      // 추가 처리
      for (const student of addedStudents) {
        try {
          await addStudentToSheet(
            student.name,
            student.route,
            student.station,
            student.expectedTime,
            selectedDay
          );
          addStudent({
            name: student.name,
            route: student.route,
            station: student.station,
            expectedTime: student.expectedTime,
            days: [selectedDay],
            grade: '',
            contact: '',
          });
          messages.push(`✓ ${student.name} 추가`);
        } catch (e: any) {
          console.error('Add failed:', e);
          errors.push(`✗ ${student.name} 추가 실패: ${e.message}`);
        }
      }

      // 수정 처리
      for (const student of updatedStudents) {
        try {
          await updateStudentInSheet(student.name, {
            station: student.station,
            time: student.expectedTime,
            route: student.route,
            day: selectedDay,
          });
          updateStudent(student.name, {
            station: student.station,
            expectedTime: student.expectedTime,
            route: student.route,
          });
          messages.push(`✓ ${student.name} 수정`);
        } catch (e: any) {
          console.error('Update failed:', e);
          errors.push(`✗ ${student.name} 수정 실패: ${e.message}`);
        }
      }

      // 결과 표시
      const allMessages = [...messages, ...errors];
      if (allMessages.length > 0) {
        const title = errors.length > 0 ? '변경 완료 (일부 오류)' : '변경 완료';
        Alert.alert(title, allMessages.join('\n'));
        // Google Sheets에서 최신 데이터 다시 로드
        await refreshStudents();
      }
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('오류', `저장 중 오류가 발생했습니다:\n${error.message}`);
    }
  };

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

  const handleStatusSelect = (status: '결석' | '시간변경' | '직접등원') => {
    if (selectedStudentId) {
      setStudentStatus(selectedStudentId, status);
    }
    setMenuVisible(false);
    setSelectedStudentId(null);
  };

  // 상태별 색상 가져오기
  const getStatusColor = (status: string | null): string => {
    switch (status) {
      case '결석':
        return '#FFB3BA'; // 핑크 파스텔
      case '시간변경':
        return '#FFFFBA'; // 옐로우 파스텔
      case '직접등원':
        return '#BAE1FF'; // 블루 파스텔
      default:
        return '#ffffff';
    }
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

  // 편집 모드: + 버튼 클릭 시 빈 행 추가
  const handleAddStudent = (index: number) => {
    const newStudent: Student = {
      id: `temp-${Date.now()}`,
      name: '',
      station: '',
      expectedTime: '',
      route: selectedRoute,
      days: [selectedDay],
      grade: '',
      contact: '',
    };
    const newStudents = [...editableStudents];
    newStudents.splice(index + 1, 0, newStudent);
    setEditableStudents(newStudents);
  };

  // 편집 모드: 학생 정보 수정
  const handleStudentChange = (index: number, field: keyof Student, value: string) => {
    const newStudents = [...editableStudents];
    newStudents[index] = {
      ...newStudents[index],
      [field]: value,
    };
    setEditableStudents(newStudents);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Google Sheets에서 데이터를 불러오는 중...</Text>
      </View>
    );
  }

  // 편집 모드 렌더링
  if (isEditMode) {
    return (
      <View style={styles.container}>
        <ScrollView ref={scrollViewRef} style={styles.scrollView}>
          {/* 첫 번째 학생 위에 + 버튼 */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddStudent(-1)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>

          {editableStudents.map((student, index) => (
            <View key={student.id}>
              <View style={styles.studentRow}>
                <View style={styles.timeCell}>
                  <TextInput
                    style={styles.editInput}
                    value={student.expectedTime}
                    onChangeText={(value) => handleStudentChange(index, 'expectedTime', value)}
                    placeholder="시간"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.stationCell}>
                  <TextInput
                    style={styles.editInput}
                    value={student.station}
                    onChangeText={(value) => handleStudentChange(index, 'station', value)}
                    placeholder="정류장"
                    placeholderTextColor="#999"
                  />
                </View>
                <View style={styles.nameCell}>
                  <TextInput
                    style={styles.editInput}
                    value={student.name}
                    onChangeText={(value) => handleStudentChange(index, 'name', value)}
                    placeholder="이름"
                    placeholderTextColor="#999"
                  />
                </View>
              </View>
              {/* 각 학생 아래 + 버튼 */}
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => handleAddStudent(index)}
              >
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // 일반 모드 렌더링
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
          filteredStudents.map((student) => {
            const boarded = isBoarded(student.id);
            const status = getStudentStatus(student.id);
            const statusColor = status ? getStatusColor(status) : null;

            return (
              <TouchableOpacity
                key={student.id}
                onPress={() => toggleBoarding(student.id)}
                style={styles.studentRow}
              >
                <View style={[
                  styles.timeCell,
                  boarded && styles.cellBoarded,
                  statusColor && { backgroundColor: statusColor }
                ]}>
                  <Text style={[styles.timeText, boarded && styles.cellTextBoarded]}>
                    {formatTime(student.expectedTime)}
                  </Text>
                </View>
                <View style={[
                  styles.stationCell,
                  boarded && styles.cellBoarded,
                  statusColor && { backgroundColor: statusColor }
                ]}>
                  <Text
                    style={[styles.cellText, boarded && styles.cellTextBoarded]}
                    adjustsFontSizeToFit={true}
                    numberOfLines={1}
                  >
                    {student.station}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.nameCell,
                    boarded && styles.cellBoarded,
                    statusColor && { backgroundColor: statusColor }
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
                    {status && (
                      <Text style={styles.statusText}>
                        {status}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })
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
              onPress={() => handleStatusSelect('시간변경')}
            >
              <Text style={styles.menuItemText}>시간변경</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleStatusSelect('직접등원')}
            >
              <Text style={styles.menuItemText}>직접등원</Text>
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
  studentRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  timeCell: {
    width: 80,
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  stationCell: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  nameCell: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
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
  editInput: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    padding: 0,
    width: '100%',
  },
  addButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
  },
});
