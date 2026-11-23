import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react-native';
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TimerCircle from '@/components/TimerCircle';
import { colors } from '@/constants/colors';
import { TimerType } from '@/constants/TimerType';
import useStreak from '@/hooks/useStreak';
import useTimer from '@/hooks/useTimer';
import PawPrint from 'lucide-react-native/icons/paw-print';

const pawRotations: Record<string, number> = {
    '1': Math.floor(Math.random() * 51) + 20,
    '2': Math.floor(Math.random() * 51) + 20,
    '3': Math.floor(Math.random() * 51) + 20,
    '4': Math.floor(Math.random() * 51) + 20,
};

export default function HomeScreen() {
    const { streak, resetStreak, addNewStreak } = useStreak();

    const {
        timerType,
        setTimerType,
        durationMs,
        isStarted,
        isOnPause,
        isAfterFocus,
        isDurationReady,
        getProgress,
        timeToString,
        setOnPause,
        onResetHandle,
        onSkipHandle,
    } = useTimer({ onStart: resetStreak, onFocusCompleted: addNewStreak });

    const continueText = () => {
        return isStarted
            ? 'Continue'
            : timerType === TimerType.FOCUS
              ? 'Start'
              : 'Rest';
    };

    const getPawRotation = (id: string) => {
        return `-${pawRotations[id]}deg`;
    };

    const getTimerHeader = () => {
        switch (timerType) {
            case TimerType.FOCUS:
                return 'FOCUS SESSION';
            case TimerType.SHORT:
                return 'SHORT BREAK';
            case TimerType.LONG:
                return 'LONG BREAK';
        }
    };

    return (
        <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
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

            <TimerCircle
                progress={getProgress()}
                header={getTimerHeader() ?? ''}
                time={timeToString()}
                minutes={Math.floor(durationMs / 10 / 60) / 100}
            />

            {timerType === TimerType.FOCUS && (
                <View style={styles.streakWrapper}>
                    <View style={styles.streakContainer}>
                        {streak.map((item) => (
                            <View
                                key={item.id}
                                style={{
                                    transform: [
                                        { rotate: getPawRotation(item.id) },
                                    ],
                                }}
                            >
                                <PawPrint
                                    size={28}
                                    color={
                                        item.complete
                                            ? colors.accent
                                            : colors.muted
                                    }
                                ></PawPrint>
                            </View>
                        ))}
                    </View>
                    <Text style={styles.streakCaption}>
                        Soft paws, steady progress.
                    </Text>
                </View>
            )}

            <View style={styles.session}>
                {isOnPause ? (
                    <Pressable
                        style={[
                            styles.continueButton,
                            !isDurationReady && styles.buttonDisabled,
                        ]}
                        disabled={!isDurationReady}
                        onPress={() => setOnPause(false)}
                    >
                        <Play
                            style={styles.buttonIcon}
                            size={24}
                            color={colors.background}
                        />
                        <Text style={styles.continueText}>
                            {continueText()}
                        </Text>
                    </Pressable>
                ) : (
                    <Pressable
                        style={styles.pauseButton}
                        onPress={() => setOnPause(true)}
                    >
                        <Pause
                            style={styles.buttonIcon}
                            size={24}
                            color={colors.text}
                        />
                        <Text style={styles.pauseText}>Pause</Text>
                    </Pressable>
                )}
                {isAfterFocus ? (
                    <Pressable
                        style={styles.resetButton}
                        onPress={onSkipHandle}
                    >
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
    screen: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background,
    },
    typeContainer: {
        backgroundColor: colors.subtle,
        borderRadius: 48,
        flexDirection: 'row',
        padding: 6,
        width: '75%',
        marginBottom: 48,
    },
    typeOptionActive: {
        paddingHorizontal: 4,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderRadius: 48,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeOptionInactive: {
        paddingHorizontal: 4,
        paddingVertical: 12,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    typeTextActive: {
        fontFamily: 'Andika',
        color: colors.text,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    typeTextInactive: {
        fontFamily: 'Andika',
        color: colors.muted,
        textAlign: 'center',
    },
    session: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
        flexDirection: 'row',
    },
    continueButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.accent,
        width: '55%',
        padding: 18,
        borderRadius: 48,
        flexDirection: 'row',
    },
    pauseButton: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.subtle,
        width: '55%',
        padding: 18,
        borderRadius: 48,
        flexDirection: 'row',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    resetButton: {
        width: 66,
        height: 66,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.surface,
        marginLeft: 12,
    },
    streakContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    streakWrapper: {
        alignItems: 'center',
        marginTop: 24,
    },
    streakCaption: {
        color: colors.muted,
        fontFamily: 'Andika',
        marginTop: 6,
    },
    buttonIcon: {
        position: 'absolute',
        left: 16,
    },
    continueText: {
        fontFamily: 'Andika',
        fontSize: 20,
        color: colors.background,
    },
    pauseText: {
        fontFamily: 'Andika',
        fontSize: 20,
        color: colors.text,
    },
});
