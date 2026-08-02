import { useEffect, useState, useCallback, useRef } from 'react';
import { router } from '@inertiajs/react';
import { AlertTriangle } from 'lucide-react';

function IdleLogoutWatcher() {
    const TOTAL_IDLE_TIME = 10 * 60; // 10 minutos
    const WARNING_TIME = 2 * 60; // aviso cuando falten 2 min

    const [timeLeft, setTimeLeft] = useState(TOTAL_IDLE_TIME);
    const [showWarning, setShowWarning] = useState(false);
    const loggingOutRef = useRef(false);

    const handleLogout = useCallback(() => {
        if (loggingOutRef.current) return;
        loggingOutRef.current = true;
        router.post('/logout');
    }, []);

    // Temporizador + listeners: NO depende de timeLeft (evita remount cada segundo)
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const resetTimer = () => {
            setTimeLeft(TOTAL_IDLE_TIME);
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'mousemove'];
        events.forEach((e) => window.addEventListener(e, resetTimer));

        return () => {
            clearInterval(timer);
            events.forEach((e) => window.removeEventListener(e, resetTimer));
        };
    }, [handleLogout]);

    useEffect(() => {
        setShowWarning(timeLeft <= WARNING_TIME && timeLeft > 0);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    if (!showWarning) return null;

    return (
        <div className="fixed bottom-4 right-4 z-[9999] animate-bounce">
            <div className="bg-amber-100 border-l-4 border-amber-500 p-4 shadow-lg rounded-r-lg flex items-center gap-3">
                <AlertTriangle className="text-amber-600 h-5 w-5" />
                <div className="text-sm text-amber-800">
                    <p className="font-bold">Inactividad detectada</p>
                    <p>
                        La sesión se cerrará en:{' '}
                        <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
                    </p>
                </div>
                <button
                    onClick={() => setTimeLeft(TOTAL_IDLE_TIME)}
                    className="ml-2 bg-amber-500 text-white px-2 py-1 rounded text-xs hover:bg-amber-600 transition"
                >
                    Seguir aquí
                </button>
            </div>
        </div>
    );
}

export default IdleLogoutWatcher;
