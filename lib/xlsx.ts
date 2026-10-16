/**
 * 공식 주문서(public/goods/order-template.xlsx)의 빈칸만 채워서 새 xlsx 를 만듭니다.
 * xlsx 는 zip 안의 XML 이라, 서식·수식·드롭다운은 그대로 두고 「개인별 주문」 B~H 칸만 바꿉니다.
 * 라이브러리 없이 브라우저/Node 내장 (Decompression|Compression)Stream 만 씀.
 */
import { type Line } from "./goods.ts";

const ORDER_SHEET = "xl/worksheets/sheet2.xml"; // 「개인별 주문」
const FIRST_ROW = 6;
export const MAX_ROWS = 300; // 6~305 줄

type Entry = { name: string; method: number; crc: number; data: Uint8Array; size: number };

const u16 = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8);
const u32 = (b: Uint8Array, o: number) => (u16(b, o) | (u16(b, o + 2) << 16)) >>> 0;

const pipe = async (data: Uint8Array, stream: GenericTransformStream) =>
  new Uint8Array(await new Response(new Blob([data as BlobPart]).stream().pipeThrough(stream)).arrayBuffer());

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
const crc32 = (b: Uint8Array) => {
  let c = 0xffffffff;
  for (const x of b) c = CRC_TABLE[(c ^ x) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};

/** zip 의 파일 목록 (중앙 디렉터리 기준). data 는 압축된 그대로 */
export const readZip = (b: Uint8Array): Entry[] => {
  let eocd = b.length - 22;
  while (eocd >= 0 && u32(b, eocd) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error("xlsx 파일이 아닙니다.");
  const out: Entry[] = [];
  for (let i = 0, p = u32(b, eocd + 16); i < u16(b, eocd + 10); i++) {
    const nameLen = u16(b, p + 28);
    const local = u32(b, p + 42);
    const start = local + 30 + u16(b, local + 26) + u16(b, local + 28);
    out.push({
      name: new TextDecoder().decode(b.subarray(p + 46, p + 46 + nameLen)),
      method: u16(b, p + 10),
      crc: u32(b, p + 16),
      data: b.subarray(start, start + u32(b, p + 20)),
      size: u32(b, p + 24),
    });
    p += 46 + nameLen + u16(b, p + 30) + u16(b, p + 32);
  }
  return out;
};

export const unzipText = async (e: Entry) =>
  new TextDecoder().decode(e.method === 8 ? await pipe(e.data, new DecompressionStream("deflate-raw")) : e.data);

const writeZip = (entries: Entry[]) => {
  const enc = new TextEncoder();
  const parts: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;
  for (const e of entries) {
    const name = enc.encode(e.name);
    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, 0x04034b50, true);
    local.setUint16(4, 20, true);
    local.setUint16(6, 0x0800, true); // 파일 이름 UTF-8
    local.setUint16(8, e.method, true);
    local.setUint32(14, e.crc, true);
    local.setUint32(18, e.data.length, true);
    local.setUint32(22, e.size, true);
    local.setUint16(26, name.length, true);
    const cd = new DataView(new ArrayBuffer(46));
    cd.setUint32(0, 0x02014b50, true);
    cd.setUint16(4, 20, true);
    cd.setUint16(6, 20, true);
    cd.setUint16(8, 0x0800, true);
    cd.setUint16(10, e.method, true);
    cd.setUint32(16, e.crc, true);
    cd.setUint32(20, e.data.length, true);
    cd.setUint32(24, e.size, true);
    cd.setUint16(28, name.length, true);
    cd.setUint32(42, offset, true);
    parts.push(new Uint8Array(local.buffer), name, e.data);
    central.push(new Uint8Array(cd.buffer), name);
    offset += 30 + name.length + e.data.length;
  }
  const cdSize = central.reduce((s, c) => s + c.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, cdSize, true);
  end.setUint32(16, offset, true);
  return new Blob([...parts, ...central, new Uint8Array(end.buffer)] as BlobPart[], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

const esc = (s: string) => s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" })[c]!);

/** 칸 하나를 값으로 바꿈 (서식 번호 s 는 그대로) */
const setCell = (xml: string, ref: string, v: string | number) =>
  xml.replace(new RegExp(`<c r="${ref}"([^>]*?)(?:/>|>[\\s\\S]*?</c>)`), (_, attrs: string) => {
    const s = attrs.match(/ s="\d+"/)?.[0] ?? "";
    return typeof v === "number"
      ? `<c r="${ref}"${s}><v>${v}</v></c>`
      : `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${esc(v)}</t></is></c>`;
  });

/** 엑셀 「개인별 주문」 B~H 한 줄 값 (이름, 상품, 사이즈, 세트: 반다나/바쿠백/키링, 수량) */
export const sheetRows = (orders: { name: string; items: Line[] }[]) =>
  orders.flatMap((o) => o.items.map((l) => [o.name, l.item, l.size ?? "", l.bandana ?? "", l.bag ?? "", l.keyring ?? "", l.qty] as const));

/** 엑셀에 붙여넣기용: 탭으로 구분한 B~H 줄 */
export const excelRows = (orders: { name: string; items: Line[] }[]) =>
  sheetRows(orders).map((r) => r.map((v) => String(v).replace(/[\t\n\r]/g, " ")).join("\t")).join("\n");

/** 공식 주문서에 주문을 채운 xlsx */
export const fillOrderForm = async (template: Uint8Array, orders: { name: string; items: Line[] }[]) => {
  const rows = sheetRows(orders);
  if (rows.length > MAX_ROWS) throw new Error(`주문서는 ${MAX_ROWS}줄까지만 들어갑니다. (지금 ${rows.length}줄)`);
  const entries = readZip(template);
  const edit = async (name: string, fn: (xml: string) => string) => {
    const i = entries.findIndex((e) => e.name === name);
    const raw = new TextEncoder().encode(fn(await unzipText(entries[i])));
    entries[i] = { name, method: 8, crc: crc32(raw), data: await pipe(raw, new CompressionStream("deflate-raw")), size: raw.length };
  };
  await edit(ORDER_SHEET, (xml) =>
    rows.reduce(
      (x, r, i) => [..."BCDEFGH"].reduce((y, col, j) => (r[j] === "" ? y : setCell(y, `${col}${FIRST_ROW + i}`, r[j])), x),
      xml,
    ),
  );
  // 열 때 수식을 다시 계산하게 (저장된 합계 0 이 그대로 보이지 않도록)
  await edit("xl/workbook.xml", (xml) => xml.replace(/<calcPr[^>]*\/>/, '<calcPr fullCalcOnLoad="1"/>'));
  return writeZip(entries);
};
