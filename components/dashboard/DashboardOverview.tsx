'use client';

import Link from 'next/link';
import {
    FileText,
    Eye,
    Briefcase,
    AlertCircle,
    CheckCircle2,
    ArrowRight,
    Download,
    Settings
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DashboardOverviewProps } from '@/types/dashboard';

const DashboardOverview = ({ data }: DashboardOverviewProps) => {
    const { user, profile, metrics, completionTips } = data;

    return (
        <div className="container max-w-7xl mx-auto py-12 px-4">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-slate-900">
                    Welcome back, {profile.firstName}!
                </h1>
                <p className="text-slate-600 mt-2">
                    Here&apos;s what&apos;s happening with your HyreYou profile
                </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Profile Strength
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold text-slate-900">
                                {metrics.completionScore}%
                            </span>
                        </div>
                        <Progress
                            value={metrics.completionScore}
                            className="mt-3"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Profile Views
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <Eye className="w-5 h-5 text-teal-600" />
                            <span className="text-3xl font-bold text-slate-900">
                                {metrics.profileViews}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">
                            Last 30 days
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Applications
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-2">
                            <Briefcase className="w-5 h-5 text-slate-blue" />
                            <span className="text-3xl font-bold text-slate-900">
                                {metrics.applicationCount}
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 mt-2">
                            Total submitted
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            Email Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            {metrics.emailVerified ? (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    <span className="text-lg font-semibold text-green-600">
                                        Verified
                                    </span>
                                </>
                            ) : (
                                <>
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                    <span className="text-lg font-semibold text-amber-600">
                                        Unverified
                                    </span>
                                </>
                            )}
                        </div>
                        {!metrics.emailVerified && (
                            <Button
                                variant="link"
                                className="p-0 h-auto mt-2 text-teal-600"
                            >
                                Verify Now
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Profile Completion */}
                    {completionTips.length > 0 && (
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle>
                                            Complete Your Profile
                                        </CardTitle>
                                        <CardDescription>
                                            Boost your visibility to recruiters
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">
                                        {completionTips.length} items left
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {completionTips.map((tip, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <AlertCircle className="w-5 h-5 text-amber-500" />
                                                <span className="text-slate-700">
                                                    {tip}
                                                </span>
                                            </div>
                                            <Button variant="ghost" size="sm">
                                                <ArrowRight className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Recent Applications */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Applications</CardTitle>
                                    <CardDescription>
                                        Your latest job applications
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/applications">View All</Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {profile.applications.length === 0 ? (
                                <div className="text-center py-12">
                                    <Briefcase className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                                    <p className="text-slate-600 mb-4">
                                        No applications yet
                                    </p>
                                    <Button asChild>
                                        <Link href="/jobs">Browse Jobs</Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {profile.applications.map(
                                        (application: any) => (
                                            <div
                                                key={application.id}
                                                className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                                            >
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-slate-900">
                                                        {application.job.title}
                                                    </h4>
                                                    <p className="text-sm text-slate-600">
                                                        {
                                                            application.job
                                                                .organization
                                                                .name
                                                        }
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Applied{' '}
                                                        {new Date(
                                                            application.appliedAt
                                                        ).toLocaleDateString(
                                                            'en-US',
                                                            {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            }
                                                        )}
                                                    </p>
                                                </div>
                                                <Badge
                                                    variant={
                                                        application.status ===
                                                        'SUBMITTED'
                                                            ? 'secondary'
                                                            : application.status ===
                                                                'REVIEWED'
                                                              ? 'default'
                                                              : 'secondary'
                                                    }
                                                >
                                                    {application.status}
                                                </Badge>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                className="w-full justify-start bg-transparent"
                                variant="outline"
                                asChild
                            >
                                <Link href="/profile/resume">
                                    <FileText className="w-4 h-4 mr-2" />
                                    View Resume
                                </Link>
                            </Button>
                            <Button
                                className="w-full justify-start bg-transparent"
                                variant="outline"
                                asChild
                            >
                                <Link href="/profile/edit">
                                    <Settings className="w-4 h-4 mr-2" />
                                    Edit Profile
                                </Link>
                            </Button>
                            <Button
                                className="w-full justify-start bg-transparent"
                                variant="outline"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download Resume
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Profile Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Profile Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-600">
                                        Experience
                                    </span>
                                    <span className="text-sm font-medium text-slate-900">
                                        {profile.workExperience.length}{' '}
                                        positions
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-600">
                                        Education
                                    </span>
                                    <span className="text-sm font-medium text-slate-900">
                                        {profile.education.length} degrees
                                    </span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-slate-600">
                                        Skills
                                    </span>
                                    <span className="text-sm font-medium text-slate-900">
                                        {profile.skills.length} skills
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-slate-600">
                                        Certifications
                                    </span>
                                    <span className="text-sm font-medium text-slate-900">
                                        {profile.certifications.length} certs
                                    </span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="flex items-center gap-2 text-sm">
                                    <div
                                        className={`w-2 h-2 rounded-full ${profile.searchable ? 'bg-green-500' : 'bg-slate-400'}`}
                                    />
                                    <span className="text-slate-600">
                                        {profile.searchable
                                            ? 'Visible to recruiters'
                                            : 'Hidden from search'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tips */}
                    <Card className="bg-linear-to-br from-teal-50 to-slate-blue/5 border-teal-200">
                        <CardHeader>
                            <CardTitle className="text-teal-900">
                                Pro Tip
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-teal-800">
                                Profiles with verified skills get 3x more views
                                from recruiters. Consider taking a skill
                                assessment to boost your visibility!
                            </p>
                            <Button
                                className="w-full mt-4 bg-transparent"
                                variant="outline"
                            >
                                Take Assessment
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
