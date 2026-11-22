import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

// Renders lightweight markdown: **bold**, _italic_, "- " / "• " bullets and "1. " numbered lines.

const renderInline = (line, baseStyle, keyPrefix) => {
  const parts = [];
  const regex = /(\*\*[^*]+\*\*|_[^_]+_)/g;
  let last = 0;
  let match;
  let i = 0;
  while ((match = regex.exec(line)) !== null) {
    if (match.index > last) parts.push(line.slice(last, match.index));
    const token = match[0];
    if (token.startsWith('**')) {
      parts.push(
        <Text key={`${keyPrefix}-b${i++}`} style={styles.bold}>
          {token.slice(2, -2)}
        </Text>,
      );
    } else {
      parts.push(
        <Text key={`${keyPrefix}-i${i++}`} style={styles.italic}>
          {token.slice(1, -1)}
        </Text>,
      );
    }
    last = match.index + token.length;
  }
  if (last < line.length) parts.push(line.slice(last));
  return <Text style={baseStyle}>{parts}</Text>;
};

export default function FormattedText({ text, style }) {
  const lines = text.split('\n');
  return (
    <View>
      {lines.map((raw, idx) => {
        const bullet = raw.match(/^\s*[-•]\s+(.*)$/);
        const numbered = raw.match(/^\s*(\d+)\.\s+(.*)$/);
        if (bullet || numbered) {
          const marker = bullet ? '•' : `${numbered[1]}.`;
          const content = bullet ? bullet[1] : numbered[2];
          return (
            <View key={idx} style={styles.listRow}>
              <Text style={[style, styles.marker]}>{marker}</Text>
              <View style={styles.flex}>{renderInline(content, style, idx)}</View>
            </View>
          );
        }
        if (raw.trim() === '') return <View key={idx} style={styles.spacer} />;
        return <View key={idx}>{renderInline(raw, style, idx)}</View>;
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bold: { fontWeight: '700' },
  italic: { fontStyle: 'italic' },
  listRow: { flexDirection: 'row', gap: 6 },
  marker: { minWidth: 14 },
  spacer: { height: 6 },
});
