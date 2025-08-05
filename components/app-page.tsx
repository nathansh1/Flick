import { useAppTheme } from '@/components/app-theme'
import { AppView, AppViewProps } from '@/components/app-view'
import React, { PropsWithChildren } from 'react'

export function AppPage({ children, ...props }: PropsWithChildren<AppViewProps>) {
  const { spacing } = useAppTheme()
  return (
    <AppView style={{ flex: 1, gap: spacing.md, padding: spacing.md, backgroundColor: '#000000' }} {...props}>
      {children}
    </AppView>
  )
}
