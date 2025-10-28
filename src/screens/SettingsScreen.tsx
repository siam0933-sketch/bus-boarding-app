import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '../utils/storage';
import { saveScriptUrl } from '../services/simpleAppsScript';

const SCRIPT_URL_KEY = '@apps_script_url';

// 기본 Apps Script URL (보안 주의: GitHub에 공개됨)
const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyPmA80LqUB3WKW5mApPt8utHdIlX-2pXKvXgdK9dZ9acLlgZMeAB_mbujBFqjw1Lu3/exec';

export const SettingsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [scriptUrl, setScriptUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const url = await AsyncStorage.getItem(SCRIPT_URL_KEY);
      setScriptUrl(url || DEFAULT_SCRIPT_URL);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUrl = async () => {
    if (!scriptUrl.trim()) {
      setSaveMessage('❌ Apps Script URL을 입력해주세요.');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    try {
      await saveScriptUrl(scriptUrl.trim());
      setSaveMessage('✅ URL이 저장되었습니다! 앱을 새로고침하세요.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save URL:', error);
      setSaveMessage('❌ URL 저장에 실패했습니다.');
      setTimeout(() => setSaveMessage(''), 3000);
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

      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Google Apps Script 연결</Text>

            <Text style={styles.label}>Apps Script URL</Text>
            <Text style={styles.description}>
              Google Apps Script 웹 앱 URL을 입력하세요.
              {'\n'}이 URL 하나로 읽기/쓰기를 모두 처리합니다.
            </Text>
            <TextInput
              style={styles.input}
              value={scriptUrl}
              onChangeText={setScriptUrl}
              placeholder="https://script.google.com/macros/s/..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveUrl}>
              <Text style={styles.saveButtonText}>저장</Text>
            </TouchableOpacity>

            {saveMessage !== '' && (
              <View style={styles.saveMessageBox}>
                <Text style={styles.saveMessageText}>{saveMessage}</Text>
              </View>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 설정 방법</Text>
              <Text style={styles.infoText}>
                1. Google Sheets 열기{'\n'}
                2. 확장 프로그램 {'>'} Apps Script{'\n'}
                3. APPS_SCRIPT_SIMPLE.md 파일의 코드 복사{'\n'}
                4. 배포 {'>'} 새 배포 {'>'} 웹 앱{'\n'}
                5. "모든 사용자" 권한으로 배포{'\n'}
                6. 받은 URL을 여기에 입력
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
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
    lineHeight: 20,
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
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveMessageBox: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  saveMessageText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#f5f5e9',
    padding: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0a0',
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
