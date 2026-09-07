import "react-native-url-polyfill/auto";

import {
    createClient,
    SupabaseClient,
} from "@supabase/supabase-js";


let supabaseClient: SupabaseClient | null = null;


export function getSupabase() {

    const supabaseUrl =
        process.env.EXPO_PUBLIC_SUPABASE_URL;

    const supabaseKey =
        process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;


    if (!supabaseUrl) {
        throw new Error(
            "EXPO_PUBLIC_SUPABASE_URL is missing."
        );
    }

    if (!supabaseKey) {
        throw new Error(
            "EXPO_PUBLIC_SUPABASE_ANON_KEY is missing."
        );
    }


    if (!supabaseClient) {

        supabaseClient = createClient(
            supabaseUrl,
            supabaseKey
        );

    }


    return supabaseClient;
}