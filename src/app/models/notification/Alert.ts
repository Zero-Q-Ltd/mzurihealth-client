export interface Alert {
    duration?: number;
    title: string;
    body: string;
    icon?: string;
    placement: {
        horizontal: 'start' | 'center' | 'end' | 'left' | 'right',
        vertical: 'bottom' | 'top'
    };
    alertType?: 'success' | 'error' | 'warning' | 'info' | 'question';
}
