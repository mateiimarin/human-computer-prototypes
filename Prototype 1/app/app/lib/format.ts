const dateFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const timeFmt = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function dayDiff(iso: string, now = new Date()) {
  return Math.round((startOfDay(new Date(iso)) - startOfDay(now)) / 86_400_000);
}

export function dueLabel(iso: string) {
  const n = dayDiff(iso);
  if (n === 0) return "Due today";
  if (n === 1) return "Due tomorrow";
  if (n > 1 && n < 7) return `Due ${new Intl.DateTimeFormat("en-GB", { weekday: "long" }).format(new Date(iso))}`;
  if (n < 0) return `Was due ${dateFmt.format(new Date(iso))}`;
  return `Due ${dateFmt.format(new Date(iso))}`;
}

export function dueTone(iso: string): "soon" | "late" | "calm" {
  const n = dayDiff(iso);
  if (n < 0) return "late";
  return n <= 2 ? "soon" : "calm";
}

export function dayLabel(iso: string) {
  const n = dayDiff(iso);
  if (n === 0) return `Today, ${timeFmt.format(new Date(iso))}`;
  if (n === -1) return `Yesterday, ${timeFmt.format(new Date(iso))}`;
  if (n > -7 && n < 0) return `${-n} days ago`;
  return dateFmt.format(new Date(iso));
}

export function shortDate(iso: string) {
  return dateFmt.format(new Date(iso));
}

export function monthLabel(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(new Date(iso));
}

export function greeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function todayLabel(now = new Date()) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(now);
}

export function plural(n: number, one: string, many = `${one}s`) {
  return `${n} ${n === 1 ? one : many}`;
}
