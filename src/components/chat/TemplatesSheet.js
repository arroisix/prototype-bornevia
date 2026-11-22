import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import BottomSheet from './BottomSheet';
import FormattedText from './FormattedText';
import { REPLY_TEMPLATES, fillTemplate } from '../../data/chatMocks';
import { CloseIcon, ExpandIcon, CollapseIcon, TemplateIcon, CheckSmallIcon } from './ChatIcons';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CATEGORY_COLORS = {
  General: ['#EEF0F2', '#3B3F45'],
  Verification: ['#E7F0FE', '#1877F2'],
  Technical: ['#FDEEE4', '#D4561A'],
  Closing: ['#E6F6EC', '#1E9E5A'],
};

/** List of 5 saved reply templates; tap to preview, then insert. */
const TemplatesSheet = forwardRef(function TemplatesSheet({ vars, color, onInsert, onClosed }, ref) {
  const sheetRef = useRef(null);
  useImperativeHandle(ref, () => ({ close: () => sheetRef.current?.close() }));
  const [selectedId, setSelectedId] = useState(null);

  const select = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.create(220, 'easeInEaseOut', 'opacity'));
    setSelectedId((cur) => (cur === id ? null : id));
  };

  const insert = () => {
    const t = REPLY_TEMPLATES.find((x) => x.id === selectedId);
    if (!t) return;
    onInsert(t, fillTemplate(t.body, vars));
    sheetRef.current?.close();
  };

  return (
    <BottomSheet
      ref={sheetRef}
      expandable
      halfRatio={0.64}
      onClosed={onClosed}
      header={({ expanded, setExpanded, close }) => (
        <View style={styles.header}>
          <View style={styles.flex}>
            <Text style={styles.title}>Templates</Text>
            <Text style={styles.subtitle}>{REPLY_TEMPLATES.length} saved replies</Text>
          </View>
          <TouchableOpacity style={styles.headerBtn} onPress={() => setExpanded(!expanded)}>
            {expanded ? <CollapseIcon size={18} /> : <ExpandIcon size={18} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={close}>
            <CloseIcon size={18} />
          </TouchableOpacity>
        </View>
      )}
      footer={
        <Pressable
          onPress={insert}
          style={({ pressed }) => [styles.insertBtn, { backgroundColor: color }, !selectedId && styles.disabled, pressed && styles.pressed]}
        >
          <Text style={styles.insertText}>{selectedId ? 'Insert template' : 'Select a template'}</Text>
        </Pressable>
      }
    >
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {REPLY_TEMPLATES.map((t) => {
          const active = t.id === selectedId;
          const [bg, fg] = CATEGORY_COLORS[t.category] || CATEGORY_COLORS.General;
          return (
            <Pressable
              key={t.id}
              onPress={() => select(t.id)}
              style={({ pressed }) => [styles.item, active && { borderColor: color, backgroundColor: color + '0D' }, pressed && styles.pressed]}
            >
              <View style={styles.itemTop}>
                <View style={[styles.itemIcon, { backgroundColor: bg }]}>
                  <TemplateIcon size={18} color={fg} />
                </View>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{t.title}</Text>
                  <Text style={[styles.itemCategory, { color: fg }]}>{t.category}</Text>
                </View>
                <View style={[styles.radio, active && { backgroundColor: color, borderColor: color }]}>
                  {active && <CheckSmallIcon size={12} />}
                </View>
              </View>
              {active ? (
                <View style={styles.preview}>
                  <FormattedText text={fillTemplate(t.body, vars)} style={styles.previewText} />
                </View>
              ) : (
                <Text style={styles.snippet} numberOfLines={2}>
                  {fillTemplate(t.body, vars).replace(/\*\*|_/g, '').replace(/\n/g, ' ')}
                </Text>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </BottomSheet>
  );
});

export default TemplatesSheet;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#000000' },
  subtitle: { fontSize: 12, color: 'rgba(93,92,93,0.75)', marginTop: 1 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 10 },
  item: { borderWidth: 1.5, borderColor: '#EDEDED', borderRadius: 16, padding: 14 },
  itemTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#292929' },
  itemCategory: { fontSize: 12, fontWeight: '600', marginTop: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#DADADA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  snippet: { fontSize: 13, lineHeight: 19, color: '#5D5C5D', marginTop: 10 },
  preview: { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F0F0F0' },
  previewText: { fontSize: 14, lineHeight: 21, color: '#292929' },
  insertBtn: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  insertText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85 },
});
