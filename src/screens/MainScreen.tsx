import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Text, Modal } from 'react-native';
import { DaySelector } from '../components/DaySelector';
import { RouteSelector } from '../components/RouteSelector';
import { StudentList } from '../components/StudentList';
import { SettingsScreen } from './SettingsScreen';
import { useApp } from '../context/AppContext';

export const MainScreen: React.FC = () => {
  const { memo, setMemo, saveMemo } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEditToggle = () => {
    console.log('=== EDIT BUTTON CLICKED ===');
    console.log('Current isEditMode:', isEditMode);
    console.log('Will change to:', !isEditMode);
    setIsEditMode(!isEditMode);
  };

  // 메모 변경 시 자동 저장 (debounce 1초)
  const handleMemoChange = (text: string) => {
    setMemo(text);

    // 기존 타이머 취소
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // 1초 후 저장
    saveTimeoutRef.current = setTimeout(() => {
      saveMemo().catch((error) => {
        console.error('메모 자동 저장 실패:', error);
      });
    }, 1000);
  };

  // 컴포넌트 unmount 시 타이머 정리
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* 제목 */}
      <View style={styles.titleContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditToggle}
        >
          <Text style={styles.editButtonText}>
            {isEditMode ? '완료' : '추가삭제'}
          </Text>
        </TouchableOpacity>
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
            onChangeText={handleMemoChange}
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
      <StudentList isEditMode={isEditMode} />

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
  editButton: {
    position: 'absolute',
    left: 16,
    padding: 4,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
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
