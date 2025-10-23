import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
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

  // 시간/정류장으로 그룹화
  const groupedStudents = filteredStudents.reduce((acc, student) => {
    const key = `${student.expectedTime}-${student.station}`;
    if (!acc[key]) {
      acc[key] = {
        time: student.expectedTime,
        station: student.station,
        students: [],
      };
    }
    acc[key].students.push(student);
    return acc;
  }, {} as Record<string, { time: string; station: string; students: typeof filteredStudents }>);

  const groups = Object.values(groupedStudents);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {groups.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text variant="bodyLarge" style={styles.emptyText}>
              이 요일과 노선에 등록된 학생이 없습니다.
            </Text>
          </View>
        ) : (
          groups.map((group, groupIndex) => (
            <View key={groupIndex} style={styles.groupCard}>
              {/* 시간 */}
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(group.time)}</Text>
              </View>

              {/* 정류장과 탑승자를 좌우로 배치 */}
              <View style={styles.contentRow}>
                {/* 정류장 (왼쪽) */}
                <View style={styles.stationColumn}>
                  <Text style={styles.stationText}>{group.station}</Text>
                </View>

                {/* 탑승자들 (오른쪽, 세로 배열) */}
                <View style={styles.namesColumn}>
                  {group.students.map((student) => {
                    const boarded = isBoarded(student.id);
                    return (
                      <TouchableOpacity
                        key={student.id}
                        style={[
                          styles.nameButton,
                          boarded && styles.nameBoardedButton,
                        ]}
                        onPress={() => toggleBoarding(student.id)}
                      >
                        <Text style={[
                          styles.nameText,
                          boarded && styles.nameBoardedText,
                        ]}>
                          {student.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {groups.length > 0 && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={resetBoardingRecords}
            style={styles.resetButton}
            buttonColor="#2196F3"
          >
            탑승기록 완료
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    padding: 16,
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
  groupCard: {
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  timeRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  contentRow: {
    flexDirection: 'row',
    minHeight: 80,
  },
  stationColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  stationText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  namesColumn: {
    flex: 1,
    padding: 12,
    gap: 8,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  nameButton: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
  },
  nameBoardedButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
    elevation: 2,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  nameText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  nameBoardedText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  resetButton: {
    paddingVertical: 8,
    borderRadius: 12,
  },
});
