import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/config';
import { pickCsvFile, importCsvFile } from '../services/csvService';

export default function CsvImportScreen({ navigation }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);

  async function handlePickFile() {
    try {
      const file = await pickCsvFile();
      if (file) {
        setSelectedFile(file);
        setResult(null);
        setLogs([]);
        setProgress(null);
      }
    } catch (err) {
      Alert.alert('Error', `No s'ha pogut seleccionar el fitxer: ${err.message}`);
    }
  }

  async function handleImport() {
    if (!selectedFile) return;

    try {
      setImporting(true);
      setLogs([]);
      setResult(null);

      addLog('info', `Important fitxer: ${selectedFile.name}`);

      const importResult = await importCsvFile(selectedFile.uri, (prog) => {
        setProgress(prog);
        if (prog.productName) {
          addLog('ok', `Importat: ${prog.productName} (${prog.current}/${prog.total})`);
        }
      });

      setResult(importResult);

      if (importResult.success) {
        addLog('success', `Importació completada: ${importResult.imported} de ${importResult.total} productes`);
        if (importResult.errors.length > 0) {
          for (const err of importResult.errors) {
            addLog('error', `Fila ${err.row}: ${err.error}`);
          }
        }
      } else {
        addLog('error', `Error d'importació: ${importResult.error}`);
      }
    } catch (err) {
      addLog('error', `Error inesperat: ${err.message}`);
      setResult({ success: false, error: err.message });
    } finally {
      setImporting(false);
    }
  }

  function addLog(type, message) {
    setLogs(prev => [...prev, { type, message, time: new Date().toLocaleTimeString() }]);
  }

  function getLogColor(type) {
    switch (type) {
      case 'success': return COLORS.success;
      case 'error': return COLORS.error;
      case 'ok': return COLORS.text;
      default: return COLORS.textLight;
    }
  }

  return (
    <View style={styles.container}>
      {/* Instructions */}
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={COLORS.primary} />
        <View style={styles.infoContent}>
          <Text style={styles.infoTitle}>Format CSV esperat</Text>
          <Text style={styles.infoText}>
            Columnes separades per punt i coma (;):{'\n'}
            CODI; NOM; PREU; FAMILIA; CATEGORIA; unitatMesura; Descripcio
          </Text>
        </View>
      </View>

      {/* File picker */}
      <TouchableOpacity
        style={styles.pickButton}
        onPress={handlePickFile}
        disabled={importing}
      >
        <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
        <Text style={styles.pickButtonText}>
          {selectedFile ? selectedFile.name : 'Seleccionar fitxer CSV'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </TouchableOpacity>

      {/* File info */}
      {selectedFile && (
        <View style={styles.fileInfo}>
          <Text style={styles.fileInfoText}>
            Fitxer: {selectedFile.name}
            {selectedFile.size ? ` (${(selectedFile.size / 1024).toFixed(1)} KB)` : ''}
          </Text>
        </View>
      )}

      {/* Import button */}
      {selectedFile && !result?.success && (
        <TouchableOpacity
          style={[styles.importButton, importing && styles.importButtonDisabled]}
          onPress={handleImport}
          disabled={importing}
        >
          <Ionicons name="cloud-upload" size={22} color={COLORS.textOnPrimary} />
          <Text style={styles.importButtonText}>
            {importing ? 'Importatant...' : 'Importar productes'}
          </Text>
        </TouchableOpacity>
      )}

      {/* Progress */}
      {progress && importing && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill,
              { width: `${(progress.current / progress.total) * 100}%` },
            ]} />
          </View>
          <Text style={styles.progressText}>
            {progress.current} / {progress.total} ({progress.imported} importats)
          </Text>
        </View>
      )}

      {/* Result */}
      {result && (
        <View style={[
          styles.resultCard,
          result.success ? styles.resultSuccess : styles.resultError,
        ]}>
          <Ionicons
            name={result.success ? 'checkmark-circle' : 'alert-circle'}
            size={24}
            color={result.success ? COLORS.success : COLORS.error}
          />
          <Text style={styles.resultText}>
            {result.success
              ? `${result.imported} productes importats correctament`
              : result.error
            }
            {result.errors && result.errors.length > 0
              ? `\n${result.errors.length} errors`
              : ''
            }
          </Text>
        </View>
      )}

      {/* Logs */}
      {logs.length > 0 && (
        <ScrollView style={styles.logContainer}>
          <Text style={styles.logTitle}>Registre d'importació:</Text>
          {logs.map((log, i) => (
            <View key={i} style={styles.logEntry}>
              <Text style={[styles.logTime]}>{log.time}</Text>
              <Text style={[styles.logMessage, { color: getLogColor(log.type) }]}>
                {log.message}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Back to catalog button after successful import */}
      {result?.success && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Tornar al catàleg</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    gap: 12,
  },
  pickButtonText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  fileInfo: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  fileInfoText: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 8,
    gap: 8,
  },
  importButtonDisabled: {
    opacity: 0.6,
  },
  importButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
  progressContainer: {
    marginTop: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: 6,
    textAlign: 'center',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    gap: 12,
  },
  resultSuccess: {
    backgroundColor: '#E8F5E9',
  },
  resultError: {
    backgroundColor: '#FFEBEE',
  },
  resultText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },
  logContainer: {
    flex: 1,
    marginTop: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  logEntry: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 8,
  },
  logTime: {
    fontSize: 10,
    color: COLORS.textLight,
    fontFamily: Platform?.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  logMessage: {
    fontSize: 12,
    flex: 1,
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 12,
  },
  backButtonText: {
    fontSize: 15,
    color: COLORS.primary,
    fontWeight: '600',
  },
});
