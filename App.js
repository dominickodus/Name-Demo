import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from "react-native";

export default function App() {

    //Universal Use States / Functions
    const [logs, setLogs] = useState({
        Study: 0,
        Fitness: 0,
        Unplugged: 0,
    });
    const [page, setPage] = useState(1);
    const intervalRef = useRef(null);
    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;

        if (h > 0) return `${h}h ${m}m ${s}s`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

    //Page 1 Use States / Functions
    const [activity, setActivity] = useState("Study");
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);

    const startTimer = () => {
        if (running) return;
        setRunning(true);
        intervalRef.current = setInterval(() => {
            setTime((prev) => prev + 1);
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(intervalRef.current);
        setRunning(false);

        setVerifying(true);

        setTimeout(() => {
            setVerifying(false);
            setVerified(true);

            setLogs((prev) => ({
                ...prev,
                [activity]: prev[activity] + time,
            }));

            setTime(0);

            setTimeout(() => {
                setVerified(false);
            }, 1500);

        }, 2000);
    };

    //Page 2 Use States
    const today = new Date();
    const [viewingDate, setViewingDate] = useState(today);
    const dateString = viewingDate.toISOString().split("T")[0];
    const isToday = viewingDate.toDateString() === new Date().toDateString();

    const goToPreviousDay = () => {
        const newDate = new Date(viewingDate);
        newDate.setDate(newDate.getDate() - 1);
        setViewingDate(newDate);
    };

    const goToNextDay = () => {
        if (viewingDate.toDateString() === today.toDateString()) return;
        const newDate = new Date(viewingDate);
        newDate.setDate(newDate.getDate() + 1);
        setViewingDate(newDate);
    };

    //UI
    return (
        <View style={{ flex: 1 }}>

            {/* First Page */}
            {page === 1 && (
                <View style={styles.container}>

                    <Text style={styles.header}>Name DEMO</Text>

                    <Text style={styles.activity}>
                        {"Currently Tracking: " + activity}
                    </Text>

                    <Text style={styles.timer}>{formatTime(time)}</Text>

                    <View style={styles.activityRow}>
                        {["Study", "Fitness", "Unplugged"].map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={[
                                    styles.activityButton,
                                    activity === item && styles.activeButton,
                                ]}
                                onPress={() => setActivity(item)}
                            >
                                <Text style={styles.buttonText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.controlRow}>
                        <TouchableOpacity style={styles.startButton} onPress={startTimer}>
                            <Text style={styles.buttonText}>Start</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.stopButton} onPress={stopTimer}>
                            <Text style={styles.buttonText}>Stop</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.logsContainer}>
                        <Text style={styles.sectionTitle}>TODAY'S ACTIVITY</Text>
                        <Text style={styles.logs}>Study: {formatTime(logs.Study)}</Text>
                        <Text style={styles.logs}>Fitness: {formatTime(logs.Fitness)}</Text>
                        <Text style={styles.logs}>Unplugged: {formatTime(logs.Unplugged)}</Text>
                    </View>

                    <Modal transparent={true} visible={verifying || verified}>
                        <View style={styles.modalContainer}>
                            <View style={styles.modalBox}>
                                {verifying && (
                                    <Text style={styles.modalText}>Verifying...</Text>
                                )}
                                {verified && (
                                    <Text style={styles.modalText}>Verification Complete</Text>
                                )}
                            </View>
                        </View>
                    </Modal>

                </View>
            )}

            {/* Second Page */}
            {page === 2 && (
                <View style={styles.container}>

                    <Text style={styles.header}>Stats</Text>

                    <View style={styles.dateRow}>
                        <TouchableOpacity onPress={goToPreviousDay}>
                            <Text style={styles.arrow}>←</Text>
                        </TouchableOpacity>

                        <Text style={styles.activity}>
                            {dateString}
                        </Text>

                        <TouchableOpacity onPress={goToNextDay}>
                            <Text style={styles.arrow}>→</Text>
                        </TouchableOpacity>
                    </View>

                    {isToday && (
                        <View style={styles.statsCard}>
                            <Text style={styles.sectionTitle}>
                                Today's Activity ({dateString})
                            </Text>
                            <Text style={styles.logs}>Study: {formatTime(logs.Study)}</Text>
                            <Text style={styles.logs}>Fitness: {formatTime(logs.Study)}</Text>
                            <Text style={styles.logs}>Unplugged: {formatTime(logs.Study)}</Text>
                            <Text style={styles.total}>
                                Total: {formatTime(logs.Study)}
                            </Text>
                        </View>
                    )}

                    {!isToday && (
                        <View style={styles.statsCard}>
                            <Text style={styles.sectionTitle}>
                                Activity for ({dateString})
                            </Text>
                            <Text style={styles.logs}>Study: 2h 45m 21s</Text>
                            <Text style={styles.logs}>Fitness: 1h 15m 11s</Text>
                            <Text style={styles.logs}>Unplugged: 3h 01m 15s</Text>
                            <Text style={styles.total}>
                                Total: 7h 1m 47s
                            </Text>
                        </View>
                    )}

                </View>
            )}

            {/* Floating Nav Button */}
            <TouchableOpacity
                style={styles.floatingButton}
                onPress={() => setPage(page === 1 ? 2 : 1)}
            >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                    {page === 1 ? "Stats →" : "← Back"}
                </Text>
            </TouchableOpacity>

        </View>
    );
}

// Styles outside the component
const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#0f172a",
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 80,
        paddingHorizontal: 20,
    },

    header: {
        fontSize: 28,
        color: "#fff",
        fontWeight: "bold",
        marginBottom: 20,
    },

    activity: {
        fontSize: 20,
        color: "#94a3b8",
    },

    timer: {
        fontSize: 60,
        color: "#fff",
        fontWeight: "bold",
        marginVertical: 20,
    },

    activityRow: {
        flexDirection: "row",
        gap: 10,
        marginBottom: 20,
    },

    activityButton: {
        backgroundColor: "#1e293b",
        padding: 10,
        borderRadius: 10,
    },

    activeButton: {
        backgroundColor: "#3b82f6",
    },

    controlRow: {
        flexDirection: "row",
        gap: 15,
        marginBottom: 20,
    },

    startButton: {
        backgroundColor: "#22c55e",
        padding: 15,
        borderRadius: 10,
    },

    stopButton: {
        backgroundColor: "#ef4444",
        padding: 15,
        borderRadius: 10,
    },

    buttonText: {
        color: "#fff",
        fontWeight: "bold",
    },

    logsContainer: {
        marginTop: 20,
        alignItems: "center",
    },

    logs: {
        color: "#cbd5f5",
        fontSize: 16,
    },

    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },

    modalBox: {
        backgroundColor: "#1e293b",
        padding: 30,
        borderRadius: 15,
    },

    modalText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },

    sectionTitle: {
        fontSize: 16,
        color: "#94a3b8",
        marginBottom: 10,
        textAlign: "center",
    },

    dateRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 25,
        marginBottom: 30,
    },

    arrow: {
        color: "#fff",
        fontSize: 26,
        paddingHorizontal: 10,
    },

    statsCard: {
        width: "100%",
        backgroundColor: "#1e293b",
        padding: 20,
        borderRadius: 15,
        alignItems: "center",
    },

    total: {
        fontSize: 32,
        color: "#fff",
        fontWeight: "bold",
        marginTop: 20,
        textAlign: "center",
    },

    floatingButton: {
        position: "absolute",
        bottom: 40,
        right: 20,
        backgroundColor: "#3b82f6",
        padding: 15,
        borderRadius: 12,
    },

});