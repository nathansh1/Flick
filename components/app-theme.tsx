import { useColorScheme } from '@/hooks/use-color-scheme'
import {
    DarkTheme as reactNavigationDark,
    DefaultTheme as reactNavigationLight,
    ThemeProvider,
} from '@react-navigation/native'
import merge from 'deepmerge'
import { PropsWithChildren } from 'react'
import { adaptNavigationTheme, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper'

const { LightTheme, DarkTheme } = adaptNavigationTheme({ reactNavigationLight, reactNavigationDark })

// Create a custom darker theme by extending MD3DarkTheme
const CustomDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    background: '#000000', // Pure black background
    surface: '#0A0A0A', // Very dark surface
    surfaceVariant: '#1A1A1A', // Darker surface variant
    surfaceDisabled: '#0F0F0F', // Darker disabled surface
    onSurface: '#FFFFFF', // White text on surface
    onSurfaceVariant: '#E0E0E0', // Light gray text on surface variant
    onBackground: '#FFFFFF', // White text on background
    elevation: {
      level0: 'transparent',
      level1: '#0A0A0A',
      level2: '#1A1A1A',
      level3: '#2A2A2A',
      level4: '#3A3A3A',
      level5: '#4A4A4A',
    },
  },
}

const AppThemeLight = merge(MD3LightTheme, LightTheme)
const AppThemeDark = merge(CustomDarkTheme, DarkTheme)

export function useAppTheme() {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const theme = isDark ? AppThemeDark : AppThemeLight
  return {
    colorScheme,
    isDark,
    theme,
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  }
}

export function AppTheme({ children }: PropsWithChildren) {
  const { theme } = useAppTheme()

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider value={theme}>{children}</ThemeProvider>
    </PaperProvider>
  )
}
