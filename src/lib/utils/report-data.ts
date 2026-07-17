export interface AccountGeoReportRow {
  linkAccountId: string
  country?: string | null
  isUnique?: boolean | null
}

export interface AccountLike {
  id: string
  accountName?: string | null
}

export interface AccountGeoReportDataset {
  label: string
  data: number[]
  borderColor: string
  backgroundColor: string
  fill: boolean
  tension: number
  pointRadius: number
}

export interface AccountGeoReportPayload {
  labels: string[]
  datasets: AccountGeoReportDataset[]
  accountBreakdown: Array<{
    accountName: string
    totalUniqueClicks: number
    countries: Array<{ country: string; uniqueClicks: number }>
  }>
}

export function buildAccountGeoReport(
  clicks: AccountGeoReportRow[],
  accounts: AccountLike[]
): AccountGeoReportPayload {
  const countryTotals = new Map<string, number>()
  clicks.forEach((click) => {
    if (!click.isUnique) return
    const country = (click.country || '').trim()
    if (!country) return
    countryTotals.set(country, (countryTotals.get(country) || 0) + 1)
  })

  const countries = Array.from(countryTotals.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([country]) => country)

  const accountMap = new Map(accounts.map((account) => [account.id, account.accountName || 'Unnamed account']))
  const accountSeries = new Map<string, Map<string, number>>()

  clicks.forEach((click) => {
    if (!click.linkAccountId) return
    if (!click.isUnique) return

    const country = (click.country || '').trim()
    if (!country) return

    const series = accountSeries.get(click.linkAccountId) || new Map<string, number>()
    series.set(country, (series.get(country) || 0) + 1)
    accountSeries.set(click.linkAccountId, series)
  })

  const datasets = accounts
    .map((account) => {
      const series = accountSeries.get(account.id) || new Map<string, number>()
      return {
        label: account.accountName || 'Unnamed account',
        data: countries.map((country) => series.get(country) || 0),
        borderColor: ['#8B5CF6', '#22C55E', '#38BDF8', '#F59E0B', '#F472B6'][accounts.indexOf(account) % 5],
        backgroundColor: 'rgba(255,255,255,0.06)',
        fill: false,
        tension: 0.35,
        pointRadius: 2,
      }
    })
    .filter((dataset) => dataset.label)

  const accountBreakdown = accounts
    .map((account) => {
      const series = accountSeries.get(account.id) || new Map<string, number>()
      const countriesBreakdown = Array.from(series.entries())
        .map(([country, uniqueClicks]) => ({ country, uniqueClicks }))
        .sort((left, right) => right.uniqueClicks - left.uniqueClicks)

      return {
        accountName: account.accountName || 'Unnamed account',
        totalUniqueClicks: countriesBreakdown.reduce((sum, item) => sum + item.uniqueClicks, 0),
        countries: countriesBreakdown,
      }
    })
    .filter((account) => account.totalUniqueClicks > 0)
    .sort((left, right) => right.totalUniqueClicks - left.totalUniqueClicks)

  return {
    labels: countries,
    datasets,
    accountBreakdown,
  }
}
