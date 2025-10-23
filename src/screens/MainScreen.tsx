import React, { useState } from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { DaySelector } from '../components/DaySelector';
import { RouteSelector } from '../components/RouteSelector';
import { StudentList } from '../components/StudentList';

export const MainScreen: React.FC = () => {
  const [memo, setMemo] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.container}>
      {/* 메모 입력 영역 */}
      <View style={styles.memoContainer}>
        <View style={styles.memoInputContainer}>
          <TextInput
            style={[
              styles.memoInput,
              isExpanded && styles.memoInputExpanded,
            ]}
            value={memo}
            onChangeText={setMemo}
            placeholder="메모를 입력하세요..."
            multiline={isExpanded}
            numberOfLines={isExpanded ? 5 : 1}
            placeholderTextColor="#999"
          />
          <IconButton
            icon={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={24}
            onPress={() => setIsExpanded(!isExpanded)}
            style={styles.expandButton}
          />
        </View>
      </View>

      <DaySelector />
      <RouteSelector />
      <StudentList />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  memoContainer: {
    backgroundColor: '#ffffff',
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  memoInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingLeft: 16,
    overflow: 'hidden',
  },
  memoInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 14,
    paddingRight: 8,
    color: '#333',
    minHeight: 50,
    fontFamily: 'System',
  },
  memoInputExpanded: {
    minHeight: 140,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  expandButton: {
    margin: 0,
    marginTop: 4,
  },
});
