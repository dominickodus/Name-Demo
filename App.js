import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
} from "react-native";

export default function App() {
    const [activity, setActivity] = useState("Study");
    const [time, setTime] = useState(0);
    const [running, setRunning] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [verified, setVerified] = useState(false);
    const [logs, setLogs] = useState({
        Study: 0,
        Fitness: 0,
        Unplugged: 0,
    });

    const intervalRef = useRef(null);

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

    return (
        <View style={styles.container}>

            <Text style={styles.header}>Name DEMO</Text>

            <Text style={styles.activity}>{"Currently Tracking: " + activity}</Text>

            <Text style={styles.timer}>{time}s</Text>

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
                <Text style={styles.activity}>TODAY'S TOTAL TRACKED ACTIVITY</Text>
                <Text style={styles.logs}>Study: {logs.Study}s</Text>
                <Text style={styles.logs}>Fitness: {logs.Fitness}s</Text>
                <Text style={styles.logs}>Unplugged: {logs.Unplugged}s</Text>
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
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0f172a",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
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
});