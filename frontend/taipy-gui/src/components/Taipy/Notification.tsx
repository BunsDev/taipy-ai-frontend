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

import React, { useCallback, useEffect, useMemo } from "react";
import { SnackbarKey, useSnackbar, VariantType } from "notistack";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import { NotificationMessage, createDeleteAlertAction } from "../../context/taipyReducers";
import { useDispatch } from "../../utils/hooks";

interface NotificationProps {
    notifications: NotificationMessage[];
}

const TaipyNotification = ({ notifications }: NotificationProps) => {
    const notification = notifications.length ? notifications[0] : undefined;
    const { enqueueSnackbar, closeSnackbar } = useSnackbar();
    const dispatch = useDispatch();

    const resetNotification = useCallback(
        (key: SnackbarKey) => () => {
            closeSnackbar(key);
        },
        [closeSnackbar]
    );

    const notificationAction = useCallback(
        (key: SnackbarKey) => (
            <IconButton size="small" aria-label="close" color="inherit" onClick={resetNotification(key)}>
                <CloseIcon fontSize="small" />
            </IconButton>
        ),
        [resetNotification]
    );

    const faviconUrl = useMemo(() => {
        const nodeList = document.getElementsByTagName("link");
        for (let i = 0; i < nodeList.length; i++) {
            if (nodeList[i].getAttribute("rel") == "icon" || nodeList[i].getAttribute("rel") == "shortcut icon") {
                return nodeList[i].getAttribute("href") || "/favicon.png";
            }
        }
        return "/favicon.png";
    }, []);

    useEffect(() => {
        if (notification) {
            const notificationId = notification.notificationId || "";
            if (notification.atype === "") {
                closeSnackbar(notificationId);
            } else {
                enqueueSnackbar(notification.message, {
                    variant: notification.atype as VariantType,
                    action: notificationAction,
                    autoHideDuration: notification.duration,
                    key: notificationId,
                });
                notification.system &&
                    new Notification(document.title || "Taipy", { body: notification.message, icon: faviconUrl });
            }
            dispatch(createDeleteAlertAction(notificationId));
        }
    }, [notification, enqueueSnackbar, closeSnackbar, notificationAction, faviconUrl, dispatch]);

    useEffect(() => {
        notification?.system && window.Notification && Notification.requestPermission();
    }, [notification?.system]);

    return null;
};

export default TaipyNotification;
