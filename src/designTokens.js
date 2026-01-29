// Design Tokens extracted from Figma
export const colors = {
  // Primary colors from Figma
  primary: {
    purple: '#667eea', // Gradient start
    purpleDark: '#764ba2', // Gradient end
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  
  // Text colors
  text: {
    primary: '#1a1a1a',
    secondary: '#666',
    white: '#ffffff',
  },
  
  // Background colors
  background: {
    white: '#ffffff',
    black: '#000000',
    gray: '#f5f5f5',
    grayLight: '#e0e0e0',
  },
  
  // Status bar colors
  statusBar: {
    bg: '#000000',
    text: '#ffffff',
  },
  
  // Button colors
  button: {
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    shadow: 'rgba(102, 126, 234, 0.4)',
    shadowHover: 'rgba(102, 126, 234, 0.5)',
  },
  
  // Indicator colors
  indicator: {
    inactive: 'rgba(255, 255, 255, 0.5)',
    active: '#ffffff',
    hover: 'rgba(255, 255, 255, 0.7)',
  },
}

export const typography = {
  fontFamily: {
    primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
  fontSize: {
    title: '24px',
    description: '16px',
    button: '16px',
    status: '14px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    title: '1.2',
    description: '1.5',
    button: '1',
  },
}

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '20px',
  xl: '24px',
  xxl: '33px',
}

export const borderRadius = {
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  full: '50%',
}

export const shadows = {
  sm: '0 4px 12px rgba(0, 0, 0, 0.15)',
  md: '0 6px 16px rgba(0, 0, 0, 0.2)',
  lg: '0 8px 24px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 60px rgba(0, 0, 0, 0.3)',
  button: '0 4px 12px rgba(102, 126, 234, 0.4)',
  buttonHover: '0 6px 20px rgba(102, 126, 234, 0.5)',
}


