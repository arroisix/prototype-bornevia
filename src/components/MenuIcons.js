import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

// Line icons used in ⋯ menus and detail screens (24px grid, stroke-based).
const I = ({ size = 18, color = '#292929', children }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {children(color)}
  </Svg>
);
const st = (c) => ({ stroke: c, strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' });

export const SortIcon = (p) => <I {...p}>{(c) => <Path d="M7 4V20M7 20L3.5 16.5M7 20L10.5 16.5M17 20V4M17 4L13.5 7.5M17 4L20.5 7.5" {...st(c)} />}</I>;
export const FilterIcon = (p) => <I {...p}>{(c) => <Path d="M4 5H20L14 12.5V19L10 17V12.5L4 5Z" {...st(c)} />}</I>;
export const CheckAllIcon = (p) => <I {...p}>{(c) => <Path d="M2.5 12.5L7 17L16 7M12 16L13 17L22 7" {...st(c)} />}</I>;
export const SelectIcon = (p) => (
  <I {...p}>{(c) => (<><Rect x={4} y={4} width={16} height={16} rx={4} {...st(c)} /><Path d="M8.5 12L11 14.5L15.5 9.5" {...st(c)} /></>)}</I>
);
export const DownloadIcon = (p) => <I {...p}>{(c) => <Path d="M12 4V15M12 15L7.5 10.5M12 15L16.5 10.5M5 19H19" {...st(c)} />}</I>;
export const EditIcon = (p) => <I {...p}>{(c) => <Path d="M4 20H8L18.5 9.5A2.1 2.1 0 0 0 15.5 6.5L5 17V20ZM14 8L17 11" {...st(c)} />}</I>;
export const UserPlusIcon = (p) => (
  <I {...p}>{(c) => (<><Circle cx={9} cy={8} r={3.5} {...st(c)} /><Path d="M3 20C3 16.7 5.7 14 9 14C12.3 14 15 16.7 15 20M19 8V14M16 11H22" {...st(c)} /></>)}</I>
);
export const BellOffIcon = (p) => <I {...p}>{(c) => <Path d="M6 16V11A6 6 0 0 1 15.5 6.1M18 11V16L20 18H8M10 21H14M3 3L21 21" {...st(c)} />}</I>;
export const BellIcon = (p) => <I {...p}>{(c) => <Path d="M6 16V11A6 6 0 0 1 18 11V16L20 18H4L6 16ZM10 21H14" {...st(c)} />}</I>;
export const LogOutIcon = (p) => <I {...p}>{(c) => <Path d="M14 4H18A2 2 0 0 1 20 6V18A2 2 0 0 1 18 20H14M10 16L14 12M14 12L10 8M14 12H4" {...st(c)} />}</I>;
export const TrashIcon = (p) => <I {...p}>{(c) => <Path d="M4 7H20M9 7V4H15V7M6 7L7 20H17L18 7M10 11V16M14 11V16" {...st(c)} />}</I>;
export const CalendarIcon = (p) => (
  <I {...p}>{(c) => (<><Rect x={3.5} y={5} width={17} height={15} rx={3} {...st(c)} /><Path d="M3.5 10H20.5M8 3V7M16 3V7" {...st(c)} /></>)}</I>
);
export const SettingsIcon = (p) => (
  <I {...p}>{(c) => (<><Circle cx={12} cy={12} r={3} {...st(c)} /><Path d="M12 2.5V5M12 19V21.5M4.6 4.6L6.4 6.4M17.6 17.6L19.4 19.4M2.5 12H5M19 12H21.5M4.6 19.4L6.4 17.6M17.6 6.4L19.4 4.6" {...st(c)} /></>)}</I>
);
export const ShareIcon = (p) => (
  <I {...p}>{(c) => (<><Circle cx={18} cy={5.5} r={2.5} {...st(c)} /><Circle cx={6} cy={12} r={2.5} {...st(c)} /><Circle cx={18} cy={18.5} r={2.5} {...st(c)} /><Path d="M8.2 10.8L15.8 6.7M8.2 13.2L15.8 17.3" {...st(c)} /></>)}</I>
);
export const ArchiveIcon = (p) => <I {...p}>{(c) => <Path d="M3.5 5H20.5V9H3.5V5ZM5 9V19H19V9M10 13H14" {...st(c)} />}</I>;
export const RefreshIcon = (p) => <I {...p}>{(c) => <Path d="M20 12A8 8 0 1 1 17.3 6M18 2.5V6.5H14" {...st(c)} />}</I>;
export const LinkIcon = (p) => <I {...p}>{(c) => <Path d="M10 14A4.5 4.5 0 0 0 16.4 14L19.2 11.2A4.5 4.5 0 0 0 12.8 4.8L11.5 6.1M14 10A4.5 4.5 0 0 0 7.6 10L4.8 12.8A4.5 4.5 0 0 0 11.2 19.2L12.5 17.9" {...st(c)} />}</I>;
export const UsersIcon = (p) => (
  <I {...p}>{(c) => (<><Circle cx={9} cy={8} r={3.5} {...st(c)} /><Path d="M3 20C3 16.7 5.7 14 9 14C12.3 14 15 16.7 15 20M16 4.5A3.5 3.5 0 0 1 16 11.5M18 14.3C20 15 21 17 21 20" {...st(c)} /></>)}</I>
);
export const EyeIcon = (p) => (
  <I {...p}>{(c) => (<><Path d="M2.5 12C4.5 7.5 8 5 12 5C16 5 19.5 7.5 21.5 12C19.5 16.5 16 19 12 19C8 19 4.5 16.5 2.5 12Z" {...st(c)} /><Circle cx={12} cy={12} r={3} {...st(c)} /></>)}</I>
);
export const ClockIcon = (p) => (
  <I {...p}>{(c) => (<><Circle cx={12} cy={12} r={8.5} {...st(c)} /><Path d="M12 7.5V12L15 14" {...st(c)} /></>)}</I>
);
export const BackArrowIcon = (p) => <I {...p}>{(c) => <Path d="M15 5L8 12L15 19" {...st(c)} />}</I>;
export const ChevronRightIcon = (p) => <I {...p}>{(c) => <Path d="M9 5L16 12L9 19" {...st(c)} />}</I>;
export const ChevronDownIcon = (p) => <I {...p}>{(c) => <Path d="M6 9L12 15L18 9" {...st(c)} />}</I>;
export const PinIcon = (p) => <I {...p}>{(c) => <Path d="M14.5 3.5L20.5 9.5L17 11L13 15L12.5 19L5 11.5L9 11L13 7L14.5 3.5ZM8.5 15.5L3.5 20.5" {...st(c)} />}</I>;
export const StarIcon = (p) => <I {...p}>{(c) => <Path d="M12 3.5L14.6 8.9L20.5 9.6L16.2 13.7L17.3 19.5L12 16.7L6.7 19.5L7.8 13.7L3.5 9.6L9.4 8.9L12 3.5Z" {...st(c)} />}</I>;
