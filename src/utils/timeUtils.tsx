export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  const secs = Math.floor((minutes * 60) % 60);
  
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export const formatMinutesToHHMM = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

export const formatHoursWorked = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};
