// lib/utils.js
// NEW FILE - A helper function for Tailwind CSS class names, required by the new UI.

import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}
