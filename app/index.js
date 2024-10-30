import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'expo-checkbox';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Dimensions, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, Vibration, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
const TASKS_STORE_KEY = "@tasks";

export default function HomeScreen() {
  const backgroundColor = darkMode ? '#333' : '#fff';
  const textColor = darkMode ? '#fff' : '#000';
  const [todoList, setTodoList] = useState([]);
  const swipeableRef = useRef(null);
  const [cameraPermissions, requestCameraPermissions] = ImagePicker.useCameraPermissions();
  const [mediaLibraryPermissions, requestMediaLibraryPermissions] = ImagePicker.useMediaLibraryPermissions();
  const [showConfetti, setShowConfetti] = useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

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
          item.id === parsedUpdatedTask.id 
            ? { ...parsedUpdatedTask, completed: item.completed }
            : item
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
        color={todoList.some(item => item.completed) ? "#33FF2B" : "grey"}  
        onPress={maybeRemoveCheckedItems}
        disabled={!todoList.some(item => item.completed)}
      />
    ),
    headerRight: () => (
      <Ionicons name="settings-outline" size={24} color="grey" onPress={() => navigation.navigate("settings")}/>
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
        style={[styles.taskContainer, { backgroundColor: item.completed ? '#e0e0e0' : '#ffffff' }]}
        activeOpacity={1} // disable animation
      >
        <Checkbox
          value={item.completed}
          onValueChange={() => toggleComplete(item.id)}
          color={item.completed ? '#007AFF' : undefined}
        />
        <View style={styles.taskContent}>
          {/* Wrap the priority text in a View for better styling */}
          <View style={getPriorityTitleStyle(item.priority)}>
            <Text style={{ color: '#333', fontWeight: '700' }}>
              {`${item.title} (${item.priority === '1' ? '!!!' : item.priority === '2' ? '!!' : item.priority === '3' ? '!' : 'None'})`}
            </Text>
          </View>
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
          <>
            <View style={styles.emptyListContainer}>
              <Text style={[styles.emptyText, { color: textColor }]}>You have no tasks</Text>
            </View>
          </>
        ) : (
          <>
            <Button title="Sort by Priority" onPress={sortTasksByPriority} />
            <FlatList
              data={todoList}
              keyExtractor={(item) => item.id}
              renderItem={renderTodoItem}
              onDragEnd={onDragEnd} // Enable drag and drop
              onMoveShouldSetResponder={() => true} // Allow dragging
            ></FlatList>
          </>
        )}
         <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate("create")}
        >
          <Ionicons name="create-outline" size={24} color="#007AFF" />
        </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 15,
    marginVertical: 5,
    width: '95%',
    alignSelf: 'center'
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
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  createButton: {
    position: 'absolute',
    bottom: 50,
    right: 30,
    backgroundColor: '#f7f7f7',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swipeActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginTop: 5,
  },
});

