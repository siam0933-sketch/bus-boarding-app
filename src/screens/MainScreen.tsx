import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Modal } from 'react-native';
import { DaySelector } from '../components/DaySelector';
import { RouteSelector } from '../components/RouteSelector';
import { StudentList } from '../components/StudentList';
import { SettingsScreen } from './SettingsScreen';

export const MainScreen: React.FC = () => {
  const [memo, setMemo] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);

  return (
    <View style={styles.container}>
      {/* 제목 */}
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>탑승관리</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => setSettingsVisible(true)}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* 요일 선택 */}
      <DaySelector />

      {/* 노선 선택 */}
      <RouteSelector />

      {/* 메모 입력 영역 */}
      <View style={styles.memoRow}>
        <View style={styles.memoCell}>
          <TextInput
            style={[styles.memoInput, isExpanded && styles.memoInputExpanded]}
            value={memo}
            onChangeText={setMemo}
            placeholder="메모를 입력하세요"
            placeholderTextColor="#999"
            multiline={isExpanded}
            numberOfLines={isExpanded ? 5 : 1}
          />
        </View>
        <TouchableOpacity
          style={styles.expandButton}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <Text style={styles.expandButtonText}>
            {isExpanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 학생 목록 */}
      <StudentList />

      {/* 설정 모달 */}
      <Modal
        visible={settingsVisible}
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <SettingsScreen onClose={() => setSettingsVisible(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    position: 'relative',
  },
  titleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  settingsButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  settingsIcon: {
    fontSize: 24,
  },
  memoRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    alignItems: 'stretch',
  },
  memoCell: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  memoInput: {
    fontSize: 14,
    color: '#333',
    padding: 0,
    textAlignVertical: 'top',
  },
  memoInputExpanded: {
    minHeight: 100,
  },
  expandButton: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  expandButtonText: {
    fontSize: 18,
    color: '#000',
    fontWeight: 'bold',
  },
});
