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

const BasicDetailsStep = ({
    profile,
    onNext,
    isFirstStep
}: BasicDetailsStepProps) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<BasicDetailsInput>({
        resolver: zodResolver(basicDetailsSchema),
        defaultValues: {
            firstName: profile?.firstName || '',
            lastName: profile?.lastName || '',
            headline: profile?.headline || '',
            location: profile?.location || '',
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

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="location"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="New York, NY"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Phone Number (Optional)
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="+1 (555) 000-0000"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

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
