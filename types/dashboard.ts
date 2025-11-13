export interface DashboardOverviewProps {
    data: {
        user: any;
        profile: any;
        metrics: {
            completionScore: number;
            profileViews: number;
            applicationCount: number;
            hasResume: boolean;
            emailVerified: boolean;
        };
        completionTips: string[];
    };
}
