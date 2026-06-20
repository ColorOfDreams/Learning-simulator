const THANH_GHI_DUNG_CU: Record<string, DungCu.IRecord> = {};

export function dangKy(dungCu: DungCu.IRecord) {
  THANH_GHI_DUNG_CU[dungCu.maDungCu] = dungCu;
}

export function layDungCu(ma: string): DungCu.IRecord | undefined {
  return THANH_GHI_DUNG_CU[ma];
}

export function layTatCa(): DungCu.IRecord[] {
  return Object.values(THANH_GHI_DUNG_CU);
}

export function layTheoMon(monHoc: string): DungCu.IRecord[] {
  return Object.values(THANH_GHI_DUNG_CU).filter((d) => d.monHoc === monHoc);
}
