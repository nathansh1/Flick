import { Text as NativeText } from 'react-native'
import { Text, TextProps } from 'react-native-paper'

export function AppText({ ...rest }: TextProps<NativeText>) {
  return <Text {...rest} />
}
