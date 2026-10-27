import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Circle, Line, Polyline } from 'react-native-svg'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../navigation/types'
import type { CheckIn } from '../../types/domain'
import { Screen } from '../../components/ui/Screen'
import { Card, formStyles } from '../../components/ui/forms'
import { useCollection } from '../../hooks/useCollection'
import { newId, todayKey } from '../../services/storage'
import { LEVEL_LABEL } from '../../features/reports/buildReport'
import { colors, fonts, radius, spacing } from '../../styles/tokens'

type Props = NativeStackScreenProps<RootStackParamList, 'CheckIn'>
const LEVELS = [1, 2, 3, 4, 5] as const

/** RF3: check-in diário + histórico em série temporal. Só mostra o que foi registrado. */
export function CheckInScreen({ navigation }: Props) {
  const { items, upsert } = useCollection<CheckIn>('checkins')
  const [justSaved, setJustSaved] = useState(false)
  const today = todayKey()
  const todays = items.find((c) => c.date === today)

  async function pick(level: CheckIn['level']) {
    await upsert({ id: todays?.id ?? newId(), date: today, level, timestamp: new Date().toISOString() })
    setJustSaved(true)
    setTimeout(() => setJustSaved(false), 2000)
  }

  const series = [...items].sort((a, b) => a.date.localeCompare(b.date)).slice(-14)

  return (
    <Screen label="KALUANA · CHECK-IN" title="Como foi hoje?" onBack={() => navigation.goBack()}>
      <Text style={[formStyles.muted, { marginBottom: spacing[4] }]}>
        {todays ? 'Você já registrou hoje. Tocar de novo atualiza o registro.' : 'Escolha o que mais combina com o seu dia.'}
      </Text>
      <View style={{ gap: spacing[2] }}>
        {LEVELS.map((l) => {
          const on = todays?.level === l
          return (
            <Pressable key={l} onPress={() => pick(l)} accessibilityRole="radio" accessibilityState={{ selected: on }} style={[s.level, on && s.levelOn]}>
              <Text style={[s.levelText, on && { color: colors.white }]}>{LEVEL_LABEL[l]}</Text>
            </Pressable>
          )
        })}
      </View>
      {justSaved && <Text style={[formStyles.muted, { marginTop: spacing[3] }]}>Registrado ✓</Text>}

      <Text style={formStyles.sectionTitle}>ÚLTIMOS DIAS</Text>
      {series.length < 2 ? <Text style={formStyles.muted}>O gráfico aparece a partir de 2 dias com check-in.</Text> : <Chart data={series} />}

      {[...items].slice(0, 14).map((c) => (
        <Card key={c.id}>
          <Text style={formStyles.itemTitle}>{new Date(c.timestamp).toLocaleDateString('pt-BR')}</Text>
          <Text style={formStyles.muted}>{LEVEL_LABEL[c.level]}</Text>
        </Card>
      ))}
    </Screen>
  )
}

function Chart({ data }: { data: CheckIn[] }) {
  const W = 320
  const H = 120
  const pad = 12
  const x = (i: number) => pad + (i * (W - 2 * pad)) / (data.length - 1)
  const y = (lvl: number) => H - pad - ((lvl - 1) * (H - 2 * pad)) / 4
  const pts = data.map((c, i) => `${x(i)},${y(c.level)}`).join(' ')
  return (
    <View accessible accessibilityLabel={`Gráfico dos últimos ${data.length} check-ins`} style={s.chart}>
      <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
        {[1, 3, 5].map((l) => (
          <Line key={l} x1={pad} x2={W - pad} y1={y(l)} y2={y(l)} stroke={colors.cream} strokeWidth={1} />
        ))}
        <Polyline points={pts} fill="none" stroke={colors.ink} strokeWidth={2} />
        {data.map((c, i) => (
          <Circle key={c.id} cx={x(i)} cy={y(c.level)} r={3.5} fill={colors.emberBright} />
        ))}
      </Svg>
    </View>
  )
}

const s = StyleSheet.create({
  level: { minHeight: 52, justifyContent: 'center', paddingHorizontal: spacing[4], borderWidth: 1, borderColor: colors.ink, borderRadius: radius.sm, backgroundColor: colors.bgSurface },
  levelOn: { backgroundColor: colors.ink },
  levelText: { fontFamily: fonts.bodyBold, fontSize: 16, color: colors.ink },
  chart: { backgroundColor: colors.bgSurface, borderRadius: radius.sm, padding: spacing[2], marginBottom: spacing[4] },
})
