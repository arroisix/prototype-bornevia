import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

const S = ({ size = 20, children, viewBox = '0 0 24 24' }) => (
  <Svg width={size} height={size} viewBox={viewBox} fill="none">
    {children}
  </Svg>
);

export const SparkleIcon = ({ size = 20, color = '#7B4DFF' }) => (
  <S size={size}>
    <Path d="M12 2.5L13.9 8.1L19.5 10L13.9 11.9L12 17.5L10.1 11.9L4.5 10L10.1 8.1L12 2.5Z" fill={color} />
    <Path d="M19 15L19.8 17.2L22 18L19.8 18.8L19 21L18.2 18.8L16 18L18.2 17.2L19 15Z" fill={color} />
  </S>
);

export const PlusIcon = ({ size = 22, color = '#292929' }) => (
  <S size={size}>
    <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </S>
);

export const ImageIcon = ({ size = 22, color = '#292929' }) => (
  <S size={size}>
    <Rect x={3} y={4} width={18} height={16} rx={3} stroke={color} strokeWidth={2} />
    <Circle cx={9} cy={10} r={2} fill={color} />
    <Path d="M4 18L9.5 13L13 16L16 13.5L20 17" stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </S>
);

export const VideoIcon = ({ size = 22, color = '#292929' }) => (
  <S size={size}>
    <Rect x={3} y={6} width={13} height={12} rx={3} stroke={color} strokeWidth={2} />
    <Path d="M16 10.5L21 7.5V16.5L16 13.5" stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </S>
);

export const TemplateIcon = ({ size = 22, color = '#292929' }) => (
  <S size={size}>
    <Rect x={4} y={3} width={16} height={18} rx={3} stroke={color} strokeWidth={2} />
    <Path d="M8 8H16M8 12H16M8 16H12" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </S>
);

export const CloseSmallIcon = ({ size = 14, color = '#FFFFFF' }) => (
  <S size={size}>
    <Path d="M7 7L17 17M17 7L7 17" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
  </S>
);

export const CheckSmallIcon = ({ size = 14, color = '#FFFFFF' }) => (
  <S size={size}>
    <Path d="M5 12.5L10 17L19 7" stroke={color} strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const PlayIcon = ({ size = 18, color = '#FFFFFF' }) => (
  <S size={size}>
    <Path d="M8 5.5V18.5L19 12L8 5.5Z" fill={color} />
  </S>
);

export const RetryIcon = ({ size = 18, color = '#FFFFFF' }) => (
  <S size={size}>
    <Path d="M20 12A8 8 0 1 1 17.3 6" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    <Path d="M18 2.5V6.5H14" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const AlertIcon = ({ size = 18, color = '#FFFFFF' }) => (
  <S size={size}>
    <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2.2} />
    <Path d="M12 7.5V13" stroke={color} strokeWidth={2.4} strokeLinecap="round" />
    <Circle cx={12} cy={16.5} r={1.4} fill={color} />
  </S>
);

export const ExpandIcon = ({ size = 20, color = '#292929' }) => (
  <S size={size}>
    <Path d="M14 4H20V10M10 20H4V14M20 4L13.5 10.5M4 20L10.5 13.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const CollapseIcon = ({ size = 20, color = '#292929' }) => (
  <S size={size}>
    <Path d="M20 10H14V4M4 14H10V20M14 10L20.5 3.5M10 14L3.5 20.5" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const CloseIcon = ({ size = 20, color = '#292929' }) => (
  <S size={size}>
    <Path d="M6 6L18 18M18 6L6 18" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </S>
);

export const UndoIcon = ({ size = 16, color = '#292929' }) => (
  <S size={size}>
    <Path d="M9 14L4 9L9 4" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M4 9H14.5A5.5 5.5 0 0 1 14.5 20H11" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </S>
);

export const ArrowUpIcon = ({ size = 18, color = '#FFFFFF' }) => (
  <S size={size}>
    <Path d="M12 19V5M6 11L12 5L18 11" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const BoldIcon = ({ size = 18, color = '#292929' }) => (
  <S size={size}>
    <Path d="M7 5H13A3.5 3.5 0 0 1 13 12H7V5ZM7 12H14A3.5 3.5 0 0 1 14 19H7V12Z" stroke={color} strokeWidth={2.2} strokeLinejoin="round" />
  </S>
);

export const ItalicIcon = ({ size = 18, color = '#292929' }) => (
  <S size={size}>
    <Path d="M10 5H18M6 19H14M14 5L10 19" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </S>
);

export const BulletListIcon = ({ size = 18, color = '#292929' }) => (
  <S size={size}>
    <Circle cx={5} cy={7} r={1.6} fill={color} />
    <Circle cx={5} cy={12} r={1.6} fill={color} />
    <Circle cx={5} cy={17} r={1.6} fill={color} />
    <Path d="M10 7H20M10 12H20M10 17H20" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </S>
);

export const NumberListIcon = ({ size = 18, color = '#292929' }) => (
  <S size={size}>
    <Path d="M4 5H5.5V9.5M4 9.5H7M4 14.5C4 13.5 7 13.5 7 15C7 16.2 4 17 4 19H7" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    <Path d="M11 7H20M11 12H20M11 17H20" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
  </S>
);

export const ClearFormatIcon = ({ size = 18, color = '#292929' }) => (
  <S size={size}>
    <Path d="M6 5H18M12 5L9 19M14 13L20 19M20 13L14 19" stroke={color} strokeWidth={2} strokeLinecap="round" />
  </S>
);
