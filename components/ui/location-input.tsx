'use client';

import * as React from 'react';
import { Check, Loader2, MapPin, ChevronsUpDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';

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
    const [open, setOpen] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [results, setResults] = React.useState<LocationResult[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const debounceTimer = React.useRef<NodeJS.Timeout | null>(null);

    const displayValue = React.useMemo(() => {
        if (!value?.city) return '';
        const parts = [value.city];
        if (value.state) parts.push(value.state);
        parts.push(value.country);
        return parts.join(', ');
    }, [value]);

    const searchLocations = React.useCallback(async (query: string) => {
        if (!query || query.length < 2) {
            setResults([]);
            return;
        }

        setIsLoading(true);

        try {
            // Use Mapbox Geocoding API - much more reliable for suburbs
            const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

            if (mapboxToken) {
                // Mapbox API call with types for neighborhoods, places, localities
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

            // Fallback to Photon API (more reliable than Nominatim)
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

                    // Extract suburb/city from various possible fields
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

            // Remove duplicates
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
        setOpen(false);
        setSearchQuery('');
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.({ city: '', country: '' });
        setSearchQuery('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        'w-full justify-between font-normal',
                        'hover:border-primary/50 hover:bg-primary/5 hover:text-foreground',
                        'focus-visible:ring-2 focus-visible:ring-primary',
                        !displayValue &&
                            'text-muted-foreground hover:text-muted-foreground'
                    )}
                    disabled={disabled}
                >
                    <div className="flex items-center gap-2 truncate">
                        <MapPin className="h-4 w-4 shrink-0 text-primary" />
                        <span className="text-sm">
                            {displayValue || placeholder}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 ml-2 shrink-0">
                        {displayValue && !disabled && (
                            <div
                                onClick={handleClear}
                                className="rounded-sm opacity-70 hover:opacity-100 hover:bg-primary/10 p-0.5 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </div>
                        )}
                        <ChevronsUpDown className="h-4 w-4 opacity-50" />
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Type suburb or city (e.g., Moorabbin)..."
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        {isLoading && (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            </div>
                        )}

                        {!isLoading && searchQuery && results.length === 0 && (
                            <CommandEmpty>No locations found</CommandEmpty>
                        )}

                        {!isLoading && !searchQuery && (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Start typing to search
                            </div>
                        )}

                        {!isLoading && results.length > 0 && (
                            <CommandGroup>
                                {results.map((location, index) => (
                                    <CommandItem
                                        key={`${location.displayName}-${index}`}
                                        value={location.displayName}
                                        onSelect={() => handleSelect(location)}
                                        className="cursor-pointer data-[selected=true]:bg-indigo-100 data-[selected=true]:text-indigo-900"
                                    >
                                        <Check
                                            className={cn(
                                                'mr-2 h-4 w-4',
                                                displayValue ===
                                                    location.displayName
                                                    ? 'opacity-100'
                                                    : 'opacity-0'
                                            )}
                                        />
                                        <MapPin className="mr-2 h-4 w-4 text-primary/70" />
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {location.city}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {[
                                                    location.state,
                                                    location.country
                                                ]
                                                    .filter(Boolean)
                                                    .join(', ')}
                                            </span>
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
