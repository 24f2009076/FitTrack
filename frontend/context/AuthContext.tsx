import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

import * as SecureStore from "expo-secure-store";


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


export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        restoreSession();
    }, []);


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
                setSession({
                    accessToken,
                    refreshToken,
                    userId,
                    email,
                });
            } else {
                setSession(null);
            }

        } catch (error) {
            console.error("Failed to restore auth session:", error);
            setSession(null);

        } finally {
            setIsLoading(false);
        }
    }


    async function saveSession(newSession: AuthSession) {
        await Promise.all([
            SecureStore.setItemAsync(
                ACCESS_TOKEN_KEY,
                newSession.accessToken
            ),

            SecureStore.setItemAsync(
                REFRESH_TOKEN_KEY,
                newSession.refreshToken
            ),

            SecureStore.setItemAsync(
                USER_ID_KEY,
                newSession.userId
            ),

            SecureStore.setItemAsync(
                EMAIL_KEY,
                newSession.email
            ),
        ]);

        setSession(newSession);
    }


    async function signOut() {
        try {
            await Promise.all([
                SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
                SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
                SecureStore.deleteItemAsync(USER_ID_KEY),
                SecureStore.deleteItemAsync(EMAIL_KEY),
            ]);
        } finally {
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