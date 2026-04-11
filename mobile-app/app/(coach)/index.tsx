import { useCallback } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, Button, ActivityIndicator, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSize } from '@/constants/Layout';
import { useAuth } from '@/services/AuthContext';
import { useLanguage } from '@/services/LanguageContext';
import { useCoachDashboard } from '@/hooks/useDashboard';

// Helper function to get event type color for any type string
const getEventTypeColorFromString = (type: string): string => {
  const upperType = type?.toUpperCase() || '';
  if (upperType === 'TRAINING' || upperType.includes('TRENING')) {
    return Colors.eventTraining;
  }
  if (upperType === 'MATCH' || upperType.includes('UTAKMICA') || upperType.includes('MEČ')) {
    return Colors.eventCompetition;
  }
  if (upperType === 'OTHER') {
    return Colors.eventMeeting;
  }
  return Colors.primary;
};

// Check if event is today
const isEventToday = (dateString: string): boolean => {
  const eventDate = new Date(dateString);
  const today = new Date();
  return eventDate.toDateString() === today.toDateString();
};

// Get relative time text
const getRelativeTimeText = (dateString: string): string => {
  const eventDate = new Date(dateString);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const eventStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());

  const diffTime = eventStart.getTime() - todayStart.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Danas';
  if (diffDays === 1) return 'Sutra';
  if (diffDays > 1 && diffDays <= 7) return `Za ${diffDays} dana`;
  if (diffDays > 7) return `Za ${Math.floor(diffDays / 7)} ned.`;
  return '';
};

export default function CoachDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: dashboardStats, isLoading, refetch } = useCoachDashboard();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Split events into today and upcoming
  const todayEvents = dashboardStats?.upcomingEvents?.filter(event => isEventToday(event.startTime)) || [];
  const upcomingEvents = dashboardStats?.upcomingEvents?.filter(event => !isEventToday(event.startTime)) || [];

  const renderEventCard = (event: typeof dashboardStats.upcomingEvents[0], isToday: boolean) => {
    const eventDate = new Date(event.startTime);
    const dayNumber = eventDate.getDate();
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
    const dayName = t(`dateTime.days.${dayKeys[eventDate.getDay()]}`);
    const eventTypeColor = getEventTypeColorFromString(event.type);
    const relativeTime = getRelativeTimeText(event.startTime);

    return (
      <TouchableOpacity
        key={event._id}
        onPress={() => router.push(`/(coach)/events/${event._id}`)}
      >
        <Card style={[styles.eventCard, isToday && styles.eventCardToday]}>
          <Card.Content style={styles.eventCardContent}>
            {/* Date Column */}
            <View style={styles.dateWrapper}>
              <View style={[
                styles.dateColumn,
                { backgroundColor: isToday ? Colors.success : eventTypeColor }
              ]}>
                <Text style={styles.dateDay}>{dayNumber}</Text>
                <Text style={styles.dateDayName}>{dayName}</Text>
              </View>
              {relativeTime && (
                <View style={styles.relativeTimeRow}>
                  <MaterialCommunityIcons name="clock-outline" size={10} color={Colors.textSecondary} />
                  <Text style={styles.relativeTime}>{relativeTime}</Text>
                </View>
              )}
            </View>

            {/* Event Info */}
            <View style={styles.eventInfo}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle} numberOfLines={1}>{event.title}</Text>
                <Text style={styles.eventTime}>
                  {formatTime(event.startTime)} - {formatTime(event.endTime)}
                </Text>
              </View>

              {/* Group Name */}
              {event.groupName && (
                <View style={styles.groupRow}>
                  <View style={[styles.groupDot, { backgroundColor: event.groupColor || Colors.primary }]} />
                  <Text style={[styles.groupName, { color: event.groupColor || Colors.primary }]}>
                    {event.groupName}
                  </Text>
                </View>
              )}

              {/* RSVP Stats */}
              <View style={styles.rsvpStats}>
                <View style={styles.rsvpStat}>
                  <MaterialCommunityIcons name="check-circle" size={14} color={Colors.success} />
                  <Text style={[styles.rsvpText, { color: Colors.success }]}>
                    {event.confirmedCount} {t('dashboard.attending')}
                  </Text>
                </View>
                <View style={styles.rsvpStat}>
                  <MaterialCommunityIcons name="close-circle" size={14} color={Colors.error} />
                  <Text style={[styles.rsvpText, { color: Colors.error }]}>
                    {event.declinedCount || 0} {t('dashboard.notAttending')}
                  </Text>
                </View>
                <View style={styles.rsvpStat}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color={Colors.warning} />
                  <Text style={[styles.rsvpText, { color: Colors.warning }]}>
                    {event.pendingCount} {t('dashboard.pending')}
                  </Text>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>{t('dashboard.welcomeBack')}</Text>
        <Text style={styles.userName}>{user?.fullName || t('roles.coach')}</Text>
      </View>

      {/* News Section - Create Post */}
      <Text style={styles.sectionTitle}>{t('navigation.news')}</Text>
      <TouchableOpacity onPress={() => router.push('/(coach)/news/create')} activeOpacity={0.7}>
        <Card style={styles.newsCard}>
          <Card.Content style={styles.createPostCard}>
            <View style={styles.createPostLeft}>
              {user?.profileImage ? (
                <Avatar.Image size={40} source={{ uri: user.profileImage }} />
              ) : (
                <Avatar.Text
                  size={40}
                  label={(user?.fullName || 'U').slice(0, 2).toUpperCase()}
                  style={styles.newsAvatar}
                />
              )}
              <Text style={styles.createPostPlaceholder}>{t('news.createPost')}...</Text>
            </View>
            <MaterialCommunityIcons name="pencil-plus-outline" size={24} color={Colors.primary} />
          </Card.Content>
        </Card>
      </TouchableOpacity>
      <TouchableOpacity style={styles.openNewsLink} onPress={() => router.push('/(coach)/news')}>
        <Text style={styles.openNewsText}>{t('dashboard.openNews')}</Text>
        <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.primary} />
      </TouchableOpacity>

      {/* Today's Events - only show if there are events today */}
      {todayEvents.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>{t('dashboard.todaysEvents')}</Text>
          <View style={styles.eventsContainer}>
            {todayEvents.map((event) => renderEventCard(event, true))}
          </View>
        </>
      )}

      {/* Upcoming Events - only future events */}
      {isLoading ? (
        <>
          <Text style={styles.sectionTitle}>{t('dashboard.upcomingEvents')}</Text>
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </Card.Content>
          </Card>
        </>
      ) : upcomingEvents.length > 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t('dashboard.upcomingEvents')}</Text>
          <View style={styles.eventsContainer}>
            {upcomingEvents.map((event) => renderEventCard(event, false))}
          </View>
          <Button
            mode="text"
            onPress={() => router.push('/(coach)/calendar')}
            style={styles.viewAllButton}
          >
            {t('events.viewAllEvents')}
          </Button>
        </>
      ) : todayEvents.length === 0 ? (
        <>
          <Text style={styles.sectionTitle}>{t('dashboard.upcomingEvents')}</Text>
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <MaterialCommunityIcons name="calendar-blank" size={48} color={Colors.textSecondary} />
              <Text style={styles.emptyText}>{t('empty.noUpcomingEvents')}</Text>
              <Button
                mode="contained"
                onPress={() => router.push('/(coach)/events/create')}
                style={styles.createEventButton}
              >
                {t('events.createEvent')}
              </Button>
            </Card.Content>
          </Card>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  welcomeSection: {
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: FontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  // News Section
  newsCard: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.xs,
  },
  newsAvatar: {
    backgroundColor: Colors.primary,
  },
  createPostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
  },
  createPostLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  createPostPlaceholder: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginLeft: Spacing.sm,
  },
  openNewsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  openNewsText: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.md,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  eventsContainer: {
    marginBottom: Spacing.sm,
  },
  // Event Card
  eventCard: {
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  eventCardToday: {
    borderWidth: 2,
    borderColor: Colors.success,
  },
  eventCardContent: {
    flexDirection: 'row',
    padding: 0,
    alignItems: 'flex-start',
  },
  dateWrapper: {
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginLeft: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dateColumn: {
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  dateDay: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dateDayName: {
    fontSize: 11,
    color: '#FFFFFF',
    textTransform: 'uppercase',
    marginTop: 1,
  },
  relativeTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 3,
  },
  relativeTime: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  eventInfo: {
    flex: 1,
    padding: Spacing.sm,
    paddingLeft: Spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventTitle: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
    marginRight: Spacing.sm,
  },
  eventTime: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  groupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  groupName: {
    fontSize: FontSize.sm,
    fontWeight: '500',
  },
  rsvpStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  rsvpStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rsvpText: {
    fontSize: FontSize.xs,
    fontWeight: '500',
  },
  viewAllButton: {
    marginTop: Spacing.xs,
  },
  createEventButton: {
    marginTop: Spacing.md,
  },
});
