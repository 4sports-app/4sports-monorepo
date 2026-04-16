import { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Image, TouchableOpacity, Linking } from 'react-native';
import { Text, Card, Avatar, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSize } from '@/constants/Layout';
import { useAuth } from '@/services/AuthContext';
import { useLanguage } from '@/services/LanguageContext';
import api from '@/services/api';

interface ClubInfo {
  name: string;
  logo?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  description?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  twitter?: string;
  foundedYear?: string;
  stadium?: string;
  history?: string;
  achievements?: string;
}

interface CoachInfo {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImage?: string;
  role: string;
}

export default function ClubInfoScreen() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [clubInfo, setClubInfo] = useState<ClubInfo | null>(null);
  const [coaches, setCoaches] = useState<CoachInfo[]>([]);
  const [owner, setOwner] = useState<CoachInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchClubData = useCallback(async () => {
    if (!user?.clubId) return;
    try {
      const [settingsRes, usersRes] = await Promise.all([
        api.get('/settings/club'),
        api.get('/chat/users'),
      ]);
      const settings = settingsRes.data.data;
      setClubInfo({
        name: settings.name || settings.clubName || '',
        logo: settings.logoUrl || settings.logo || '',
        address: settings.address,
        phoneNumber: settings.phoneNumber,
        email: settings.email,
        description: settings.description,
        website: settings.website,
        facebook: settings.facebook,
        instagram: settings.instagram,
        twitter: settings.twitter,
        foundedYear: settings.foundedYear,
        stadium: settings.stadium,
        history: settings.history,
        achievements: settings.achievements,
      });
      const users = usersRes.data.data || [];
      setOwner(users.find((u: CoachInfo) => u.role === 'OWNER') || null);
      setCoaches(users.filter((u: CoachInfo) => u.role === 'COACH'));
    } catch (error) {
      console.error('Error fetching club data:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user?.clubId]);

  useEffect(() => { fetchClubData(); }, [fetchClubData]);
  const onRefresh = () => { setIsRefreshing(true); fetchClubData(); };

  const getInitials = (name?: string) => {
    if (!name) return '??';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleCall = (phoneNumber?: string) => { if (phoneNumber) Linking.openURL(`tel:${phoneNumber}`); };
  const handleEmail = (email?: string) => { if (email) Linking.openURL(`mailto:${email}`); };
  const handleLink = (url?: string) => {
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      Linking.openURL(fullUrl);
    }
  };

  const handleChatWithUser = async (userId: string) => {
    try {
      const response = await api.post('/chat/conversations', { participantIds: [userId] });
      const conversationId = response.data.data.conversationId || response.data.data._id;
      router.push(`/(member)/chat/${conversationId}` as any);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const hasSocials = clubInfo?.website || clubInfo?.facebook || clubInfo?.instagram || clubInfo?.twitter;
  const hasExtra = clubInfo?.foundedYear || clubInfo?.stadium;

  const renderPersonCard = (person: CoachInfo, isOwner: boolean = false) => (
    <Card key={person._id} style={styles.personCard}>
      <Card.Content style={styles.personContent}>
        <View style={styles.personHeader}>
          {person.profileImage ? (
            <Image source={{ uri: person.profileImage }} style={styles.personAvatar} />
          ) : (
            <Avatar.Text size={56} label={getInitials(person.fullName)} style={[styles.avatarPlaceholder, isOwner && styles.ownerAvatar]} />
          )}
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{person.fullName}</Text>
            <View style={styles.roleBadge}>
              <MaterialCommunityIcons name={isOwner ? 'crown' : 'whistle'} size={14} color={isOwner ? Colors.warning : Colors.primary} />
              <Text style={[styles.roleText, isOwner && styles.ownerRoleText]}>
                {isOwner ? t('roles.owner') : t('roles.coach')}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.contactSection}>
          {person.email && (
            <TouchableOpacity style={styles.contactRow} onPress={() => handleEmail(person.email)}>
              <MaterialCommunityIcons name="email-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{person.email}</Text>
            </TouchableOpacity>
          )}
          {person.phoneNumber && (
            <TouchableOpacity style={styles.contactRow} onPress={() => handleCall(person.phoneNumber)}>
              <MaterialCommunityIcons name="phone-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.contactText}>{person.phoneNumber}</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.chatButton} onPress={() => handleChatWithUser(person._id)}>
          <MaterialCommunityIcons name="chat-outline" size={20} color={Colors.primary} />
          <Text style={styles.chatButtonText}>{t('chat.startChat') || 'Chat'}</Text>
        </TouchableOpacity>
      </Card.Content>
    </Card>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
    >
      {/* Club Header */}
      <Card style={styles.clubCard}>
        <Card.Content style={styles.clubContent}>
          <View style={styles.clubLogo}>
            {clubInfo?.logo ? (
              <Image source={{ uri: clubInfo.logo }} style={styles.logoImage} />
            ) : (
              <MaterialCommunityIcons name="shield-outline" size={48} color={Colors.primary} />
            )}
          </View>
          <Text style={styles.clubName}>{clubInfo?.name}</Text>
          {clubInfo?.description ? <Text style={styles.clubDescription}>{clubInfo.description}</Text> : null}
        </Card.Content>
      </Card>

      {/* Contact Info */}
      {(clubInfo?.address || clubInfo?.phoneNumber || clubInfo?.email) && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>{t('profile.contactInfo')}</Text>
            {clubInfo?.address && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{clubInfo.address}</Text>
              </View>
            )}
            {clubInfo?.phoneNumber && (
              <TouchableOpacity style={styles.infoRow} onPress={() => handleCall(clubInfo.phoneNumber)}>
                <MaterialCommunityIcons name="phone-outline" size={20} color={Colors.textSecondary} />
                <Text style={[styles.infoText, styles.linkText]}>{clubInfo.phoneNumber}</Text>
              </TouchableOpacity>
            )}
            {clubInfo?.email && (
              <TouchableOpacity style={styles.infoRow} onPress={() => handleEmail(clubInfo.email)}>
                <MaterialCommunityIcons name="email-outline" size={20} color={Colors.textSecondary} />
                <Text style={[styles.infoText, styles.linkText]}>{clubInfo.email}</Text>
              </TouchableOpacity>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Club Details */}
      {hasExtra && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>{t('profile.clubDetails') || 'Detalji kluba'}</Text>
            {clubInfo?.foundedYear && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="calendar-star" size={20} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{t('profile.founded') || 'Osnovano'}: {clubInfo.foundedYear}</Text>
              </View>
            )}
            {clubInfo?.stadium && (
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="stadium-outline" size={20} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{clubInfo.stadium}</Text>
              </View>
            )}
          </Card.Content>
        </Card>
      )}

      {/* Social & Web Links */}
      {hasSocials && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>{t('profile.links') || 'Linkovi'}</Text>
            {clubInfo?.website && (
              <TouchableOpacity style={styles.infoRow} onPress={() => handleLink(clubInfo.website)}>
                <MaterialCommunityIcons name="web" size={20} color={Colors.textSecondary} />
                <Text style={[styles.infoText, styles.linkText]}>{clubInfo.website}</Text>
              </TouchableOpacity>
            )}
            {clubInfo?.facebook && (
              <TouchableOpacity style={styles.infoRow} onPress={() => handleLink(clubInfo.facebook)}>
                <MaterialCommunityIcons name="facebook" size={20} color="#1877F2" />
                <Text style={[styles.infoText, styles.linkText]}>{clubInfo.facebook}</Text>
              </TouchableOpacity>
            )}
            {clubInfo?.instagram && (
              <TouchableOpacity style={styles.infoRow} onPress={() => handleLink(clubInfo.instagram)}>
                <MaterialCommunityIcons name="instagram" size={20} color="#E4405F" />
                <Text style={[styles.infoText, styles.linkText]}>{clubInfo.instagram}</Text>
              </TouchableOpacity>
            )}
            {clubInfo?.twitter && (
              <TouchableOpacity style={styles.infoRow} onPress={() => handleLink(clubInfo.twitter)}>
                <MaterialCommunityIcons name="twitter" size={20} color="#1DA1F2" />
                <Text style={[styles.infoText, styles.linkText]}>{clubInfo.twitter}</Text>
              </TouchableOpacity>
            )}
          </Card.Content>
        </Card>
      )}

      {/* History */}
      {clubInfo?.history && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>{t('profile.history') || 'Istorija'}</Text>
            <Text style={styles.bodyText}>{clubInfo.history}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Achievements */}
      {clubInfo?.achievements && (
        <Card style={styles.infoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>{t('profile.achievements') || 'Dostignuća'}</Text>
            <Text style={styles.bodyText}>{clubInfo.achievements}</Text>
          </Card.Content>
        </Card>
      )}

      {/* Owner */}
      {owner && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('roles.owner')}</Text>
          {renderPersonCard(owner, true)}
        </View>
      )}

      {/* Coaches */}
      {coaches.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{t('roles.coach')}s ({coaches.length})</Text>
          {coaches.map((coach) => renderPersonCard(coach, false))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 120 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.md },
  clubCard: { backgroundColor: Colors.surface, marginBottom: Spacing.md },
  clubContent: { alignItems: 'center', paddingVertical: Spacing.lg },
  clubLogo: { width: 96, height: 96, borderRadius: BorderRadius.lg, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  logoImage: { width: 96, height: 96, borderRadius: BorderRadius.lg },
  clubName: { fontSize: FontSize.xxl, fontWeight: 'bold', color: Colors.text, textAlign: 'center' },
  clubDescription: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: 'center', marginTop: Spacing.sm, paddingHorizontal: Spacing.lg },
  infoCard: { backgroundColor: Colors.surface, marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.sm, gap: Spacing.md },
  infoText: { fontSize: FontSize.md, color: Colors.text, flex: 1 },
  linkText: { color: Colors.primary },
  bodyText: { fontSize: FontSize.md, color: Colors.text, lineHeight: 22 },
  section: { marginBottom: Spacing.md },
  sectionHeader: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text, marginBottom: Spacing.sm, marginLeft: Spacing.xs },
  personCard: { backgroundColor: Colors.surface, marginBottom: Spacing.sm },
  personContent: { paddingVertical: Spacing.sm },
  personHeader: { flexDirection: 'row', alignItems: 'center' },
  personAvatar: { width: 56, height: 56, borderRadius: 28 },
  avatarPlaceholder: { backgroundColor: Colors.primary },
  ownerAvatar: { backgroundColor: Colors.warning },
  personInfo: { flex: 1, marginLeft: Spacing.md },
  personName: { fontSize: FontSize.lg, fontWeight: '600', color: Colors.text },
  roleBadge: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.xs, gap: Spacing.xs },
  roleText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: '500' },
  ownerRoleText: { color: Colors.warning },
  contactSection: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: Colors.border },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: Spacing.xs, gap: Spacing.sm },
  contactText: { fontSize: FontSize.sm, color: Colors.text, flex: 1 },
  chatButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.primary, borderRadius: BorderRadius.sm, gap: Spacing.sm },
  chatButtonText: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '500' },
});
