declare namespace DanhMuc {
  interface BaseRecord {
    id: string;
    _id?: string;
    createdAt?: string;
    updatedAt?: string;
    name: string;
    code: string;
    description?: string;
  }

  interface MonHoc extends BaseRecord {}

  interface Lop extends BaseRecord {}

  interface LoaiCauHoi extends BaseRecord {}

  interface DoKho extends BaseRecord {}

  interface ChuDe extends BaseRecord {
    subjectCode?: string;
    gradeCode?: string;
  }
}
