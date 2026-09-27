import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";

import * as SecureStore from "expo-secure-store";

import { getSupabase } from "@/lib/supabase";


export interface AuthSession {
    accessToken: string;
    refreshToken: string;
    userId: string;
    email: string;
}


interface AuthContextType {
    session: AuthSession | null;
    isLoading: boolean;

    saveSession: (session: AuthSession) => Promise<void>;
    signOut: () => Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


const ACCESS_TOKEN_KEY = "fittrack_access_token";
const REFRESH_TOKEN_KEY = "fittrack_refresh_token";
const USER_ID_KEY = "fittrack_user_id";
const EMAIL_KEY = "fittrack_email";


async function persistSession(currentSession: AuthSession) {
    await Promise.all([
        SecureStore.setItemAsync(ACCESS_TOKEN_KEY, currentSession.accessToken),
        SecureStore.setItemAsync(REFRESH_TOKEN_KEY, currentSession.refreshToken),
        SecureStore.setItemAsync(USER_ID_KEY, currentSession.userId),
        SecureStore.setItemAsync(EMAIL_KEY, currentSession.email),
    ]);
}


async function clearStoredSession() {
    await Promise.all([
        SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.deleteItemAsync(USER_ID_KEY),
        SecureStore.deleteItemAsync(EMAIL_KEY),
    ]);
}


export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const sessionRef = useRef<AuthSession | null>(null);


    useEffect(() => {
        let isMounted = true;

        const initializeAuth = async () => {
            await restoreSession();

            if (!isMounted) return;

            const supabase = getSupabase();
            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange((event, authSession) => {
                if (!isMounted) return;

                if (event === "SIGNED_OUT" || !authSession) {
                    sessionRef.current = null;
                    setSession(null);
                    clearStoredSession();
                    return;
                }

                if (event !== "TOKEN_REFRESHED") return;

                const currentSession = sessionRef.current;
                if (!currentSession) return;

                const updatedSession: AuthSession = {
                    accessToken: authSession.access_token,
                    refreshToken: authSession.refresh_token,
                    userId: authSession.user?.id ?? currentSession.userId,
                    email: authSession.user?.email ?? currentSession.email,
                };

                sessionRef.current = updatedSession;
                setSession(updatedSession);
                persistSession(updatedSession).catch((error) => {
                    console.error("Failed to persist refreshed session:", error);
                });
            });

            return subscription;
        };

        let subscription: { unsubscribe: () => void } | undefined;
        initializeAuth().then((authSubscription) => {
            subscription = authSubscription;
        });

        return () => {
            isMounted = false;
            subscription?.unsubscribe();
        };
    }, [restoreSession]);


    async function restoreSession() {
        try {
            const [
                accessToken,
                refreshToken,
                userId,
                email,
            ] = await Promise.all([
                SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
                SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
                SecureStore.getItemAsync(USER_ID_KEY),
                SecureStore.getItemAsync(EMAIL_KEY),
            ]);

            if (
                accessToken &&
                refreshToken &&
                userId &&
                email
            ) {
                const supabase = getSupabase();
                const { data: authData, error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                })

                if (error) {
                    console.error("Failed to set Supabase session:", error);
                    setSession(null);
                    return;
                }

                const restoredSession: AuthSession = {
                    accessToken: authData.session?.access_token ?? accessToken,
                    refreshToken: authData.session?.refresh_token ?? refreshToken,
                    userId,
                    email,
                };

                sessionRef.current = restoredSession;
                setSession(restoredSession);
                await persistSession(restoredSession);
            } else {
                sessionRef.current = null;
                setSession(null);
            }

        } catch (error) {
            console.error("Failed to restore auth session:", error);
            sessionRef.current = null;
            setSession(null);

        } finally {
            setIsLoading(false);
        }
    }


    async function saveSession(newSession: AuthSession) {
        await persistSession(newSession);

        const supabase = getSupabase();

        const { error } = await supabase.auth.setSession({
            access_token: newSession.accessToken,
            refresh_token: newSession.refreshToken
        });

        if (error) {
            console.error("Failed to set Supabase session:", error);
        }


        sessionRef.current = newSession;
        setSession(newSession);
    }


    async function signOut() {
        try {
            const supabase = getSupabase();
            await Promise.all([
                clearStoredSession(),
                supabase.auth.signOut(),
            ]);
        } finally {
            sessionRef.current = null;
            setSession(null);
        }
    }


    return (
        <AuthContext.Provider
            value={{
                session,
                isLoading,
                saveSession,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider"
        );
    }

    return context;
}