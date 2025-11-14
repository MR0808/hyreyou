'use client';

import * as React from 'react';
import { Check, Loader2, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

interface Location {
    city: string;
    state?: string;
    country: string;
}

interface LocationInputProps {
    value?: Location;
    onChange?: (value: Location) => void;
    disabled?: boolean;
    placeholder?: string;
}

interface LocationResult {
    city: string;
    state?: string;
    country: string;
    displayName: string;
}

export function LocationInput({
    value,
    onChange,
    disabled,
    placeholder = 'Search for a city or suburb...'
}: LocationInputProps) {
    const [searchQuery, setSearchQuery] = React.useState('');
    const [results, setResults] = React.useState<LocationResult[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [showResults, setShowResults] = React.useState(false);
    const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const displayValue = React.useMemo(() => {
        if (!value?.city) return '';
        const parts = [value.city];
        if (value.state) parts.push(value.state);
        parts.push(value.country);
        return parts.join(', ');
    }, [value]);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchLocations = React.useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);

        try {
            const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

            if (mapboxToken) {
                const response = await fetch(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
                        new URLSearchParams({
                            access_token: mapboxToken,
                            types: 'place,locality,neighborhood,district',
                            limit: '10',
                            language: 'en'
                        })
                );

                if (response.ok) {
                    const data = await response.json();
                    const locations: LocationResult[] = data.features.map(
                        (feature: any) => {
                            const contextObj: Record<string, string> = {};
                            feature.context?.forEach((ctx: any) => {
                                const [type] = ctx.id.split('.');
                                contextObj[type] = ctx.text;
                            });

                            const city = feature.text;
                            const state =
                                contextObj.region || contextObj.district;
                            const country = contextObj.country || '';

                            return {
                                city,
                                state,
                                country,
                                displayName: [city, state, country]
                                    .filter(Boolean)
                                    .join(', ')
                            };
                        }
                    );

                    setResults(locations);
                    setIsLoading(false);
                    return;
                }
            }

            const response = await fetch(
                `https://photon.komoot.io/api/?` +
                    new URLSearchParams({
                        q: query,
                        limit: '10',
                        lang: 'en'
                    })
            );

            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();

            const locations: LocationResult[] = data.features
                .map((feature: any) => {
                    const props = feature.properties;

                    const city =
                        props.name ||
                        props.city ||
                        props.town ||
                        props.village ||
                        props.suburb ||
                        props.neighbourhood ||
                        props.district;

                    const state = props.state || props.county;
                    const country = props.country || '';

                    if (!city || !country) return null;

                    return {
                        city,
                        state,
                        country,
                        displayName: [city, state, country]
                            .filter(Boolean)
                            .join(', ')
                    };
                })
                .filter(
                    (loc: LocationResult | null): loc is LocationResult =>
                        loc !== null
                );

            const uniqueLocations = Array.from(
                new Map(locations.map((loc) => [loc.displayName, loc])).values()
            );

            setResults(uniqueLocations);
        } catch (err) {
            console.error('Location search error:', err);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    React.useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            searchLocations(searchQuery);
        }, 300);

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchQuery, searchLocations]);

    const handleSelect = (location: LocationResult) => {
        onChange?.({
            city: location.city,
            state: location.state,
            country: location.country
        });
        setShowResults(false);
        setSearchQuery('');
    };

    const handleClear = () => {
        onChange?.({ city: '', country: '' });
        setSearchQuery('');
        setResults([]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setShowResults(true);
    };

    const handleFocus = () => {
        if (!displayValue && searchQuery) {
            setShowResults(true);
        }
    };

    const isSelected = !!displayValue;

    return (
        <div ref={containerRef} className="relative w-full">
            <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />

                {isSelected ? (
                    <div
                        className={cn(
                            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                            'items-center justify-between pl-9',
                            disabled && 'cursor-not-allowed opacity-50'
                        )}
                    >
                        <span className="text-foreground">{displayValue}</span>
                        {!disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="rounded-sm opacity-70 hover:opacity-100 hover:bg-primary/10 p-0.5 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <Input
                        type="text"
                        value={searchQuery}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        placeholder={placeholder}
                        disabled={disabled}
                        className="pl-9"
                    />
                )}
            </div>

            {showResults && !isSelected && searchQuery && (
                <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-[300px] overflow-auto">
                    {isLoading && (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        </div>
                    )}

                    {!isLoading && results.length === 0 && (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            No locations found
                        </div>
                    )}

                    {!isLoading && results.length > 0 && (
                        <div className="py-1">
                            {results.map((location, index) => (
                                <button
                                    key={`${location.displayName}-${index}`}
                                    type="button"
                                    onClick={() => handleSelect(location)}
                                    className={cn(
                                        'w-full flex items-start gap-2 px-3 py-2 text-left text-sm',
                                        'hover:bg-accent cursor-pointer',
                                        'transition-colors'
                                    )}
                                >
                                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary/70" />
                                    <div className="flex flex-col min-w-0">
                                        <span className="font-medium truncate">
                                            {location.city}
                                        </span>
                                        <span className="text-xs text-muted-foreground truncate">
                                            {[location.state, location.country]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
