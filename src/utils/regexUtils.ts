export function extractName(text: string): string {
  const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
  
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.trim();
    if (/^(resume|curriculum|cv|portfolio)/i.test(cleaned)) continue;
    if (/@|http|www\.|phone|tel:|email/i.test(cleaned)) continue;
    if (/^\d{5,}/.test(cleaned)) continue;
    
    const nameMatch = cleaned.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})$/);
    if (nameMatch) return nameMatch[1];
    
    if (/^[A-Za-z\s.'-]{2,50}$/.test(cleaned) && cleaned.split(/\s+/).length <= 5) {
      return cleaned;
    }
  }
  
  return lines[0]?.trim().slice(0, 50) || "Unknown";
}

export interface ExperienceDetail {
  totalMonths: number;
  years: number;
  months: number;
}

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2,
  apr: 3, april: 3, may: 4, jun: 5, june: 5,
  jul: 6, july: 6, aug: 7, august: 7, sep: 8, sept: 8, september: 8,
  oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11,
};

function parseMonthName(str: string): number | null {
  const key = str.toLowerCase().replace(/\.$/, '');
  return MONTH_MAP[key] ?? null;
}

function monthsBetween(startMonth: number, startYear: number, endMonth: number, endYear: number): number {
  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1; // inclusive of start month
}

function formatExperience(totalMonths: number): string {
  if (totalMonths <= 0) return 'Not detected';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  if (years === 0) return `${months} month${months !== 1 ? 's' : ''}`;
  if (months === 0) return `${years} year${years !== 1 ? 's' : ''}`;
  return `${years} year${years !== 1 ? 's' : ''} ${months} month${months !== 1 ? 's' : ''}`;
}

// Section headers that indicate PROJECT sections (not work experience)
const PROJECT_HEADERS = /(?:^|\n)\s*(?:projects?|personal\s+projects?|academic\s+projects?|side\s+projects?|college\s+projects?|university\s+projects?)\s*(?:\n|$|:|-|–)/i;
const WORK_HEADERS = /(?:^|\n)\s*(?:work\s+experience|professional\s+experience|employment\s+history|experience|internship|work\s+history|career\s+history)\s*(?:\n|$|:|-|–)/i;

/**
 * Splits text into sections and identifies which are work/internship vs projects.
 * Returns only the work/internship portions of text.
 */
function extractWorkSections(text: string): string {
  // Split by common section headers
  const sectionPattern = /(?:^|\n)\s*((?:work\s+experience|professional\s+experience|employment\s+history|experience|internship(?:s)?|work\s+history|career\s+history|projects?|personal\s+projects?|academic\s+projects?|side\s+projects?|college\s+projects?|university\s+projects?|education|educational\s+qualifications?|academic\s+details?|qualifications?|skills|technical\s+skills|certifications?|achievements?|awards?|hobbies|interests|references?|summary|objective|about\s+me|extra\s*curricular|co\s*-?\s*curricular|activities))\s*(?:\n|$|:|-|–)/gi;

  const sections: { header: string; start: number; text: string }[] = [];
  let match: RegExpExecArray | null;
  const matches: { header: string; start: number }[] = [];

  while ((match = sectionPattern.exec(text)) !== null) {
    matches.push({ header: match[1].trim().toLowerCase(), start: match.index });
  }

  if (matches.length === 0) {
    // No clear sections found — use entire text but try to exclude obvious project blocks
    return text;
  }

  for (let i = 0; i < matches.length; i++) {
    const end = i + 1 < matches.length ? matches[i + 1].start : text.length;
    sections.push({
      header: matches[i].header,
      start: matches[i].start,
      text: text.slice(matches[i].start, end),
    });
  }

  // Include only work/internship sections
  const workSections = sections.filter(s =>
    /^(work\s+experience|professional\s+experience|employment\s+history|experience|internship(?:s)?|work\s+history|career\s+history)$/i.test(s.header)
  );

  if (workSections.length > 0) {
    return workSections.map(s => s.text).join('\n');
  }

  // If no explicit work section found, use everything except project/education/skills sections
  const nonWorkSections = sections.filter(s =>
    !/^(projects?|personal\s+projects?|academic\s+projects?|side\s+projects?|college\s+projects?|university\s+projects?|education|educational\s+qualifications?|academic\s+details?|qualifications?|skills|technical\s+skills|certifications?|achievements?|awards?|hobbies|interests|references?|summary|objective|about\s+me|extra\s*curricular|co\s*-?\s*curricular|activities)$/i.test(s.header)
  );

  return nonWorkSections.length > 0
    ? nonWorkSections.map(s => s.text).join('\n')
    : text;
}

export function extractExperience(text: string): ExperienceDetail {
  // First check for explicit "X years Y months" statements
  const explicitPatterns = [
    /(\d+)\s*\+?\s*years?\s+(?:and\s+)?(\d+)\s*months?\s*(?:of\s+)?(?:experience|exp)/gi,
    /(\d+)\s*\+?\s*years?\s*(?:of\s+)?(?:experience|exp)/gi,
    /(\d+)\s*\+?\s*months?\s*(?:of\s+)?(?:experience|exp)/gi,
    /experience\s*:?\s*(\d+)\s*\+?\s*years?/gi,
    /experience\s*:?\s*(\d+)\s*\+?\s*months?/gi,
    /(\d+)\s*\+?\s*years?\s+(?:in|of|working)/gi,
    /(\d+)\s*\+?\s*months?\s+(?:in|of|working)/gi,
    /(\d+)\s*yrs?\s+(\d+)\s*mos?\b/gi,
    /(\d+)\s*yrs?\b/gi,
  ];

  // Check year+month pattern first
  const ymPattern = /(\d+)\s*\+?\s*years?\s+(?:and\s+)?(\d+)\s*months?/gi;
  let m = ymPattern.exec(text);
  if (m) {
    const total = parseInt(m[1]) * 12 + parseInt(m[2]);
    return makeResult(total);
  }

  const yrmosPattern = /(\d+)\s*yrs?\s+(\d+)\s*mos?\b/gi;
  m = yrmosPattern.exec(text);
  if (m) {
    const total = parseInt(m[1]) * 12 + parseInt(m[2]);
    return makeResult(total);
  }

  // Check years-only explicit
  for (const pattern of [explicitPatterns[1], explicitPatterns[3], explicitPatterns[5], explicitPatterns[7]]) {
    m = pattern.exec(text);
    if (m) {
      const val = parseFloat(m[1]);
      return makeResult(Math.round(val * 12));
    }
  }

  // Check months-only explicit
  for (const pattern of [explicitPatterns[2], explicitPatterns[4], explicitPatterns[6]]) {
    m = pattern.exec(text);
    if (m) {
      return makeResult(parseInt(m[1]));
    }
  }

  // --- Calculate from date ranges in WORK sections only ---
  const totalFromDates = calculateFromDateRanges(text);

  if (totalFromDates > 0) {
    return makeResult(totalFromDates);
  }

  // Fallback: try full text date ranges
  const totalFallback = calculateFromDateRanges(text);
  if (totalFallback > 0) {
    return makeResult(totalFallback);
  }

  return makeResult(0);
}

function calculateFromDateRanges(text: string): number {
  let totalMonths = 0;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Pattern 1: "Month Year - Month Year" or "Month Year - Present"
  // e.g. "Jan 2020 – Mar 2023", "January 2024 - Present", "Apr 2025 - current"
  const monthYearPattern = /\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s*[,']?\s*(\d{4})\s*[-–—]+\s*(?:(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\.?\s*[,']?\s*(\d{4})|(present|current|now|ongoing|till\s*date|to\s*date))\b/gi;

  let match: RegExpExecArray | null;
  const ranges: { startMonth: number; startYear: number; endMonth: number; endYear: number }[] = [];

  while ((match = monthYearPattern.exec(text)) !== null) {
    const startMon = parseMonthName(match[1]);
    const startYr = parseInt(match[2]);
    let endMon: number;
    let endYr: number;

    if (match[3] && match[4]) {
      endMon = parseMonthName(match[3])!;
      endYr = parseInt(match[4]);
    } else {
      // Present/current
      endMon = currentMonth;
      endYr = currentYear;
    }

    if (startMon === null) continue;
    if (startYr < 1990 || startYr > currentYear + 1) continue;

    const months = monthsBetween(startMon, startYr, endMon, endYr);
    if (months > 0 && months < 600) { // sanity: less than 50 years
      ranges.push({ startMonth: startMon, startYear: startYr, endMonth: endMon, endYear: endYr });
      totalMonths += months;
    }
  }

  // Pattern 2: "MM/YYYY - MM/YYYY" or "MM-YYYY - MM-YYYY"
  const numericDatePattern = /\b(\d{1,2})\s*[/.-]\s*(\d{4})\s*[-–—]+\s*(?:(\d{1,2})\s*[/.-]\s*(\d{4})|(present|current|now|ongoing))\b/gi;

  while ((match = numericDatePattern.exec(text)) !== null) {
    const startMon = parseInt(match[1]) - 1;
    const startYr = parseInt(match[2]);
    let endMon: number;
    let endYr: number;

    if (match[3] && match[4]) {
      endMon = parseInt(match[3]) - 1;
      endYr = parseInt(match[4]);
    } else {
      endMon = currentMonth;
      endYr = currentYear;
    }

    if (startMon < 0 || startMon > 11) continue;
    if (startYr < 1990 || startYr > currentYear + 1) continue;

    const months = monthsBetween(startMon, startYr, endMon, endYr);
    if (months > 0 && months < 600) {
      totalMonths += months;
    }
  }

  // Pattern 3: "YYYY - YYYY" (year only, no month — use 12 months per year diff)
  // Only use if we haven't found any month-level ranges
  if (totalMonths === 0) {
    const yearOnlyPattern = /\b(\d{4})\s*[-–—]+\s*(?:(\d{4})|(present|current|now|ongoing))\b/gi;

    while ((match = yearOnlyPattern.exec(text)) !== null) {
      const startYr = parseInt(match[1]);
      const endYr = match[2] ? parseInt(match[2]) : currentYear;

      if (startYr < 1990 || startYr > currentYear) continue;
      if (endYr < startYr) continue;

      const months = (endYr - startYr) * 12;
      if (months > 0 && months < 600) {
        totalMonths += months;
      }
    }
  }

  return totalMonths;
}

function makeResult(totalMonths: number): ExperienceDetail {
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return {
    totalMonths,
    years,
    months,
  };
}

// Keep backward-compatible numeric getter
export function extractExperienceYears(text: string): number {
  const detail = extractExperience(text);
  return Math.round((detail.totalMonths / 12) * 10) / 10;
}

export function extractSalary(text: string): string | null {
  const salaryPatterns = [
    /₹\s*[\d,]+(?:\.\d+)?(?:\s*(?:lpa|lac|lakh|lakhs|per\s*annum))?/gi,
    /(?:inr|rs\.?)\s*[\d,]+(?:\.\d+)?(?:\s*(?:lpa|lac|lakh|lakhs|per\s*annum))?/gi,
    /(\d+\.?\d*)\s*(?:lpa|lac|lakh|lakhs)/gi,
    /\$\s*[\d,]+(?:\.\d+)?(?:\s*(?:k|per\s*(?:year|annum|month)))?/gi,
    /(?:usd)\s*[\d,]+(?:\.\d+)?/gi,
    /€\s*[\d,]+(?:\.\d+)?/gi,
    /(?:ctc|salary|compensation|package)\s*:?\s*[\$₹€]?\s*[\d,.]+\s*(?:lpa|k|lac|lakh|lakhs|per\s*annum)?/gi,
  ];
  
  for (const pattern of salaryPatterns) {
    const match = pattern.exec(text);
    if (match) return match[0].trim();
  }
  
  return null;
}

export function extractEmail(text: string): string | null {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return match ? match[0] : null;
}

export function extractPhone(text: string): string | null {
  const match = text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return match ? match[0] : null;
}
