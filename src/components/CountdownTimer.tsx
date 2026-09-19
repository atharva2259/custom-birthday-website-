import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calendar, Clock, MapPin, ExternalLink, CalendarPlus, Sparkles } from 'lucide-react';
import { BirthdayEventConfig, ThemeColors } from '../types';

interface CountdownTimerProps {
  config: BirthdayEventConfig;
  theme: ThemeColors;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ config, theme }) => {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const target = new Date(config.celebrationDate).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isPast: true,
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [config.celebrationDate]);

  // Format date for display
  const eventDateObj = new Date(config.celebrationDate);
  const formattedDate = eventDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedTime = eventDateObj.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Generate Google Calendar Link
  const getGoogleCalendarUrl = () => {
    const startTime = eventDateObj.toISOString().replace(/-|:|\.\d+/g, '');
    const endDateObj = new Date(eventDateObj.getTime() + 4 * 60 * 60 * 1000);
    const endTime = endDateObj.toISOString().replace(/-|:|\.\d+/g, '');
    const title = encodeURIComponent(`${config.personName}'s ${config.milestoneAge}th Birthday Celebration`);
    const details = encodeURIComponent(config.welcomeMessage || 'Join us to celebrate!');
    const location = encodeURIComponent(config.locationAddress);

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startTime}/${endTime}&details=${details}&location=${location}`;
  };

  // Generate .ICS file download for Apple Calendar / Outlook
  const downloadIcs = () => {
    const startTime = eventDateObj.toISOString().replace(/-|:|\.\d+/g, '');
    const endDateObj = new Date(eventDateObj.getTime() + 4 * 60 * 60 * 1000);
    const endTime = endDateObj.toISOString().replace(/-|:|\.\d+/g, '');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${config.personName}'s ${config.milestoneAge}th Birthday Celebration`,
      `DESCRIPTION:${config.welcomeMessage}`,
      `LOCATION:${config.locationAddress}`,
      `DTSTART:${startTime}`,
      `DTEND:${endTime}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${config.personName}-birthday-celebration.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const timeUnits = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <section id="countdown-section" className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div
        className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#E8E1DA] p-6 sm:p-10 md:p-12 shadow-sm text-center relative overflow-hidden"
        style={{ borderColor: theme.border }}
      >
        {/* Subtle background accent glow */}
        <div
          className="absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ backgroundColor: theme.accentLight }}
        />

        {/* Section Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs uppercase tracking-widest text-[#8C7B6B] bg-[#F3EFEA] border border-[#E8E1DA] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          The Gathering Countdown
        </div>

        <h2 className="text-3xl sm:text-4xl font-serif text-[#2D2A26] mb-2">
          Counting Down to the Celebration
        </h2>
        <p className="text-sm text-[#6E665E] max-w-md mx-auto mb-10">
          Gathering in honour of {config.personName} for an unforgettable evening of warmth, toasts, and heartfelt connections.
        </p>

        {/* Digital Clock Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
          {timeUnits.map((unit, i) => (
            <motion.div
              key={unit.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#FAF8F5] border border-[#E8E1DA] rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center shadow-2xs hover:border-[#D5C9BE] transition-colors"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium text-[#2D2A26] tabular-nums tracking-tight">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-xs uppercase tracking-wider text-[#8C7B6B] font-medium mt-1 font-sans">
                {unit.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Event Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t border-[#E8E1DA] text-left">
          {/* Date & Time */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF8F5]/80 border border-[#E8E1DA]/80">
            <div className="p-2.5 rounded-xl bg-white text-[#8C7B6B] shadow-2xs shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#8C7B6B] uppercase tracking-wider">Date & Time</div>
              <div className="text-sm font-serif font-medium text-[#2D2A26] mt-0.5">{formattedDate}</div>
              <div className="text-xs text-[#6E665E] flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                <span>{formattedTime}</span>
              </div>
            </div>
          </div>

          {/* Location & Venue */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF8F5]/80 border border-[#E8E1DA]/80">
            <div className="p-2.5 rounded-xl bg-white text-[#8C7B6B] shadow-2xs shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#8C7B6B] uppercase tracking-wider">Venue Location</div>
              <div className="text-sm font-serif font-medium text-[#2D2A26] mt-0.5">{config.locationName}</div>
              <p className="text-xs text-[#6E665E] mt-0.5 line-clamp-1">{config.locationAddress}</p>
              {config.locationMapUrl && (
                <a
                  href={config.locationMapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-[#8C7B6B] hover:text-[#2D2A26] inline-flex items-center gap-1 mt-1 underline decoration-[#D5C9BE]"
                >
                  <span>Open Maps</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>

          {/* Dress Code & Notes */}
          <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-[#FAF8F5]/80 border border-[#E8E1DA]/80">
            <div className="p-2.5 rounded-xl bg-white text-[#8C7B6B] shadow-2xs shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#8C7B6B] uppercase tracking-wider">Dress Code</div>
              <div className="text-sm font-serif font-medium text-[#2D2A26] mt-0.5">{config.dressCode}</div>
              <p className="text-xs text-[#6E665E] mt-0.5">
                Soft tones & comfort for a relaxed celebration.
              </p>
            </div>
          </div>
        </div>

        {/* Add to Calendar Action Row */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href={getGoogleCalendarUrl()}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium text-white shadow-xs hover:opacity-90 transition-opacity"
            style={{ backgroundColor: theme.accent }}
          >
            <CalendarPlus className="w-3.5 h-3.5" />
            <span>Add to Google Calendar</span>
          </a>
          <button
            onClick={downloadIcs}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium text-[#2D2A26] bg-white border border-[#D5C9BE] hover:bg-[#FAF8F5] transition-colors shadow-2xs"
          >
            <Calendar className="w-3.5 h-3.5 text-[#8C7B6B]" />
            <span>Download Apple / Outlook Invite (.ics)</span>
          </button>
        </div>
      </div>
    </section>
  );
};
