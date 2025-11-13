'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Users, CheckCircle2 } from 'lucide-react';

import {
    profilePhotoSchema,
    type ProfilePhotoInput
} from '@/schemas/onboarding';
import { saveProfilePhoto } from '@/actions/onboarding';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ProfilePhotoStepProps } from '@/types/onboarding';

const ProfilePhotoStep = ({ profile, onPrevious }: ProfilePhotoStepProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<ProfilePhotoInput>({
        resolver: zodResolver(profilePhotoSchema),
        defaultValues: {
            image: '',
            profileVisibility: profile?.profileVisibility || 'public',
            searchable: profile?.searchable ?? true
        }
    });

    function onSubmit(data: ProfilePhotoInput) {
        startTransition(async () => {
            const result = await saveProfilePhoto(data);

            if (result.success) {
                toast.success('Profile completed! Redirecting to dashboard...');
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                toast.error(result.error || 'Failed to save profile settings');
            }
        });
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">
                    Profile Visibility & Privacy
                </h2>
                <p className="text-slate-600 mt-1">
                    Choose who can see your profile and how you want to be
                    discovered
                </p>
            </div>

            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8"
                >
                    {/* Profile Visibility */}
                    <FormField
                        control={form.control}
                        name="profileVisibility"
                        render={({ field }) => (
                            <FormItem className="space-y-4">
                                <FormLabel className="text-base font-semibold">
                                    Profile Visibility
                                </FormLabel>
                                <FormControl>
                                    <RadioGroup
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        className="space-y-3"
                                    >
                                        <div className="flex items-start space-x-3 p-4 border border-slate-200 rounded-lg hover:border-slate-300 cursor-pointer transition-colors">
                                            <RadioGroupItem
                                                value="public"
                                                id="public"
                                                className="mt-1"
                                            />
                                            <Label
                                                htmlFor="public"
                                                className="flex-1 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Eye className="w-4 h-4 text-teal-600" />
                                                    <span className="font-medium">
                                                        Public
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    Your profile is visible to
                                                    everyone, including search
                                                    engines
                                                </p>
                                            </Label>
                                        </div>

                                        <div className="flex items-start space-x-3 p-4 border border-slate-200 rounded-lg hover:border-slate-300 cursor-pointer transition-colors">
                                            <RadioGroupItem
                                                value="recruiter-only"
                                                id="recruiter-only"
                                                className="mt-1"
                                            />
                                            <Label
                                                htmlFor="recruiter-only"
                                                className="flex-1 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Users className="w-4 h-4 text-slate-blue" />
                                                    <span className="font-medium">
                                                        Verified Recruiters Only
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    Only verified recruiters on
                                                    HyreYou can view your
                                                    profile
                                                </p>
                                            </Label>
                                        </div>

                                        <div className="flex items-start space-x-3 p-4 border border-slate-200 rounded-lg hover:border-slate-300 cursor-pointer transition-colors">
                                            <RadioGroupItem
                                                value="private"
                                                id="private"
                                                className="mt-1"
                                            />
                                            <Label
                                                htmlFor="private"
                                                className="flex-1 cursor-pointer"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <EyeOff className="w-4 h-4 text-slate-500" />
                                                    <span className="font-medium">
                                                        Private
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-600">
                                                    Your profile is hidden from
                                                    everyone except you
                                                </p>
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Searchable */}
                    <FormField
                        control={form.control}
                        name="searchable"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-slate-200 p-4">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel className="text-base font-medium">
                                        Allow recruiters to find me
                                    </FormLabel>
                                    <FormDescription>
                                        When enabled, verified recruiters can
                                        discover your profile when searching for
                                        candidates with your skills and
                                        experience
                                    </FormDescription>
                                </div>
                            </FormItem>
                        )}
                    />

                    {/* Completion Message */}
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-6">
                        <div className="flex gap-3">
                            <CheckCircle2 className="w-6 h-6 text-teal-600 shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-teal-900 mb-1">
                                    Almost Done!
                                </h3>
                                <p className="text-sm text-teal-800">
                                    {
                                        "You're about to complete your HyreYou profile. Once saved, you'll be redirected to your dashboard where you can generate your resume and start applying for jobs."
                                    }
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onPrevious}
                        >
                            Back
                        </Button>
                        <Button type="submit" disabled={isPending} size="lg">
                            {isPending ? 'Completing...' : 'Complete Profile'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
};

export default ProfilePhotoStep;
