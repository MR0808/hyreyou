'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { educationSchema, type EducationInput } from '@/schemas/onboarding';
import {
    addEducation,
    deleteEducation,
    updateEducation
} from '@/actions/onboarding';
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
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { EducationStepProps } from '@/types/onboarding';
import { LocationInput } from '@/components/ui/location-input';

const EducationStep = ({ profile, onNext, onPrevious }: EducationStepProps) => {
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [education, setEducation] = useState(profile?.education || []);
    const [isCurrent, setIsCurrent] = useState(false);
    const [editingEducation, setEditingEducation] = useState<any>(null);

    const form = useForm<EducationInput>({
        resolver: zodResolver(educationSchema),
        defaultValues: {
            institution: '',
            degree: '',
            field: '',
            city: '',
            state: '',
            country: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        }
    });

    const handleDialogChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) {
            form.reset();
            setIsCurrent(false);
            setEditingEducation(null);
        }
    };

    const handleEdit = (edu: any) => {
        setEditingEducation(edu);
        const formatDateForMonthInput = (dateString: string) => {
            if (!dateString) return '';
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${year}-${month}`;
        };

        form.reset({
            institution: edu.institution,
            degree: edu.degree,
            field: edu.field || '',
            city: edu.city || '',
            state: edu.state || '',
            country: edu.country || '',
            startDate: formatDateForMonthInput(edu.startDate),
            endDate: formatDateForMonthInput(edu.endDate),
            current: edu.current,
            description: edu.description || ''
        });
        setIsCurrent(edu.current);
        setIsDialogOpen(true);
    };

    const sortedEducation = [...education].sort((a, b) => {
        if (a.current && !b.current) return -1;
        if (!a.current && b.current) return 1;

        if (!a.endDate && !b.endDate) return 0;
        if (!a.endDate) return 1;
        if (!b.endDate) return -1;

        const aDate = new Date(a.endDate);
        const bDate = new Date(b.endDate);

        return bDate.getTime() - aDate.getTime();
    });

    function onSubmit(data: EducationInput) {
        startTransition(async () => {
            const result = editingEducation
                ? await updateEducation(editingEducation.id, data)
                : await addEducation(data);

            if (result.success) {
                toast.success(
                    editingEducation ? 'Education updated!' : 'Education added!'
                );
                setIsDialogOpen(false);
                form.reset();
                if (result.data) {
                    if (editingEducation) {
                        setEducation(
                            education.map((edu: any) =>
                                edu.id === editingEducation.id
                                    ? result.data
                                    : edu
                            )
                        );
                    } else {
                        setEducation([...education, result.data]);
                    }
                }
                setEditingEducation(null);
            } else {
                toast.error(
                    result.error ||
                        `Failed to ${editingEducation ? 'update' : 'add'} education`
                );
            }
        });
    }

    function handleDelete(educationId: string) {
        startTransition(async () => {
            const result = await deleteEducation(educationId);

            if (result.success) {
                toast.success('Education deleted');
                setEducation(
                    education.filter((edu: any) => edu.id !== educationId)
                );
            } else {
                toast.error(result.error || 'Failed to delete education');
            }
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Education
                    </h2>
                    <p className="text-slate-600 mt-1">
                        Add your educational background and qualifications
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Education
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>
                                {editingEducation
                                    ? 'Edit Education'
                                    : 'Add Education'}
                            </DialogTitle>
                        </DialogHeader>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="institution"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Institution</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Stanford University"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="degree"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Degree</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Bachelor of Science"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="field"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Field of Study (Optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Computer Science"
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
                                                    Start Date (Optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="month"
                                                        {...field}
                                                        max={new Date()
                                                            .toISOString()
                                                            .slice(0, 7)}
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
                                                <FormLabel>
                                                    End Date (Optional)
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="month"
                                                        {...field}
                                                        disabled={isCurrent}
                                                        max={new Date()
                                                            .toISOString()
                                                            .slice(0, 7)}
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
                                                    onCheckedChange={(
                                                        checked
                                                    ) => {
                                                        field.onChange(checked);
                                                        setIsCurrent(
                                                            checked as boolean
                                                        );
                                                    }}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                    Currently studying here
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
                                                <Textarea
                                                    placeholder="Notable achievements, coursework, activities..."
                                                    rows={3}
                                                    {...field}
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
                                        onClick={() =>
                                            handleDialogChange(false)
                                        }
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending
                                            ? editingEducation
                                                ? 'Updating...'
                                                : 'Adding...'
                                            : editingEducation
                                              ? 'Update Education'
                                              : 'Add Education'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Education List */}
            <div className="space-y-4">
                {education.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                        <GraduationCap className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                        <p className="text-slate-600 mb-4">
                            No education added yet
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Education
                        </Button>
                    </div>
                ) : (
                    sortedEducation.map((edu: any) => (
                        <div
                            key={edu.id}
                            className="flex justify-between items-start p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                        >
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">
                                    {edu.degree}
                                </h3>
                                <p className="text-slate-700">
                                    {edu.institution}
                                </p>
                                {edu.field && (
                                    <p className="text-sm text-slate-600">
                                        Field: {edu.field}
                                    </p>
                                )}
                                {edu.city && (
                                    <p className="text-sm text-slate-600">
                                        Location:{' '}
                                        {[edu.city, edu.state, edu.country]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>
                                )}
                                {(edu.startDate || edu.endDate) && (
                                    <p className="text-sm text-slate-500 mt-1">
                                        {edu.startDate &&
                                            new Date(
                                                edu.startDate
                                            ).toLocaleDateString('en-US', {
                                                month: 'short',
                                                year: 'numeric'
                                            })}{' '}
                                        -{' '}
                                        {edu.current
                                            ? 'Present'
                                            : edu.endDate &&
                                              new Date(
                                                  edu.endDate
                                              ).toLocaleDateString('en-US', {
                                                  month: 'short',
                                                  year: 'numeric'
                                              })}
                                    </p>
                                )}
                                {edu.description && (
                                    <p className="text-sm text-slate-600 mt-2">
                                        {edu.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEdit(edu)}
                                    disabled={isPending}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        className="text-slate-600"
                                    >
                                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                        <path d="m15 5 4 4" />
                                    </svg>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDelete(edu.id)}
                                    disabled={isPending}
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onPrevious}>
                    Back
                </Button>
                <Button onClick={onNext}>
                    {education.length > 0 ? 'Continue' : 'Skip for Now'}
                </Button>
            </div>
        </div>
    );
};

export default EducationStep;
