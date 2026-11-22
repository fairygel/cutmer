import { storageKeys } from "@/constants/storageKeys";
import { TimerType } from "@/constants/TimerType";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";

const isOnlyNumbers = (str: string) => /^\d*$/.test(str);

const durationKeys = {
  [TimerType.FOCUS]: storageKeys.focusDuration,
  [TimerType.SHORT]: storageKeys.shortDuration,
  [TimerType.LONG]: storageKeys.longDuration,
};

const getDefaultTimer = (timerType: TimerType) => {
  switch (timerType) {
    case TimerType.FOCUS:
      return 1000 * 60 * 25;
    case TimerType.SHORT:
      return 1000 * 60 * 5;
    case TimerType.LONG:
      return 1000 * 60 * 15;
  }
};

const readDuration = async (timerType: TimerType) => {
  try {
    const savedDuration = await AsyncStorage.getItem(durationKeys[timerType]);

    if (
      savedDuration &&
      savedDuration !== "0" &&
      isOnlyNumbers(savedDuration)
    ) {
      return Number(savedDuration);
    }
  } catch (e) {
    console.log(e);
  }
  return getDefaultTimer(timerType);
};

type TimerHooks = {
  onStart: () => void;
  onFocusCompleted: () => number;
};

export default function useTimer({ onStart, onFocusCompleted }: TimerHooks) {
  const [timerType, setTimerType] = useState(TimerType.FOCUS);

  const [durationMs, setDurationMs] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [endAt, setEndAt] = useState(0);

  const [isOnPause, setIsOnPause] = useState(true);
  const [isStarted, setIsStarted] = useState(false);
  const [isAfterFocus, setIsAfterFocus] = useState(false);

  const isStartedRef = useRef(isStarted);
  const isOnPauseRef = useRef(isOnPause);

  const getLeftTime = () => {
    return Math.max(0, endAt - Date.now());
  };

  const getLeftTimeRef = useRef(getLeftTime);
  useEffect(() => {
    getLeftTimeRef.current = getLeftTime;
  });

  const setOnPause = (onPause: boolean) => {
    if (onPause) {
      setRemainingTime(getLeftTime());
      setEndAt(0);
    } else {
      setEndAt(Date.now() + remainingTime);
      setIsStarted(true);

      onStart();
    }
    setIsOnPause(onPause);
  };

  const onResetHandle = (destinationTimerType: TimerType) => {
    readDuration(destinationTimerType)
      .then((duration) => {
        setDurationMs(duration);
        setRemainingTime(duration);
        setEndAt(0);
        setIsOnPause(true);
        setIsStarted(false);
      })
      .catch((e) => console.log(e));
  };

  const onSkipHandle = () => {
    setIsAfterFocus(false);
    setTimerType(TimerType.FOCUS);
    onResetHandle(TimerType.FOCUS);
  };

  const onCompleted = () => {
    let finalTimerType = timerType;

    if (timerType === TimerType.FOCUS) {
      setIsAfterFocus(true);

      const incompleteCount = onFocusCompleted();
      
      if (incompleteCount <= 1) {
        finalTimerType = TimerType.LONG;
      } else {
        finalTimerType = TimerType.SHORT;
      }

      setTimerType(finalTimerType);
    } else if (isAfterFocus) {
      setIsAfterFocus(false);
      finalTimerType = TimerType.FOCUS;
      
      setTimerType(finalTimerType);
    }

    onResetHandle(finalTimerType);
  };

  const onCompletedRef = useRef(onCompleted);
  useEffect(() => {
    onCompletedRef.current = onCompleted;
  });

  useFocusEffect(
    useCallback(() => {
      isOnPauseRef.current = isOnPause;
    }, [isOnPause]),
  );

  useFocusEffect(
    useCallback(() => {
      isStartedRef.current = isStarted;
    }, [isStarted]),
  );

  // on first open and tab was switched to this
  useFocusEffect(
    useCallback(() => {
      readDuration(timerType)
        .then((duration) => {
          if (isOnPauseRef.current && !isStartedRef.current) {
            setRemainingTime(duration);
            setEndAt(0);
          }
          if (!isStartedRef.current) {
            setDurationMs(duration);
          }
        })
        .catch((e) => console.log(e));
    }, [timerType]),
  );

  const getProgress = () => {
    return (durationMs - remainingTime) / durationMs || 0;
  };

  const timeToString = () => {
    const totalSeconds = Math.ceil(remainingTime / 1000);

    const mm = Math.floor(totalSeconds / 60)
      .toString()
      .padStart(2, "0");
    const ss = (totalSeconds % 60).toString().padStart(2, "0");

    return `${mm}:${ss}`;
  };

  useEffect(() => {
    if (!endAt) return;
    const id = setInterval(() => {
      const left = getLeftTimeRef.current();

      setRemainingTime(left);

      if (left === 0) {
        clearInterval(id);
        onCompletedRef.current();
      }
    }, 250);
    return () => clearInterval(id);
  }, [endAt]);

  return {
    timerType,
    setTimerType,
    durationMs,
    remainingTime,
    isStarted,
    isOnPause,
    isAfterFocus,
    getProgress,
    timeToString,
    setOnPause,
    onResetHandle,
    onSkipHandle,
  };
}
