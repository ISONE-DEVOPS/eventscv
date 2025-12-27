'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import type { Event } from '@eventscv/shared-types';

interface AddToCalendarProps {
  event: Event;
  className?: string;
}

export function AddToCalendar({ event, className = '' }: AddToCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date): string => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const generateICS = (): void => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Events.cv//Event Calendar//EN
BEGIN:VEVENT
DTSTART:${formatDate(event.startDate)}
DTEND:${formatDate(event.endDate)}
SUMMARY:${event.title}
LOCATION:${event.venue}${event.address ? ', ' + event.address : ''}
DESCRIPTION:${event.description?.replace(/\n/g, '\\n') || ''}
URL:https://events.cv/events/${event.slug}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.slug}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setIsOpen(false);
  };

  const formatGoogleDate = (date: Date): string => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const addToGoogle = (): void => {
    const googleUrl = new URL('https://calendar.google.com/calendar/render');
    googleUrl.searchParams.append('action', 'TEMPLATE');
    googleUrl.searchParams.append('text', event.title);
    googleUrl.searchParams.append(
      'dates',
      `${formatGoogleDate(event.startDate)}/${formatGoogleDate(event.endDate)}`
    );
    googleUrl.searchParams.append(
      'details',
      event.description || 'Ver mais em: https://events.cv/events/' + event.slug
    );
    googleUrl.searchParams.append('location', `${event.venue}${event.address ? ', ' + event.address : ''}`);
    googleUrl.searchParams.append('ctz', 'Atlantic/Cape_Verde');

    window.open(googleUrl.toString(), '_blank');
    setIsOpen(false);
  };

  const addToOutlook = (): void => {
    const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
    outlookUrl.searchParams.append('subject', event.title);
    outlookUrl.searchParams.append('startdt', event.startDate.toString());
    outlookUrl.searchParams.append('enddt', event.endDate.toString());
    outlookUrl.searchParams.append('body', event.description || '');
    outlookUrl.searchParams.append('location', event.venue);
    outlookUrl.searchParams.append('path', '/calendar/action/compose');
    outlookUrl.searchParams.append('rru', 'addevent');

    window.open(outlookUrl.toString(), '_blank');
    setIsOpen(false);
  };

  const addToYahoo = (): void => {
    const yahooUrl = new URL('https://calendar.yahoo.com/');
    yahooUrl.searchParams.append('v', '60');
    yahooUrl.searchParams.append('title', event.title);
    yahooUrl.searchParams.append('st', formatGoogleDate(event.startDate));
    yahooUrl.searchParams.append('et', formatGoogleDate(event.endDate));
    yahooUrl.searchParams.append('desc', event.description || '');
    yahooUrl.searchParams.append('in_loc', event.venue);

    window.open(yahooUrl.toString(), '_blank');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
      >
        <Calendar className="h-4 w-4" />
        Adicionar ao Calendário
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <button
                onClick={addToGoogle}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google Calendar
              </button>

              <button
                onClick={generateICS}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4V1h2v2h6V1h2v2zm-2 2H9v2H7V5H4v4h16V5h-3v2h-2V5zm5 6H4v8h16v-8z"/>
                </svg>
                Apple Calendar
              </button>

              <button
                onClick={addToOutlook}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#0078D4"
                    d="M23 4.01v15.98a2 2 0 0 1-2 2H11.5v-4.68h2.67l.4-3.1h-3.07V12.5c0-.9.25-1.51 1.54-1.51h1.64V8.24c-.28-.04-1.26-.12-2.4-.12-2.37 0-4 1.45-4 4.1v2.29H5.62v3.1h2.66V22H3a2 2 0 0 1-2-2V4.01A2 2 0 0 1 3 2.03h18a2 2 0 0 1 2 1.98z"
                  />
                </svg>
                Outlook
              </button>

              <button
                onClick={addToYahoo}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#6001D2"
                    d="M13.969 11.512L17.375 4h-2.812l-2.563 5.625L9.688 4H6.875l3.406 7.512L6.375 20h2.812l2.813-6.188L14.813 20h2.812l-3.656-8.488z"
                  />
                </svg>
                Yahoo Calendar
              </button>

              <button
                onClick={generateICS}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download .ics
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
