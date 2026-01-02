import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { Board, CreateBoardRequest } from '@/services/types';

type BoardFormModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBoardRequest) => Promise<void>;
  initialBoard?: Board | null;
  submitting?: boolean;
};

export function BoardFormModal({
  visible,
  onClose,
  onSubmit,
  initialBoard,
  submitting = false,
}: BoardFormModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBoard) {
      setTitle(initialBoard.title);
      setDescription(initialBoard.description || '');
      setIsPublic(initialBoard.is_public);
    } else {
      setTitle('');
      setDescription('');
      setIsPublic(false);
    }
    setError(null);
  }, [initialBoard, visible]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setError(null);

    await onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      isPublic,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modal}
        >
          <Text style={styles.title}>{initialBoard ? 'Edit Board' : 'Create Board'}</Text>
          <Text style={styles.subtitle}>
            Give your board a name and description to help you remember what goes inside.
          </Text>

          <TextInput
            placeholder="Board title"
            placeholderTextColor={Colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            autoFocus
          />

          <TextInput
            placeholder="Description (optional)"
            placeholderTextColor={Colors.textSecondary}
            value={description}
            onChangeText={setDescription}
            style={[styles.input, styles.multilineInput]}
            multiline
            numberOfLines={3}
          />

          <View style={styles.switchRow}>
            <View>
              <Text style={styles.switchLabel}>Public board</Text>
              <Text style={styles.switchHint}>
                When public, anyone with the link can view your board.
              </Text>
            </View>
            <Switch value={isPublic} onValueChange={setIsPublic} thumbColor={Colors.surface} />
          </View>

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
              <Text style={styles.primaryText}>{submitting ? 'Saving...' : 'Save board'}</Text>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  switchHint: {
    fontSize: 13,
    color: Colors.textSecondary,
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
