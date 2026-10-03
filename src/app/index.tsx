import { useState } from "react";
import { FlatList } from "react-native";
import { View, Text, Pressable } from "@/tw";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useUnlocks } from "@/hooks/use-unlocks";
import {
  countOn,
  dailyAverage,
  groupHistory,
  weekTotal,
  type Period,
  type PeriodRow,
} from "@/unlock-stats";

const BLACK = "#000000";
const WHITE = "#F5F5F4";
const DIM = "#57534E";
const FAINT = "#2A2724";
const GREEN = "#4CFF7E";
const YELLOW = "#FFE24D";

const RING_SIZE = 232;
const RING_RADIUS = RING_SIZE / 2;
const DOT_SIZE = 14;

const PERIODS: { id: Period; label: string }[] = [
  { id: "day", label: "Day" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
];

function TodayRing({ today, average }: { today: number; average: number }) {
  // One full lap of the ring = your daily average. Past it, the ring turns yellow.
  const over = average > 0 && today > average;
  const color = average === 0 ? DIM : over ? YELLOW : GREEN;
  const progress = average > 0 ? (today % average) / average : 0;
  const angle = progress * 2 * Math.PI - Math.PI / 2;
  const travel = RING_RADIUS - DOT_SIZE / 2;
  const dotX = RING_RADIUS + travel * Math.cos(angle) - DOT_SIZE / 2;
  const dotY = RING_RADIUS + travel * Math.sin(angle) - DOT_SIZE / 2;

  const diff = Math.abs(today - average);
  const status =
    average === 0 ? "TODAY" : over ? `${diff} ABOVE AVG` : `${diff} BELOW AVG`;

  return (
    <View className="items-center pt-6 pb-2">
      <View
        style={{ width: RING_SIZE, height: RING_SIZE }}
        className="items-center justify-center"
      >
        <View
          style={{
            position: "absolute",
            width: RING_SIZE,
            height: RING_SIZE,
            borderRadius: RING_RADIUS,
            borderWidth: 3,
            borderColor: average === 0 ? FAINT : color,
            opacity: average === 0 ? 1 : 0.55,
          }}
        />
        <View
          style={{
            position: "absolute",
            left: dotX,
            top: dotY,
            width: DOT_SIZE,
            height: DOT_SIZE,
            borderRadius: DOT_SIZE / 2,
            backgroundColor: color,
            shadowColor: color,
            shadowOpacity: 0.9,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 0 },
            elevation: 6,
          }}
        />
        <Text className="font-mono" style={{ fontSize: 56, color: WHITE }}>
          {today}
        </Text>
        <Text
          className="font-mono uppercase"
          style={{ fontSize: 10, letterSpacing: 4, color: DIM, marginTop: 2 }}
        >
          Unlocks today
        </Text>
      </View>
      <Text
        className="font-mono uppercase"
        style={{ marginTop: 18, fontSize: 12, letterSpacing: 5, color }}
      >
        {status}
      </Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View className="flex-1 items-center">
      <Text className="font-mono" style={{ fontSize: 20, color: WHITE }}>
        {value}
      </Text>
      <Text className="text-[9px] tracking-[0.15em] text-stone-500 uppercase mt-1">
        {label}
      </Text>
    </View>
  );
}

function HistoryRow({ row, max, period }: { row: PeriodRow; max: number; period: Period }) {
  const perDay = period !== "day" && row.dayCount > 0 ? Math.round(row.count / row.dayCount) : null;
  return (
    <View className="py-3 border-b" style={{ borderColor: FAINT }}>
      <View className="flex-row justify-between items-baseline">
        <View className="flex-row items-baseline gap-2">
          <Text className="text-sm" style={{ color: "#D6D3D1" }}>
            {row.label}
          </Text>
          {row.sublabel ? (
            <Text className="text-[10px] text-stone-600">{row.sublabel}</Text>
          ) : null}
        </View>
        <View className="flex-row items-baseline gap-3">
          {perDay !== null && (
            <Text className="text-[10px] font-mono text-stone-500">{perDay}/day</Text>
          )}
          <Text className="text-sm font-mono" style={{ color: WHITE }}>
            {row.count}
          </Text>
        </View>
      </View>
      <View className="mt-2 h-1 rounded-full" style={{ backgroundColor: FAINT }}>
        <View
          className="h-1 rounded-full"
          style={{
            width: `${max > 0 ? (row.count / max) * 100 : 0}%`,
            backgroundColor: DIM,
          }}
        />
      </View>
    </View>
  );
}

export default function UnlocksScreen() {
  const { days, hasAccess, loaded, supported, requestAccess } = useUnlocks();
  const [period, setPeriod] = useState<Period>("day");

  const now = new Date();
  const today = countOn(days, now);
  const yesterday = countOn(days, new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const average = dailyAverage(days, now);
  const rows = groupHistory(days, period, now);
  const max = Math.max(0, ...rows.map((r) => r.count));

  const header = (
    <View>
      <TodayRing today={today} average={average} />

      <View className="flex-row py-6">
        <Stat label="Yesterday" value={yesterday} />
        <Stat label="This week" value={weekTotal(days, now)} />
        <Stat label="Avg / day" value={average} />
      </View>

      {!supported ? (
        <Notice text="Unlock counting works on Android 9 or newer only." />
      ) : loaded && !hasAccess ? (
        <View className="rounded-2xl p-4 mb-4 border" style={{ borderColor: FAINT }}>
          <Text className="text-sm" style={{ color: WHITE }}>
            Allow usage access
          </Text>
          <Text className="text-xs text-stone-500 mt-1 leading-5">
            Android records every unlock in its usage log. Turn on usage access for
            this app so it can read the count. Nothing leaves your phone.
          </Text>
          <Pressable
            onPress={requestAccess}
            className="mt-4 self-start rounded-full px-5 py-2"
            style={{ backgroundColor: GREEN }}
          >
            <Text className="text-xs font-mono uppercase tracking-[0.15em]" style={{ color: BLACK }}>
              Grant access
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View className="flex-row rounded-full p-1 mb-2" style={{ backgroundColor: "#0F0E0D" }}>
        {PERIODS.map((p) => {
          const active = p.id === period;
          return (
            <Pressable
              key={p.id}
              onPress={() => setPeriod(p.id)}
              className="flex-1 items-center rounded-full py-2"
              style={{ backgroundColor: active ? FAINT : "transparent" }}
            >
              <Text
                className="text-[10px] font-mono uppercase tracking-[0.15em]"
                style={{ color: active ? WHITE : DIM }}
              >
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BLACK }}>
      <StatusBar style="light" backgroundColor={BLACK} />
      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        renderItem={({ item }) => <HistoryRow row={item} max={max} period={period} />}
        ListHeaderComponent={header}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
      />
    </SafeAreaView>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <View className="items-center pb-4">
      <Text className="text-[10px] tracking-[0.15em] text-stone-500 uppercase text-center">
        {text}
      </Text>
    </View>
  );
}
