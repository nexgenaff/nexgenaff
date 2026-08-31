export type DashboardMetricClick = {
  isBot: boolean;
};

export function filterDashboardClicks<T extends DashboardMetricClick>(
  clicks: T[],
  clickType?: string,
): T[] {
  if (clickType === 'bots') {
    return clicks.filter((click) => click.isBot);
  }

  return clicks.filter((click) => !click.isBot);
}

export function getBotClicksCount<T extends DashboardMetricClick>(clicks: T[]): number {
  return clicks.filter((click) => click.isBot).length;
}
