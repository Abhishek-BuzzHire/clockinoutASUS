"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface CustomDatePickerProps {
  value?: string; // "YYYY-MM-DD" or ""
  onChange?: (dateStr: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function CustomDatePicker({
  value = "",
  onChange,
  placeholder = "dd-mm-yyyy",
  className = "",
  disabled = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showYearMonthPicker, setShowYearMonthPicker] = useState(false);

  // Parse initial date or default to today
  const getInitialDate = () => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      return new Date(y, m - 1, d);
    }
    return new Date();
  };

  const [viewDate, setViewDate] = useState<Date>(getInitialDate);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 280 });

  useEffect(() => {
    if (isOpen) {
      setViewDate(getInitialDate());
      setShowYearMonthPicker(false);
      updateCoords();
    }
  }, [isOpen, value]);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const popoverWidth = 288; // w-72
      const popoverHeight = 350;

      let top = rect.bottom + 6;
      let left = rect.left;

      // Check vertical space
      if (rect.bottom + popoverHeight > window.innerHeight && rect.top > popoverHeight) {
        top = rect.top - popoverHeight - 6;
      }

      // Check horizontal space
      if (left + popoverWidth > window.innerWidth - 10) {
        left = Math.max(10, window.innerWidth - popoverWidth - 10);
      }

      setCoords({ top, left, width: rect.width });
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("resize", handleScrollOrResize, true);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      window.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("resize", handleScrollOrResize, true);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen]);

  // Format value to DD-MM-YYYY for display
  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return "";
    const [y, m, d] = dateStr.split("-");
    return `${d}-${m}-${y}`;
  };

  const handleDaySelect = (year: number, month: number, day: number) => {
    const formatted = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    if (onChange) onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChange) onChange("");
    setIsOpen(false);
  };

  const handleToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    const formatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (onChange) onChange(formatted);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1));
  };

  // Generate calendar grid
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: { day: number; currentMonth: boolean; year: number; month: number }[] = [];

  // Prev month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonth = month === 0 ? 11 : month - 1;
    days.push({ day: daysInPrevMonth - i, currentMonth: false, year: prevMonthYear, month: prevMonth });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, currentMonth: true, year, month });
  }

  // Next month padding
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    const nextMonthYear = month === 11 ? year + 1 : year;
    const nextMonth = month === 11 ? 0 : month + 1;
    days.push({ day: i, currentMonth: false, year: nextMonthYear, month: nextMonth });
  }

  const todayStr = (() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
  })();

  const yearsList = [];
  for (let y = year - 15; y <= year + 15; y++) {
    yearsList.push(y);
  }

  return (
    <>
      {/* Trigger Box */}
      <div
        ref={triggerRef}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between px-3 py-2 text-sm border rounded-xl bg-white transition-all duration-200 cursor-pointer shadow-sm select-none min-w-[140px]
          ${disabled ? "opacity-50 cursor-not-allowed bg-slate-50 border-slate-200" : "hover:border-blue-400"}
          ${isOpen ? "border-blue-600 ring-4 ring-blue-500/15 shadow-sm" : "border-slate-300"}
          ${className}`}
      >
        <span className={value ? "text-slate-800 font-semibold" : "text-slate-400 font-normal"}>
          {formatDisplayDate(value) || placeholder}
        </span>
        <CalendarIcon className={`w-4 h-4 transition-colors ${isOpen ? "text-blue-600" : "text-slate-400"}`} />
      </div>

      {/* Popover Portal */}
      {isOpen && typeof window !== "undefined" && createPortal(
        <div
          ref={popoverRef}
          style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
          className="fixed z-[9999] w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-4 animate-in fade-in zoom-in-95 duration-150 select-none text-slate-800"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setShowYearMonthPicker(!showYearMonthPicker)}
              className="flex items-center gap-1.5 font-bold text-base text-slate-800 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <span>{MONTH_NAMES[month]} {year}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showYearMonthPicker ? "rotate-180" : ""}`} />
            </button>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 transition hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/60 flex items-center justify-center text-slate-600 transition hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Year/Month Quick Selector view */}
          {showYearMonthPicker ? (
            <div className="py-2 space-y-3 max-h-[240px] overflow-y-auto pr-1">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Select Month</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {MONTH_NAMES.map((mName, idx) => (
                    <button
                      key={mName}
                      type="button"
                      onClick={() => {
                        setViewDate(new Date(year, idx, 1));
                        setShowYearMonthPicker(false);
                      }}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        idx === month ? "bg-blue-600 text-white shadow-sm" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {mName.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-1">Select Year</div>
                <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {yearsList.map(y => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setViewDate(new Date(y, month, 1));
                        setShowYearMonthPicker(false);
                      }}
                      className={`py-1 text-xs font-semibold rounded-lg transition-colors ${
                        y === year ? "bg-blue-600 text-white shadow-sm" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Weekdays */}
              <div className="grid grid-cols-7 gap-1 mb-1.5 text-center">
                {WEEK_DAYS.map((dayName, index) => (
                  <div key={dayName} className={`text-xs font-bold py-1 ${index === 0 || index === 6 ? "text-amber-500" : "text-slate-400"}`}>
                    {dayName}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((item, idx) => {
                  const dateStr = `${item.year}-${String(item.month + 1).padStart(2, "0")}-${String(item.day).padStart(2, "0")}`;
                  const isSelected = value === dateStr;
                  const isTodayDate = todayStr === dateStr;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDaySelect(item.year, item.month, item.day)}
                      className={`w-9 h-9 rounded-xl text-xs font-semibold flex items-center justify-center transition-all relative
                        ${!item.currentMonth ? "text-slate-300 font-normal" : "text-slate-700"}
                        ${isTodayDate && !isSelected ? "bg-blue-50 text-blue-600 border border-blue-200 font-bold" : ""}
                        ${isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-500/30 font-bold scale-105 z-10" : "hover:bg-slate-100"}`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3 px-1">
            <button
              type="button"
              onClick={handleClear}
              className="text-xs font-bold text-slate-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
