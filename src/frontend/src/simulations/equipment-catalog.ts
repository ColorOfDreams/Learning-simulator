export interface EquipmentDef {
  id: string;
  name: string;
  subject: 'physics' | 'chemistry' | 'math';
  grade: 10 | 11 | 12;
  chapter: string;
  chapterName: string;
  topic: string;
  topicName: string;
  type: string;
  connections: string[];
}

export const GRADE_OPTIONS = [
  { value: 10, label: 'Lớp 10' },
  { value: 11, label: 'Lớp 11' },
  { value: 12, label: 'Lớp 12' },
] as const;

export const CHAPTERS: Record<string, { value: string; label: string; grade: number; subject: string }[]> = {
  physics: [
    { value: 'chuong-1-dao-dong', label: 'Chương 1: Dao động', grade: 11, subject: 'physics' },
    { value: 'chuong-2-song-co', label: 'Chương 2: Sóng cơ', grade: 11, subject: 'physics' },
    { value: 'chuong-3-dien-tu', label: 'Chương 3: Điện từ', grade: 11, subject: 'physics' },
    { value: 'chuong-1-dong-hoc', label: 'Chương 1: Động học', grade: 10, subject: 'physics' },
    { value: 'chuong-2-dong-luc-hoc', label: 'Chương 2: Động lực học', grade: 10, subject: 'physics' },
    { value: 'chuong-1-dao-dong-dien-tu', label: 'Chương 1: Dao động điện từ', grade: 12, subject: 'physics' },
  ],
  chemistry: [
    { value: 'chuong-1-nguyen-tu', label: 'Chương 1: Nguyên tử', grade: 10, subject: 'chemistry' },
    { value: 'chuong-2-bang-tuan-hoan', label: 'Chương 2: Bảng tuần hoàn', grade: 10, subject: 'chemistry' },
    { value: 'chuong-3-phan-ung-hoa-hoc', label: 'Chương 3: Phản ứng hóa học', grade: 10, subject: 'chemistry' },
    { value: 'chuong-1-axit-bazo', label: 'Chương 1: Axit - Bazơ', grade: 11, subject: 'chemistry' },
    { value: 'chuong-2-nhom-halogen', label: 'Chương 2: Nhóm Halogen', grade: 11, subject: 'chemistry' },
  ],
  math: [
    { value: 'chuong-1-dai-so', label: 'Chương 1: Đại số', grade: 11, subject: 'math' },
    { value: 'chuong-2-hinh-hoc', label: 'Chương 2: Hình học', grade: 11, subject: 'math' },
    { value: 'chuong-3-luong-giac', label: 'Chương 3: Lượng giác', grade: 11, subject: 'math' },
  ],
};

export const TOPICS: Record<string, { value: string; label: string; chapter: string }[]> = {
  'chuong-1-dao-dong': [
    { value: 'dao-dong-dieu-hoa', label: 'Dao động điều hòa', chapter: 'chuong-1-dao-dong' },
    { value: 'con-lac-lo-xo', label: 'Con lắc lò xo', chapter: 'chuong-1-dao-dong' },
    { value: 'con-lac-don', label: 'Con lắc đơn', chapter: 'chuong-1-dao-dong' },
    { value: 'dao-dong-tat-dan', label: 'Dao động tắt dần', chapter: 'chuong-1-dao-dong' },
    { value: 'dao-dong-cuong-buc', label: 'Dao động cưỡng bức', chapter: 'chuong-1-dao-dong' },
  ],
  'chuong-3-phan-ung-hoa-hoc': [{ value: 'phan-ung-hoa-hoc', label: 'Phản ứng hóa học', chapter: 'chuong-3-phan-ung-hoa-hoc' }],
  'chuong-2-nhom-halogen': [{ value: 'nhom-halogen', label: 'Nhóm Halogen', chapter: 'chuong-2-nhom-halogen' }],
  'chuong-2-hinh-hoc': [{ value: 'hinh-hoc-phang', label: 'Hình học phẳng', chapter: 'chuong-2-hinh-hoc' }],
  'chuong-3-luong-giac': [{ value: 'luong-giac', label: 'Lượng giác', chapter: 'chuong-3-luong-giac' }],
};

export const EQUIPMENT_TYPES = [
  { value: 'co-dinh', label: 'Cố định' },
  { value: 'dao-dong', label: 'Dao động' },
  { value: 'vat-ran', label: 'Vật rắn' },
  { value: 'chat-long', label: 'Chất lỏng' },
  { value: 'chat-khi', label: 'Chất khí' },
  { value: 'do-luong', label: 'Đo lường' },
  { value: 'hien-thi', label: 'Hiển thị' },
  { value: 'thuy-tinh', label: 'Thủy tinh' },
  { value: 'phan-ung', label: 'Phản ứng' },
];

export const ALL_EQUIPMENT: EquipmentDef[] = [
  {
    id: 'Stand', name: 'Giá đỡ tĩnh', subject: 'physics', grade: 11,
    chapter: 'chuong-1-dao-dong', chapterName: 'Chương 1: Dao động',
    topic: 'dao-dong-dieu-hoa', topicName: 'Dao động điều hòa',
    type: 'co-dinh', connections: ['clamp'],
  },
  {
    id: 'SimplePendulum', name: 'Con lắc đơn', subject: 'physics', grade: 11,
    chapter: 'chuong-1-dao-dong', chapterName: 'Chương 1: Dao động',
    topic: 'con-lac-don', topicName: 'Con lắc đơn',
    type: 'dao-dong', connections: ['anchor'],
  },
  {
    id: 'SpringPendulum', name: 'Con lắc lò xo', subject: 'physics', grade: 11,
    chapter: 'chuong-1-dao-dong', chapterName: 'Chương 1: Dao động',
    topic: 'con-lac-lo-xo', topicName: 'Con lắc lò xo',
    type: 'dao-dong', connections: ['anchor'],
  },
  {
    id: 'Spring', name: 'Lò xo', subject: 'physics', grade: 11,
    chapter: 'chuong-1-dao-dong', chapterName: 'Chương 1: Dao động',
    topic: 'dao-dong-dieu-hoa', topicName: 'Dao động điều hòa',
    type: 'dao-dong', connections: ['spring_top', 'spring_bottom'],
  },
  {
    id: 'MassBlock', name: 'Vật nặng', subject: 'physics', grade: 11,
    chapter: 'chuong-1-dao-dong', chapterName: 'Chương 1: Dao động',
    topic: 'dao-dong-dieu-hoa', topicName: 'Dao động điều hòa',
    type: 'vat-ran', connections: ['hook_top', 'hook_bottom'],
  },
  {
    id: 'WoodenBlock', name: 'Khối gỗ', subject: 'physics', grade: 11,
    chapter: 'chuong-1-dao-dong', chapterName: 'Chương 1: Dao động',
    topic: 'dao-dong-dieu-hoa', topicName: 'Dao động điều hòa',
    type: 'vat-ran', connections: [],
  },
  {
    id: 'Stopwatch', name: 'Đồng hồ bấm giờ', subject: 'physics', grade: 11,
    chapter: 'chuong-1-dao-dong', chapterName: 'Chương 1: Dao động',
    topic: 'dao-dong-dieu-hoa', topicName: 'Dao động điều hòa',
    type: 'do-luong', connections: [],
  },
  {
    id: 'Ruler', name: 'Thước đo', subject: 'physics', grade: 11,
    chapter: 'chuong-1-dao-dong', chapterName: 'Chương 1: Dao động',
    topic: 'dao-dong-dieu-hoa', topicName: 'Dao động điều hòa',
    type: 'do-luong', connections: [],
  },
  {
    id: 'Protractor', name: 'Thước đo góc', subject: 'physics', grade: 11,
    chapter: 'chuong-1-dao-dong', chapterName: 'Chương 1: Dao động',
    topic: 'dao-dong-dieu-hoa', topicName: 'Dao động điều hòa',
    type: 'do-luong', connections: [],
  },
  {
    id: 'Dashpot', name: 'Bộ giảm chấn', subject: 'physics', grade: 11,
    chapter: 'chuong-1-dao-dong', chapterName: 'Chương 1: Dao động',
    topic: 'dao-dong-tat-dan', topicName: 'Dao động tắt dần',
    type: 'dao-dong', connections: ['dashpot_top', 'dashpot_bottom'],
  },
  {
    id: 'DrivingMotor', name: 'Động cơ rung', subject: 'physics', grade: 11,
    chapter: 'chuong-1-dao-dong', chapterName: 'Chương 1: Dao động',
    topic: 'dao-dong-cuong-buc', topicName: 'Dao động cưỡng bức',
    type: 'dao-dong', connections: ['motor_output'],
  },
  {
    id: 'EnergyMeter', name: 'Đồng hồ năng lượng', subject: 'physics', grade: 11,
    chapter: 'chuong-1-dao-dong', chapterName: 'Chương 1: Dao động',
    topic: 'dao-dong-dieu-hoa', topicName: 'Dao động điều hòa',
    type: 'hien-thi', connections: [],
  },
  {
    id: 'Beaker', name: 'Cốc thủy tinh', subject: 'chemistry', grade: 11,
    chapter: 'chuong-1-axit-bazo', chapterName: 'Chương 1: Axit - Bazơ',
    topic: 'axit-bazo', topicName: 'Axit - Bazơ',
    type: 'thuy-tinh', connections: [],
  },
  {
    id: 'TestTube', name: 'Ống nghiệm', subject: 'chemistry', grade: 11,
    chapter: 'chuong-3-phan-ung-hoa-hoc', chapterName: 'Chương 3: Phản ứng hóa học',
    topic: 'phan-ung-hoa-hoc', topicName: 'Phản ứng hóa học',
    type: 'thuy-tinh', connections: [],
  },
  {
    id: 'ErlenmeyerFlask', name: 'Bình tam giác', subject: 'chemistry', grade: 11,
    chapter: 'chuong-3-phan-ung-hoa-hoc', chapterName: 'Chương 3: Phản ứng hóa học',
    topic: 'phan-ung-hoa-hoc', topicName: 'Phản ứng hóa học',
    type: 'thuy-tinh', connections: [],
  },
  {
    id: 'RoundFlask', name: 'Bình cầu', subject: 'chemistry', grade: 11,
    chapter: 'chuong-3-phan-ung-hoa-hoc', chapterName: 'Chương 3: Phản ứng hóa học',
    topic: 'phan-ung-hoa-hoc', topicName: 'Phản ứng hóa học',
    type: 'thuy-tinh', connections: [],
  },
  {
    id: 'BunsenBurner', name: 'Đèn cồn', subject: 'chemistry', grade: 11,
    chapter: 'chuong-3-phan-ung-hoa-hoc', chapterName: 'Chương 3: Phản ứng hóa học',
    topic: 'phan-ung-hoa-hoc', topicName: 'Phản ứng hóa học',
    type: 'co-dinh', connections: [],
  },
  {
    id: 'ChemicalSolid', name: 'Chất rắn', subject: 'chemistry', grade: 11,
    chapter: 'chuong-3-phan-ung-hoa-hoc', chapterName: 'Chương 3: Phản ứng hóa học',
    topic: 'phan-ung-hoa-hoc', topicName: 'Phản ứng hóa học',
    type: 'vat-ran', connections: ['chemical'],
  },
  {
    id: 'ChemicalLiquid', name: 'Chất lỏng', subject: 'chemistry', grade: 11,
    chapter: 'chuong-3-phan-ung-hoa-hoc', chapterName: 'Chương 3: Phản ứng hóa học',
    topic: 'phan-ung-hoa-hoc', topicName: 'Phản ứng hóa học',
    type: 'chat-long', connections: ['chemical'],
  },
  {
    id: 'ChemicalGas', name: 'Chất khí', subject: 'chemistry', grade: 11,
    chapter: 'chuong-3-phan-ung-hoa-hoc', chapterName: 'Chương 3: Phản ứng hóa học',
    topic: 'phan-ung-hoa-hoc', topicName: 'Phản ứng hóa học',
    type: 'chat-khi', connections: ['chemical'],
  },
  {
    id: 'NuocCat', name: 'Nước cất (H2O)', subject: 'chemistry', grade: 11,
    chapter: 'chuong-1-axit-bazo', chapterName: 'Chương 1: Axit - Bazơ',
    topic: 'axit-bazo', topicName: 'Axit - Bazơ',
    type: 'chat-long', connections: ['chemical'],
  },
  {
    id: 'AxitClohidric', name: 'Axit clohidric (HCl)', subject: 'chemistry', grade: 10,
    chapter: 'chuong-3-phan-ung-hoa-hoc', chapterName: 'Chương 3: Phản ứng hóa học',
    topic: 'phan-ung-hoa-hoc', topicName: 'Phản ứng hóa học',
    type: 'chat-long', connections: ['chemical'],
  },
  {
    id: 'NatriHidroxit', name: 'Natri hidroxit (NaOH)', subject: 'chemistry', grade: 10,
    chapter: 'chuong-3-phan-ung-hoa-hoc', chapterName: 'Chương 3: Phản ứng hóa học',
    topic: 'phan-ung-hoa-hoc', topicName: 'Phản ứng hóa học',
    type: 'chat-long', connections: ['chemical'],
  },
  {
    id: 'AxitSunfuric', name: 'Axit sunfuric (H2SO4)', subject: 'chemistry', grade: 10,
    chapter: 'chuong-3-phan-ung-hoa-hoc', chapterName: 'Chương 3: Phản ứng hóa học',
    topic: 'phan-ung-hoa-hoc', topicName: 'Phản ứng hóa học',
    type: 'chat-long', connections: ['chemical'],
  },
  {
    id: 'DongSunfat', name: 'Đồng (II) sunfat (CuSO4)', subject: 'chemistry', grade: 10,
    chapter: 'chuong-3-phan-ung-hoa-hoc', chapterName: 'Chương 3: Phản ứng hóa học',
    topic: 'phan-ung-hoa-hoc', topicName: 'Phản ứng hóa học',
    type: 'chat-long', connections: ['chemical'],
  },
  {
    id: 'Phenolphtalein', name: 'Phenolphthalein', subject: 'chemistry', grade: 11,
    chapter: 'chuong-1-axit-bazo', chapterName: 'Chương 1: Axit - Bazơ',
    topic: 'axit-bazo', topicName: 'Axit - Bazơ',
    type: 'chat-long', connections: ['chemical'],
  },
  {
    id: 'QuyTim', name: 'Quỳ tím', subject: 'chemistry', grade: 11,
    chapter: 'chuong-1-axit-bazo', chapterName: 'Chương 1: Axit - Bazơ',
    topic: 'axit-bazo', topicName: 'Axit - Bazơ',
    type: 'chat-long', connections: ['chemical'],
  },
  {
    id: 'CoordinatePlane', name: 'Mặt phẳng tọa độ', subject: 'math', grade: 11,
    chapter: 'chuong-2-hinh-hoc', chapterName: 'Chương 2: Hình học',
    topic: 'hinh-hoc-phang', topicName: 'Hình học phẳng',
    type: 'hien-thi', connections: [],
  },
  {
    id: 'ParabolaGraph', name: 'Đồ thị Parabol', subject: 'math', grade: 11,
    chapter: 'chuong-1-dai-so', chapterName: 'Chương 1: Đại số',
    topic: 'dai-so', topicName: 'Đại số',
    type: 'hien-thi', connections: [],
  },
  {
    id: 'TrigWave', name: 'Sóng lượng giác', subject: 'math', grade: 11,
    chapter: 'chuong-3-luong-giac', chapterName: 'Chương 3: Lượng giác',
    topic: 'luong-giac', topicName: 'Lượng giác',
    type: 'hien-thi', connections: [],
  },
  {
    id: 'GeometryTriangle', name: 'Tam giác', subject: 'math', grade: 11,
    chapter: 'chuong-2-hinh-hoc', chapterName: 'Chương 2: Hình học',
    topic: 'hinh-hoc-phang', topicName: 'Hình học phẳng',
    type: 'dao-dong', connections: [],
  },
  {
    id: 'GeometryCircle', name: 'Đường tròn', subject: 'math', grade: 11,
    chapter: 'chuong-2-hinh-hoc', chapterName: 'Chương 2: Hình học',
    topic: 'hinh-hoc-phang', topicName: 'Hình học phẳng',
    type: 'dao-dong', connections: [],
  },
  {
    id: 'Vector2D', name: 'Vector 2D', subject: 'math', grade: 11,
    chapter: 'chuong-2-hinh-hoc', chapterName: 'Chương 2: Hình học',
    topic: 'hinh-hoc-phang', topicName: 'Hình học phẳng',
    type: 'hien-thi', connections: [],
  },
  {
    id: 'FunctionPlotter', name: 'Bảng vẽ đồ thị', subject: 'math', grade: 11,
    chapter: 'chuong-1-dai-so', chapterName: 'Chương 1: Đại số',
    topic: 'dai-so', topicName: 'Đại số',
    type: 'hien-thi', connections: [],
  },
  {
    id: 'StatisticsChart', name: 'Biểu đồ thống kê', subject: 'math', grade: 11,
    chapter: 'chuong-1-dai-so', chapterName: 'Chương 1: Đại số',
    topic: 'dai-so', topicName: 'Đại số',
    type: 'hien-thi', connections: [],
  },
];

export const INITIAL_Y: Record<string, number> = {
  WoodenBlock: 0.15, Beaker: 0.4, Stand: 1.9,
  SimplePendulum: 1.5, SpringPendulum: 1.5, Spring: 1.5,
  MassBlock: 0.2, Stopwatch: 0.1, Ruler: 0.05, Protractor: 0.05,
  Dashpot: 0.5, DrivingMotor: 0.2, EnergyMeter: 0.05,
  TestTube: 0.2, ErlenmeyerFlask: 0.3, RoundFlask: 0.4, BunsenBurner: 0.1, ChemicalSolid: 0.1, ChemicalLiquid: 0.2, ChemicalGas: 0.5,
  NuocCat: 0.2, AxitClohidric: 0.2, NatriHidroxit: 0.2, AxitSunfuric: 0.2, AxitSunfuricDac: 0.2, DongSunfat: 0.2, Phenolphtalein: 0.2, QuyTim: 0.2,
  CoordinatePlane: 0.05, ParabolaGraph: 0.05, TrigWave: 0.05, GeometryTriangle: 0.05, GeometryCircle: 0.05, Vector2D: 0.05, FunctionPlotter: 0.05, StatisticsChart: 0.05,
};

