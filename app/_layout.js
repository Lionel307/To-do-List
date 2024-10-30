import { Stack } from "expo-router";
export default function TasksLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ title:"Tasks" }} />
            <Stack.Screen name="create" options={{ title:"Create a task", presentation: "modal" }} />
            <Stack.Screen name="edit" options={{ title:"Edit task", presentation: "modal" }} />
            <Stack.Screen name="settings" options={{ title:"Settings"}} />
        </Stack>
    );
}