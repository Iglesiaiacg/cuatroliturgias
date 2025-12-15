import { useState, useEffect } from 'react';

const Clock = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const seconds = time.getSeconds();
    const minutes = time.getMinutes();
    const hours = time.getHours();

    const secDeg = seconds * 6;
    const minDeg = minutes * 6 + seconds * 0.1;
    const hourDeg = hours * 30 + minutes * 0.5;

    return (
        // Wrapper to protect header layout from strict specific pixel widths in CSS
        <div className="relative w-[100px] h-[100px] flex items-center justify-center overflow-hidden">
            <div className="clock-container">
                <div className="clock-face">
                    {/* Markers */}
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className={`marker marker-${i + 1}`}>
                            <div className="marker-dot"></div>
                        </div>
                    ))}

                    {/* Numbers */}
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className={`number number-${i + 1}`}>
                            <span className={`number-${i + 1}-text`}>{i + 1}</span>
                        </div>
                    ))}

                    {/* Hands - Dynamic rotation applied inline to override static CSS animations */}
                    <div
                        className="hand hour-hand"
                        style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
                    ></div>
                    <div
                        className="hand minute-hand"
                        style={{ transform: `translateX(-50%) rotate(${minDeg}deg)` }}
                    ></div>
                    <div
                        className="hand second-hand"
                        style={{ transform: `translateX(-50%) rotate(${secDeg}deg)` }}
                    ></div>

                    <div className="center-pin"></div>
                </div>
            </div>
        </div>
    );
};

export default Clock;
