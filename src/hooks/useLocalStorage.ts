/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (!item) return initialValue;

            const parsed = JSON.parse(item);

            // Safety guard: If initial state is an array, verify parsed is also an array
            if (Array.isArray(initialValue) && !Array.isArray(parsed)) {
                return initialValue;
            }

            // Safety guard: If initial state is an object, verify parsed is also an object
            if (initialValue !== null && typeof initialValue === 'object' && (parsed === null || typeof parsed !== 'object')) {
                return initialValue;
            }

            return parsed;
        } catch (error) {
            console.error('Error reading localStorage key:', key, error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error('Error writing localStorage key:', key, error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
}
