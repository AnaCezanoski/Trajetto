// TicketCard.tsx — substitua o <TouchableOpacity style={[styles.card, ...]}> dentro do SwipeableCard

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRIMARY = '#006ecf';

function categoryIcon(category: string): string {
    const c = (category || '').toLowerCase();
    if (c.includes('museum')) return '🏛️';
    if (c.includes('monument')) return '🗿';
    if (c.includes('castle')) return '🏰';
    if (c.includes('church')) return '⛪';
    if (c.includes('park')) return '🌳';
    if (c.includes('square')) return '🏙️';
    if (c.includes('fountain')) return '⛲';
    if (c.includes('ruins')) return '🏚️';
    if (c.includes('art')) return '🎨';
    if (c.includes('view')) return '🌄';
    if (c.includes('restaurant') || c.includes('food')) return '🍽️';
    if (c.includes('cafe') || c.includes('coffee')) return '☕';
    return '📍';
}

const formatTime = (time: string) => time?.slice(0, 5) ?? '';

interface TicketCardProps {
    place: {
        name: string;
        address: string;
        estimatedVisitTime: string;
        category?: string | null;
        fee?: string | null;
        openingHours?: string | null;
        orderIndex: number;
    };
    idx: number;
    color: string;
    isPast: boolean;
    isHighlighted: boolean;
    isLast: boolean;
    onPress: () => void;
    onInfoPress: () => void;
}

export function TicketCard({
    place, idx, color, isPast, isHighlighted, isLast, onPress, onInfoPress,
}: TicketCardProps) {
    return (
        <TouchableOpacity
            style={[
                ticketStyles.ticket,
                isLast && { marginBottom: 0 },
                isHighlighted && { borderColor: color },
                isPast && ticketStyles.pastTicket,
            ]}
            activeOpacity={0.75}
            onPress={onPress}
        >
            {/* Cabeçalho colorido */}
            <View style={[ticketStyles.header, { backgroundColor: isPast ? '#9aa4b2' : color }]}>
                <View style={ticketStyles.headerLeft}>
                    <Text style={ticketStyles.stopLabel}>PARADA</Text>
                    <Text style={ticketStyles.stopNumber}>{String(idx + 1).padStart(2, '0')}</Text>
                </View>
                <View style={ticketStyles.headerCenter}>
                    <Text style={ticketStyles.categoryEmoji}>
                        {categoryIcon(place.category ?? '')}
                    </Text>
                </View>
                <View style={ticketStyles.headerRight}>
                    <Text style={ticketStyles.timeLabel}>HORÁRIO</Text>
                    <Text style={ticketStyles.timeValue}>{formatTime(place.estimatedVisitTime)}</Text>
                </View>
            </View>


            <View style={ticketStyles.perforationRow}>
                <View style={ticketStyles.notchLeft} />
                <View style={ticketStyles.dashes}>
                    {Array.from({ length: 22 }).map((_, i) => (
                        <View key={i} style={[ticketStyles.dash, { backgroundColor: isPast ? '#d1d8e0' : `${color}55` }]} />
                    ))}
                </View>
                <View style={ticketStyles.notchRight} />
            </View>

            {/* Corpo do ticket */}
            <View style={ticketStyles.body}>
                <Text style={[ticketStyles.placeName, isPast && { color: '#9aa4b2' }]} numberOfLines={2}>
                    {place.name}
                </Text>

                <View style={ticketStyles.addressRow}>
                    <Ionicons name="location-outline" size={13} color={isPast ? '#b0bac6' : '#8a9ab0'} />
                    <Text style={[ticketStyles.addressText, isPast && { color: '#b0bac6' }]} numberOfLines={1}>
                        {place.address}
                    </Text>
                </View>

                {place.openingHours ? (
                    <View style={ticketStyles.addressRow}>
                        <Ionicons name="time-outline" size={13} color={isPast ? '#b0bac6' : '#8a9ab0'} />
                        <Text style={[ticketStyles.addressText, isPast && { color: '#b0bac6' }]} numberOfLines={1}>
                            {place.openingHours}
                        </Text>
                    </View>
                ) : null}

                {/* Rodapé do ticket */}
                <View style={ticketStyles.footer}>
                    <View style={ticketStyles.tagsRow}>
                        {place.category ? (
                            <View style={[ticketStyles.badge, { backgroundColor: isPast ? '#e8eaed' : `${color}18` }]}>
                                <Text style={[ticketStyles.badgeText, { color: isPast ? '#9aa4b2' : color }]}>
                                    {place.category.charAt(0).toUpperCase() + place.category.slice(1)}
                                </Text>
                            </View>
                        ) : null}
                        {place.fee === 'yes' ? (
                            <View style={ticketStyles.feeBadge}>
                                <Text style={ticketStyles.feeBadgeText}>🎟️ Pago</Text>
                            </View>
                        ) : place.fee === 'no' ? (
                            <View style={ticketStyles.freeBadge}>
                                <Text style={ticketStyles.freeBadgeText}>🆓 Grátis</Text>
                            </View>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[ticketStyles.infoBtn, { borderColor: isPast ? '#c8d0da' : `${color}55` }]}
                        onPress={onInfoPress}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Text style={[ticketStyles.infoBtnText, { color: isPast ? '#9aa4b2' : color }]}>Sobre</Text>
                        <Ionicons name="information-circle-outline" size={14} color={isPast ? '#9aa4b2' : color} />
                    </TouchableOpacity>
                </View>
            </View>

        </TouchableOpacity>
    );
}

const ticketStyles = StyleSheet.create({
    ticket: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 4,
        borderWidth: 1.5,
        borderColor: 'transparent',
    },
    pastTicket: {
        opacity: 0.55,
    },

    // ── Cabeçalho ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    headerLeft: { flex: 1 },
    headerCenter: { alignItems: 'center', paddingHorizontal: 12 },
    headerRight: { flex: 1, alignItems: 'flex-end' },
    stopLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
    stopNumber: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
    timeLabel: { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
    timeValue: { fontSize: 18, fontWeight: '800', color: '#fff' },
    categoryEmoji: { fontSize: 28 },


    perforationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 30,
        marginTop: 6,
        overflow: 'visible',
    },
    notchLeft: {
        width: 30,
        height: 30,
        borderRadius: 20,
        marginLeft: -9,
        backgroundColor: '#f4f6f9',
    },
    notchRight: {
        width: 30,
        height: 30,
        borderRadius: 20,
        marginRight: -9,
        backgroundColor: '#f4f6f9',
    },
    dashes: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 6,
    },
    dash: {
        width: 5,
        height: 1.5,
        borderRadius: 1,
    },

    // ── Corpo ──
    body: {
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 12,
    },
    placeName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 6,
        letterSpacing: -0.3,
        lineHeight: 22,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 3,
    },
    addressText: {
        fontSize: 12,
        color: '#8a9ab0',
        flex: 1,
        lineHeight: 17,
    },

    // ── Rodapé ──
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    tagsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
    badge: {
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: { fontSize: 11, fontWeight: '700' },
    feeBadge: {
        backgroundColor: '#fff7ed',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    feeBadgeText: { fontSize: 11, fontWeight: '600', color: '#c2410c' },
    freeBadge: {
        backgroundColor: '#f0fdf4',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    freeBadgeText: { fontSize: 11, fontWeight: '600', color: '#15803d' },
    infoBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1.5,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    infoBtnText: { fontSize: 12, fontWeight: '700' },

    // ── Ícone mapa (canto) ──
    mapCorner: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
});