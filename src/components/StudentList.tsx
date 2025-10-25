import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Text } from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import { useApp } from '../context/AppContext';

export const StudentList: React.FC = () => {
  const { filteredStudents, boardingRecords, toggleBoarding, resetBoardingRecords, loading } = useApp();

  const isBoarded = (studentId: string): boolean => {
    const record = boardingRecords.find((r) => r.studentId === studentId);
    return record?.isBoarded || false;
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
      <ScrollView style={styles.scrollView}>
        {filteredStudents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              이 요일과 노선에 등록된 학생이 없습니다.
            </Text>
          </View>
        ) : (
          filteredStudents.map((student) => {
            const boarded = isBoarded(student.id);
            return (
              <TouchableOpacity
                key={student.id}
                onPress={() => toggleBoarding(student.id)}
                style={styles.studentRow}
              >
                <View style={[styles.timeCell, boarded && styles.cellBoarded]}>
                  <Text style={[styles.cellText, boarded && styles.cellTextBoarded]}>
                    {formatTime(student.expectedTime)}
                  </Text>
                </View>
                <View style={[styles.stationCell, boarded && styles.cellBoarded]}>
                  <Text style={[styles.cellText, boarded && styles.cellTextBoarded]}>
                    {student.station}
                  </Text>
                </View>
                <View style={[styles.nameCell, boarded && styles.cellBoarded]}>
                  <Text style={[styles.cellText, boarded && styles.cellTextBoarded]}>
                    {student.name}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

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
    width: 110,
    paddingVertical: 21,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  stationCell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  nameCell: {
    flex: 1,
    paddingVertical: 21,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  cellBoarded: {
    backgroundColor: '#90EE90',
  },
  cellText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
  },
  cellTextBoarded: {
    fontWeight: 'bold',
    color: '#000',
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
