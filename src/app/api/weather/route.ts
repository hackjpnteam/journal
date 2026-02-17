import { NextRequest, NextResponse } from 'next/server'

// 天気をキャッシュ（IPごとに30分間）
const weatherCache = new Map<string, { weather: string; location: string; temp: number | null; tempMin: number | null; tempMax: number | null; humidity: number | null; description: string; timestamp: number }>()
const CACHE_DURATION = 30 * 60 * 1000 // 30分

export async function GET(request: NextRequest) {
  try {
    // クライアントのIPアドレスを取得
    const forwarded = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    let ip = forwarded?.split(',')[0]?.trim() || realIp || '127.0.0.1'

    // ローカル開発時はデフォルトで東京
    if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      ip = 'tokyo' // ローカルの場合は東京をキーにする
    }

    // キャッシュがあり、有効期限内ならキャッシュを返す
    const cached = weatherCache.get(ip)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return NextResponse.json({ weather: cached.weather, location: cached.location, temp: cached.temp, tempMin: cached.tempMin, tempMax: cached.tempMax, humidity: cached.humidity, description: cached.description })
    }

    let lat: number = 35.6762
    let lon: number = 139.6503
    let locationName = '東京'

    // IPから位置情報を取得（APIキーの有無に関わらず）
    if (ip === 'tokyo') {
      lat = 35.6762
      lon = 139.6503
    } else {
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,lat,lon`, {
          next: { revalidate: 3600 }
        })

        if (geoRes.ok) {
          const geoData = await geoRes.json()
          if (geoData.status === 'success' && geoData.lat && geoData.lon) {
            lat = geoData.lat
            lon = geoData.lon
            locationName = geoData.city || '不明な地域'
          }
        }
      } catch {
        // エラー時は東京のまま
      }
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY

    // APIキーがない場合は位置情報のみ返す（気温なし）
    if (!apiKey) {
      weatherCache.set(ip, { weather: 'clear', location: locationName, temp: null, tempMin: null, tempMax: null, humidity: null, description: '', timestamp: Date.now() })
      return NextResponse.json({ weather: 'clear', location: locationName, temp: null, tempMin: null, tempMax: null, humidity: null, description: '' })
    }

    // OpenWeatherMap APIで天気を取得
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`,
      { next: { revalidate: 1800 } }
    )

    if (!res.ok) {
      console.error('Weather API error:', res.status)
      return NextResponse.json({ weather: 'clear', location: locationName, temp: null, tempMin: null, tempMax: null, humidity: null, description: '' })
    }

    const data = await res.json()
    const weatherId = data.weather?.[0]?.id || 800
    const weatherDescription = data.weather?.[0]?.description || ''
    const temp = data.main?.temp ? Math.round(data.main.temp - 273.15) : null
    const tempMin = data.main?.temp_min ? Math.round(data.main.temp_min - 273.15) : null
    const tempMax = data.main?.temp_max ? Math.round(data.main.temp_max - 273.15) : null
    const humidity = data.main?.humidity || null

    let weather = 'clear'
    if (weatherId >= 200 && weatherId < 300) {
      weather = 'thunderstorm'
    } else if (weatherId >= 300 && weatherId < 400) {
      weather = 'drizzle'
    } else if (weatherId >= 500 && weatherId < 600) {
      weather = 'rain'
    } else if (weatherId >= 600 && weatherId < 700) {
      weather = 'snow'
    } else if (weatherId >= 700 && weatherId < 800) {
      weather = 'fog'
    } else if (weatherId === 800) {
      weather = 'clear'
    } else if (weatherId >= 801 && weatherId <= 802) {
      weather = 'partly_cloudy'
    } else if (weatherId >= 803) {
      weather = 'cloudy'
    }

    weatherCache.set(ip, { weather, location: locationName, temp, tempMin, tempMax, humidity, description: weatherDescription, timestamp: Date.now() })

    return NextResponse.json({ weather, location: locationName, temp, tempMin, tempMax, humidity, description: weatherDescription })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ weather: 'clear', location: '東京' })
  }
}
