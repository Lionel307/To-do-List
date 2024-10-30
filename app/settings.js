import React from 'react';
import { View, Switch, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function SettingsScreen() {
  const [darkMode, setDarkMode] = React.useState(false);
  const [confettiEnabled, setConfettiEnabled] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Settings</Text>
      
      <View style={styles.setting}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      <View style={styles.setting}>
        <Text style={styles.label}>Enable Confetti</Text>
        <Switch value={confettiEnabled} onValueChange={setConfettiEnabled} />
      </View>

      <View style={styles.setting}>
        <Text style={styles.label}>Enable Confetti</Text>
        <Switch value={haptics} onValueChange={setHaptics} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
  },
});

