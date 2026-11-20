/**
 * Telegram WebApp Haptic Feedback & Vibrations Utility
 * Qurilma qo'lda mayin titrashi uchun (iPhone / Android)
 */

export const hapticFeedback = {
  /**
   * Oddiy tugmalar, kartalar bosilganda
   * @param {'light' | 'medium' | 'heavy' | 'rigid' | 'soft'} style
   */
  impact: (style = 'light') => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(style === 'heavy' ? 25 : style === 'medium' ? 15 : 8);
      }
    } catch (e) {
      // Ignore vibration errors
    }
  },

  /**
   * Sana, vaqt, filtr, tab yoki menyu tanlanganda
   */
  selection: () => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.selectionChanged();
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(6);
      }
    } catch (e) {}
  },

  /**
   * Muvaffaqiyatli buyurtma, ogohlantirish yoki xatolik
   * @param {'success' | 'warning' | 'error'} type
   */
  notification: (type = 'success') => {
    try {
      if (window.Telegram?.WebApp?.HapticFeedback) {
        window.Telegram.WebApp.HapticFeedback.notificationOccurred(type);
      } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
        if (type === 'error') {
          navigator.vibrate([25, 40, 25]);
        } else if (type === 'warning') {
          navigator.vibrate([15, 30]);
        } else {
          navigator.vibrate([10, 25]);
        }
      }
    } catch (e) {}
  }
};

export default hapticFeedback;
