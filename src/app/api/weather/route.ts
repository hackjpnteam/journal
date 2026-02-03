import { NextRequest, NextResponse } from 'next/server'

// 天気をキャッシュ（IPごとに30分間）
const weatherCache = new Map<string, { weather: string; location: string; timestamp: number }>()
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
      return NextResponse.json({ weather: cached.weather, location: cached.location })
    }

    const apiKey = process.env.OPENWEATHERMAP_API_KEY

    // APIキーがない場合はデフォルトで晴れを返す
    if (!apiKey) {
      return NextResponse.json({ weather: 'clear', location: '東京' })
    }

    let lat: number
    let lon: number
    let locationName = '東京'

    // ローカル開発時は東京の座標を使用
    if (ip === 'tokyo') {
      lat = 35.6762
      lon = 139.6503
    } else {
      // IPから位置情報を取得（ip-api.comは無料で使用可能）
      try {
        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,lat,lon`, {
          next: { revalidate: 3600 } // 1時間キャッシュ
        })

        if (geoRes.ok) {
          const geoData = await geoRes.json()
          if (geoData.status === 'success' && geoData.lat && geoData.lon) {
            lat = geoData.lat
            lon = geoData.lon
            locationName = geoData.city || '不明な地域'
          } else {
            // 位置情報取得失敗時は東京
            lat = 35.6762
            lon = 139.6503
          }
        } else {
          lat = 35.6762
          lon = 139.6503
        }
      } catch {
        // エラー時は東京
        lat = 35.6762
        lon = 139.6503
      }
    }

    // OpenWeatherMap APIで天気を取得
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`,
      { next: { revalidate: 1800 } } // 30分キャッシュ
    )

    if (!res.ok) {
      console.error('Weather API error:', res.status)
      return NextResponse.json({ weather: 'clear', location: locationName })
    }

    const data = await res.json()
    const weatherId = data.weather?.[0]?.id || 800

    // OpenWeatherMap の weather ID を天気タイプに変換
    // https://openweathermap.org/weather-conditions
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

    // キャッシュを更新
    weatherCache.set(ip, { weather, location: locationName, timestamp: Date.now() })

    return NextResponse.json({ weather, location: locationName })
  } catch (error) {
    console.error('Weather API error:', error)
    return NextResponse.json({ weather: 'clear', location: '東京' })
  }
}
