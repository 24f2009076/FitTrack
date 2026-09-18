const API_URL = "http://192.168.29.169:8000";

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user_id: string;
    email: string;
}

export async function login(
    credentials: LoginRequest
): Promise<AuthResponse> {

    const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        }
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.detail || "Login failed"
        );
    }

    return data;
}

export interface SignupRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    refresh_token: string;
    user_id: string;
    email: string;
}


export async function signup(
    credentials: SignupRequest
): Promise<AuthResponse> {

    const response = await fetch(
        `${API_URL}/api/auth/signup`,
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(credentials),
        }
    );


    const data = await response.json();


    if (!response.ok) {
        throw new Error(
            data.detail || "Failed to create account"
        );
    }


    return data;
}