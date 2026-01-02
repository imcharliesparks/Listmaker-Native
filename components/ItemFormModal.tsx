import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '@/constants/Colors';

type ItemFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (url: string, note?: string) => Promise<void>;
  submitting?: boolean;
};

export function ItemFormModal({ visible, onClose, onSubmit, submitting = false }: ItemFormModalProps) {
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) {
      setUrl('');
      setNote('');
      setError(null);
    }
  }, [visible]);

  const handleSubmit = async () => {
    if (!url.trim()) {
      setError('Please paste a URL to save.');
      return;
    }

    try {
      new URL(url.trim());
    } catch {
      setError('Enter a valid URL with http or https.');
      return;
    }

    setError(null);
    await onSubmit(url.trim(), note.trim() || undefined);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modal}
        >
          <Text style={styles.title}>Save an item</Text>
          <Text style={styles.subtitle}>
            Paste any link. We’ll pull the title, thumbnail, and metadata for you.
          </Text>

          <TextInput
            placeholder="https://example.com/your-link"
            placeholderTextColor={Colors.textSecondary}
            value={url}
            onChangeText={setUrl}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="url"
            autoCorrect={false}
          />

          <TextInput
            placeholder="Add a note (optional)"
            placeholderTextColor={Colors.textSecondary}
            value={note}
            onChangeText={setNote}
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={3}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={onClose} disabled={submitting}>
              <Text style={styles.secondaryText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, submitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              <Text style={styles.primaryText}>{submitting ? 'Saving...' : 'Save item'}</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Colors.gray200,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
