import React, { useState, useRef } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity, SafeAreaView,
    ScrollView, TextInput, Alert, Dimensions
} from "react-native";

export default function App() {
    // --- State ---
    const [page, setPage] = useState(1);
    const [activity, setActivity] = useState("Study");
    const [targetMinutes, setTargetMinutes] = useState("30");
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const intervalRef = useRef(null);

    // --- Live Data (Today) ---
    const [todayLogs, setTodayLogs] = useState({ Study: 0, Fitness: 0, Unplugged: 0 });
    const [viewingDate, setViewingDate] = useState(new Date());
    const dailyGoalSeconds = 7200;

    const colors = {
        bg: "#0f172a",
        card: "#1e293b",
        electricBlue: "#3b82f6",
        study: "#3b82f6",
        fitness: "#f97316",
        unplugged: "#a855f7",
        start: "#22c55e",
        stop: "#ef4444",
        text: "#ffffff",
        textDim: "#64748b"
    };

    // --- Timer Logic ---
    const startSession = () => {
        if (!targetMinutes || isNaN(targetMinutes) || targetMinutes <= 0) {
            Alert.alert("Invalid Time", "Please set a target duration.");
            return;
        }
        setIsRunning(true);
        intervalRef.current = setInterval(() => setSecondsElapsed(prev => prev + 1), 1000);
    };

    const stopSession = () => {
        const targetSecs = parseInt(targetMinutes) * 60;
        if (secondsElapsed < targetSecs) {
            Alert.alert(
                "Goal Not Met",
                `Required: ${targetMinutes}m\nCurrent: ${formatTime(secondsElapsed)}\n\nDiscard session?`,
                [
                    { text: "Keep Working", style: "cancel" },
                    { text: "Discard", style: "destructive", onPress: resetTracker }
                ]
            );
        } else {
            setTodayLogs(prev => ({ ...prev, [activity]: prev[activity] + secondsElapsed }));
            resetTracker();
        }
    };

    const resetTracker = () => {
        clearInterval(intervalRef.current);
        setIsRunning(false);
        setSecondsElapsed(0);
    };

    // --- Data Handling ---
    const getHistoricalData = (date) => {
        const day = date.getDate();
        const gen = (factor) => Math.floor(((day * factor) % 5) * 1800 + 1200);
        return { Study: gen(3), Fitness: gen(7), Unplugged: gen(11) };
    };

    const isToday = viewingDate.toDateString() === new Date().toDateString();
    const currentViewData = isToday ? todayLogs : getHistoricalData(viewingDate);

    const formatTime = (secs) => {
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        return h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`;
    };

    // --- Bar Chart Component ---
    const MiniBarChart = ({ data }) => {
        const maxVal = Math.max(data.Study, data.Fitness, data.Unplugged, 3600); // Scale based on 1hr min
        const activities = [
            { label: "Study", val: data.Study, col: colors.study },
            { label: "Fit", val: data.Fitness, col: colors.fitness },
            { label: "Off", val: data.Unplugged, col: colors.unplugged }
        ];

        return (
            <View style={styles.chartWrapper}>
                <View style={styles.chartHeader}>
                    <Text style={styles.chartTitle}>ACTIVITY DISTRIBUTION</Text>
                </View>
                <View style={styles.barContainer}>
                    {activities.map((item, i) => (
                        <View key={i} style={styles.barColumn}>
                            <View style={[styles.barTrack, { height: 120 }]}>
                                <View style={[styles.barFill, { height: `${(item.val / maxVal) * 100}%`, backgroundColor: item.col }]} />
                            </View>
                            <Text style={styles.barLabel}>{item.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>

            {page === 1 && (
                <View style={styles.page}>
                    <Text style={styles.header}>ReVive 1.4</Text>
                    <View style={styles.goalContainer}>
                        <Text style={styles.goalLabel}>DAILY PROGRESS</Text>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${Math.min(((todayLogs.Study + todayLogs.Fitness + todayLogs.Unplugged) / dailyGoalSeconds) * 100, 100)}%` }]} />
                        </View>
                    </View>

                    <Text style={styles.timerLarge}>{formatTime(secondsElapsed)}</Text>

                    <View style={styles.setupBox}>
                        <Text style={styles.setupLabel}>SET TARGET (MINUTES)</Text>
                        <TextInput style={styles.input} value={targetMinutes} onChangeText={setTargetMinutes} keyboardType="numeric" editable={!isRunning} />
                    </View>

                    <View style={styles.activityRow}>
                        {["Study", "Fitness", "Unplugged"].map(item => (
                            <TouchableOpacity key={item} disabled={isRunning} onPress={() => setActivity(item)}
                                              style={[styles.chip, activity === item && { backgroundColor: colors[item.toLowerCase()] }]}>
                                <Text style={styles.chipText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity style={[styles.mainBtn, { backgroundColor: isRunning ? colors.stop : colors.start }]} onPress={isRunning ? stopSession : startSession}>
                        <Text style={styles.mainBtnText}>{isRunning ? "COMPLETE" : "START SESSION"}</Text>
                    </TouchableOpacity>
                </View>
            )}

            {page === 2 && (
                <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
                    <Text style={styles.header}>HISTORY & STATS</Text>

                    <View style={styles.dateNav}>
                        <TouchableOpacity onPress={() => {const d=new Date(viewingDate); d.setDate(d.getDate()-1); setViewingDate(d);}}><Text style={styles.arrow}>←</Text></TouchableOpacity>
                        <Text style={styles.dateText}>{isToday ? "Today" : viewingDate.toLocaleDateString('en-GB')}</Text>
                        <TouchableOpacity onPress={() => {const d=new Date(viewingDate); d.setDate(d.getDate()+1); if(d <= new Date()) setViewingDate(d);}} disabled={isToday}><Text style={[styles.arrow, isToday && {opacity:0.2}]}>→</Text></TouchableOpacity>
                    </View>

                    <MiniBarChart data={currentViewData} />

                    <View style={styles.statsCard}>
                        <View style={styles.statLine}><Text style={styles.statName}>Study</Text><Text style={[styles.statVal, { color: colors.study }]}>{formatTime(currentViewData.Study)}</Text></View>
                        <View style={styles.statLine}><Text style={styles.statName}>Fitness</Text><Text style={[styles.statVal, { color: colors.fitness }]}>{formatTime(currentViewData.Fitness)}</Text></View>
                        <View style={styles.statLine}><Text style={styles.statName}>Unplugged</Text><Text style={[styles.statVal, { color: colors.unplugged }]}>{formatTime(currentViewData.Unplugged)}</Text></View>
                        <View style={styles.totalLine}>
                            <Text style={styles.totalLabel}>TOTAL</Text>
                            <Text style={styles.totalVal}>{formatTime(currentViewData.Study + currentViewData.Fitness + currentViewData.Unplugged)}</Text>
                        </View>
                    </View>

                    <View style={styles.streakBox}>
                        <Text style={styles.streakTitle}>🔥 7 DAY STREAK</Text>
                        <Text style={styles.textDim}>Keep Going!</Text>
                    </View>
                    <View style={{height: 100}} />
                </ScrollView>
            )}

            {page === 3 && (
                <View style={styles.page}>
                    <Text style={styles.header}>COMMUNITIES</Text>
                    <View style={styles.searchBar}><Text style={styles.textDim}>🔍 Search Friends...</Text></View>
                    <View style={styles.statsCard}>
                        <Text style={styles.cardHeader}>WEEKLY RANKINGS: THE ELITE</Text>
                        <Text style={styles.friend}>1. James — 9h 15m</Text>
                        <Text style={styles.friend}>2. Sarah — 7h 30m</Text>
                        <Text style={[styles.friend, { color: colors.electricBlue }]}>3. You — {formatTime(todayLogs.Study + todayLogs.Fitness + todayLogs.Unplugged)}</Text>
                    </View>
                </View>
            )}

            <View style={styles.bottomNav}>
                {["Timer", "Stats", "Social"].map((tab, i) => (
                    <TouchableOpacity key={tab} onPress={() => setPage(i + 1)} style={styles.navItem}>
                        <Text style={[styles.navText, page === i + 1 && { color: colors.electricBlue }]}>{tab}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    page: { flex: 1, padding: 25 },
    header: { color: "#fff", fontSize: 18, fontWeight: "900", textAlign: "center", letterSpacing: 5, marginBottom: 30, marginTop: 10 },
    textDim: { color: "#64748b", fontSize: 12 },

    // Bar Chart
    chartWrapper: { backgroundColor: "#1e293b", padding: 20, borderRadius: 30, marginBottom: 20, borderWidth: 1, borderColor: "#334155" },
    chartHeader: { marginBottom: 20, alignItems: "center" },
    chartTitle: { color: "#3b82f6", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
    barContainer: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end" },
    barColumn: { alignItems: "center" },
    barTrack: { width: 40, backgroundColor: "#0f172a", borderRadius: 10, justifyContent: "flex-end", overflow: "hidden" },
    barFill: { width: "100%", borderRadius: 10 },
    barLabel: { color: "#94a3b8", fontSize: 11, marginTop: 10, fontWeight: "bold" },

    // Timer UI
    goalContainer: { marginBottom: 20 },
    goalLabel: { color: "#3b82f6", fontSize: 10, fontWeight: "bold", marginBottom: 8 },
    progressBar: { height: 4, backgroundColor: "#1e293b", borderRadius: 2 },
    progressFill: { height: 4, backgroundColor: "#3b82f6", borderRadius: 2 },
    timerLarge: { color: "#fff", fontSize: 70, fontWeight: "200", textAlign: "center", marginVertical: 35, fontVariant: ['tabular-nums'] },
    setupBox: { alignItems: "center", marginBottom: 30 },
    setupLabel: { color: "#64748b", fontSize: 10, fontWeight: "bold" },
    input: { color: "#fff", fontSize: 32, borderBottomWidth: 2, borderBottomColor: "#3b82f6", width: 80, textAlign: "center" },
    activityRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 40 },
    chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#1e293b" },
    chipText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
    mainBtn: { paddingVertical: 22, borderRadius: 25, alignItems: "center", elevation: 8 },
    mainBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },

    // General UI
    dateNav: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 30, marginBottom: 20 },
    arrow: { color: "#3b82f6", fontSize: 32, fontWeight: "bold" },
    dateText: { color: "#fff", fontSize: 18, fontWeight: "700", width: 140, textAlign: "center" },
    statsCard: { backgroundColor: "#1e293b", padding: 25, borderRadius: 30, borderWidth: 1, borderColor: "#334155" },
    statLine: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
    statName: { color: "#94a3b8", fontSize: 16 },
    statVal: { fontWeight: "700", fontSize: 16 },
    totalLine: { marginTop: 15, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#334155", flexDirection: "row", justifyContent: "space-between" },
    totalLabel: { color: "#fff", fontWeight: "900" },
    totalVal: { color: "#fff", fontSize: 22, fontWeight: "900" },
    streakBox: { marginTop: 20, backgroundColor: "#1e293b", padding: 25, borderRadius: 30, alignItems: "center", borderStyle: 'dashed', borderWidth: 1, borderColor: '#334155' },
    streakTitle: { color: "#fff", fontSize: 20, fontWeight: "900" },

    searchBar: { backgroundColor: "#1e293b", padding: 18, borderRadius: 20, marginBottom: 25 },
    cardHeader: { color: "#3b82f6", fontSize: 10, fontWeight: "900", marginBottom: 15 },
    friend: { color: "#fff", fontSize: 16, marginVertical: 8 },
    bottomNav: { flexDirection: "row", height: 90, backgroundColor: "#0f172a", borderTopWidth: 1, borderTopColor: "#1e293b" },
    navItem: { flex: 1, justifyContent: "center", alignItems: "center" },
    navText: { color: "#475569", fontWeight: "bold", fontSize: 11, textTransform: 'uppercase' }
});