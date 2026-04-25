/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    theme: {
        extend: {
            // keyframes: {
            //     fadeIn: {
            //         "0%": { opacity: 0 },
            //         "50%": { scale: 1.1 },
            //         "100%": { opacity: 1 },
            //     },
            // },
            fontSize: {
                sm: "16px",
                base: "18px",
            },
        },
    },
    plugins: [require("@tailwindcss/typography")],
};
