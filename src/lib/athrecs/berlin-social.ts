import {
  berlinPlace,
  berlinTitle,
  type BerlinResult,
  type BerlinSearch,
  type BerlinSnapshot,
} from "./berlin-results";

// Exact data graphics: text is painted from verified source fields, never generated.
export async function berlinCard(
  data: BerlinSnapshot,
  search: BerlinSearch,
  rows: BerlinResult[],
  format: "instagram" | "x",
  individual = false,
  evergreen = false,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const portrait = format === "instagram";
  canvas.width = portrait ? 1080 : 1600;
  canvas.height = portrait ? 1350 : 900;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser cannot create an image. Try another browser.");
  const w = canvas.width,
    h = canvas.height,
    pad = 64;
  ctx.fillStyle = "#082d32";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#10c1b2";
  ctx.fillRect(0, 0, 14, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(pad, 42, 330, 74);
  const logo = new Image();
  logo.src = "/athrecs-logo-header.png";
  await logo.decode();
  ctx.drawImage(logo, pad + 15, 52, 300, (300 * logo.naturalHeight) / logo.naturalWidth);
  const text = (
    value: string,
    x: number,
    y: number,
    size: number,
    color = "#ffffff",
    maxWidth = w - 2 * pad,
    bold = false,
  ) => {
    ctx.fillStyle = color;
    ctx.font = `${bold ? 700 : 400} ${size}px Arial, sans-serif`;
    let label = value;
    while (ctx.measureText(label).width > maxWidth && label.length > 1) label = label.slice(0, -1);
    if (label !== value) label = label.slice(0, -1) + "…";
    ctx.fillText(label, x, y);
  };
  text("27 SEP 2026  /  42.195 KM", pad, 158, 24, "#a6d5d3");
  text("BERLIN MARATHON", pad, 226, portrait ? 61 : 68, "#ffffff", w - 2 * pad, true);
  const title = evergreen
    ? "RESULTS HUB"
    : individual
      ? "FINISHER RESULT"
      : berlinTitle(search).toUpperCase();
  text(title, pad, 275, 32, "#47ded0", w - 2 * pad, true);
  const label = evergreen
    ? "MEN · WOMEN · AGE CATEGORIES"
    : rows.length
      ? `${data.status === "official" ? "OFFICIAL" : "PROVISIONAL"} · ${data.coverage.toUpperCase()} COVERAGE`
      : "AWAITING VERIFIED RESULTS";
  text(label, pad, 314, 21, "#a6d5d3");
  if (!rows.length) {
    ctx.fillStyle = "#104047";
    ctx.fillRect(pad, 380, w - pad * 2, portrait ? 560 : 300);
    text(
      evergreen ? "BERLIN 2026" : "RESULTS TO FOLLOW",
      pad + 32,
      portrait ? 595 : 490,
      portrait ? 46 : 56,
      "#ffffff",
      w - pad * 2 - 64,
      true,
    );
    text(
      "Men · Women · Age categories",
      pad + 32,
      portrait ? 660 : 550,
      29,
      "#a6d5d3",
      w - pad * 2 - 64,
    );
    text(
      "Official results linked at athrecs.com",
      pad + 32,
      portrait ? 718 : 607,
      26,
      "#a6d5d3",
      w - pad * 2 - 64,
    );
  } else if (individual) {
    const row = rows[0];
    text(row.name, pad, 432, portrait ? 54 : 66, "#ffffff", w - pad * 2, true);
    text([row.country, row.club].filter(Boolean).join(" · "), pad, 487, 28, "#a6d5d3");
    text(
      row.chipTime ?? row.gunTime ?? "",
      pad,
      portrait ? 675 : 625,
      portrait ? 110 : 120,
      "#47ded0",
      w - 2 * pad,
      true,
    );
    text(row.chipTime ? "CHIP TIME" : "GUN TIME", pad, portrait ? 728 : 674, 26, "#a6d5d3");
    text(
      `Bib ${row.bib}${row.category ? ` · ${row.category}` : ""}`,
      pad,
      portrait ? 842 : 728,
      28,
    );
    text(
      `Overall ${row.overallPlace ?? "—"} · Gender ${row.genderPlace ?? "—"} · Category ${row.categoryPlace ?? "—"}`,
      pad,
      portrait ? 903 : 773,
      25,
      "#a6d5d3",
    );
  } else {
    const rowHeight = portrait ? 76 : 40;
    text("POS", pad, 368, 19, "#a6d5d3");
    text("ATHLETE / CLUB", pad + 86, 368, 19, "#a6d5d3");
    text("TIME / TYPE", w - pad - 178, 368, 19, "#a6d5d3");
    rows.slice(0, 10).forEach((row, i) => {
      const y = 388 + i * rowHeight;
      ctx.fillStyle = i % 2 ? "#0c353b" : "#104047";
      ctx.fillRect(pad, y, w - 2 * pad, rowHeight - 3);
      text(String(berlinPlace(row, search.view) ?? "—"), pad + 12, y + 28, 25, "#47ded0", 60, true);
      text(row.name, pad + 86, y + 28, 26, "#ffffff", w - 2 * pad - 300, true);
      const detail = [row.country, row.club].filter(Boolean).join(" · ");
      if (portrait) text(detail, pad + 86, y + 56, 20, "#a6d5d3", w - 2 * pad - 300);
      const time =
        search.view === "age" || search.view === "all"
          ? (row.chipTime ?? row.gunTime)
          : (row.gunTime ?? row.chipTime);
      const chip =
        time === row.chipTime && (search.view === "age" || search.view === "all" || !row.gunTime);
      text(
        `${time ?? "—"}${portrait ? "" : chip ? " C" : " G"}`,
        w - pad - 178,
        y + 28,
        portrait ? 27 : 25,
        "#ffffff",
        174,
        true,
      );
      if (portrait) text(chip ? "CHIP" : "GUN", w - pad - 178, y + 56, 18, "#a6d5d3");
    });
    if (!portrait)
      text("C = chip · G = gun · Placings as published by the organiser", pad, 814, 19, "#a6d5d3");
  }
  ctx.fillStyle = "#10c1b2";
  ctx.fillRect(pad, h - 102, w - 2 * pad, 2);
  text("ATHRECS.COM", pad, h - 52, 31, "#ffffff", 400, true);
  text(
    data.updatedAt
      ? `Updated ${new Date(data.updatedAt).toLocaleString("en-GB", { timeZone: "Europe/London", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })} UK`
      : "Results hub · 2026",
    w - pad - 410,
    h - 52,
    21,
    "#a6d5d3",
    410,
  );
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image export failed."))),
      "image/png",
    ),
  );
}
export function downloadBerlinCard(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
