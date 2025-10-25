import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { useApp } from '../context/AppContext';

export const RouteSelector: React.FC = () => {
  const { selectedRoute, setSelectedRoute, routes } = useApp();

  const buttons = routes.map((route) => ({
    value: route.id,
    label: route.name,
  }));

  return (
    <View style={styles.container}>
      <SegmentedButtons
        value={selectedRoute}
        onValueChange={setSelectedRoute}
        buttons={buttons}
        style={styles.segmentedButtons}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  segmentedButtons: {
    width: '100%',
  },
});
