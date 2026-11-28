import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

/**
 * Centered confirm / prompt dialog (Modal, so it covers tabs and overlays).
 * With `input` it becomes a prompt: { value, onChangeText, placeholder }.
 */
export default function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  accent = '#EE4323',
  input,
  onCancel,
  onConfirm,
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (visible) {
      anim.setValue(0);
      Animated.spring(anim, { toValue: 1, tension: 140, friction: 14, useNativeDriver: true }).start();
    }
  }, [visible, anim]);

  const disabled = input && !input.value.trim();

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent onRequestClose={onCancel}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.backdrop, { opacity: anim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
      </Animated.View>
      <View style={styles.center} pointerEvents="box-none">
        <Animated.View
          style={[styles.dialog, { opacity: anim, transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }] }]}
        >
          <Text style={styles.title}>{title}</Text>
          {body ? <Text style={styles.body}>{body}</Text> : null}
          {input && (
            <TextInput
              style={styles.input}
              value={input.value}
              onChangeText={input.onChangeText}
              placeholder={input.placeholder}
              placeholderTextColor="rgba(46,46,46,0.45)"
              autoFocus
              selectTextOnFocus
            />
          )}
          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={({ pressed }) => [styles.btn, styles.ghost, pressed && styles.pressed]}>
              <Text style={styles.ghostText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={disabled ? undefined : onConfirm}
              style={({ pressed }) => [
                styles.btn,
                { backgroundColor: destructive ? '#D93025' : accent },
                disabled && { opacity: 0.4 },
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.btnText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { backgroundColor: 'rgba(0,0,0,0.4)' },
  center: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', padding: 32 },
  dialog: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 22, padding: 22 },
  title: { fontSize: 18, fontWeight: '800', color: '#000000' },
  body: { fontSize: 14, color: '#5D5C5D', marginTop: 6, lineHeight: 20 },
  input: {
    marginTop: 14,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#EE4323',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#000000',
  },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  btn: { flex: 1, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  ghost: { borderWidth: 1, borderColor: '#E5E5E5' },
  ghostText: { fontSize: 15, fontWeight: '700', color: '#292929' },
  btnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
