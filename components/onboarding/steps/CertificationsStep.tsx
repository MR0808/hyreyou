'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Award, Plus, Trash2 } from 'lucide-react';

import {
    certificationSchema,
    type CertificationInput
} from '@/schemas/onboarding';
import { addCertification, deleteCertification } from '@/actions/onboarding';
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { CertificationsStepProps } from '@/types/onboarding';

const CertificationsStep = ({
    profile,
    onNext,
    onPrevious
}: CertificationsStepProps) => {
    const [isPending, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [certifications, setCertifications] = useState(
        profile?.certifications || []
    );

    const form = useForm<CertificationInput>({
        resolver: zodResolver(certificationSchema),
        defaultValues: {
            name: '',
            issuer: '',
            issueDate: '',
            expiryDate: '',
            credentialId: '',
            credentialUrl: ''
        }
    });

    function onSubmit(data: CertificationInput) {
        startTransition(async () => {
            const result = await addCertification(data);

            if (result.success) {
                toast.success('Certification added!');
                setIsDialogOpen(false);
                form.reset();
                window.location.reload();
            } else {
                toast.error(result.error || 'Failed to add certification');
            }
        });
    }

    function handleDelete(certificationId: string) {
        startTransition(async () => {
            const result = await deleteCertification(certificationId);

            if (result.success) {
                toast.success('Certification deleted');
                setCertifications(
                    certifications.filter(
                        (cert: any) => cert.id !== certificationId
                    )
                );
            } else {
                toast.error(result.error || 'Failed to delete certification');
            }
        });
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Certifications & Verifications
                    </h2>
                    <p className="text-slate-600 mt-1">
                        Add professional certifications to boost your
                        credibility
                    </p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Certification
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Add Certification</DialogTitle>
                        </DialogHeader>

                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-4"
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Certification Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="AWS Certified Solutions Architect"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="issuer"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Issuing Organization
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Amazon Web Services"
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
                                        name="issueDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Issue Date (Optional)
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
                                        name="expiryDate"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Expiry Date (Optional)
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
                                </div>

                                <FormField
                                    control={form.control}
                                    name="credentialId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Credential ID (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="ABC123XYZ"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="credentialUrl"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Credential URL (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="url"
                                                    placeholder="https://www.credly.com/badges/..."
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
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isPending}>
                                        {isPending
                                            ? 'Adding...'
                                            : 'Add Certification'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Certifications List */}
            <div className="space-y-4">
                {certifications.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                        <Award className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                        <p className="text-slate-600 mb-4">
                            No certifications added yet
                        </p>
                        <p className="text-sm text-slate-500 mb-4">
                            Certifications are optional but help verify your
                            expertise
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Certification
                        </Button>
                    </div>
                ) : (
                    certifications.map((cert: any) => (
                        <div
                            key={cert.id}
                            className="flex justify-between items-start p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                        >
                            <div className="flex-1">
                                <h3 className="font-semibold text-slate-900">
                                    {cert.name}
                                </h3>
                                <p className="text-slate-700">{cert.issuer}</p>
                                {(cert.issueDate || cert.credentialId) && (
                                    <div className="flex gap-4 mt-1 text-sm text-slate-500">
                                        {cert.issueDate && (
                                            <span>
                                                Issued:{' '}
                                                {new Date(
                                                    cert.issueDate
                                                ).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        )}
                                        {cert.credentialId && (
                                            <span>ID: {cert.credentialId}</span>
                                        )}
                                    </div>
                                )}
                                {cert.credentialUrl && (
                                    <a
                                        href={cert.credentialUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-teal-600 hover:underline mt-1 inline-block"
                                    >
                                        View Credential
                                    </a>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(cert.id)}
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
                <Button onClick={onNext}>Continue</Button>
            </div>
        </div>
    );
};

export default CertificationsStep;
