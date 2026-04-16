import { useState, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Colors } from '@/constants/Colors';
import { BorderRadius } from '@/constants/Layout';
import { Event } from '@/types';

interface EventCalendarProps {
  events: Event[];
  selectedDate: string | null;
  onDayPress: (date: string) => void;
  userId?: string; // Current user ID - used to show other coaches' events with lower opacity
  eventTypeColors?: Record<string, string>; // Custom event type colors keyed by type ID
}

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    customStyles?: {
      container?: object;
      text?: object;
    };
  };
}

// Helper function to get event type color for any type string
const getEventTypeColor = (type: string, eventTypeColors?: Record<string, string>): string => {
  if (eventTypeColors) {
    // Check direct ID match first
    if (eventTypeColors[type]) return eventTypeColors[type];
    const typeId = type?.toUpperCase().replace(/\s+/g, '_');
    if (eventTypeColors[typeId]) return eventTypeColors[typeId];
  }
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

// Check if current user is coach of an event's group
const isUserCoachOfEvent = (event: Event, userId: string): boolean => {
  if (typeof event.groupId !== 'object') return true;
  const coaches = event.groupId.coaches || [];
  return coaches.some((coachId: any) => {
    const id = typeof coachId === 'string' ? coachId : coachId._id || coachId;
    return id === userId;
  });
};

export default function EventCalendar({
  events,
  selectedDate,
  onDayPress,
  userId,
  eventTypeColors,
}: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date().toISOString().split('T')[0]);

  // Generate marked dates from events
  const markedDates = useMemo(() => {
    const marks: MarkedDates = {};

    // Group events by date
    const eventsByDate = new Map<string, Event[]>();
    events.forEach(event => {
      const dateSource = event.date || event.startTime;
      if (!dateSource) return;
      const dateKey = dateSource.split('T')[0];
      if (!eventsByDate.has(dateKey)) {
        eventsByDate.set(dateKey, []);
      }
      eventsByDate.get(dateKey)!.push(event);
    });

    // Create marks for each date with events
    eventsByDate.forEach((dateEvents, date) => {
      // Get the primary event type color (first event)
      const primaryColor = getEventTypeColor(dateEvents[0].type, eventTypeColors);

      // Check if any event on this date belongs to current user's groups
      const hasOwnEvent = !userId || dateEvents.some(e => isUserCoachOfEvent(e, userId));
      const opacity = hasOwnEvent ? 1 : 0.3;

      marks[date] = {
        customStyles: {
          container: {
            backgroundColor: primaryColor,
            borderRadius: 20,
            opacity,
          },
          text: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
        },
      };
    });

    // Highlight today's date
    const todayKey = new Date().toISOString().split('T')[0];
    const existingToday = marks[todayKey];
    if (existingToday) {
      marks[todayKey] = {
        ...existingToday,
        customStyles: {
          container: {
            ...existingToday.customStyles?.container,
            borderWidth: 2,
            borderColor: Colors.primary,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          },
          text: {
            ...existingToday.customStyles?.text,
            fontSize: 17,
            fontWeight: '800',
            textAlign: 'center',
          },
        },
      };
    } else {
      marks[todayKey] = {
        customStyles: {
          container: {
            borderWidth: 2,
            borderColor: Colors.primary,
            borderRadius: 20,
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
          },
          text: {
            color: Colors.primary,
            fontSize: 17,
            fontWeight: '800',
            textAlign: 'center',
          },
        },
      };
    }

    // Add selected date styling
    if (selectedDate) {
      const existingMark = marks[selectedDate];
      if (existingMark) {
        // If date has events, add border to show selection
        marks[selectedDate] = {
          ...existingMark,
          customStyles: {
            container: {
              ...existingMark.customStyles?.container,
              borderWidth: 2,
              borderColor: Colors.text,
            },
            text: existingMark.customStyles?.text,
          },
        };
      } else {
        // If no events, just show selection
        marks[selectedDate] = {
          customStyles: {
            container: {
              backgroundColor: Colors.primary,
              borderRadius: 20,
            },
            text: {
              color: '#FFFFFF',
              fontWeight: '600',
            },
          },
        };
      }
    }

    return marks;
  }, [events, selectedDate]);

  const handleDayPress = (day: DateData) => {
    onDayPress(day.dateString);
  };

  const handleMonthChange = (month: DateData) => {
    setCurrentMonth(month.dateString);
  };

  return (
    <View style={styles.container}>
      <Calendar
        markingType="custom"
        markedDates={markedDates}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        enableSwipeMonths={true}
        theme={{
          backgroundColor: Colors.surface,
          calendarBackground: Colors.surface,
          textSectionTitleColor: Colors.textSecondary,
          selectedDayBackgroundColor: Colors.primary,
          selectedDayTextColor: Colors.text,
          todayTextColor: Colors.primary,
          todayBackgroundColor: Colors.primary + '20',
          dayTextColor: Colors.text,
          textDisabledColor: Colors.textDisabled,
          dotColor: Colors.primary,
          selectedDotColor: Colors.text,
          arrowColor: Colors.primary,
          monthTextColor: Colors.text,
          indicatorColor: Colors.primary,
          textDayFontWeight: '500',
          textMonthFontWeight: '600',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 15,
          textMonthFontSize: 17,
          textDayHeaderFontSize: 12,
        }}
        style={styles.calendar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: BorderRadius.md,
  },
});
