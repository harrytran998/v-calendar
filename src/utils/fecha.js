/* eslint-disable no-bitwise, no-mixed-operators, no-useless-escape, no-multi-assign */
/* DATE FORMATTING & PARSING USING A SLIGHTLY MODIFIED VERSION OF FECHA (https://github.com/taylorhakes/fecha) */
/* ADDS A NARROW WEEKDAY FORMAT 'dd' */
import { isString } from './_';
import { pad, arrayHasItems } from './helpers';

const token = /d{1,2}|W{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|X{1,3}|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
const twoDigits = /\d\d?/;
const threeDigits = /\d{3}/;
const fourDigits = /\d{4}/;
const word = /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
const literal = /\[([^]*?)\]/gm;
const noop = () => {};

function monthUpdate(arrName) {
  return (d, v, i18n) => {
    const index = i18n[arrName].indexOf(
      v.charAt(0).toUpperCase() + v.substr(1).toLowerCase(),
    );
    if (~index) {
      d.month = index;
    }
  };
}

const formatFlags = {
  D(dateObj) {
    return dateObj.day;
  },
  DD(dateObj) {
    return pad(dateObj.day);
  },
  Do(dateObj, i18n) {
    return i18n.DoFn(dateObj.day);
  },
  d(dateObj) {
    return dateObj.weekday - 1;
  },
  dd(dateObj) {
    return pad(dateObj.weekday - 1);
  },
  W(dateObj, i18n) {
    return i18n.dayNamesNarrow[dateObj.weekday - 1];
  },
  WW(dateObj, i18n) {
    return i18n.dayNamesShorter[dateObj.weekday - 1];
  },
  WWW(dateObj, i18n) {
    return i18n.dayNamesShort[dateObj.weekday - 1];
  },
  WWWW(dateObj, i18n) {
    return i18n.dayNames[dateObj.weekday - 1];
  },
  M(dateObj) {
    return dateObj.month;
  },
  MM(dateObj) {
    return pad(dateObj.month);
  },
  MMM(dateObj, i18n) {
    return i18n.monthNamesShort[dateObj.month - 1];
  },
  MMMM(dateObj, i18n) {
    return i18n.monthNames[dateObj.month - 1];
  },
  YY(dateObj) {
    return String(dateObj.year).substr(2);
  },
  YYYY(dateObj) {
    return pad(dateObj.year, 4);
  },
  h(dateObj) {
    return dateObj.hours % 12 || 12;
  },
  hh(dateObj) {
    return pad(dateObj.hours % 12 || 12);
  },
  H(dateObj) {
    return dateObj.hours;
  },
  HH(dateObj) {
    return pad(dateObj.hours);
  },
  m(dateObj) {
    return dateObj.minutes;
  },
  mm(dateObj) {
    return pad(dateObj.minutes);
  },
  s(dateObj) {
    return dateObj.seconds;
  },
  ss(dateObj) {
    return pad(dateObj.seconds);
  },
  S(dateObj) {
    return Math.round(dateObj.milliseconds / 100);
  },
  SS(dateObj) {
    return pad(Math.round(dateObj.milliseconds / 10), 2);
  },
  SSS(dateObj) {
    return pad(dateObj.milliseconds, 3);
  },
  a(dateObj, i18n) {
    return dateObj.hours < 12 ? i18n.amPm[0] : i18n.amPm[1];
  },
  A(dateObj, i18n) {
    return dateObj.hours < 12
      ? i18n.amPm[0].toUpperCase()
      : i18n.amPm[1].toUpperCase();
  },
  X(dateObj) {
    const o = dateObj.timezoneOffset;
    return `${o > 0 ? '-' : '+'}${pad(Math.floor(Math.abs(o) / 60), 2)}`;
  },
  XX(dateObj) {
    const o = dateObj.timezoneOffset;
    return `${o > 0 ? '-' : '+'}${pad(
      Math.floor(Math.abs(o) / 60) * 100 + (Math.abs(o) % 60),
      4,
    )}`;
  },
  XXX(dateObj) {
    const o = dateObj.timezoneOffset;
    return `${o > 0 ? '-' : '+'}${pad(Math.floor(Math.abs(o) / 60), 2)}:${pad(
      Math.abs(o) % 60,
      2,
    )}`;
  },
};

const parseFlags = {
  D: [
    twoDigits,
    (d, v) => {
      d.day = v;
    },
  ],
  Do: [
    new RegExp(twoDigits.source + word.source),
    (d, v) => {
      d.day = parseInt(v, 10);
    },
  ],
  d: [twoDigits, noop],
  W: [word, noop],
  M: [
    twoDigits,
    (d, v) => {
      d.month = v - 1;
    },
  ],
  MMM: [word, monthUpdate('monthNamesShort')],
  MMMM: [word, monthUpdate('monthNames')],
  YY: [
    twoDigits,
    (d, v) => {
      const da = new Date();
      const cent = +da
        .getFullYear()
        .toString()
        .substr(0, 2);
      d.year = `${v > 68 ? cent - 1 : cent}${v}`;
    },
  ],
  YYYY: [
    fourDigits,
    (d, v) => {
      d.year = v;
    },
  ],
  S: [
    /\d/,
    (d, v) => {
      d.millisecond = v * 100;
    },
  ],
  SS: [
    /\d{2}/,
    (d, v) => {
      d.millisecond = v * 10;
    },
  ],
  SSS: [
    threeDigits,
    (d, v) => {
      d.millisecond = v;
    },
  ],
  h: [
    twoDigits,
    (d, v) => {
      d.hour = v;
    },
  ],
  m: [
    twoDigits,
    (d, v) => {
      d.minute = v;
    },
  ],
  s: [
    twoDigits,
    (d, v) => {
      d.second = v;
    },
  ],
  a: [
    word,
    (d, v, i18n) => {
      const val = v.toLowerCase();
      if (val === i18n.amPm[0]) {
        d.isPm = false;
      } else if (val === i18n.amPm[1]) {
        d.isPm = true;
      }
    },
  ],
  X: [
    /[^\s]*?[\+\-]\d\d:?\d\d|[^\s]*?Z?/,
    (d, v) => {
      if (v === 'Z') v = '+00:00';
      const parts = `${v}`.match(/([+-]|\d\d)/gi);
      if (parts) {
        const minutes = +(parts[1] * 60) + parseInt(parts[2], 10);
        d.timezoneOffset = parts[0] === '+' ? minutes : -minutes;
      }
    },
  ],
};
parseFlags.DD = parseFlags.D;
parseFlags.dd = parseFlags.d;
parseFlags.WWWW = parseFlags.WWW = parseFlags.WW = parseFlags.W;
parseFlags.MM = parseFlags.M;
parseFlags.mm = parseFlags.m;
parseFlags.hh = parseFlags.H = parseFlags.HH = parseFlags.h;
parseFlags.ss = parseFlags.s;
parseFlags.A = parseFlags.a;
parseFlags.XXX = parseFlags.XX = parseFlags.X;

export const format = (dateObj, mask, locale, timezone) => {
  mask =
    (arrayHasItems(mask) && mask[0]) ||
    (isString(mask) && mask) ||
    'YYYY-MM-DD';

  dateObj = locale.getDateParts(locale.normalizeDate(dateObj), timezone);

  mask = locale.masks[mask] || mask;
  const literals = [];
  // Make literals inactive by replacing them with ??
  mask = mask.replace(literal, ($0, $1) => {
    literals.push($1);
    return '??';
  });
  // Apply formatting rules
  mask = mask.replace(token, $0 =>
    $0 in formatFlags
      ? formatFlags[$0](dateObj, locale)
      : $0.slice(1, $0.length - 1),
  );
  // Inline literal values back into the formatted value
  return mask.replace(/\?\?/g, () => literals.shift());
};

const parseString = (dateStr, mask, locale, timezone) => {
  if (typeof mask !== 'string') {
    throw new Error('Invalid mask in fecha.parse');
  }
  mask = locale.masks[mask] || mask;
  // Avoid regular expression denial of service, fail early for really long strings
  // https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS
  if (dateStr.length > 1000) {
    return false;
  }

  let isValid = true;
  const dateInfo = {};
  mask.replace(token, $0 => {
    if (parseFlags[$0]) {
      const info = parseFlags[$0];
      const index = dateStr.search(info[0]);
      if (!~index) {
        isValid = false;
      } else {
        dateStr.replace(info[0], result => {
          info[1](dateInfo, result, locale);
          dateStr = dateStr.substr(index + result.length);
          return result;
        });
      }
    }

    return parseFlags[$0] ? '' : $0.slice(1, $0.length - 1);
  });

  if (!isValid) {
    return false;
  }

  const today = new Date();
  if (
    dateInfo.isPm === true &&
    dateInfo.hour != null &&
    +dateInfo.hour !== 12
  ) {
    dateInfo.hour = +dateInfo.hour + 12;
  } else if (dateInfo.isPm === false && +dateInfo.hour === 12) {
    dateInfo.hour = 0;
  }

  let date;
  if (dateInfo.timezoneOffset != null) {
    dateInfo.minute = +(dateInfo.minute || 0) - +dateInfo.timezoneOffset;
    date = new Date(
      Date.UTC(
        dateInfo.year || today.getFullYear(),
        dateInfo.month || 0,
        dateInfo.day || 1,
        dateInfo.hour || 0,
        dateInfo.minute || 0,
        dateInfo.second || 0,
        dateInfo.millisecond || 0,
      ),
    );
  } else {
    date = locale.getDateFromParts(
      {
        year: dateInfo.year || today.getFullYear(),
        month: (dateInfo.month || 0) + 1,
        day: dateInfo.day || 1,
        hours: dateInfo.hour || 0,
        minutes: dateInfo.minute || 0,
        seconds: dateInfo.second || 0,
        milliseconds: dateInfo.millisecond || 0,
      },
      timezone,
    );
  }
  return date;
};

export const parse = (dateStr, mask, locale, timezone) => {
  const masks = (arrayHasItems(mask) && mask) || [
    (isString(mask) && mask) || 'YYYY-MM-DD',
  ];
  return (
    masks.map(m => parseString(dateStr, m, locale, timezone)).find(d => d) ||
    new Date(dateStr)
  );
};
