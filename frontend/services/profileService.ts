const API_URL = "http://192.168.29.169:8000";

import { getSupabase } from "@/lib/supabase";

export interface ProfileUpdate {
    username?: string | null;
    profile_pic_url?: string | null;

    level?: "Beginner" | "Intermediate" | "Advanced" | null;

    goal?:
    | "Build Muscle"
    | "Lose Weight"
    | "Improve Strength"
    | "General Fitness"
    | null;

    height_cm?: number | null;
    weight_kg?: number | null;
}

export interface ProfileResponse {
    id: string;

    username: string | null;
    profile_pic_url: string | null;

    level: string | null;
    goal: string | null;

    height_cm: number | null;
    weight_kg: number | null;
}


export async function updateProfile(
    data: ProfileUpdate,
    accessToken: string
): Promise<ProfileResponse> {

    const response = await fetch(
        `${API_URL}/api/auth/profile`,
        {
            method: "PATCH",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },

            body: JSON.stringify(data),
        }
    );

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.detail || "Failed to update profile"
        );
    }

    return result;
}

// export async function updateProfilePicture(
//     imageUri: string,
//     accessToken: string
// ) {
//     const formData = new FormData();

//     formData.append("file",
//         {
//             uri: imageUri,
//             name: `profile.jpg`,
//             type: "image/jpeg",
//         } as any
//     );

//     const response = await fetch(
//         `${process.env.EXPO_PUBLIC_API_URL}/api/auth/profile_pic`,
//         {
//             method: "POST",
//             headers: {
//                 Authorization: `Bearer ${accessToken}`,
//             },
//             body: formData,
//         }
//     );

//     const responseText = await response.text();
//     console.log("STATUS:", response.status);
//     console.log("PROFILE PIC RESPONSE:", responseText);


//     if (!response.ok) {
//         const error = await response.json();

//         throw new Error(
//             "Failed to update profile picture" + responseText
//         );
//     }

//     return response.json();

// }

export async function uploadProfileImage(
    imageUri: string,
    userId: string
) {
    const supabase = getSupabase();

    const arrayBuffer = await fetch(imageUri)
        .then((response) => response.arrayBuffer());

    const filePath =
        `${userId}/${Date.now()}.jpg`;

    const { error } = await supabase.storage
        .from("profile_pics")
        .upload(
            filePath,
            arrayBuffer,
            {
                contentType: "image/jpeg",
                upsert: false,
            }
        );

    if (error) {
        throw new Error(
            `Failed to upload profile picture: ${error.message}`
        );
    }

    const {
        data: { publicUrl },
    } = supabase.storage
        .from("profile_pics")
        .getPublicUrl(filePath);

    return {
        path: filePath,
        publicUrl,
    };
}