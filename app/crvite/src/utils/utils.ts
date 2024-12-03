import { createHash } from "crypto";

export const generate_message_id = (prefix: string): string => {
    // Get current timestamp in milliseconds
    const timestamp = Date.now();

    // Generate a random component (6 characters)
    const random = Math.random().toString(36).substring(2, 8);

    // Combine timestamp and random string with a separator
    const id = `${prefix}_${timestamp}_${random}`;
    return id;
}