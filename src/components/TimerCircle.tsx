import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { colors } from "@/constants/colors";

const circleRadius = 120;
const circleSize = circleRadius * 2;
const stroke = 10;
const dashCount = 2 * Math.PI * (circleRadius - stroke);

type TimerCircleProps = {
  progress: number;
  header: string;
  time: string;
  minutes: number;
};

export default function TimerCircle({
  progress,
  header,
  time,
  minutes,
}: TimerCircleProps) {
  return (
    <View style={styles.container}>
      <Svg width={circleSize} height={circleSize} style={styles.svg}>
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
          strokeDashoffset={dashCount - progress * dashCount}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.overlay}>
        <Text style={styles.header}>{header}</Text>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.minutes}>of {minutes} minutes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    transform: [{ rotate: "-90deg" }],
  },
  overlay: {
    position: "absolute",
    alignItems: "center",
  },
  header: {
    fontFamily: "Andika",
    color: colors.muted,
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 2,
  },
  time: {
    fontFamily: "Andika",
    fontSize: 55,
    fontWeight: "bold",
    color: colors.text,
  },
  minutes: {
    fontFamily: "Andika",
    color: colors.muted,
    fontSize: 12,
  },
});
