import { View, Text, Pressable, ScrollView } from "@/tw";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { MaterialIcons } from "@expo/vector-icons";
import { useStopwatch } from "@/hooks/use-stopwatch";

const BLACK = "#000000";
const WHITE = "#F5F5F4";
const DIM = "#57534E";
const FAINT = "#2A2724";

const RING_SIZE = 264;
const RING_RADIUS = RING_SIZE / 2;
const DOT_SIZE = 14;
const REVOLUTION_MS = 60000;

type StatusColors = { ring: string; dot: string; text: string };

function getStatusColors(isRunning: boolean, isReady: boolean): StatusColors {
  if (isReady) return { ring: FAINT, dot: "#8A8580", text: DIM };
  if (isRunning) return { ring: "#2ECC5F", dot: "#4CFF7E", text: "#4CFF7E" };
  return { ring: "#8C7A1A", dot: "#FFE24D", text: "#FFE24D" };
}

function pad2(n: number) {
  return String(Math.floor(n)).padStart(2, "0");
}

function fmtMain(ms: number) {
  return `${pad2(ms / 60000)}:${pad2((ms % 60000) / 1000)}`;
}

function fmtCs(ms: number) {
  return pad2((ms % 1000) / 10);
}

function fmtSplit(ms: number) {
  return `${fmtMain(ms)}.${fmtCs(ms)}`;
}

export default function StopwatchScreen() {
  const { displayTime, isRunning, isReady, laps, start, pause, reset, lap } =
    useStopwatch();

  const statusLabel = isRunning ? "RUNNING" : isReady ? "READY" : "PAUSED";
  const canReset = !isReady;
  const canLap = isRunning;
  const colors = getStatusColors(isRunning, isReady);

  // Dot position: one full lap of the ring per minute of elapsed time
  const progress = (displayTime % REVOLUTION_MS) / REVOLUTION_MS;
  const angle = progress * 2 * Math.PI - Math.PI / 2;
  const dotTravel = RING_RADIUS - DOT_SIZE / 2;
  const dotX = RING_RADIUS + dotTravel * Math.cos(angle) - DOT_SIZE / 2;
  const dotY = RING_RADIUS + dotTravel * Math.sin(angle) - DOT_SIZE / 2;

  // Current-lap split: time since the last recorded lap (or since start)
  const lastLapTotal = laps[0] ?? 0;
  const currentSplit = displayTime - lastLapTotal;
  const currentLapIndex = laps.length + 1;
  const showLapRows = !isReady || laps.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BLACK }}>
      <StatusBar style="light" backgroundColor={BLACK} />

      {/* Ring + time */}
      <View className="items-center pt-8 pb-2">
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
              borderColor: colors.ring,
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
              backgroundColor: colors.dot,
              shadowColor: colors.dot,
              shadowOpacity: 0.9,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 0 },
              elevation: 6,
            }}
          />
          <Text
            className="font-mono"
            style={{ fontSize: 40, letterSpacing: 1, color: WHITE }}
          >
            {fmtMain(displayTime)}
            <Text style={{ fontSize: 22, color: DIM }}>
              .{fmtCs(displayTime)}
            </Text>
          </Text>
        </View>

        <Text
          className="font-mono uppercase"
          style={{
            marginTop: 20,
            fontSize: 12,
            letterSpacing: 5,
            color: colors.text,
          }}
        >
          {statusLabel}
        </Text>
      </View>

      {/* Laps section */}
      <View className="flex-1 px-6 pt-6">
        {!showLapRows ? (
          <View className="items-center pt-3">
            <Text className="text-[9px] tracking-[0.15em] text-stone-500 uppercase">
              No laps yet · Tap the flag to record one
            </Text>
          </View>
        ) : (
          <>
            {/* Current running lap */}
            {!isReady && (
              <View
                className="flex-row justify-between items-center py-3 border-b"
                style={{ borderColor: FAINT }}
              >
                <Text className="text-[9px] tracking-[0.15em] text-stone-500 uppercase">
                  Lap {currentLapIndex}
                </Text>
                <Text
                  className="text-sm font-mono"
                  style={{ color: "#D6D3D1" }}
                >
                  {fmtSplit(currentSplit)}
                </Text>
              </View>
            )}
            {/* Recorded laps */}
            <ScrollView className="flex-1">
              {laps.map((total, i) => {
                const split = total - (laps[i + 1] ?? 0);
                const lapNum = laps.length - i;
                return (
                  <View
                    key={i}
                    className="flex-row justify-between items-center py-3 border-b"
                    style={{ borderColor: FAINT }}
                  >
                    <Text className="text-[9px] tracking-[0.15em] text-stone-600 uppercase">
                      Lap {lapNum}
                    </Text>
                    <Text
                      className="text-sm font-mono"
                      style={{ color: "#A8A29E" }}
                    >
                      {fmtSplit(split)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </>
        )}
      </View>

      {/* Controls */}
      <View className="flex-row justify-center items-center gap-10 py-10">
        {/* Reset */}
        <Pressable
          onPress={reset}
          disabled={!canReset}
          android_ripple={{ color: "#292524", borderless: true, radius: 30 }}
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{
            borderWidth: 1.5,
            borderColor: canReset ? "#D6D3D1" : FAINT,
          }}
        >
          <MaterialIcons
            name="refresh"
            size={22}
            color={canReset ? "#D6D3D1" : FAINT}
          />
        </Pressable>

        {/* Play / Pause */}
        <Pressable
          onPress={isRunning ? pause : start}
          android_ripple={{ color: "#000000", borderless: true, radius: 42 }}
          className="w-20 h-20 rounded-full items-center justify-center"
          style={{
            backgroundColor: colors.dot,
            shadowColor: colors.dot,
            shadowOpacity: 0.5,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 0 },
            elevation: 8,
          }}
        >
          <MaterialIcons
            name={isRunning ? "pause" : "play-arrow"}
            size={34}
            color={BLACK}
          />
        </Pressable>

        {/* Lap */}
        <Pressable
          onPress={lap}
          disabled={!canLap}
          android_ripple={{ color: "#292524", borderless: true, radius: 30 }}
          className="w-14 h-14 rounded-full items-center justify-center"
          style={{
            borderWidth: 1.5,
            borderColor: canLap ? "#D6D3D1" : FAINT,
          }}
        >
          <MaterialIcons
            name="flag"
            size={20}
            color={canLap ? "#D6D3D1" : FAINT}
          />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
