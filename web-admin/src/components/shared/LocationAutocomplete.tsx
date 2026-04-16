import { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2 } from 'lucide-react';

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function LocationAutocomplete({ value, onChange, placeholder, className, id }: LocationAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=sr`,
        { headers: { 'Accept-Language': 'sr' } }
      );
      const data: NominatimResult[] = await res.json();
      setSuggestions(data);
      setShowDropdown(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 400);
  };

  const handleSelect = (result: NominatimResult) => {
    // Use a shorter display name (first 2 parts of the full name)
    const parts = result.display_name.split(', ');
    const shortName = parts.slice(0, 3).join(', ');
    onChange(shortName);
    setSuggestions([]);
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
        )}
        <Input
          id={id}
          value={value}
          onChange={handleInputChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className={`pl-9 ${className || ''}`}
          autoComplete="off"
        />
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-md shadow-md overflow-hidden">
          {suggestions.map((result) => {
            const parts = result.display_name.split(', ');
            const main = parts[0];
            const sub = parts.slice(1, 3).join(', ');
            return (
              <button
                key={result.place_id}
                type="button"
                className="w-full flex items-start gap-2 px-3 py-2 text-left text-sm hover:bg-accent transition-colors"
                onMouseDown={(e) => { e.preventDefault(); handleSelect(result); }}
              >
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-foreground truncate">{main}</p>
                  {sub && <p className="text-xs text-muted-foreground truncate">{sub}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
