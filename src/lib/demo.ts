import type { Group, Participant, Transfer } from "./types";
import { uid } from "./utils";

export const DEMO_MONTH = "2026-09";

export function demoGroups(): Group[] {
  return [
    { id: "g-seniorzy", name: "SENIORZY", defaultFee: 210 },
    { id: "g-seniorzy-ii", name: "SENIORZY II", defaultFee: 220 },
    { id: "g-taniec", name: "TANIEC SENIORZY", defaultFee: 220 },
  ];
}

export function demoParticipants(): Participant[] {
  return [
    {
      id: uid("p"),
      firstName: "Paweł",
      lastName: "Zajk",
      groupId: "g-seniorzy",
      monthlyFee: 210,
      notes: "",
      active: true,
    },
    {
      id: uid("p"),
      firstName: "Julia",
      lastName: "Zajk",
      groupId: "g-seniorzy-ii",
      monthlyFee: 220,
      notes: "",
      active: true,
    },
  ];
}

export const DEMO_STATEMENT_LINES = [
  "mBank S.A. Bankowość Detaliczna",
  "Lista operacji za okres od 2026-09-01 do 2026-09-02",
  "dla rachunków:",
  "mKonto Intensive",
  "Waluta Wpływy Wydatki",
  "PLN 10,00 -224,98",
  "Operacje",
  "Data operacji Opis operacji Rachunek Kategoria Kwota",
  "2026-09-02 JULIA ZAJK, JULIA ZAJK SENIORZY WRZESIEŃ mKonto Intensive Wpływy - inne 10,00 PLN",
  "UL.SAMBORA 2B 81-235 GDYNIA PRZELEW WEWNĘTRZNY PRZYCHODZĄCY",
  "2026-09-02 PRZYCHOD. DLA ZWIERZAT SC mKonto Intensive Zwierzęta -93,00 PLN",
  "ZAKUP PRZY UŻYCIU KARTY W KRAJU transakcja nierozliczona",
  "2026-09-01 TESLA POLAND SP. Z O. O. mKonto Intensive Serwis i części -34,99 PLN",
  "ZAKUP PRZY UŻYCIU KARTY - INTERNET",
  "2026-09-01 Leroy Merlin mKonto Intensive Akcesoria i wyposażenie -52,49 PLN",
  "ZAKUP PRZY UŻYCIU KARTY W KRAJU",
  "2026-09-01 ACTIVE FLOW ARENA mKonto Intensive Sport i hobby -4,50 PLN",
  "ZAKUP PRZY UŻYCIU KARTY W KRAJU",
  "2026-09-01 HTTPS://APP.FITSSEY.COM/A mKonto Intensive Sport i hobby -40,00 PLN",
  "BLIK ZAKUP E-COMMERCE",
];

export function demoTransfers(statementId: string): Transfer[] {
  const rows: Array<[string, number, string, Transfer["direction"]]> = [
    ["2026-09-02", 10, "JULIA ZAJK, JULIA ZAJK SENIORZY WRZESIEŃ PRZELEW WEWNĘTRZNY PRZYCHODZĄCY", "in"],
    ["2026-09-02", 93, "PRZYCHOD. DLA ZWIERZAT SC ZAKUP PRZY UŻYCIU KARTY W KRAJU", "out"],
    ["2026-09-01", 34.99, "TESLA POLAND SP. Z O. O. ZAKUP PRZY UŻYCIU KARTY - INTERNET", "out"],
    ["2026-09-01", 52.49, "Leroy Merlin ZAKUP PRZY UŻYCIU KARTY W KRAJU", "out"],
    ["2026-09-01", 4.5, "ACTIVE FLOW ARENA ZAKUP PRZY UŻYCIU KARTY W KRAJU", "out"],
    ["2026-09-01", 40, "HTTPS://APP.FITSSEY.COM/A BLIK ZAKUP E-COMMERCE", "out"],
  ];
  return rows.map(([date, amount, title, direction]) => ({
    id: uid("tr"),
    statementId,
    date,
    amount,
    title,
    sender: "",
    raw: `${date} ${amount.toFixed(2)} ${title}`,
    direction,
    ignored: direction === "out",
  }));
}
