import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AdminManager } from '../utils/adminManager';
import { theme } from '../styles/theme';

const AdminScreen = ({ navigation }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [duration, setDuration] = useState('365');
  const [friendsList, setFriendsList] = useState([]);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadFriendsList();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    const adminStatus = await AdminManager.isAdmin();
    setIsAdmin(adminStatus);
  };

  const handleAdminLogin = async () => {
    const success = await AdminManager.enableAdminMode(password);
    if (success) {
      setIsAdmin(true);
      Alert.alert('Success', 'Admin mode activated!');
      loadFriendsList();
    } else {
      Alert.alert('Error', 'Invalid password');
    }
    setPassword('');
  };

  const loadFriendsList = async () => {
    const friends = await AdminManager.getAllFriendsStatus();
    setFriendsList(friends);
  };

  const grantPremiumAccess = async () => {
    if (!friendEmail.trim()) {
      Alert.alert('Error', 'Please enter friend\'s email');
      return;
    }

    const durationDays = parseInt(duration) || 365;
    const success = await AdminManager.grantPremiumAccess(friendEmail.trim(), durationDays);
    
    if (success) {
      Alert.alert('Success', `Premium access granted to ${friendEmail} for ${durationDays} days`);
      setFriendEmail('');
      loadFriendsList();
    } else {
      Alert.alert('Error', 'Failed to grant premium access');
    }
  };

  const revokePremiumAccess = async (email) => {
    Alert.alert(
      'Revoke Access',
      `Are you sure you want to revoke premium access for ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            const success = await AdminManager.revokePremiumAccess(email);
            if (success) {
              Alert.alert('Success', 'Premium access revoked');
              loadFriendsList();
            }
          }
        }
      ]
    );
  };

  const renderFriendItem = ({ item }) => (
    <View style={styles.friendItem}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendEmail}>{item.email}</Text>
        <Text style={[styles.friendStatus, { color: item.isActive ? '#4CAF50' : '#F44336' }]}>
          {item.isActive ? `Active (${item.daysRemaining} days left)` : 'Expired'}
        </Text>
        <Text style={styles.friendDate}>
          Granted: {new Date(item.grantedDate).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.revokeButton}
        onPress={() => revokePremiumAccess(item.email)}
      >
        <Ionicons name="trash-outline" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  if (!isAdmin) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#2E86AB" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Admin Access</Text>
        </View>

        <View style={styles.loginContainer}>
          <Ionicons name="lock-closed" size={64} color="#FF9800" />
          <Text style={styles.loginTitle}>Admin Login Required</Text>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter admin password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.loginButton} onPress={handleAdminLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#2E86AB" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Premium Management</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Grant Access Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Grant Premium Access</Text>
          <TextInput
            style={styles.input}
            placeholder="Friend's email address"
            value={friendEmail}
            onChangeText={setFriendEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Duration (days)"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.grantButton} onPress={grantPremiumAccess}>
            <Ionicons name="gift" size={20} color="#FFFFFF" />
            <Text style={styles.grantButtonText}>Grant Premium Access</Text>
          </TouchableOpacity>
        </View>

        {/* Friends List Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Premium Friends ({friendsList.length})</Text>
          {friendsList.length > 0 ? (
            <FlatList
              data={friendsList}
              renderItem={renderFriendItem}
              keyExtractor={(item) => item.email}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.emptyText}>No premium friends yet</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E86AB',
    marginLeft: 8,
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 32,
  },
  passwordInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  grantButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  grantButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  friendInfo: {
    flex: 1,
  },
  friendEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  friendStatus: {
    fontSize: 14,
    marginTop: 4,
  },
  friendDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  revokeButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    paddingVertical: 32,
  },
});

export default AdminScreen;
