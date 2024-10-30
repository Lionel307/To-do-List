import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, Image, StyleSheet, Text, TextInput, View } from "react-native";
import DropDownPicker from 'react-native-dropdown-picker';

export default function EditScreen() {
  const { id, title, description, imageUri, priority, completed, dueDate } = useLocalSearchParams();
  const [taskTitle, setTaskTitle] = useState(title || '');
  const [taskDescription, setTaskDescription] = useState(description || '');
  const [taskImage, setTaskImage] = useState(imageUri === "null" ? null : imageUri);
  const [taskPriority, setTaskPriority] = useState(priority || null);
  const [priorityOpen, setPriorityOpen] = useState(false);

  const parseDueDate = (dueDateString) => {
    const [year, month, day] = dueDateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };
  const [taskDueDate, setTaskDueDate] = useState(parseDueDate(dueDate) || new Date());

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

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      const adjustedDate = new Date(selectedDate);
      adjustedDate.setHours(12, 0, 0, 0); // Set to noon to avoid time zone issues
      setTaskDueDate(adjustedDate);
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
      completed: completed,
      dueDate: taskDueDate.toISOString().split('T')[0]
    };
    navigation.navigate("index", { updatedTask: JSON.stringify(updatedTask) });
  };

  return (
    <View style={styles.container}>
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
      <View style={styles.thirdRow}>
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
        <View style={styles.dueDateContainer}>
          <Text style={styles.dueLabel}>Due:</Text>
          <DateTimePicker
            value={taskDueDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        </View>
      </View>
      {taskImage && <Image source={{ uri: taskImage }} style={styles.previewImage} />}
      <View style={styles.buttonRow}>
        <MaterialIcons name="add-photo-alternate" size={40} color="#4A90E2" onPress={pickImage}/>
        {taskImage && (
          <MaterialIcons name="no-photography" size={40} color="#f54336" onPress={() => setTaskImage(null)}/>
        )}
        <MaterialIcons name="add-a-photo" size={40} color="#4A90E2" onPress={takePhoto}/>
      </View>
      <Button title="Save Task" onPress={saveChanges} color="#4CAF50" style={styles.saveButton} />
      <Button title="Cancel" onPress={() => navigation.goBack()} color="#f54336" style={styles.cancelButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 10,
    zIndex: 1
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
    zIndex: 2
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
    zIndex: 1000,
    fontSize: 14,
  },
  dropdownPlaceholder: {
    color: '#888',
    zIndex: 1000,
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
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    zIndex: 1,
  },
  saveButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#FF5722',
  },
  thirdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10000,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f4f4f8',
  },
  dueLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginRight: 1,
  },
});
