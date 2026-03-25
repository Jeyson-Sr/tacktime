import { createPortal } from 'react-dom';

interface AlertProps {
    variant?: 'error' | 'warning' | 'info';
    title: string;
    message?: string;
}

const icons = {
    error: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1" />
            <line x1="8" y1="4.5" x2="8" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11" r="0.75" fill="currentColor" />
        </svg>
    ),
    warning: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 1.5L14.5 13H1.5L8 1.5Z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
            <line x1="8" y1="6.5" x2="8" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
        </svg>
    ),
    info: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1" />
            <circle cx="8" cy="5" r="0.75" fill="currentColor" />
            <line x1="8" y1="7" x2="8" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
};

const styles = {
    error: {
        wrapper: 'bg-red-50 border-red-300 border-l-red-500 text-red-700',
        title: 'text-red-700',
        message: 'text-red-600',
    },
    warning: {
        wrapper: 'bg-amber-50 border-amber-300 border-l-amber-500 text-amber-700',
        title: 'text-amber-700',
        message: 'text-amber-600',
    },
    info: {
        wrapper: 'bg-blue-50 border-blue-300 border-l-blue-500 text-blue-700',
        title: 'text-blue-700',
        message: 'text-blue-600',
    },
};

export default function Alert({ variant = 'error', title, message }: AlertProps) {
    const s = styles[variant];

    return createPortal(
        <div
            role="alert"
            className={`fixed top-5 right-5 w-[300px] flex items-start gap-3 rounded-md border border-l-[3px] px-4 py-3 ${s.wrapper}`}
        >
            <span className={`mt-0.5 shrink-0 ${s.title}`}>
                {icons[variant]}
            </span>
            <div>
                <p className={`text-sm font-medium ${s.title}`}>{title}</p>
                {message?.trim() && (
                    <p className={`mt-0.5 text-sm opacity-90 ${s.message}`}>{message}</p>
                )}
            </div>
        </div>,
        document.body
    );
}