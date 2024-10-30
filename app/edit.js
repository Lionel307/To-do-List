import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Image, StyleSheet, TextInput, View, Text, Alert } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';

export default function EditScreen() {
  const { id, title, description, imageUri, priority, completed } = useLocalSearchParams();
  const [taskTitle, setTaskTitle] = useState(title || '');
  const [taskDescription, setTaskDescription] = useState(description || '');
  const [taskImage, setTaskImage] = useState(imageUri === "null" ? null : imageUri);
  const [taskPriority, setTaskPriority] = useState(priority || null);
  const [priorityOpen, setPriorityOpen] = useState(false);

  const navigation = useNavigation();

  const [cameraPermissions, requestCameraPermissions] = ImagePicker.useCameraPermissions();
  const [mediaLibraryPermissions, requestMediaLibraryPermissions] = ImagePicker.useMediaLibraryPermissions();
  
  useEffect(() => {
    if (cameraPermissions && !cameraPermissions.granted) {
      requestCameraPermissions();
    }
    if (mediaLibraryPermissions && !mediaLibraryPermissions.granted) {
      requestMediaLibraryPermissions();
    }
  }, [cameraPermissions, mediaLibraryPermissions]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (!result.canceled) {
        setTaskImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "An error occurred while picking the image.");
    }
  };
  
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync();
      if (!result.canceled) {
        setTaskImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "An error occurred while taking the photo.");
    }
  };

  const saveChanges = () => {
    if (taskTitle.trim() === '') {
      Alert.alert('Title Required', 'Please enter a title for the task.');
      return;
    }

    const updatedTask = {
      id: id,
      title: taskTitle,
      description: taskDescription,
      imageUri: taskImage,
      priority: taskPriority,
      completed: completed
    };
    
    navigation.navigate("index", { updatedTask: JSON.stringify(updatedTask) });
  };

  return (
    <View style={{ marginTop: 20, padding: 10 }}>
      <Text style={styles.required}>Task name is required*</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Task Name"
          value={taskTitle}
          onChangeText={setTaskTitle}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Description"
          value={taskDescription}
          onChangeText={setTaskDescription}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={[styles.dropdownWrapper, priorityOpen && styles.dropdownOpen]}>
        <DropDownPicker
          open={priorityOpen}
          value={taskPriority}
          items={[
            { label: "None", value: null },
            { label: "High", value: "1" },
            { label: "Medium", value: "2" },
            { label: "Low", value: "3" },
          ]}
          setOpen={setPriorityOpen}
          setValue={setTaskPriority}
          placeholder="Select Priority"
          placeholderStyle={styles.dropdownPlaceholder}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          listItemContainerStyle={styles.dropdownListItem}
          listItemLabelStyle={styles.dropdownListItemLabel}
          textStyle={styles.dropdownText}
        />
      </View>

      {taskImage && <Image source={{ uri: taskImage }} style={styles.previewImage} />}
      <Button title="Pick an image" onPress={pickImage} />
      <Button title="Take a photo" onPress={takePhoto} />
      {taskImage && (
        <Button title="Remove Photo" onPress={() => setTaskImage(null)} color="red" />
      )}
      <Button title="Save Changes" onPress={saveChanges} color="#007AFF" />
      <Button title="Cancel" onPress={() => navigation.goBack()} color="red" />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    color: '#000',
    flex: 1,
  },
  required: {
    color: 'red',
    marginLeft: 10,
    fontSize: 12,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    height: 40,
    width: 150,
    marginBottom: 10,
    marginLeft: 8,
  },
  dropdownWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    zIndex: 1
  },
  dropdownOpen: {
    zIndex: 1000, 
  },
  dropdownContainer: {
    backgroundColor: '#f9f9f9',
    borderColor: '#ddd',
    width: 150,
    marginLeft: 8,
  },
  dropdownListItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  dropdownListItemLabel: {
    color: '#333',
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: '#888',
    fontSize: 14,
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  previewImage: {
    width: 250,
    height: 250,
    marginTop: 10,
    alignSelf: 'center',
  },
});
