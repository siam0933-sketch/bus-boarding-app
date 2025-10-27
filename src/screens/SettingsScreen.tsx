import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '../utils/storage';
import { executeAICommand, AIAction } from '../services/gemini';
import { useApp } from '../context/AppContext';
import { DayOfWeek } from '../types';

const SHEET_URL_KEY = '@sheet_url';
const GEMINI_API_KEY = '@gemini_api_key';

export const SettingsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addStudent, removeStudent, updateStudent } = useApp();
  const [sheetUrl, setSheetUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [aiCommand, setAiCommand] = useState('');
  const [aiProcessing, setAiProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const url = await AsyncStorage.getItem(SHEET_URL_KEY);
      const key = await AsyncStorage.getItem(GEMINI_API_KEY);
      if (url) setSheetUrl(url);
      if (key) setApiKey(key);
    } catch (error) {
      console.error('Failed to load settings:', error);
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

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      Alert.alert('오류', 'Gemini API 키를 입력해주세요.');
      return;
    }

    try {
      await AsyncStorage.setItem(GEMINI_API_KEY, apiKey.trim());
      Alert.alert('성공', 'API 키가 저장되었습니다.');
    } catch (error) {
      console.error('Failed to save API key:', error);
      Alert.alert('오류', 'API 키 저장에 실패했습니다.');
    }
  };

  const handleAICommand = async () => {
    if (!aiCommand.trim()) {
      Alert.alert('오류', '명령을 입력해주세요.');
      return;
    }

    if (!apiKey) {
      Alert.alert('오류', 'Gemini API 키를 먼저 저장해주세요.');
      return;
    }

    try {
      setAiProcessing(true);
      const action = await executeAICommand(aiCommand, apiKey);

      // Execute the action based on type
      switch (action.action) {
        case 'add':
          if (action.studentName && action.route) {
            addStudent({
              name: action.studentName,
              route: action.route,
              station: action.station || '',
              expectedTime: action.time || '',
              days: action.day ? [action.day as DayOfWeek] : ['월', '화', '수', '목', '금'],
              grade: '',
              contact: '',
            });
          }
          break;

        case 'remove':
          if (action.studentName) {
            removeStudent(action.studentName, action.route, action.day as DayOfWeek);
          }
          break;

        case 'update':
          if (action.studentName) {
            const updates: any = {};
            if (action.station) updates.station = action.station;
            if (action.time) updates.expectedTime = action.time;
            if (action.route) updates.route = action.route;
            updateStudent(action.studentName, updates);
          }
          break;
      }

      Alert.alert('성공', action.message || '명령이 실행되었습니다.');
      setAiCommand('');
    } catch (error: any) {
      Alert.alert('오류', error.message || 'AI 명령 실행에 실패했습니다.');
    } finally {
      setAiProcessing(false);
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
          {/* Google Sheets URL 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Google Sheets 연결</Text>
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
          </View>

          {/* Gemini API 키 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🤖 AI 기능 설정</Text>
            <Text style={styles.label}>Gemini API 키</Text>
            <Text style={styles.description}>
              Google AI Studio에서 발급받은 API 키를 입력하세요
            </Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={setApiKey}
              placeholder="AIza..."
              placeholderTextColor="#999"
              secureTextEntry
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveApiKey}>
              <Text style={styles.saveButtonText}>API 키 저장</Text>
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 API 키 발급 방법</Text>
              <Text style={styles.infoText}>
                1. https://aistudio.google.com 접속{'\n'}
                2. "Get API key" 클릭{'\n'}
                3. 발급받은 키를 복사하여 입력
              </Text>
            </View>
          </View>

          {/* AI 명령 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💬 AI 명령</Text>
            <Text style={styles.label}>명령 입력</Text>
            <Text style={styles.description}>
              자연어로 탑승 리스트 수정 명령을 입력하세요
            </Text>
            <TextInput
              style={[styles.input, styles.commandInput]}
              value={aiCommand}
              onChangeText={setAiCommand}
              placeholder="예: 김철수를 3시부 노선에 추가해줘"
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              editable={!aiProcessing}
            />
            <TouchableOpacity
              style={[styles.commandButton, aiProcessing && styles.buttonDisabled]}
              onPress={handleAICommand}
              disabled={aiProcessing}
            >
              {aiProcessing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>실행</Text>
              )}
            </TouchableOpacity>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 명령 예시</Text>
              <Text style={styles.infoText}>
                • "박민수를 5시부 노선에 추가"{'\n'}
                • "이지은을 월요일 3시부에서 제거"{'\n'}
                • "최수진의 정류장을 학교앞으로 변경"
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
  commandInput: {
    minHeight: 100,
  },
  commandButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 54,
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
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
