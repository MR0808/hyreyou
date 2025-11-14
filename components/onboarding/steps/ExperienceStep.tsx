'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Briefcase, Plus, Trash2 } from 'lucide-react';

import {
    workExperienceSchema,
    type WorkExperienceInput
} from '@/schemas/onboarding';
import { addWorkExperience, deleteWorkExperience } from '@/actions/onboarding';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { LocationInput } from '@/components/ui/location-input';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { ExperienceStepProps } from '@/types/onboarding';

const ExperienceStep = ({
    profile,
    onNext,
    onPrevious
}: ExperienceStepProps) => {
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [experiences, setExperiences] = useState(
        profile?.workExperience || []
    );

    const form = useForm<WorkExperienceInput>({
        resolver: zodResolver(workExperienceSchema),
        defaultValues: {
            company: '',
            title: '',
            city: '',
            state: '',
            country: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        }
    });

    const isCurrent = form.getValues('current');

    function onSubmit(data: WorkExperienceInput) {
        startTransition(async () => {
            const result = await addWorkExperience(data);

            if (result.success) {
                toast.success('Work experience added!');
                setIsDialogOpen(false);
                form.reset();
                // Refresh the page to get updated experiences
                window.location.reload();
            } else {
                toast.error(result.error || 'Failed to add experience');
            }
        });
    }

    function handleDelete(experienceId: string) {
        startTransition(async () => {
            const result = await deleteWorkExperience(experienceId);

            if (result.success) {
                toast.success('Experience deleted');
                setExperiences(
                    experiences.filter((exp: any) => exp.id !== experienceId)
                );
            } else {
                toast.error(result.error || 'Failed to delete experience');
            }
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Work Experience
                    </h2>
                    <p className="text-slate-600 mt-1">
                        Add your professional experience to showcase your
                        background
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Experience
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Add Work Experience</DialogTitle>
                        </DialogHeader>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="company"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Company</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Acme Corp"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Job Title</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Software Engineer"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="city"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Location (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <LocationInput
                                                    value={{
                                                        city:
                                                            form.getValues(
                                                                'city'
                                                            ) || '',
                                                        state: form.getValues(
                                                            'state'
                                                        ),
                                                        country:
                                                            form.getValues(
                                                                'country'
                                                            ) || ''
                                                    }}
                                                    onChange={(location) => {
                                                        form.setValue(
                                                            'city',
                                                            location.city
                                                        );
                                                        form.setValue(
                                                            'state',
                                                            location.state
                                                        );
                                                        form.setValue(
                                                            'country',
                                                            location.country
                                                        );
                                                    }}
                                                    placeholder="Search for city or suburb..."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Start Date
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="month"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>End Date</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="month"
                                                        disabled={isCurrent}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="current"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                            <FormControl>
                                                <Checkbox
                                                    checked={field.value}
                                                    onCheckedChange={
                                                        field.onChange
                                                    }
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    I currently work here
                                                </FormLabel>
                                            </div>
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Description (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <RichTextEditor
                                                    value={field.value || ''}
                                                    onChange={field.onChange}
                                                    placeholder="Describe your responsibilities and achievements... Use bullet points for better readability."
                                                    className="min-h-[150px]"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending
                                            ? 'Adding...'
                                            : 'Add Experience'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Experience List */}
            <div className="space-y-4">
                {experiences.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                        <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                        <p className="text-slate-600 mb-4">
                            No work experience added yet
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Experience
                        </Button>
                    </div>
                ) : (
                    experiences.map((exp: any) => (
                        <div
                            key={exp.id}
                            className="flex justify-between items-start p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                        >
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">
                                    {exp.title}
                                </h3>
                                <p className="text-slate-700">{exp.company}</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    {new Date(exp.startDate).toLocaleDateString(
                                        'en-US',
                                        {
                                            month: 'short',
                                            year: 'numeric'
                                        }
                                    )}{' '}
                                    -{' '}
                                    {exp.current
                                        ? 'Present'
                                        : new Date(
                                              exp.endDate
                                          ).toLocaleDateString('en-US', {
                                              month: 'short',
                                              year: 'numeric'
                                          })}
                                    {exp.city &&
                                        ` • ${[exp.city, exp.state, exp.country].filter(Boolean).join(', ')}`}
                                </p>
                                {exp.description && (
                                    <div
                                        className="text-sm text-slate-600 mt-2 prose prose-sm max-w-none"
                                        dangerouslySetInnerHTML={{
                                            __html: exp.description
                                        }}
                                    />
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(exp.id)}
                                disabled={isPending}
                            >
                                <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                        </div>
                    ))
                )}
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onPrevious}>
                    Back
                </Button>
                <Button onClick={onNext}>
                    {experiences.length > 0 ? 'Continue' : 'Skip for Now'}
                </Button>
            </div>
        </div>
    );
};

export default ExperienceStep;
