import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '../utils/storage';
import { saveWebhookUrl } from '../services/sheetsWebhook';

const SHEET_URL_KEY = '@sheet_url';
const WEBHOOK_URL_KEY = '@apps_script_webhook_url';

// 기본 웹훅 URL (보안 주의: GitHub에 공개됨)
const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwjbgJu01HY6XeEDY3pp5J9CGD2SD1XXKxtTCgyhNVuVYZlbVFIckcofc0KEkwYGISk/exec';

export const SettingsScreen: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [sheetUrl, setSheetUrl] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const url = await AsyncStorage.getItem(SHEET_URL_KEY);
      const webhook = await AsyncStorage.getItem(WEBHOOK_URL_KEY);
      if (url) setSheetUrl(url);
      // 저장된 웹훅 URL이 없으면 기본값 사용
      setWebhookUrl(webhook || DEFAULT_WEBHOOK_URL);
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

  const saveWebhook = async () => {
    if (!webhookUrl.trim()) {
      setSaveMessage('❌ Apps Script 웹훅 URL을 입력해주세요.');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    try {
      await saveWebhookUrl(webhookUrl.trim());
      setSaveMessage('✅ 웹훅 URL이 저장되었습니다!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save webhook URL:', error);
      setSaveMessage('❌ 웹훅 URL 저장에 실패했습니다.');
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
          {/* Google Sheets URL 섹션 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 Google Sheets 연결</Text>

            <Text style={styles.label}>Google Sheets URL (읽기용)</Text>
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

            <Text style={[styles.label, {marginTop: 16}]}>Apps Script 웹훅 URL (쓰기용)</Text>
            <Text style={styles.description}>
              Google Sheets에 데이터를 추가/수정하려면 웹훅 URL이 필요합니다
            </Text>
            <TextInput
              style={styles.input}
              value={webhookUrl}
              onChangeText={setWebhookUrl}
              placeholder="https://script.google.com/macros/s/..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveWebhook}>
              <Text style={styles.saveButtonText}>웹훅 URL 저장</Text>
            </TouchableOpacity>

            {saveMessage !== '' && (
              <View style={styles.saveMessageBox}>
                <Text style={styles.saveMessageText}>{saveMessage}</Text>
              </View>
            )}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 웹훅 설정 방법</Text>
              <Text style={styles.infoText}>
                자세한 설정 방법은 GOOGLE_APPS_SCRIPT_SETUP.md 파일을 참고하세요
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
