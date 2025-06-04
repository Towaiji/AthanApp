import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { Link, Stack } from "expo-router";
import { colors } from "../constants/colors";

export default function NotFoundScreen() {
    return (
        <>
            <Stack.Screen options={{ title: "404 - Not Found" }} />
            <View style={styles.container}>
                <Link href="/" style={styles.button}>
                    Go back to Home screen!
                </Link>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
    },
    text: {
        fontSize: 30,
        color: "black",
    },
    button: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: "black",
        fontWeight: "bold",
    },
});
