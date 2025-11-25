export type DeepDiveMode = 'eli5' | 'analogy' | 'mental-model';

export function getModeIcon(mode?: DeepDiveMode): string {
    switch (mode) {
        case 'eli5':
            return '🧒';
        case 'analogy':
            return '🔗';
        case 'mental-model':
            return '🧠';
        default:
            return '💡';
    }
}

export function getModeTitle(mode?: DeepDiveMode): string {
    switch (mode) {
        case 'eli5':
            return 'ELI5';
        case 'analogy':
            return 'Analogy';
        case 'mental-model':
            return 'Mental Model';
        default:
            return 'Deep Dive';
    }
}

export function getDeepDiveAccent(mode?: DeepDiveMode): string {
    switch (mode) {
        case 'eli5':
            return '#10b981'; // Green
        case 'analogy':
            return '#f59e0b'; // Amber
        case 'mental-model':
            return '#8b5cf6'; // Purple
        default:
            return '#6366f1'; // Indigo
    }
}
