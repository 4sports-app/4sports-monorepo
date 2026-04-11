import { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Text, TextInput, IconButton } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { Spacing, BorderRadius, FontSize } from '@/constants/Layout';

const GEOAPIFY_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_MAPS_API_KEY || '';

export interface LocationValue {
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  placeId?: string;
}

interface SuggestionItem {
  formatted: string;
  name?: string;
  city?: string;
  country?: string;
  lat: number;
  lon: number;
  place_id: string;
}

interface LocationPickerProps {
  value: LocationValue | null;
  onChange: (loc: LocationValue) => void;
  savedLocations: LocationValue[];
  placeholder?: string;
  savedLocationsTitle?: string;
  onOpen?: () => void;
}

export default function LocationPicker({
  value,
  onChange,
  savedLocations,
  placeholder = 'Pretraži lokaciju...',
  savedLocationsTitle = 'Prethodne lokacije',
  onOpen,
}: LocationPickerProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch Geoapify autocomplete
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    if (!GEOAPIFY_KEY) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&lang=sr&limit=5&apiKey=${GEOAPIFY_KEY}`;
        const res = await fetch(url);
        const json = await res.json();
        if (json.features && json.features.length > 0) {
          setSuggestions(
            json.features.map((f: any) => ({
              formatted: f.properties.formatted || '',
              name: f.properties.name || f.properties.street || '',
              city: f.properties.city || '',
              country: f.properties.country || '',
              lat: f.properties.lat,
              lon: f.properties.lon,
              place_id: f.properties.place_id || `${f.properties.lat},${f.properties.lon}`,
            }))
          );
        } else {
          setSuggestions([]);
        }
      } catch (e) {
        console.warn('Geoapify autocomplete error:', e);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    const name = item.name || item.formatted.split(',')[0] || item.formatted;
    onChange({
      name,
      address: item.formatted,
      lat: item.lat,
      lng: item.lon,
      placeId: item.place_id,
    });
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setShowSearchInput(false);
  };

  const handleSelectSaved = (loc: LocationValue) => {
    onChange(loc);
    setShowSuggestions(false);
    setShowSearchInput(false);
  };

  return (
    <View style={styles.container}>
      {/* Selected location card */}
      {value && !showSearchInput && (
        <TouchableOpacity
          style={styles.selectedCard}
          onPress={() => { setShowSearchInput(true); onOpen?.(); }}
        >
          <MaterialCommunityIcons name="map-marker" size={20} color={Colors.primary} />
          <View style={styles.selectedTextWrapper}>
            <Text style={styles.selectedName} numberOfLines={1}>{value.name}</Text>
            {value.address ? (
              <Text style={styles.selectedAddress} numberOfLines={1}>{value.address}</Text>
            ) : null}
          </View>
          <MaterialCommunityIcons name="pencil" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Empty state - tap to pick */}
      {!value && !showSearchInput && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => { setShowSearchInput(true); onOpen?.(); }}
        >
          <MaterialCommunityIcons name="map-marker-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>{placeholder}</Text>
          <MaterialCommunityIcons name="chevron-down" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      )}

      {/* Search mode */}
      {showSearchInput && (
        <View>
          <View style={styles.searchRow}>
            <TextInput
              value={query}
              onChangeText={(t) => {
                setQuery(t);
                setShowSuggestions(true);
              }}
              placeholder={placeholder}
              mode="outlined"
              style={styles.searchInput}
              outlineColor={Colors.border}
              activeOutlineColor={Colors.primary}
              dense
              autoFocus
              left={<TextInput.Icon icon="magnify" />}
              right={isSearching ? <TextInput.Icon icon={() => <ActivityIndicator size="small" color={Colors.primary} />} /> : undefined}
            />
            <IconButton
              icon="close"
              size={20}
              onPress={() => {
                setQuery('');
                setSuggestions([]);
                setShowSuggestions(false);
                setShowSearchInput(false);
              }}
            />
          </View>

          {!GEOAPIFY_KEY && (
            <Text style={styles.warningText}>
              Geoapify API key nije podešen. Pretraga je onemogućena.
            </Text>
          )}

          {/* Saved locations (history) - shown when no query */}
          {savedLocations.length > 0 && query.trim().length === 0 && (
            <View style={styles.savedSection}>
              <Text style={styles.savedTitle}>{savedLocationsTitle}</Text>
              {savedLocations.map((loc, idx) => (
                <TouchableOpacity
                  key={`${loc.placeId || loc.name}-${idx}`}
                  style={styles.savedItem}
                  onPress={() => handleSelectSaved(loc)}
                >
                  <MaterialCommunityIcons name="history" size={18} color={Colors.textSecondary} />
                  <View style={styles.savedTextWrapper}>
                    <Text style={styles.savedName} numberOfLines={1}>{loc.name}</Text>
                    {loc.address ? (
                      <Text style={styles.savedAddress} numberOfLines={1}>{loc.address}</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Autocomplete results */}
          {showSuggestions && suggestions.length > 0 && (
            <View style={styles.suggestionsList}>
              {suggestions.map((item, idx) => (
                <TouchableOpacity
                  key={`${item.place_id}-${idx}`}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectSuggestion(item)}
                >
                  <MaterialCommunityIcons name="map-marker-outline" size={18} color={Colors.primary} />
                  <View style={styles.suggestionTextWrapper}>
                    <Text style={styles.suggestionMain} numberOfLines={1}>
                      {item.name || item.formatted.split(',')[0]}
                    </Text>
                    <Text style={styles.suggestionSecondary} numberOfLines={1}>
                      {item.formatted}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.xs },
  selectedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  selectedTextWrapper: { flex: 1 },
  selectedName: { fontSize: FontSize.md, color: Colors.text, fontWeight: '500' },
  selectedAddress: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  emptyText: { flex: 1, fontSize: FontSize.md, color: Colors.textSecondary },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  searchInput: { flex: 1, backgroundColor: Colors.surface },
  warningText: { fontSize: FontSize.xs, color: Colors.warning, marginTop: Spacing.xs },
  savedSection: { marginTop: Spacing.sm },
  savedTitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    fontWeight: '600',
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  savedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  savedTextWrapper: { flex: 1 },
  savedName: { fontSize: FontSize.md, color: Colors.text },
  savedAddress: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
  suggestionsList: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  suggestionTextWrapper: { flex: 1 },
  suggestionMain: { fontSize: FontSize.md, color: Colors.text, fontWeight: '500' },
  suggestionSecondary: { fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 2 },
});
