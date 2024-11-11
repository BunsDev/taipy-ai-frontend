/*
 * Copyright 2021-2024 Avaiga Private Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import { Dispatch, useEffect } from "react";
import { createLocalStorageAction, createLocalStorageUpdateAction, TaipyBaseAction } from "../context/taipyReducers";

const STORAGE_EVENT = "storage";
const CUSTOM_LOCAL_STORAGE_EVENT = "local-storage";

export const useLocalStorageWithEvent = (dispatch: Dispatch<TaipyBaseAction>) => {
    // Override the original setItem and removeItem behaviour for localStorage to dispatch a custom storage event for local tab
    useEffect(() => {
        // Preserve the original setItem and removeItem method
        const _setItem = Storage.prototype.setItem;
        const _removeItem = Storage.prototype.removeItem;

        Storage.prototype.setItem = function (key, value) {
            if (this === window.localStorage) {
                const oldValue = localStorage.getItem(key);
                _setItem.call(this, key, value);

                const customEvent = new CustomEvent(CUSTOM_LOCAL_STORAGE_EVENT, {
                    detail: { key, oldValue, newValue: value },
                });
                window.dispatchEvent(customEvent);
            } else {
                _setItem.call(this, key, value);
            }
        };

        Storage.prototype.removeItem = function (key: string) {
            if (this === window.localStorage) {
                const oldValue = localStorage.getItem(key);
                _removeItem.call(this, key);

                const customEvent = new CustomEvent(CUSTOM_LOCAL_STORAGE_EVENT, {
                    detail: { key, oldValue, newValue: null },
                });
                window.dispatchEvent(customEvent);
            } else {
                _removeItem.call(this, key);
            }
        };

        // Cleanup the override on unmount
        return () => {
            Storage.prototype.setItem = _setItem;
            Storage.prototype.removeItem = _removeItem;
        };
    }, []);

    // addEventListener for storage and custom storage event
    useEffect(() => {
        const handleStorageEvent = (
            event: StorageEvent | CustomEvent<{ key: string; oldValue: string | null; newValue: string | null }>,
        ) => {
            const isCustomEvent = event instanceof CustomEvent;
            const key = isCustomEvent ? event.detail.key : event.key;
            const newValue = isCustomEvent ? event.detail.newValue : event.newValue;
            if (!key) {
                return;
            }
            dispatch(createLocalStorageUpdateAction(key, newValue));
        };

        window.addEventListener(STORAGE_EVENT, handleStorageEvent as EventListener);
        window.addEventListener(CUSTOM_LOCAL_STORAGE_EVENT, handleStorageEvent as EventListener);

        // Cleanup event listener on unmount
        return () => {
            window.removeEventListener(STORAGE_EVENT, handleStorageEvent as EventListener);
            window.removeEventListener(CUSTOM_LOCAL_STORAGE_EVENT, handleStorageEvent as EventListener);
        };
    }, [dispatch]); // Not necessary to add dispatch to the dependency array but comply with eslint warning anyway

    // send all localStorage data to backend on init
    useEffect(() => {
        const localStorageData: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
                localStorageData[key] = localStorage.getItem(key) || "";
            }
        }
        dispatch(createLocalStorageAction(localStorageData));
    }, [dispatch]); // Not necessary to add dispatch to the dependency array but comply with eslint warning anyway
};
