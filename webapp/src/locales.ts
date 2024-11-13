import enDateLocale from 'date-fns/locale/en-US';
import zhDateLocale from 'date-fns/locale/zh-CN';
import zhTwDateLocale from 'date-fns/locale/zh-TW';

export const locales = {
  zh: {
    name: 'Chinese',
    flag: '🇨🇳',
    dateFnsLocale: zhDateLocale,
  },
  en: {
    name: 'English',
    flag: '🇬🇧',
    dateFnsLocale: enDateLocale,
  },
  zhTw: {
    name: 'Traditional Chinese',
    flag: '🇨🇳',
    dateFnsLocale: zhTwDateLocale,
  },
};
