import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui';
import { WeatherSkeletonCard } from '@/components/Skeleton';
import { useTheme } from '@/constants/theme';
import { getWeather, type Weather } from '@/lib/api';

function dayLabel(date: string) {
  const d = new Date(date + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

/** Live demo: asks the Django API for the weather of any city. */
export function WeatherDemo() {
  const t = useTheme();
  const [city, setCity] = useState('Guntur');
  const [data, setData] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      setData(await getWeather(name.trim()));
    } catch (e) {
      setData(null);
      const msg = e instanceof Error ? e.message : '';
      setError(
        msg && !msg.includes('Network') && !msg.includes('aborted') && !msg.includes('fetch')
          ? msg
          : 'The live demo API is offline right now. Start the Django server (python manage.py runserver) and try again.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('Guntur');
  }, [load]);

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
        <TextInput
          value={city}
          onChangeText={setCity}
          onSubmitEditing={() => load(city)}
          placeholder="Enter a city"
          placeholderTextColor={t.muted}
          style={{
            flexGrow: 1,
            minWidth: 180,
            backgroundColor: t.cardAlt,
            color: t.text,
            borderColor: t.border,
            borderWidth: 1,
            borderRadius: 12,
            paddingHorizontal: 14,
            paddingVertical: 11,
            fontSize: 16,
          }}
        />
        <Button label="Get weather" onPress={() => load(city)} />
      </View>

      {loading ? <WeatherSkeletonCard /> : null}

      {error ? <Text style={{ color: '#EF4444', fontSize: 15, lineHeight: 22 }}>{error}</Text> : null}

      {data && !loading ? (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Text style={{ fontSize: 56 }}>{data.icon}</Text>
            <View>
              <Text style={{ color: t.text, fontSize: 44, fontWeight: '800' }}>
                {Math.round(data.temperature)}°C
              </Text>
              <Text style={{ color: t.muted, fontSize: 16 }}>
                {data.description} in {data.city}, {data.country}
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            {[
              ['Feels like', Math.round(data.feels_like) + '°C'],
              ['Humidity', data.humidity + '%'],
              ['Wind', data.wind_speed + ' km/h'],
            ].map(([k, v]) => (
              <View
                key={k}
                style={{
                  backgroundColor: t.cardAlt,
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  minWidth: 100,
                }}>
                <Text style={{ color: t.muted, fontSize: 12 }}>{k}</Text>
                <Text style={{ color: t.text, fontSize: 17, fontWeight: '700' }}>{v}</Text>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
            {data.daily.map((d) => (
              <View
                key={d.date}
                style={{
                  backgroundColor: t.cardAlt,
                  borderRadius: 12,
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  alignItems: 'center',
                  minWidth: 78,
                }}>
                <Text style={{ color: t.muted, fontSize: 13 }}>{dayLabel(d.date)}</Text>
                <Text style={{ fontSize: 26, marginVertical: 4 }}>{d.icon}</Text>
                <Text style={{ color: t.text, fontWeight: '700' }}>{Math.round(d.max)}°</Text>
                <Text style={{ color: t.muted, fontSize: 13 }}>{Math.round(d.min)}°</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}
