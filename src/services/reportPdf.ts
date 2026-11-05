import { Platform } from 'react-native'
import * as Print from 'expo-print'
import * as Sharing from 'expo-sharing'
import type { ReportSummary } from '../features/reports/buildReport'
import { reportHtml } from '../features/reports/reportHtml'

export async function exportReportPdf(report: ReportSummary): Promise<void> {
  const html = reportHtml(report)
  if (Platform.OS === 'web') {
    await Print.printAsync({ html })
    return
  }
  const { uri } = await Print.printToFileAsync({ html })
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: 'Relatório Kaluanã' })
  } else {
    await Print.printAsync({ uri })
  }
}
