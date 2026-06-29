declare module DungCu {
  export interface IRecord {
    maDungCu: string;
    tenDungCu: string;
    monHoc: 'vat-ly' | 'hoa-hoc' | 'toan-hoc';
    lop: number;
    chuong: string;
    chuDe: string;
    loai: 'co-dinh' | 'dao-dong' | 'vat-ran' | 'chat-long' | 'chat-khi' | 'do-luong' | 'hien-thi' | 'thuy-tinh' | 'phan-ung';
    component: React.FC<IPropsDungCu>;
    kichThuocVaCham: [number, number, number] | ((thuocTinh: Record<string, any>) => [number, number, number]);
    viTriY: number;
    coDinh: boolean;
    diemSnap?: (thuocTinh: Record<string, any>) => IDiemSnap[];
    nhan: string;
    thuocTinh: IThuocTinh[];
    dieuKhien?: IDieuKhien[];
    thoiGianThuc?: (thuocTinh: Record<string, any>, dangChay: boolean) => IGiaTriThoiGianThuc | null;
  }

  export interface IPropsDungCu {
    doiTuong: Scene.Object;
    dangChay?: boolean;
    capNhatViTri?: (id: string, viTri: [number, number, number]) => void;
    doThiScene?: Scene.IRecord | null;
  }

  export interface IDiemSnap {
    id: string;
    viTri: [number, number, number];
    loai: string;
    nhan: string;
    ketNoiDen: string[];
  }

  export interface IThuocTinh {
    khoa: string;
    nhan: string;
    loai: 'so' | 'mau' | 'chon' | 'bat-tat' | 'thong-tin';
    macDinh: any;
    nhoNhat?: number;
    lonNhat?: number;
    buoc?: number;
    luaChon?: { nhan: string; giaTri: any }[];
  }

  export interface IDieuKhien {
    id: string;
    loai: 'nut' | 'bat-tat' | 'nui-xoay';
    nhan: string;
    viTri: [number, number, number];
    kichThuoc?: number;
    trangThaiMacDinh?: boolean | number;
    hanhDong: {
      loai: 'dat-thuoc-tinh' | 'tuy-chinh';
      khoa?: string;
      giaTriBat?: any;
      giaTriTat?: any;
    };
  }

  export interface IGiaTriThoiGianThuc {
    nhan: string;
    giaTri: string;
    mau?: string;
  }
}
