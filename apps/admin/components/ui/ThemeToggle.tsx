'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    // Avoid hydration mismatch
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="p-2 rounded-xl text-gray-500 hover:bg-white/5 transition-colors">
                <div className="w-5 h-5 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
            </button>
        );
    }

    return (
        <div className="flex items-center p-1 bg-background-tertiary rounded-xl border border-[hsl(var(--primary))/0.1]">
            <button
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg transition-all duration-200 ${theme === 'light'
                    ? 'bg-background-elevated text-brand-primary shadow-sm'
                    : 'text-gray-400 hover:text-[hsl(var(--foreground))] hover:bg-background-elevated/50'
                    }`}
                title="Light Mode"
            >
                <Sun size={18} />
            </button>
            <button
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-lg transition-all duration-200 ${theme === 'system'
                    ? 'bg-background-elevated text-brand-primary shadow-sm'
                    : 'text-gray-400 hover:text-[hsl(var(--foreground))] hover:bg-background-elevated/50'
                    }`}
                title="System Mode"
            >
                <Monitor size={18} />
            </button>
            <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg transition-all duration-200 ${theme === 'dark'
                    ? 'bg-background-elevated text-brand-primary shadow-sm'
                    : 'text-gray-400 hover:text-[hsl(var(--foreground))] hover:bg-background-elevated/50'
                    }`}
                title="Dark Mode"
            >
                <Moon size={18} />
            </button>
        </div>
    );
}
