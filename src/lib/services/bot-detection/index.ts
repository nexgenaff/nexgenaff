interface BotDetectionResult {
  isBot: boolean
  score: number
  reasons: string[]
  confidence: 'low' | 'medium' | 'high'
}

export class BotDetectionService {
  private static readonly requestFrequency: Map<string, number[]> = new Map()
  private static readonly suspiciousIPs: Set<string> = new Set()

  // Comprehensive search engine bot patterns
  private readonly searchEnginePatterns: RegExp[] = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /yandex/i,
    /baidu/i,
    /duckduckbot/i,
    /facebookexternalhit/i,
  ]

  // Social media and preview bots
  private readonly socialMediaPatterns: RegExp[] = [
    /twitterbot/i,
    /linkedinbot/i,
    /whatsapp/i,
    /telegram/i,
    /slack/i,
    /discord/i,
    /pinterestbot/i,
    /vkshare/i,
    /tumblr/i,
    /quora link preview/i,
    /redditbot/i,
  ]

  // SEO and website analysis bots
  private readonly seoAnalysisPatterns: RegExp[] = [
    /ahrefsbot/i,
    /semrushbot/i,
    /mj12bot/i,
    /seobility/i,
    /majestic/i,
    /rogerbot/i,
    /dotbot/i,
    /petalbot/i,
    /sitebulb/i,
    /screamingfrog/i,
    /screaming frog/i,
    /seositecheckup/i,
    /seolytics/i,
  ]

  // Headless browser and automation patterns
  private readonly automationPatterns: RegExp[] = [
    /headlesschrome/i,
    /headless/i,
    /playwright/i,
    /puppeteer/i,
    /selenium/i,
    /webdriver/i,
    /phantom/i,
    /jsdom/i,
    /lighthouse/i,
    /wdio/i,
    /chromedriver/i,
    /appium/i,
  ]

  // HTTP client and crawler patterns
  private readonly httpClientPatterns: RegExp[] = [
    /curl\//i,
    /wget\//i,
    /python-requests\//i,
    /apache-httpclient/i,
    /java\//i,
    /node-fetch/i,
    /axios/i,
    /okhttp/i,
    /libwww-perl/i,
    /php\//i,
  ]

  // Malicious and vulnerability scanner patterns
  private readonly maliciousPatterns: RegExp[] = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /nessus/i,
    /masscan/i,
    /metasploit/i,
    /havij/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i,
    /qualys/i,
  ]

  // Archive and research bots
  private readonly archivePatterns: RegExp[] = [
    /ia_archiver/i,
    /archive/i,
    /wayback/i,
    /commoncrawl/i,
  ]

  async detect(
    userAgent: string,
    ip: string,
    headers?: Record<string, string | null>,
  ): Promise<BotDetectionResult> {
    const normalizedUserAgent = userAgent.toLowerCase()
    const reasons: string[] = []
    let score = 0

    // Check known malicious bots (highest priority)
    for (const pattern of this.maliciousPatterns) {
      if (pattern.test(normalizedUserAgent)) {
        score += 100
        reasons.push('Malicious bot or vulnerability scanner detected')
        return { isBot: true, score: 100, reasons, confidence: 'high' }
      }
    }

    // Check search engine bots
    for (const pattern of this.searchEnginePatterns) {
      if (pattern.test(normalizedUserAgent)) {
        score += 50
        reasons.push('Search engine bot detected')
        break
      }
    }

    // Check social media bots
    if (score === 0) {
      for (const pattern of this.socialMediaPatterns) {
        if (pattern.test(normalizedUserAgent)) {
          score += 40
          reasons.push('Social media preview bot detected')
          break
        }
      }
    }

    // Check SEO analysis bots
    if (score === 0) {
      for (const pattern of this.seoAnalysisPatterns) {
        if (pattern.test(normalizedUserAgent)) {
          score += 60
          reasons.push('SEO analysis or crawler bot detected')
          break
        }
      }
    }

    // Check automation tools
    for (const pattern of this.automationPatterns) {
      if (pattern.test(normalizedUserAgent)) {
        score += 55
        reasons.push('Automation or headless browser detected')
        break
      }
    }

    // Check HTTP clients
    for (const pattern of this.httpClientPatterns) {
      if (pattern.test(normalizedUserAgent)) {
        score += 45
        reasons.push('Programmatic HTTP client detected')
        break
      }
    }

    // Check archive bots
    for (const pattern of this.archivePatterns) {
      if (pattern.test(normalizedUserAgent)) {
        score += 35
        reasons.push('Archive or crawling bot detected')
        break
      }
    }

    // Behavioral analysis
    if (score === 0) {
      // Check for generic crawler/spider keywords
      if (/(crawler|spider|scrape|bot|crawl|scraper|downloader|fetcher|agent|harvester)/i.test(userAgent)) {
        score += 30
        reasons.push('Generic bot-like keywords in user-agent')
      }
    }

    // Header-based detection
    if (headers) {
      const headerScore = this.analyzeHeaders(headers)
      if (headerScore.score > 0) {
        score += headerScore.score
        reasons.push(...headerScore.reasons)
      }
    }

    // Missing or suspicious headers
    if (!headers?.['user-agent'] || userAgent.length < 5) {
      score += 20
      reasons.push('Suspicious or missing user-agent header')
    }

    // Rate limiting check
    const frequency = this.getRequestFrequency(ip)
    if (frequency > 50) {
      score += 30
      reasons.push(`Extreme request frequency detected: ${frequency} requests/min`)
    } else if (frequency > 20) {
      score += 15
      reasons.push(`High request frequency: ${frequency} requests/min`)
    }

    // Suspicious IP check
    if (BotDetectionService.suspiciousIPs.has(ip)) {
      score += 25
      reasons.push('IP marked as suspicious due to bot pattern')
    }

    // If high bot score, mark IP as suspicious for future requests
    if (score >= 60) {
      BotDetectionService.suspiciousIPs.add(ip)
      // Clean up after 24 hours
      setTimeout(
        () => BotDetectionService.suspiciousIPs.delete(ip),
        24 * 60 * 60 * 1000,
      )
    }

    const finalScore = Math.min(score, 100)
    const confidence = this.getConfidence(finalScore, reasons.length)

    return {
      isBot: finalScore >= 50,
      score: finalScore,
      reasons,
      confidence,
    }
  }

  private analyzeHeaders(headers: Record<string, string | null>): { score: number; reasons: string[] } {
    let score = 0
    const reasons: string[] = []

    // Check for missing common browser headers
    const hasAccept = headers['accept']
    const hasAcceptLanguage = headers['accept-language']
    const hasAcceptEncoding = headers['accept-encoding']

    if (!hasAccept || !hasAcceptLanguage || !hasAcceptEncoding) {
      score += 10
      reasons.push('Missing common browser headers')
    }

    // Check for suspicious header combinations
    if (headers['cache-control'] === 'no-cache' && !hasAccept) {
      score += 15
      reasons.push('Suspicious cache-control without accept header')
    }

    // Check for missing or suspicious referer
    const referer = headers['referer']
    if (referer === '' || (referer && referer.includes('127.0.0.1'))) {
      score += 5
      reasons.push('Suspicious or empty referer')
    }

    return { score, reasons }
  }

  private getConfidence(score: number, reasonCount: number): 'low' | 'medium' | 'high' {
    if (score >= 80 || reasonCount >= 3) {
      return 'high'
    }
    if (score >= 60 || reasonCount >= 2) {
      return 'medium'
    }
    return 'low'
  }

  private getRequestFrequency(ip: string): number {
    const now = Date.now()
    const timestamps = BotDetectionService.requestFrequency.get(ip) || []
    const recent = timestamps.filter((timestamp) => now - timestamp < 60000)

    recent.push(now)
    BotDetectionService.requestFrequency.set(ip, recent)

    // Clean up old entries periodically
    if (recent.length > 1000) {
      const oldest = recent.splice(0, 500)
    }

    return recent.length
  }
}