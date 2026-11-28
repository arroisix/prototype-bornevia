import React, { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomSheet from '../chat/BottomSheet';
import { PopIn } from '../chat/Composer';
import { CheckSmallIcon, CloseIcon, ExpandIcon, CollapseIcon } from '../chat/ChatIcons';
import { PEOPLE, initialsOf } from '../../data/teams';
import { BRAND } from '../../theme/brand';

export const STATUS_COLORS = { online: '#22C55E', away: '#F5B041', offline: '#C4C4C4' };

export const PersonAvatar = ({ person, size = 40, showStatus = true }) => (
  <View style={{ width: size, height: size }}>
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: person.color }]}>
      <Text style={[styles.avatarText, { fontSize: size * 0.34 }]}>{initialsOf(person.name)}</Text>
    </View>
    {showStatus && (
      <View
        style={[
          styles.statusDot,
          { backgroundColor: STATUS_COLORS[person.status], width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15 },
        ]}
      />
    )}
  </View>
);

const SheetHeader = ({ title, subtitle, expanded, setExpanded, close }) => (
  <View style={styles.header}>
    <View style={styles.flex}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    <TouchableOpacity style={styles.headerBtn} onPress={() => setExpanded(!expanded)}>
      {expanded ? <CollapseIcon size={18} /> : <ExpandIcon size={18} />}
    </TouchableOpacity>
    <TouchableOpacity style={styles.headerBtn} onPress={close}>
      <CloseIcon size={18} />
    </TouchableOpacity>
  </View>
);

const PersonRow = ({ person, selected, onPress }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.personRow, selected && styles.personRowSelected, pressed && { opacity: 0.8 }]}>
    <PersonAvatar person={person} size={40} />
    <View style={styles.flex}>
      <Text style={styles.personName}>{person.name}</Text>
      <Text style={styles.personRole}>
        {person.role} · {person.status}
      </Text>
    </View>
    <View style={[styles.checkbox, selected && { backgroundColor: BRAND, borderColor: BRAND }]}>
      {selected && (
        <PopIn from={0}>
          <CheckSmallIcon size={12} />
        </PopIn>
      )}
    </View>
  </Pressable>
);

/** Pick people that aren't in the team yet. */
export const AddMemberSheet = forwardRef(function AddMemberSheet({ team, onAdd, onClosed }, ref) {
  const sheetRef = useRef(null);
  useImperativeHandle(ref, () => ({ close: () => sheetRef.current?.close() }));
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState([]);
  const inTeam = new Set(team.members.map((m) => m.id));
  const candidates = PEOPLE.filter((p) => !inTeam.has(p.id) && p.name.toLowerCase().includes(query.trim().toLowerCase()));

  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <BottomSheet
      ref={sheetRef}
      expandable
      halfRatio={0.66}
      onClosed={onClosed}
      header={(api) => <SheetHeader title="Add members" subtitle={`to ${team.name}`} {...api} />}
      footer={
        <Pressable
          onPress={() => {
            if (!selected.length) return;
            onAdd(selected);
            sheetRef.current?.close();
          }}
          style={({ pressed }) => [styles.primary, !selected.length && styles.disabled, pressed && styles.pressed]}
        >
          <Text style={styles.primaryText}>
            {selected.length ? `Add ${selected.length} ${selected.length === 1 ? 'member' : 'members'}` : 'Select people'}
          </Text>
        </Pressable>
      }
    >
      {({ setExpanded }) => (
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.search}
            placeholder="Search people"
            placeholderTextColor="rgba(46,46,46,0.45)"
            value={query}
            onChangeText={setQuery}
            onFocus={() => setExpanded(true)}
          />
          {candidates.length === 0 && <Text style={styles.empty}>Everyone matching “{query}” is already in this team</Text>}
          {candidates.map((p) => (
            <PersonRow key={p.id} person={p} selected={selected.includes(p.id)} onPress={() => toggle(p.id)} />
          ))}
        </ScrollView>
      )}
    </BottomSheet>
  );
});

const SWATCHES = ['#EE4323', '#1877F2', '#1DA851', '#D62976', '#7C5CFF', '#14171A', '#F5B041'];

/** Create a new team: name, colour and members, with validation + creating state. */
export const CreateTeamSheet = forwardRef(function CreateTeamSheet({ onCreate, onClosed }, ref) {
  const sheetRef = useRef(null);
  useImperativeHandle(ref, () => ({ close: () => sheetRef.current?.close() }));
  const [name, setName] = useState('');
  const [color, setColor] = useState(SWATCHES[0]);
  const [members, setMembers] = useState([]);
  const [error, setError] = useState(null);
  const [creating, setCreating] = useState(false);
  const shake = useRef(new Animated.Value(0)).current;

  const submit = () => {
    if (creating) return;
    if (!name.trim()) {
      setError('Give your team a name');
      Animated.sequence([10, -8, 6, -4, 0].map((v) => Animated.timing(shake, { toValue: v, duration: 55, useNativeDriver: true }))).start();
      return;
    }
    setCreating(true);
    setTimeout(() => {
      onCreate({ name: name.trim(), color, memberIds: members });
      sheetRef.current?.close();
    }, 900);
  };

  return (
    <BottomSheet
      ref={sheetRef}
      expandable
      halfRatio={0.75}
      onClosed={onClosed}
      header={(api) => <SheetHeader title="Create team" subtitle="Group agents to share a queue" {...api} />}
      footer={
        <Pressable onPress={submit} style={({ pressed }) => [styles.primary, creating && { opacity: 0.8 }, pressed && styles.pressed]}>
          <Text style={styles.primaryText}>{creating ? 'Creating team…' : 'Create team'}</Text>
        </Pressable>
      }
    >
      {({ setExpanded }) => (
        <ScrollView contentContainerStyle={styles.list} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Team name</Text>
          <Animated.View style={{ transform: [{ translateX: shake }] }}>
            <TextInput
              style={[styles.search, error && styles.inputError]}
              placeholder="e.g. Billing Support"
              placeholderTextColor="rgba(46,46,46,0.45)"
              value={name}
              onChangeText={(t) => {
                setName(t);
                setError(null);
              }}
              onFocus={() => setExpanded(true)}
            />
          </Animated.View>
          {error && (
            <PopIn from={-4}>
              <Text style={styles.error}>{error}</Text>
            </PopIn>
          )}

          <Text style={[styles.label, { marginTop: 16 }]}>Colour</Text>
          <View style={styles.swatches}>
            {SWATCHES.map((c) => (
              <Pressable key={c} onPress={() => setColor(c)} style={[styles.swatchRing, color === c && { borderColor: c }]}>
                <View style={[styles.swatch, { backgroundColor: c }]}>{color === c && <CheckSmallIcon size={14} />}</View>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.label, { marginTop: 16 }]}>Members {members.length ? `(${members.length})` : ''}</Text>
          {PEOPLE.slice(0, 8).map((p) => (
            <PersonRow
              key={p.id}
              person={p}
              selected={members.includes(p.id)}
              onPress={() => setMembers((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))}
            />
          ))}
        </ScrollView>
      )}
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  title: { fontSize: 18, fontWeight: '700', color: '#000000' },
  subtitle: { fontSize: 12, color: 'rgba(93,92,93,0.75)', marginTop: 1 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  list: { paddingHorizontal: 16, paddingBottom: 16 },
  search: {
    height: 46,
    borderWidth: 1.5,
    borderColor: '#E8E8E8',
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#000000',
    backgroundColor: '#FAFAFA',
    marginBottom: 8,
  },
  inputError: { borderColor: '#D93025', backgroundColor: '#FFF6F5' },
  error: { color: '#D93025', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  label: { fontSize: 14, fontWeight: '700', color: '#292929', marginBottom: 8 },
  empty: { fontSize: 13, color: 'rgba(93,92,93,0.75)', textAlign: 'center', marginTop: 20 },
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 14 },
  personRowSelected: { backgroundColor: '#FFF4F1' },
  personName: { fontSize: 15, fontWeight: '600', color: '#292929' },
  personRole: { fontSize: 12, color: 'rgba(93,92,93,0.75)', marginTop: 1, textTransform: 'capitalize' },
  checkbox: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, borderColor: '#D4D4D4', justifyContent: 'center', alignItems: 'center' },
  avatar: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontWeight: '700' },
  statusDot: { position: 'absolute', right: -1, bottom: -1, borderWidth: 2, borderColor: '#FFFFFF' },
  swatches: { flexDirection: 'row', gap: 10 },
  swatchRing: { padding: 3, borderRadius: 22, borderWidth: 2, borderColor: 'transparent' },
  swatch: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  primary: { height: 50, borderRadius: 14, backgroundColor: BRAND, justifyContent: 'center', alignItems: 'center' },
  primaryText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
});
