import { StyleSheet, Text, View } from 'react-native'
import { SignalMark } from '../SignalMark'
import { colors, fonts } from '../../styles/tokens'

interface AuthHeroProps {
  title: string
  maxTitleWidth?: number
  blend?: boolean
  marginBottom: number
}

export function AuthHero({ title, maxTitleWidth, blend = false, marginBottom }: AuthHeroProps) {
  return (
    <View style={[styles.hero, { marginBottom }]}>
      <View style={styles.seal}>
        <SignalMark size={64} />
      </View>
      <Text
        accessibilityRole="header"
        style={[styles.title, maxTitleWidth ? { maxWidth: maxTitleWidth } : null, blend && styles.blend]}
      >
        {title}
      </Text>
    </View>
  )
}

export function AuthSubtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>
}

export function AuthFooterLinks() {
  return <Text style={styles.footer}>termos / privacidade</Text>
}

const styles = StyleSheet.create({
  hero: {
    position: 'relative',
  },
  seal: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 35.2,
    lineHeight: 37,
    color: colors.white,
  },
  blend: {
    mixBlendMode: 'difference',
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14.4,
    lineHeight: 21.6,
    color: colors.white,
    maxWidth: 160,
    marginBottom: 40,
  },
  footer: {
    fontFamily: fonts.body,
    fontSize: 12.8,
    color: colors.inkSoft,
    textAlign: 'center',
    marginTop: 16,
  },
})
