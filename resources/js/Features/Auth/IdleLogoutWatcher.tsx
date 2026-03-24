import { useEffect, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { Timer, AlertTriangle } from 'lucide-react';

 function IdleLogoutWatcher() {
    // const TOTAL_IDLE_TIME = 10 * 60; // 10 minutos en segundos
    // const WARNING_TIME = 2 * 60;    // Mostrar aviso cuando falten 2 min
    
    const TOTAL_IDLE_TIME = 1 * 60; // 2 minutos en segundos
    const WARNING_TIME = 1 * 30;    // Mostrar aviso cuando falte 1 min
    
    const [timeLeft, setTimeLeft] = useState(TOTAL_IDLE_TIME);
    const [showWarning, setShowWarning] = useState(false);

    const handleLogout = useCallback(() => {
        router.post('/logout');
        // Redirigir a la página de login
        router.visit('/login');
    }, []);

    useEffect(() => {
        // 1. El temporizador principal que baja cada segundo
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleLogout();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // 2. Detectar si el tiempo restante es bajo para mostrar el aviso
        if (timeLeft <= WARNING_TIME) {
            setShowWarning(true);
        } else {
            setShowWarning(false);
        }

        // 3. Reiniciar el tiempo si el usuario se mueve
        const resetTimer = () => {
            setTimeLeft(TOTAL_IDLE_TIME);
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(e => window.addEventListener(e, resetTimer));

        return () => {
            clearInterval(timer);
            events.forEach(e => window.removeEventListener(e, resetTimer));
        };
    }, [timeLeft, handleLogout]);

    // Formatear segundos a MM:SS
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
                    <p>La sesión se cerrará en: <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span></p>
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