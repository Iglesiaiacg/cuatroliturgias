import { useEffect, useRef, useState } from 'react';

export default function Clock() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const h = time.getHours();
    const m = time.getMinutes();
    const s = time.getSeconds();

    const hDeg = (h % 12) * 30 + (m / 60) * 30;
    const mDeg = m * 6 + (s / 60) * 6;
    const sDeg = s * 6;

    return (
        <div id="live-clock" className="mt-2 flex items-center gap-2">
            <div className="analog-clock relative bg-white border-2 border-gray-200 rounded-full shadow-inner" style={{ width: '40px', height: '40px' }}>
                <div className="hand hour absolute bg-gray-800 rounded-full origin-bottom"
                    style={{ width: '2px', height: '30%', left: 'calc(50% - 1px)', bottom: '50%', transform: `rotate(${hDeg}deg)` }}></div>
                <div className="hand minute absolute bg-gray-600 rounded-full origin-bottom"
                    style={{ width: '2px', height: '45%', left: 'calc(50% - 1px)', bottom: '50%', transform: `rotate(${mDeg}deg)` }}></div>
                <div className="hand second absolute bg-red-500 rounded-full origin-bottom"
                    style={{ width: '1px', height: '40%', left: 'calc(50% - 0.5px)', bottom: '50%', transform: `rotate(${sDeg}deg)` }}></div>
                <div className="center-dot absolute bg-teal-500 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{ width: '4px', height: '4px' }}></div>
            </div>
            <span className="text-xs font-mono text-gray-400 font-bold ml-2">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
    );
}
