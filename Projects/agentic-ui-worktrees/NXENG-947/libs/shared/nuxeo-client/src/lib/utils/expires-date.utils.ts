/** Whether the Expires field value is valid (empty, partial mm/dd/yyyy, or complete date). */
export function isExpiresFieldValid(expiresRawText: string, expires: Date | null): boolean {
  const raw = expiresRawText.trim();
  if (!raw) {
    return !expires || !Number.isNaN(expires.getTime());
  }
  return isValidPartialOrCompleteDate(raw);
}

/** Whether to show the Expires validation message (non-empty invalid input). */
export function shouldShowExpiresFieldError(expiresRawText: string, expires: Date | null): boolean {
  return expiresRawText.trim().length > 0 && !isExpiresFieldValid(expiresRawText, expires);
}

/** Shows Expires validation errors immediately on input (not only after blur). */
export function createExpiresErrorStateMatcher(isInvalid: () => boolean): {
  isErrorState: () => boolean;
} {
  return {
    isErrorState: () => isInvalid(),
  };
}

function isValidPartialOrCompleteDate(raw: string): boolean {
  if (!/^\d{0,2}(\/\d{0,2}(\/\d{0,4})?)?$/.test(raw)) {
    return false;
  }
  if (!/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(raw)) {
    return true;
  }
  return isValidMmDdYyyy(raw);
}

function isValidMmDdYyyy(raw: string): boolean {
  const [monthPart, dayPart, yearPart] = raw.split('/');
  const month = Number.parseInt(monthPart, 10);
  const day = Number.parseInt(dayPart, 10);
  let year = Number.parseInt(yearPart, 10);

  if (yearPart.length === 2) {
    year = year <= 69 ? 2000 + year : 1900 + year;
  }

  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000 || year > 9999) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
