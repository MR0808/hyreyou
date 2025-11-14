'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
    basicDetailsSchema,
    type BasicDetailsInput
} from '@/schemas/onboarding';
import { saveBasicDetails } from '@/actions/onboarding';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { BasicDetailsStepProps } from '@/types/onboarding';
import { PhoneInput } from '@/components/ui/phone-input';
import { LocationInput } from '@/components/ui/location-input';

const BasicDetailsStep = ({ profile, onNext, user }: BasicDetailsStepProps) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<BasicDetailsInput>({
        resolver: zodResolver(basicDetailsSchema),
        defaultValues: {
            firstName: profile?.firstName || user.name || '',
            lastName: profile?.lastName || user.lastName || '',
            headline: profile?.headline || '',
            city: profile?.city || '',
            state: profile?.state || '',
            country: profile?.country || 'United States',
            phone: profile?.phone || ''
        }
    });

    function onSubmit(data: BasicDetailsInput) {
        startTransition(async () => {
            const result = await saveBasicDetails(data);

            if (result.success) {
                toast.success('Basic details saved!');
                onNext();
            } else {
                toast.error(result.error || 'Failed to save details');
            }
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Basic Details
                </h2>
                <p className="text-slate-600 mt-1">
                    {"Let's start with the basics. Tell us about yourself."}
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="firstName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="lastName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="headline"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Professional Headline</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="e.g., Full Stack Developer with 5+ years experience in React and Node.js"
                                        className="resize-none"
                                        rows={3}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is the first thing recruiters will see
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location</FormLabel>
                                <FormControl>
                                    <LocationInput
                                        value={{
                                            city: form.getValues('city'),
                                            state: form.getValues('state'),
                                            country: form.getValues('country')
                                        }}
                                        onChange={(location) => {
                                            form.setValue(
                                                'city',
                                                location.city
                                            );
                                            form.setValue(
                                                'state',
                                                location.state || ''
                                            );
                                            form.setValue(
                                                'country',
                                                location.country
                                            );
                                        }}
                                        placeholder="Search for your city (e.g., Melbourne)"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Type your city name to search globally
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Phone Number (Optional)</FormLabel>
                                <FormControl>
                                    <PhoneInput
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Enter phone number"
                                        defaultCountry="AU"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Include your country code for international
                                    numbers
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="submit" disabled={isPending} size="lg">
                            {isPending ? 'Saving...' : 'Continue'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default BasicDetailsStep;
