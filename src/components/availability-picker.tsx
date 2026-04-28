"use client";

import React, { useState, useMemo, useEffect } from "react";

interface OccupiedRange {
  checkInDate: Date;
  checkOutDate: Date;
}

interface AvailabilityPickerProps {
  occupiedRanges: OccupiedRange[];
  onRangeSelect: (range: { from: Date | null; to: Date | null }) => void;
  initialRange?: { from: Date; to: Date };
  serverDate: string;
}

export default function AvailabilityPicker({ occupiedRanges, onRangeSelect, serverDate }: AvailabilityPickerProps) {
  const [mounted, setMounted] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(serverDate);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  }); 
  const [selectedRange, setSelectedRange] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null });

  useEffect(() => {
    setMounted(true);
  }, []);

  const daysInMonth = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    // Padding for first week
    const firstDayOfWeek = firstDay.getUTCDay();
    const prevLastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push({ date: new Date(Date.UTC(year, month - 1, prevLastDay - i)), currentMonth: false });
    }

    // Days in current month
    for (let i = 1; i <= lastDay.getUTCDate(); i++) {
      days.push({ date: new Date(Date.UTC(year, month, i)), currentMonth: true });
    }

    return days;
  }, [currentMonth]);

  const isOccupied = (date: Date) => {
    return occupiedRanges.some(range => {
      const start = new Date(range.checkInDate);
      const end = new Date(range.checkOutDate);
      start.setUTCHours(0, 0, 0, 0);
      end.setUTCHours(0, 0, 0, 0);
      const curr = new Date(date);
      curr.setUTCHours(0, 0, 0, 0);
      return curr >= start && curr < end;
    });
  };

  const isSelected = (date: Date) => {
    if (!selectedRange.from) return false;
    const curr = new Date(date);
    curr.setUTCHours(0, 0, 0, 0);
    const from = new Date(selectedRange.from);
    from.setUTCHours(0, 0, 0, 0);

    if (selectedRange.to) {
      const to = new Date(selectedRange.to);
      to.setUTCHours(0, 0, 0, 0);
      return curr >= from && curr <= to;
    }

    return curr.getTime() === from.getTime();
  };

  const handleDateClick = (date: Date) => {
    const isSelectingTo = selectedRange.from && !selectedRange.to;
    
    // If picking "from", it cannot be an occupied day.
    // If picking "to", it CAN be an occupied day (check-in of next booking) 
    // because check-out happens before the next check-in.
    if (isOccupied(date) && !isSelectingTo) return;

    let newRange = { ...selectedRange };

    if (!newRange.from || (newRange.from && newRange.to)) {
      newRange = { from: date, to: null };
    } else {
      if (date < newRange.from) {
        newRange = { from: date, to: null };
      } else {
        // Check if range contains an occupied date
        let tempDate = new Date(newRange.from);
        let hasOccupied = false;
        while (tempDate < date) {
          if (isOccupied(tempDate)) {
            hasOccupied = true;
            break;
          }
          tempDate.setDate(tempDate.getDate() + 1);
        }

        if (hasOccupied) {
          newRange = { from: date, to: null };
        } else {
          newRange = { from: newRange.from, to: date };
        }
      }
    }

    setSelectedRange(newRange);
    onRangeSelect(newRange);
  };

  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));


  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm select-none">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="font-semibold text-gray-900 capitalize">
          {(() => {
            const months = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
            return `${months[currentMonth.getUTCMonth()]} ${currentMonth.getUTCFullYear()}`;
          })()}
        </h3>
        <div className="flex gap-1">
          <button onClick={prevMonth} type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">&larr;</button>
          <button onClick={nextMonth} type="button" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400">&rarr;</button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"].map(d => (
          <span key={d} className="text-[10px] uppercase font-bold text-gray-400 p-1">{d}</span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysInMonth.map((day, i) => {
          const occupied = isOccupied(day.date);
          const selected = isSelected(day.date);
          const todayDate = new Date(serverDate);
          const isToday = todayDate.getUTCFullYear() === day.date.getUTCFullYear() && 
                          todayDate.getUTCMonth() === day.date.getUTCMonth() && 
                          todayDate.getUTCDate() === day.date.getUTCDate();

          return (
            <div
              key={i}
              onClick={() => handleDateClick(day.date)}
              className={`
                aspect-square flex items-center justify-center text-xs font-medium rounded-xl cursor-pointer transition-all relative
                ${!day.currentMonth ? "text-gray-200" : "text-gray-700"}
                ${occupied ? "bg-red-50 text-red-300 cursor-not-allowed border border-red-100" : "hover:bg-gray-50"}
                ${selected ? "bg-black text-white hover:bg-black" : ""}
                ${isToday && !selected ? "border-b-2 border-black" : ""}
              `}
            >
              {day.date.getUTCDate()}
              {occupied && <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none text-red-500">✕</div>}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 border-t border-gray-50 pt-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-200"></div>
          Occupato
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-black"></div>
          Selezione
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full border border-gray-200"></div>
          Libero
        </div>
      </div>
    </div>
  );
}
