import { Pause, Play, RotateCcw, SkipForward } from "lucide-react-native";
import { useCallback } from "react";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

import { colors } from "@/constants/colors";
import { TimerType } from "@/constants/TimerType";
import useStreak from "@/hooks/useStreak";
import useTimer from "@/hooks/useTimer";
import PawPrint from "lucide-react-native/icons/paw-print";

const circleRadius = 120;
const circleSize = circleRadius * 2;
const stroke = 10;
const dashCount = 2 * Math.PI * (circleRadius - stroke);

export default function HomeScreen() {
  const { streak, resetStreak, addNewStreak } = useStreak();

  const {
    timerType,
    setTimerType,
    durationMs,
    isStarted,
    isOnPause,
    isAfterFocus,
    getProgress,
    timeToString,
    setOnPause,
    onResetHandle,
    onSkipHandle,
  } = useTimer({ onStart: resetStreak, onFocusCompleted: addNewStreak });

  const continueText = () => {
    return isStarted
      ? "Continue"
      : timerType === TimerType.FOCUS
        ? "Start"
        : "Rest";
  };

  const getPawRotation = useCallback(() => {
    const randomDeg = Math.floor(Math.random() * 51) + 20;
    return `-${randomDeg}deg`;
  }, []);

  const getTimerHeader = () => {
    switch (timerType) {
      case TimerType.FOCUS:
        return "FOCUS SESSION";
      case TimerType.SHORT:
        return "SHORT BREAK";
      case TimerType.LONG:
        return "LONG BREAK";
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.background,
      }}
      edges={["top", "bottom"]}
    >
      {!isStarted && !isAfterFocus && (
        <View style={styles.typeContainer}>
          <Pressable
            style={
              timerType === TimerType.FOCUS
                ? styles.typeOptionActive
                : styles.typeOptionInactive
            }
            onPress={() => setTimerType(TimerType.FOCUS)}
          >
            <Text
              style={
                timerType === TimerType.FOCUS
                  ? styles.typeTextActive
                  : styles.typeTextInactive
              }
            >
              Focus
            </Text>
          </Pressable>
          <Pressable
            style={
              timerType === TimerType.SHORT
                ? styles.typeOptionActive
                : styles.typeOptionInactive
            }
            onPress={() => setTimerType(TimerType.SHORT)}
          >
            <Text
              style={
                timerType === TimerType.SHORT
                  ? styles.typeTextActive
                  : styles.typeTextInactive
              }
            >
              Short Break
            </Text>
          </Pressable>
          <Pressable
            style={
              timerType === TimerType.LONG
                ? styles.typeOptionActive
                : styles.typeOptionInactive
            }
            onPress={() => setTimerType(TimerType.LONG)}
          >
            <Text
              style={
                timerType === TimerType.LONG
                  ? styles.typeTextActive
                  : styles.typeTextInactive
              }
            >
              Long Break
            </Text>
          </Pressable>
        </View>
      )}

      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Svg
          width={circleSize}
          height={circleSize}
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <Path
            d="
                M 180 35
                L 210 150
                L 240 50
                Q 240 42, 230 40
                Z"
            fill={colors.accent}
          />
          <Path
            d={`
                M 180 ${circleSize - 35}
                L 210 ${circleSize - 150}
                L 240 ${circleSize - 50}
                Q 240 ${circleSize - 42}, 230 ${circleSize - 40}
                Z`}
            fill={colors.accent}
          />

          <Circle
            fill={colors.background}
            cx={circleRadius}
            cy={circleRadius}
            r={circleRadius - stroke / 1.9}
          />

          <Circle
            stroke={`${colors.accent}55`}
            fill="none"
            cx={circleRadius}
            cy={circleRadius}
            r={circleRadius - stroke}
            strokeWidth={stroke}
          />

          <Circle
            stroke={colors.accent}
            fill="none"
            cx={circleRadius}
            cy={circleRadius}
            r={circleRadius - stroke}
            strokeWidth={stroke}
            strokeDasharray={dashCount}
            strokeDashoffset={dashCount - getProgress() * dashCount}
            strokeLinecap="round"
          />
        </Svg>
        <View style={{ position: "absolute", alignItems: "center" }}>
          <Text
            style={{
              fontFamily: "Andika",
              color: colors.muted,
              fontWeight: "bold",
              fontSize: 12,
              letterSpacing: 2,
            }}
          >
            {getTimerHeader()}
          </Text>
          <Text
            style={{
              fontFamily: "Andika",
              fontSize: 55,
              fontWeight: "bold",
              color: colors.text,
            }}
          >
            {timeToString()}
          </Text>
          <Text
            style={{
              fontFamily: "Andika",
              color: colors.muted,
              fontSize: 12,
            }}
          >
            of {Math.floor(durationMs / 10 / 60) / 100} minutes
          </Text>
        </View>
      </View>

      {timerType === TimerType.FOCUS && (
        <View style={{ alignItems: "center", marginTop: 24 }}>
          <View style={styles.streakContainer}>
            {streak.map((item) => (
              <View
                key={item.id}
                style={{ transform: [{ rotate: getPawRotation() }] }}
              >
                <PawPrint
                  size={28}
                  color={item.complete ? colors.accent : colors.muted}
                ></PawPrint>
              </View>
            ))}
          </View>
          <Text
            style={{ color: colors.muted, fontFamily: "Andika", marginTop: 6 }}
          >
            Soft paws, steady progress.
          </Text>
        </View>
      )}

      <View style={styles.session}>
        {isOnPause ? (
          <Pressable
            style={styles.continueButton}
            onPress={() => setOnPause(false)}
          >
            <Play
              style={{ position: "absolute", left: 16 }}
              size={24}
              color={colors.background}
            />
            <Text
              style={{
                fontFamily: "Andika",
                fontSize: 20,
                color: colors.background,
              }}
            >
              {continueText()}
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.pauseButton}
            onPress={() => setOnPause(true)}
          >
            <Pause
              style={{ position: "absolute", left: 16 }}
              size={24}
              color={colors.text}
            />
            <Text
              style={{ fontFamily: "Andika", fontSize: 20, color: colors.text }}
            >
              Pause
            </Text>
          </Pressable>
        )}
        {isAfterFocus ? (
          <Pressable style={styles.resetButton} onPress={onSkipHandle}>
            <SkipForward color={colors.text} />
          </Pressable>
        ) : (
          <Pressable
            style={styles.resetButton}
            onPress={() => onResetHandle(timerType)}
          >
            <RotateCcw color={colors.text} />
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  typeContainer: {
    backgroundColor: colors.subtle,
    borderRadius: 48,
    flexDirection: "row",
    padding: 6,
    width: "75%",
    marginBottom: 48,
  },
  typeOptionActive: {
    paddingHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderRadius: 48,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  typeOptionInactive: {
    paddingHorizontal: 4,
    paddingVertical: 12,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  typeTextActive: {
    fontFamily: "Andika",
    color: colors.text,
    fontWeight: "bold",
    textAlign: "center",
  },
  typeTextInactive: {
    fontFamily: "Andika",
    color: colors.muted,
    textAlign: "center",
  },
  session: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    flexDirection: "row",
  },
  continueButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.accent,
    width: "55%",
    padding: 18,
    borderRadius: 48,
    flexDirection: "row",
  },
  pauseButton: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.subtle,
    width: "55%",
    padding: 18,
    borderRadius: 48,
    flexDirection: "row",
  },
  resetButton: {
    width: 66,
    height: 66,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
    marginLeft: 12,
  },
  streakContainer: {
    flexDirection: "row",
    gap: 12,
  },
});
