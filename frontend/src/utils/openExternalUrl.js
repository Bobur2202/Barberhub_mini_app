/**
 * Xavfsiz tashqi havola va ilovalarni ochish yordamchisi.
 * Telegram WebApp ichida `window.location.href = ...` yoki maxsus scheme (`intent://`, `click://` va h.k.)
 * ishlatish qat'iyan taqiqlanadi, chunki bu Chromium WebView da `net::ERR_UNKNOWN_URL_SCHEME`
 * xatoligini keltirib chiqaradi.
 * 
 * Ushbu funksiya har qanday havolani xavfsiz Telegram WebApp `openLink` API orqali
 * tashqi tizimda ochadi.
 */
export function openExternalUrl(url) {
  if (!url) return;

  let safeUrl = String(url).trim();

  // Agar URL scheme bo'lmasa, https:// qo'shamiz
  if (!safeUrl.startsWith('http://') && !safeUrl.startsWith('https://')) {
    safeUrl = `https://${safeUrl}`;
  }

  // 1. Telegram WebApp rasmiy API si (eng xavfsiz va to'g'ri yo'l)
  try {
    if (window.Telegram?.WebApp?.openLink) {
      window.Telegram.WebApp.openLink(safeUrl, { try_instant_view: false });
      return;
    }
  } catch (err) {
    console.warn('[openExternalUrl] Telegram.WebApp.openLink xatosi:', err);
  }

  // 2. Standart brauzerda yangi oynada ochish (popup-safe)
  try {
    const win = window.open(safeUrl, '_blank', 'noopener,noreferrer');
    if (win) return;
  } catch (err) {
    console.warn('[openExternalUrl] window.open xatosi:', err);
  }

  // 3. Fallback: Hech qachon window.location.href emas! Yashirin <a> orqali ochish
  try {
    const link = document.createElement('a');
    link.href = safeUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    console.error('[openExternalUrl] Anchor click xatosi:', err);
  }
}
