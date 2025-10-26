import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '../utils/storage';

const SHEET_URL_KEY = '@sheet_url';

export const SettingsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSheetUrl();
  }, []);

  const loadSheetUrl = async () => {
    try {
      const url = await AsyncStorage.getItem(SHEET_URL_KEY);
      if (url) {
        setSheetUrl(url);
      }
    } catch (error) {
      console.error('Failed to load sheet URL:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSheetUrl = async () => {
    if (!sheetUrl.trim()) {
      Alert.alert('오류', 'Google Sheets URL을 입력해주세요.');
      return;
    }

    try {
      await AsyncStorage.setItem(SHEET_URL_KEY, sheetUrl.trim());
      Alert.alert('성공', 'Google Sheets URL이 저장되었습니다.\n앱을 재시작해주세요.', [
        { text: '확인', onPress: onClose }
      ]);
    } catch (error) {
      console.error('Failed to save sheet URL:', error);
      Alert.alert('오류', 'URL 저장에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>설정</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.label}>Google Sheets URL</Text>
        <Text style={styles.description}>
          공유된 Google Sheets의 URL을 입력하세요
        </Text>
        <TextInput
          style={styles.input}
          value={sheetUrl}
          onChangeText={setSheetUrl}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          placeholderTextColor="#999"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <TouchableOpacity style={styles.saveButton} onPress={saveSheetUrl}>
          <Text style={styles.saveButtonText}>저장</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>💡 사용 방법</Text>
          <Text style={styles.infoText}>
            1. Google Sheets를 공유 설정하세요{'\n'}
            2. URL 전체를 복사하여 붙여넣으세요{'\n'}
            3. 저장 후 앱을 재시작하세요
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#000',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 4,
    padding: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#ffffff',
    minHeight: 80,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoBox: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#666',
  },
});
