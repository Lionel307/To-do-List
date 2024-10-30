import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Image, StyleSheet, TextInput, View, Text, Alert } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';

export default function CreateScreen() {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskImage, setNewTaskImage] = useState(null);
  const [newTaskPriority, setNewTaskPriority] = useState(null);
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
        setNewTaskImage(result.assets[0].uri);
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
        setNewTaskImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "An error occurred while taking the photo.");
    }
  };

  const createUniqueId = () => {
    return Date.now() + Math.floor(Math.random() * 1000); // Adds a random component to the timestamp
  };

  const addTodoItem = () => {
    if (newTaskTitle === '') {
      Alert.alert('Title Required', 'Please enter a name for the task.');
      return;
    }

    const newTodo = {
      id: createUniqueId().toString(),
      title: newTaskTitle,
      description: newTaskDescription,
      imageUri: newTaskImage,
      priority: newTaskPriority,
      completed: false,
    };
    navigation.navigate("index", { newTodo: JSON.stringify(newTodo) });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.required}>Task name is required*</Text>

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Task Name"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Description"
          value={newTaskDescription}
          onChangeText={setNewTaskDescription}
          style={styles.input}
          placeholderTextColor="#aaa"
        />
      </View>

      <View style={[styles.dropdownWrapper, priorityOpen && styles.dropdownOpen]}>
        <DropDownPicker
          open={priorityOpen}
          value={newTaskPriority}
          items={[
            { label: "None", value: null },
            { label: "High", value: "1" },
            { label: "Medium", value: "2" },
            { label: "Low", value: "3" },
          ]}
          setOpen={setPriorityOpen}
          setValue={setNewTaskPriority}
          placeholder="Select Priority"
          placeholderStyle={styles.dropdownPlaceholder}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          listItemContainerStyle={styles.dropdownListItem}
          listItemLabelStyle={styles.dropdownListItemLabel}
          textStyle={styles.dropdownText}
        />
      </View>

      {newTaskImage && <Image source={{ uri: newTaskImage }} style={styles.previewImage} />}
      <Button title="Pick an image" onPress={pickImage} />
      <Button title="Take a photo" onPress={takePhoto} />
      {newTaskImage && <Button title="Remove Photo" onPress={() => setNewTaskImage(null)} color="red" />}
      <Button title="Save Task" onPress={addTodoItem} color="#007AFF" />
      <Button title="Cancel" onPress={() => navigation.goBack()} color="red" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 10,
  },
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
    borderRadius: 10,
  },
});
