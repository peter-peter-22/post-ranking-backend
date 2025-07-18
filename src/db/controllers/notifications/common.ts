export function notificationsRedisKey(userId: string) {
    return `notifications/${userId}/unread_keys`
}

export const redisSetPlaceholder="default"