import { auth } from '@/lib/auth';

export type Session = typeof auth.$Infer.Session;

type RawSessionType = Awaited<ReturnType<typeof auth.api.getSession>>;

type ExcludeHeaders<T> = T extends { headers: any } ? never : T;

export type SessionType = ExcludeHeaders<RawSessionType>;

export type User = NonNullable<SessionType>['user'];

export type SessionProps = {
    userSession: SessionType | null;
};
