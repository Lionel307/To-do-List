import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Vibration } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
const TASKS_STORE_KEY = "@tasks";

const HomeScreen = ({ darkMode }) => {
  const backgroundColor = darkMode ? '#333' : '#fff';
  const textColor = darkMode ? '#fff' : '#000';
  const [todoList, setTodoList] = useState([]);
  const swipeableRef = useRef(null);
  const [cameraPermissions, requestCameraPermissions] = ImagePicker.useCameraPermissions();
  const [mediaLibraryPermissions, requestMediaLibraryPermissions] = ImagePicker.useMediaLibraryPermissions();
  const [showConfetti, setShowConfetti] = useState(false);

  const navigation = useNavigation();
  const { newTodo, updatedTask } = useLocalSearchParams();

  useEffect(() => {
    if (newTodo) {
      const parsedTodo = JSON.parse(newTodo);
      setTodoList([...todoList, parsedTodo]);
    }
  }, [newTodo]);

  useEffect(() => {
    if (updatedTask) {
      const parsedUpdatedTask = JSON.parse(updatedTask);
      setTodoList(prevList =>
        prevList.map(item => 
          item.id === parsedUpdatedTask.id ? parsedUpdatedTask : item
        )
      );
    }
  }, [updatedTask]);

  useEffect(() => {
    if (cameraPermissions && !cameraPermissions.granted) {
      if (cameraPermissions.canAskAgain) { requestCameraPermissions(); }
    }
    if (mediaLibraryPermissions && !mediaLibraryPermissions.granted) {
      if (mediaLibraryPermissions.canAskAgain) { requestMediaLibraryPermissions(); }
    }
  }, [cameraPermissions, mediaLibraryPermissions]);

  useEffect(() => {
    loadTodoList();
  }, []);

  useEffect(() => {
    saveTodoList();
  }, [todoList]);

  useEffect(() => navigation.setOptions({
    headerLeft: () => (
      <MaterialIcons 
        name="add-task" 
        size={24}
        color={todoList.some(item => item.completed) ? "#33FF2B" : "grey"}   // Call the function to remove checked items
        onPress={maybeRemoveCheckedItems}
      />
    ),
    headerRight: () => (
      <Ionicons name="create-outline" size={24} color="#007AFF" onPress={() => navigation.navigate("create")} />
    ),
  }), [navigation, todoList]);

  const loadTodoList = async () => {
    try {
      const savedTodos = await AsyncStorage.getItem(TASKS_STORE_KEY);
      if (savedTodos) {
        setTodoList(JSON.parse(savedTodos));
      }
    } catch (error) {
      console.error('Failed to load todo list.', error);
    }
  };

  const saveTodoList = async () => {
    try {
      await AsyncStorage.setItem(TASKS_STORE_KEY, JSON.stringify(todoList));
    } catch (error) {
      console.error('Failed to save todo list.', error);
    }
  };

  const toggleComplete = (id) => {
    const updatedList = todoList.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setTodoList(updatedList);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const deleteTodoItem = (id) => {
    setTodoList(todoList.filter(item => item.id !== id));
  };

  const maybeRemoveCheckedItems = () => {
    Alert.alert("Remove all completed tasks?", "This action cannot be undone", [
      {text: "Cancel", style: "cancel"}, 
      {text: "Remove", style: "destructive", onPress: () => {
          setTodoList(todoList.filter(item => !item.completed));
          setShowConfetti(true); // Trigger confetti
          setTimeout(() => Vibration.vibrate(200), 500); // Vibrate after 1 second
          setTimeout(() => setShowConfetti(false), 5000); // Hide after 3 seconds
        }
      }
    ]);
  };
  

  const editTask = (item) => {
    navigation.navigate("edit", {
      id: item.id,
      title: item.title,
      description: item.description,
      imageUri: item.imageUri,
      priority: item.priority,
      completed: item.completed,
    });
    swipeableRef.current?.close();
  };
  
  const renderTodoItem = ({ item }) => ( 
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() => (
        <View style={styles.swipeActions}>
          <Button title="Edit" onPress={() => editTask(item)} />
          <Button title="Delete" onPress={() => deleteTodoItem(item.id)} color="red" />
        </View>
      )}
    >
      <TouchableOpacity
        onPress={() => toggleComplete(item.id)} // Check/Uncheck on click
        style={[styles.taskContainer, { backgroundColor: item.completed ? '#e0e0e0' : '#f9f9f9' }]}
        activeOpacity={1} // disable animation
      >
        <Checkbox
          value={item.completed}
          onValueChange={() => toggleComplete(item.id)}
          color={item.completed ? '#007AFF' : undefined}
        />
        <View style={styles.taskContent}>
        <Text style={[styles.taskText, getPriorityTitleStyle(item.priority)]}>
          {`${item.title} (${item.priority === '1' ? '!!!' : item.priority === '2' ? '!!' : item.priority === '3' ? '!' : 'None'})`}
        </Text>
          {item.imageUri && (
            <Image source={{ uri: item.imageUri }} style={styles.taskImage} />
          )}
          <Text style={[styles.taskDescription, { color: textColor }]}>{item.description}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const getPriorityTitleStyle = (priority) => ({
    padding: 10, 
    borderRadius: 20, 
    fontWeight: '700',
    backgroundColor: priority === '1' ? '#FF988A' : // Pastel red
                     priority === '2' ? 'rgb(253, 236, 200)' : // Pastel yellow
                     priority === '3' ? 'rgb(219, 237, 219)' : // Pastel green
                     'transparent',
    color: priority ? '#333' : textColor, 
    alignSelf: 'flex-start', 
    marginBottom: 5, 
  });

  const sortTasksByPriority = () => {
    const sortedTasks = [...todoList].sort((a, b) => {
      if (!a.priority) return 1; // No priority tasks at the bottom
      if (!b.priority) return -1;
      return a.priority - b.priority; // Higher priority numbers come first
    });
    setTodoList(sortedTasks);
  };

  const onDragEnd = ({ nativeEvent }) => {
    // Update todoList based on new order
    if (nativeEvent.oldIndex !== nativeEvent.newIndex) {
      const updatedList = Array.from(todoList);
      const [movedItem] = updatedList.splice(nativeEvent.oldIndex, 1);
      updatedList.splice(nativeEvent.newIndex, 0, movedItem);
      setTodoList(updatedList);
    }
  };
  const { width } = Dimensions.get('window');
  const originX = width / 2; 
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {showConfetti && (
        <ConfettiCannon
          count={200} // Number of confetti pieces
          origin={{ x: originX, y: 0 }} // Origin point for the confetti
          fadeOut={true} // Whether the confetti fades out
          explosionSpeed={700}
        />
      )}
        {todoList.length === 0 ? (
          <Text style={{ color: textColor }}>There are no tasks to do</Text>
        ) : (
          <>
            <Button title="Sort by Priority" onPress={sortTasksByPriority} />
            <FlatList
              data={todoList}
              keyExtractor={(item) => item.id}
              renderItem={renderTodoItem}
              onDragEnd={onDragEnd} // Enable drag and drop
              onMoveShouldSetResponder={() => true} // Allow dragging
            />
          </>
          
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  taskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 5,
  },
  taskContent: {
    marginLeft: 10,
    flex: 1,
  },
  taskText: {
    fontSize: 15,
  },
  taskDescription: {
    fontSize: 14,
    color: '#888',
    paddingTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  previewImage: {
    width: 100,
    height: 100,
    marginTop: 10,
    alignSelf: 'center',
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    marginTop: 20,
  },
  taskImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 5,
  },
  priorityTag: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
});

export default HomeScreen;
