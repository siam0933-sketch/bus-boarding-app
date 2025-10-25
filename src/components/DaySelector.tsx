import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { DayOfWeek } from '../types';
import { useApp } from '../context/AppContext';

const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];

export const DaySelector: React.FC = () => {
  const { selectedDay, setSelectedDay } = useApp();

  return (
    <View style={styles.container}>
      <View style={styles.chipContainer}>
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          return (
            <Chip
              key={day}
              selected={isSelected}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.chip,
                isSelected && styles.selectedChip,
              ]}
              textStyle={[
                styles.chipText,
                isSelected && styles.selectedChipText,
              ]}
              mode="outlined"
            >
              {day}
            </Chip>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: '100%',
  },
  chip: {
    minWidth: 45,
    height: 45,
    flex: 0,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  selectedChip: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
    elevation: 2,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: '#666',
  },
  selectedChipText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
