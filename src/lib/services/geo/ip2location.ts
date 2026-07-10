import axios from 'axios'

export interface GeoLocation {
  country_code: string
  country_name: string
  region: string
  city: string
  latitude: number
  longitude: number
  isp: string
  timezone: string
}

export async function getGeoLocation(ip: string): Promise<GeoLocation | null> {
  try {
    const apiKey = process.env.IP2LOCATION_API_KEY

    if (!apiKey) {
      console.warn('IP2LOCATION_API_KEY not set')
      return getFallbackLocation(ip)
    }

    if (ip === '127.0.0.1' || ip === 'localhost' || ip === '::1' || ip === 'unknown') {
      return {
        country_code: 'US',
        country_name: 'United States',
        region: 'California',
        city: 'San Francisco',
        latitude: 37.7749,
        longitude: -122.4194,
        isp: 'Local Development',
        timezone: 'America/Los_Angeles',
      }
    }

    const response = await axios.get('https://api.ip2location.io/', {
      params: {
        key: apiKey,
        ip: ip,
        format: 'json',
      },
      timeout: 5000,
    })

    if (response.data && response.data.country_code) {
      return {
        country_code: response.data.country_code,
        country_name: response.data.country_name || '',
        region: response.data.region_name || '',
        city: response.data.city_name || '',
        latitude: parseFloat(response.data.latitude) || 0,
        longitude: parseFloat(response.data.longitude) || 0,
        isp: response.data.isp || '',
        timezone: response.data.timezone || '',
      }
    }

    return getFallbackLocation(ip)
  } catch (error) {
    console.error('IP2Location error:', error)
    return getFallbackLocation(ip)
  }
}

function getFallbackLocation(ip: string): GeoLocation {
  return {
    country_code: 'US',
    country_name: 'United States',
    region: 'Unknown',
    city: 'Unknown',
    latitude: 0,
    longitude: 0,
    isp: 'Unknown',
    timezone: 'UTC',
  }
}