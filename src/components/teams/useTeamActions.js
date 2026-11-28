import React, { useState } from 'react';
import { LayoutAnimation } from 'react-native';
import ConfirmDialog from '../ConfirmDialog';
import { useTicketDetail } from '../TicketDetailContext';
import { BellIcon, BellOffIcon, EditIcon, EyeIcon, LogOutIcon, PinIcon, TrashIcon, UserPlusIcon } from '../MenuIcons';

const animateList = () => LayoutAnimation.configureNext(LayoutAnimation.create(260, 'easeInEaseOut', 'opacity'));

/**
 * Shared ⋯ menu actions for a team (used by team cards and the team detail header).
 * Returns `menuFor(team, opts)` → ActionMenu items, and `dialogs` to render once.
 */
export default function useTeamActions() {
  const { setTeams, showToast } = useTicketDetail();
  const [dialog, setDialog] = useState(null); // { type, team }
  const [renameValue, setRenameValue] = useState('');

  const update = (id, patch) => setTeams((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  const menuFor = (team, { onOpen, onAddMember, onDeleted } = {}) => [
    ...(onOpen ? [{ key: 'open', label: 'View team', icon: EyeIcon, onPress: () => onOpen(team) }] : []),
    {
      key: 'rename',
      label: 'Rename team',
      icon: EditIcon,
      onPress: () => {
        setRenameValue(team.name);
        setDialog({ type: 'rename', team });
      },
    },
    { key: 'add', label: 'Add members', icon: UserPlusIcon, onPress: () => onAddMember && onAddMember(team) },
    {
      key: 'pin',
      label: team.pinned ? 'Unpin from top' : 'Pin to top',
      icon: PinIcon,
      onPress: () => {
        animateList();
        update(team.id, { pinned: !team.pinned });
        showToast({ text: team.pinned ? `${team.name} unpinned` : `${team.name} pinned to top`, tone: 'info' });
      },
    },
    {
      key: 'mute',
      label: team.muted ? 'Unmute notifications' : 'Mute notifications',
      hint: team.muted ? 'You will get alerts again' : 'No alerts for new tickets',
      icon: team.muted ? BellIcon : BellOffIcon,
      onPress: () => {
        update(team.id, { muted: !team.muted });
        showToast({ text: team.muted ? `Notifications on for ${team.name}` : `${team.name} muted`, tone: 'info' });
      },
    },
    { key: 'leave', label: 'Leave team', icon: LogOutIcon, destructive: true, divider: true, onPress: () => setDialog({ type: 'leave', team }) },
    { key: 'delete', label: 'Delete team', icon: TrashIcon, destructive: true, onPress: () => setDialog({ type: 'delete', team, onDeleted }) },
  ];

  const close = () => setDialog(null);

  const confirm = () => {
    const { type, team, onDeleted } = dialog;
    close();
    if (type === 'rename') {
      update(team.id, { name: renameValue.trim() });
      showToast(`Renamed to “${renameValue.trim()}”`);
    }
    if (type === 'leave') {
      update(team.id, { left: true });
      showToast({ text: `You left ${team.name}`, tone: 'info', actionLabel: 'Undo', onAction: () => update(team.id, { left: false }) });
    }
    if (type === 'delete') {
      let index = 0;
      animateList();
      setTeams((list) => {
        index = list.findIndex((t) => t.id === team.id);
        return list.filter((t) => t.id !== team.id);
      });
      if (onDeleted) onDeleted();
      showToast({
        text: `${team.name} deleted`,
        tone: 'danger',
        actionLabel: 'Undo',
        onAction: () => {
          animateList();
          setTeams((list) => {
            const next = [...list];
            next.splice(Math.min(index, next.length), 0, team);
            return next;
          });
        },
      });
    }
  };

  const dialogs = (
    <>
      <ConfirmDialog
        visible={dialog?.type === 'rename'}
        title="Rename team"
        confirmLabel="Save"
        input={{ value: renameValue, onChangeText: setRenameValue, placeholder: 'Team name' }}
        onCancel={close}
        onConfirm={confirm}
      />
      <ConfirmDialog
        visible={dialog?.type === 'leave'}
        title={`Leave ${dialog?.team?.name || 'team'}?`}
        body="You will stop receiving this team's tickets. You can ask a team lead to add you back."
        confirmLabel="Leave"
        destructive
        onCancel={close}
        onConfirm={confirm}
      />
      <ConfirmDialog
        visible={dialog?.type === 'delete'}
        title={`Delete ${dialog?.team?.name || 'team'}?`}
        body="Open tickets will move back to the shared queue. This can't be undone after a few seconds."
        confirmLabel="Delete"
        destructive
        onCancel={close}
        onConfirm={confirm}
      />
    </>
  );

  return { menuFor, dialogs };
}
