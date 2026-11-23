import { storageKeys } from '@/constants/storageKeys';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

const isOnlyNumbers = (str: string) => /^\d*$/.test(str);

export default function useStreak() {
    const lastStreakDateRef = useRef(new Date().toDateString());

    const [streak, setStreak] = useState([
        { id: '1', complete: false },
        { id: '2', complete: false },
        { id: '3', complete: false },
        { id: '4', complete: false },
    ]);

    const isStreakLoadedRef = useRef(false);

    const rolloverIfNewDay = () => {
        const today = new Date().toDateString();

        if (lastStreakDateRef.current === today) return false;

        lastStreakDateRef.current = today;

        AsyncStorage.setItem(storageKeys.streakDay, today).catch((e) =>
            console.log(e),
        );

        return true;
    };

    const resetStreak = () => {
        const hasFalse = streak.some((item) => !item.complete);

        if (!hasFalse) {
            setStreak((prevStreak) => {
                return prevStreak.map((item) => {
                    return { ...item, complete: false };
                });
            });
        }
    };

    const addNewStreak = () => {
        const isNewDay = rolloverIfNewDay();

        const base = isNewDay
            ? streak.map((item) => ({ ...item, complete: false }))
            : streak;

        let found = false;
        const next = base.map((item) => {
            if (!item.complete && !found) {
                found = true;
                return { ...item, complete: true };
            }
            return item;
        });

        setStreak(next);

        return next.filter((item) => !item.complete).length;
    };

    useFocusEffect(
        useCallback(() => {
            if (!isStreakLoadedRef.current) return;

            if (rolloverIfNewDay()) {
                setStreak((prevStreak) =>
                    prevStreak.map((item) => {
                        return { ...item, complete: false };
                    }),
                );
            }
        }, []),
    );

    useEffect(() => {
        Promise.all([
            AsyncStorage.getItem(storageKeys.streakDay),
            AsyncStorage.getItem(storageKeys.streak),
        ])
            .then(([savedDay, savedStreak]) => {
                if (savedDay) lastStreakDateRef.current = savedDay;

                const count =
                    savedStreak && isOnlyNumbers(savedStreak)
                        ? Number(savedStreak)
                        : 0;

                const savedCount =
                    savedDay === new Date().toDateString() ? count : 0;

                setStreak((prevStreak) => {
                    return prevStreak.map((item, index) => {
                        return { ...item, complete: index < savedCount };
                    });
                });
            })
            .catch((e) => console.log(e))
            .finally(() => {
                isStreakLoadedRef.current = true;
            });
    }, []);

    useEffect(() => {
        if (!isStreakLoadedRef.current) return;

        const count = streak.filter((item) => item.complete).length;

        AsyncStorage.multiSet([
            [storageKeys.streak, String(count)],
            [storageKeys.streakDay, lastStreakDateRef.current],
        ]).catch((e) => console.log(e));
    }, [streak]);

    return { streak, resetStreak, addNewStreak };
}
