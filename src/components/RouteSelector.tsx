import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useApp } from '../context/AppContext';

export const RouteSelector: React.FC = () => {
  const { selectedRoute, setSelectedRoute, routes } = useApp();

  return (
    <View style={styles.container}>
      {routes.map((route, index) => {
        const isSelected = selectedRoute === route.id;
        const isLast = index === routes.length - 1;
        return (
          <TouchableOpacity
            key={route.id}
            onPress={() => setSelectedRoute(route.id)}
            style={[
              styles.routeCell,
              !isLast && styles.routeCellBorder,
              isSelected && styles.routeSelected,
            ]}
          >
            <Text style={[styles.routeText, isSelected && styles.routeTextSelected]}>
              {route.name}
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
  routeCell: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  routeCellBorder: {
    borderRightWidth: 1,
    borderRightColor: '#000',
  },
  routeSelected: {
    backgroundColor: '#ADD8E6',
  },
  routeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  routeTextSelected: {
    fontWeight: 'bold',
    color: '#000',
  },
});
