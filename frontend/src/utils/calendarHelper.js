/**
 * Kalendarga qo'shish yordamchi utiliti:
 * 1. Google Calendar Web havolasi
 * 2. Apple Calendar, iPhone, Mac va Android uchun .ics fayl generatsiyasi
 */

export function getGoogleCalendarUrl({ title, details, location, dateStr, timeSlot }) {
  // Masalan: "18-Noyabr" va "15:30"
  const now = new Date();
  const year = now.getFullYear();

  // Parse time
  const [hours, minutes] = (timeSlot || "15:00").split(':').map(Number);
  
  // Format to YYYYMMDDTHHmmSSZ
  const startTime = new Date(year, now.getMonth(), now.getDate(), hours || 15, minutes || 0, 0);
  const endTime = new Date(startTime.getTime() + 45 * 60000); // 45 min duration

  const formatIso = (d) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title || 'BarberHub Sartaroshxona Navbati',
    details: details || 'BarberHub orqali yozilgan navbat',
    location: location || 'Toshkent',
    dates: `${formatIso(startTime)}/${formatIso(endTime)}`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function downloadIcsFile({ title, details, location, dateStr, timeSlot }) {
  const now = new Date();
  const year = now.getFullYear();
  const [hours, minutes] = (timeSlot || "15:00").split(':').map(Number);
  
  const startTime = new Date(year, now.getMonth(), now.getDate(), hours || 15, minutes || 0, 0);
  const endTime = new Date(startTime.getTime() + 45 * 60000);

  const formatIcsDate = (d) => {
    return d.toISOString().replace(/-|:|\.\d\d\d/g, "").slice(0, 15) + "Z";
  };

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BarberHub//Barber Appointment//UZ",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `SUMMARY:${title || "BarberHub Sartaroshxona"}`,
    `DESCRIPTION:${details || "BarberHub orqali yozilgan navbat"}`,
    `LOCATION:${location || "Toshkent"}`,
    `DTSTART:${formatIcsDate(startTime)}`,
    `DTEND:${formatIcsDate(endTime)}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT60M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Sartaroshxonaga 1 soat qoldi!",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `barberhub-appointment.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}