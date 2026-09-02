const jiti = require("jiti")(__filename);
const fs = require("fs");
const JSZip = require("jszip");
const { patchEwidencjaWorkbook } = jiti("/workspace/src/lib/patch-ewidencja.ts");

function grab(xml, ref) {
  const re = new RegExp(`<c r="${ref}"[^/]*/>|<c r="${ref}"[^>]*>[\\s\\S]*?</c>`);
  return xml.match(re)?.[0] ?? "MISSING";
}

async function sheetOf(buf) {
  const zip = await JSZip.loadAsync(buf);
  return {
    zip,
    files: Object.keys(zip.files).sort(),
    styles: await zip.file("xl/styles.xml").async("string"),
    bag: await zip.file("xl/featurePropertyBag/featurePropertyBag.xml").async("string"),
    sheet: await zip.file("xl/worksheets/sheet1.xml").async("string"),
  };
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

(async () => {
  const src = fs.readFileSync("/workspace/attachments/UCZESTNICY (2).xlsx");
  const orig = await sheetOf(src);

  const noopPeople = [
    { lastFirst: "Zajk Paweł", fee: 210, groupName: "SENIORZY", monthsPaid: {} },
    { lastFirst: "Zajk Julia", fee: 220, groupName: "SENIORZY II", monthsPaid: {} },
  ];
  const noopBlob = await patchEwidencjaWorkbook(src, noopPeople, 2026);
  const noopBuf = Buffer.from(await noopBlob.arrayBuffer());
  const noop = await sheetOf(noopBuf);
  assert(noop.styles === orig.styles, "styles changed on no-op");
  assert(noop.bag === orig.bag, "featurePropertyBag changed on no-op");
  assert(noop.sheet === orig.sheet, "sheet changed on no-op even though values match");
  console.log("no-op: sheet identical");

  const people = [
    { lastFirst: "Zajk Paweł", fee: 210, groupName: "SENIORZY", monthsPaid: { "2026-09": false, "2026-10": false } },
    { lastFirst: "Zajk Julia", fee: 220, groupName: "SENIORZY II", monthsPaid: { "2026-09": true, "2026-10": false } },
    { lastFirst: "Nowak Anna", fee: 180, groupName: "TANIEC SENIORZY", monthsPaid: { "2026-09": false, "2026-10": true } },
  ];
  const blob = await patchEwidencjaWorkbook(src, people, 2026);
  const out = Buffer.from(await blob.arrayBuffer());
  fs.writeFileSync("/tmp/ewidencja-patched.xlsx", out);
  const patched = await sheetOf(out);
  const sheet = patched.sheet;

  assert(patched.styles === orig.styles, "styles changed");
  assert(patched.bag === orig.bag, "bag changed");
  assert(grab(sheet, "A1") === grab(orig.sheet, "A1"), "header A1 changed");
  assert(grab(sheet, "B1") === '<c r="B1" s="3"/>', "spacer col B lost");
  assert(grab(sheet, "H1") === '<c r="H1" s="5"/>', "spacer col H lost");
  assert(grab(sheet, "A3") === grab(orig.sheet, "A3"), "Paweł name cell rewritten");
  assert(grab(sheet, "I4") === '<c r="I4" s="14" t="b"><v>1</v></c>', "Julia wrzesień not checked");
  assert(grab(sheet, "E4") === '<c r="E4" s="14" t="b"><v>0</v></c>', "SENIORZY wrongly checked for Julia");
  assert(grab(sheet, "F4") === '<c r="F4" s="14" t="b"><v>1</v></c>', "SENIORZY II missing for Julia");
  assert(grab(sheet, "A2") === grab(orig.sheet, "A2"), "spacer row 2 overwritten");
  assert(/Nowak Anna/.test(sheet), "new person missing");
  assert(grab(sheet, "A5").includes("Nowak Anna"), "Anna not on row 5: " + grab(sheet, "A5"));
  assert(grab(sheet, "G5") === '<c r="G5" s="14" t="b"><v>1</v></c>', "Anna TANIEC not checked: " + grab(sheet, "G5"));
  assert(grab(sheet, "J5") === '<c r="J5" s="14" t="b"><v>1</v></c>', "Anna październik not checked: " + grab(sheet, "J5"));
  assert(grab(sheet, "C5").includes("180"), "Anna fee missing: " + grab(sheet, "C5"));
  assert(!/TRUE|FALSE/.test(sheet), "TRUE/FALSE leaked into sheet xml");
  assert((sheet.match(/t="b"/g) || []).length === 42, "unexpected bool count " + (sheet.match(/t="b"/g) || []).length);

  console.log("patched: checkboxes, spacers, new row, styles OK");
  console.log("A5", grab(sheet, "A5"));
  console.log("I4", grab(sheet, "I4"));
  console.log("G5", grab(sheet, "G5"));
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
