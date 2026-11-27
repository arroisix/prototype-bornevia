import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import FormattedText from './FormattedText';
import { PlayIcon, SparkleIcon, TemplateIcon, CheckSmallIcon } from './ChatIcons';
import { AI_COLOR } from './AIDraftSheet';

const MediaGrid = ({ attachments }) => {
  const single = attachments.length === 1;
  return (
    <View style={[styles.grid, single && styles.gridSingle]}>
      {attachments.map((a) => (
        <View key={a.key} style={single ? styles.mediaSingle : styles.mediaMulti}>
          <Image source={a.source} style={styles.mediaImage} />
          {a.type === 'video' && (
            <>
              <View style={styles.playCircle}>
                <PlayIcon size={18} />
              </View>
              <View style={styles.duration}>
                <Text style={styles.durationText}>{a.duration}</Text>
              </View>
            </>
          )}
        </View>
      ))}
    </View>
  );
};

export default function MessageBubble({ message, theme, grouped }) {
  const isAgent = message.from === 'agent';
  const hasMedia = message.attachments && message.attachments.length > 0;
  const hasText = !!message.text;
  const timeColor = isAgent ? 'rgba(255,255,255,0.8)' : 'rgba(41,41,41,0.5)';

  return (
    <View style={[styles.row, isAgent && styles.rowRight, grouped && styles.rowGrouped]}>
      <View style={[styles.col, isAgent && { alignItems: 'flex-end' }]}>
        <View
          style={[
            styles.bubble,
            isAgent ? styles.bubbleAgent : styles.bubbleCustomer,
            { backgroundColor: isAgent ? theme.solid : theme.soft },
            hasMedia && styles.bubbleMedia,
          ]}
        >
          {hasMedia && <MediaGrid attachments={message.attachments} />}
          {hasText && (
            <View style={hasMedia && styles.textUnderMedia}>
              <FormattedText text={message.text} style={[styles.text, isAgent && { color: theme.onSolid }]} />
            </View>
          )}
          <View style={[styles.meta, hasMedia && !hasText && styles.metaOverMedia]}>
            <Text style={[styles.time, { color: hasMedia && !hasText ? '#FFFFFF' : timeColor }]}>{message.time}</Text>
            {isAgent && message.status === 'sending' && (
              <Text style={[styles.time, { color: timeColor }]}>· Sending…</Text>
            )}
            {isAgent && message.status === 'sent' && <CheckSmallIcon size={12} color={hasMedia && !hasText ? '#FFFFFF' : timeColor} />}
          </View>
        </View>

        {(message.aiAssisted || message.templateTitle) && (
          <View style={styles.tags}>
            {message.aiAssisted && (
              <View style={styles.tag}>
                <SparkleIcon size={11} color={AI_COLOR} />
                <Text style={[styles.tagText, { color: AI_COLOR }]}>AI-assisted</Text>
              </View>
            )}
            {message.templateTitle && (
              <View style={styles.tag}>
                <TemplateIcon size={11} color="#3B3F45" />
                <Text style={[styles.tagText, { color: '#3B3F45' }]}>{message.templateTitle}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginTop: 12 },
  rowGrouped: { marginTop: 4 },
  rowRight: { justifyContent: 'flex-end' },
  col: { maxWidth: '80%' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleCustomer: { borderBottomLeftRadius: 6 },
  bubbleAgent: { borderBottomRightRadius: 6 },
  bubbleMedia: { padding: 4 },
  text: { fontSize: 14, lineHeight: 21, color: '#292929' },
  textUnderMedia: { paddingHorizontal: 10, paddingTop: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 4, marginTop: 4 },
  metaOverMedia: {
    position: 'absolute',
    right: 10,
    bottom: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 0,
  },
  time: { fontSize: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, width: 224 },
  gridSingle: { width: 232 },
  mediaSingle: { width: 232, height: 180, borderRadius: 14, overflow: 'hidden' },
  mediaMulti: { width: 110, height: 110, borderRadius: 12, overflow: 'hidden' },
  mediaImage: { width: '100%', height: '100%' },
  playCircle: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    marginLeft: -20,
    marginTop: -20,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 3,
  },
  duration: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  durationText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },
  tags: { flexDirection: 'row', gap: 6, marginTop: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tagText: { fontSize: 11, fontWeight: '600' },
});
