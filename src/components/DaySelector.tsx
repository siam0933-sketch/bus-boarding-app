import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { DayOfWeek } from '../types';
import { useApp } from '../context/AppContext';

const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금', '토', '일'];

export const DaySelector: React.FC = () => {
  const { selectedDay, setSelectedDay } = useApp();

  return (
    <View style={styles.container}>
      {DAYS.map((day, index) => {
        const isSelected = selectedDay === day;
        const isLast = index === DAYS.length - 1;
        return (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(day)}
            style={[
              styles.dayCell,
              !isLast && styles.dayCellBorder,
              isSelected && styles.daySelected,
            ]}
          >
            <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
              {day}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  dayCell: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  dayCellBorder: {
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  daySelected: {
    backgroundColor: '#FFE082',
  },
  dayText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  dayTextSelected: {
    fontWeight: 'bold',
    color: '#000',
  },
});
