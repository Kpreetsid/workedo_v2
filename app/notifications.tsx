import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import { Ionicons } from '@expo/vector-icons';
import Fonts from '@/constants/Typography';
import { useNotificationStore, AppNotification } from '@/src/state/notifications/useNotificationStore';
import Header from '@/src/components/global/Header';

export default function NotificationsScreen() {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handlePress = (item: AppNotification) => {
    if (item.unread) {
      markAsRead(item.id);
    }
    // Route to relevant screen if needed based on item type
  };

  const renderItem = ({ item }: { item: AppNotification }) => (
    <TouchableOpacity 
      style={[styles.notificationCard, item.unread && styles.unreadCard]} 
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="notifications-outline" size={24} color={item.unread ? "#A259FF" : "#666"} />
      </View>
      <View style={styles.contentContainer}>
        <Text style={[styles.title, item.unread && styles.unreadText]}>{item.title}</Text>
        <Text style={styles.message} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.time}>{item.timestamp}</Text>
      </View>
      {item.unread && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <Header title="Notifications" showBack={true} styling={{ backgroundColor: '#A259FF' }} />
      
      {notifications.length > 0 && (
        <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
          <Text style={styles.markAllText}>Mark all as read</Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>No new notifications</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  listContent: {
    padding: 16,
  },
  markAllButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  markAllText: {
    color: '#A259FF',
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
  },
  unreadCard: {
    backgroundColor: '#F3EBFF',
    borderLeftWidth: 3,
    borderLeftColor: '#A259FF',
  },
  iconContainer: {
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  unreadText: {
    color: '#000',
    fontWeight: '700',
  },
  message: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  time: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: '#999',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#A259FF',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: '#999',
  }
});
