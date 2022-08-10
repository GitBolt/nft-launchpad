type Sale = {
  [key: string]: number
};
export interface SalesData {
  presaleSols: number,
  publicsaleSols: number,
  presaleSols7Days: number,
  publicsaleSols7Days: number,
  presale: Sale
  publicsale: Sale
  presaleMonthlyGrowth: number,
  publicsaleMonthlyGrowth: number,
  mintedCount: number,
  nftsLeft: number
}

type Traffic = {
  [key: string]: number,
  total: number
};

export interface TrafficData {
  presaleTraffic: number,
  publicsaleTraffic: number,
  presaleTraffic7Days: number,
  publicsaleTraffic7Days: number,
  presale: Traffic
  publicsale: Traffic
  presaleWeeklyGrowth: number,
  publicsaleWeeklyGrowth: number,
}
