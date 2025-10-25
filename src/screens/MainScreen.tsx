import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { DaySelector } from '../components/DaySelector';
import { RouteSelector } from '../components/RouteSelector';
import { StudentList } from '../components/StudentList';

export const MainScreen: React.FC = () => {
  const [memo1, setMemo1] = useState('');
  const [memo2, setMemo2] = useState('');

  return (
    <View style={styles.container}>
      {/* 제목 */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>탑승관리</Text>
      </View>

      {/* 요일 선택 */}
      <DaySelector />

      {/* 노선 선택 */}
      <RouteSelector />

      {/* 메모 입력 영역 (2칸) */}
      <View style={styles.memoRow}>
        <View style={[styles.memoCell, styles.memoCellLeft]}>
          <TextInput
            style={styles.memoInput}
            value={memo1}
            onChangeText={setMemo1}
            placeholder="메모를 입력하세요"
            placeholderTextColor="#999"
          />
        </View>
        <View style={styles.memoCell}>
          <TextInput
            style={styles.memoInput}
            value={memo2}
            onChangeText={setMemo2}
            placeholder="(메모2가)"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* 학생 목록 */}
      <StudentList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  titleContainer: {
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  memoRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  memoCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  memoCellLeft: {
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  memoInput: {
    fontSize: 14,
    color: '#333',
    padding: 0,
  },
});
