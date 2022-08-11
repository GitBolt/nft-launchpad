import React from 'react';
import Countdown from 'react-countdown';

interface MintCountdownProps {
  date: Date | undefined;
  onComplete?: () => void;
  label: string
}

interface MintCountdownRender {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}

export const MintCountdown: React.FC<MintCountdownProps> = function MintCountdown({
  date,
  onComplete,
  label,
}) {
  const renderCountdown = ({
    days,
    hours,
    minutes,
    seconds,
  }: MintCountdownRender) => (
    <div
      className="h-[10rem] flex items-center justify-center relative overflow-hidden rounded-2xl font-bold w-full duration-200"
    >
      <div
        className="w-full h-full absolute z-5 rounded-2xl"
        style={{
          background: 'url(/images/nftbg.png)',
          filter: 'blur(4px) brightness(60%)',
          margin: '-2%',
        }}
      />
      <div className="flex flex-col gap-2 items-center">
        <p className="text-white z-20">{label}</p>
        <div className="flex gap-5 text-6xl font-bold text-white">
          <span className="z-20">
            {days < 10 ? `0${days}` : days}
          </span>
          <span className="white z-20">:</span>
          <span className="z-20">
            {hours < 10 ? `0${hours}` : hours}
          </span>
          <span className="z-20">:</span>
          <span className="z-20">
            {minutes < 10 ? `0${minutes}` : minutes}
          </span>
          <span className="z-20">:</span>
          <span className="z-20">
            {seconds < 10 ? `0${seconds}` : seconds}
          </span>
        </div>
        <div className="flex gap-20 text-label text-white z-20">
          <p className="text-white">Days</p>
          <p className="text-white">Hours</p>
          <p className="text-white">Mins</p>
          <p className="text-white">Seconds</p>
        </div>
      </div>
    </div>
  );

  if (date) {
    return (
      <Countdown
        date={date}
        onComplete={onComplete}
        renderer={renderCountdown}
      />
    );
  }
  return null;
};
