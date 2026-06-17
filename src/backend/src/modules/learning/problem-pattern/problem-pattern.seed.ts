import { ProblemPatternEntity } from './problem-pattern.entity';

export const problemPatternSeed: Partial<ProblemPatternEntity>[] = [
  {
    patternId: 'SHM_IDENTIFY_PARAMETERS',
    subject: 'physics',
    grade: 11,
    chapter: 'dao_dong',
    topic: 'simple_harmonic_motion',
    name: 'Xác định tham số từ phương trình dao động',
    description:
      'Dạng bài yêu cầu học sinh so sánh phương trình đã cho với dạng chuẩn x = A cos(ωt + φ) để xác định biên độ A, tần số góc ω và pha ban đầu φ.',
    mainFormula: 'x = A cos(ωt + φ)',
    requiredParameters: [],
    optionalParameters: ['A', 'omega', 'phi'],
    target: ['A', 'omega', 'phi'],
    simulationId: 'SIM_SHM_BASIC',
    levels: [
      {
        level: 'recognition',
        description: 'Nhận biết A, ω, φ từ phương trình đơn giản.',
        generationInstruction:
          'Tạo phương trình dao động dạng x = A cos(ωt + φ), yêu cầu xác định A, ω, φ.',
      },
      {
        level: 'understanding',
        description: 'Xác định tham số và giải thích ý nghĩa của từng tham số.',
        generationInstruction:
          'Tạo bài yêu cầu học sinh xác định A, ω, φ và nêu ý nghĩa vật lí của từng đại lượng.',
      },
      {
        level: 'application',
        description: 'Xác định tham số rồi tính thêm T hoặc f.',
        generationInstruction:
          'Tạo bài có phương trình dao động, yêu cầu xác định A, ω, φ và tính chu kì T.',
      },
      {
        level: 'high_application',
        description: 'Kết hợp xác định tham số với phân tích pha hoặc đồ thị.',
        generationInstruction:
          'Tạo bài yêu cầu xác định tham số và suy luận thêm về trạng thái ban đầu hoặc chiều chuyển động.',
      },
    ],
    examples: [
      {
        level: 'recognition',
        question:
          'Một vật dao động điều hòa theo phương trình x = 6cos(2πt) cm. Xác định biên độ và tần số góc.',
        answer: 'A = 6 cm, ω = 2π rad/s.',
      },
    ],
    metadata: {
      formulaKeys: ['SHM_POSITION'],
      conceptKeys: ['amplitude', 'angular_frequency', 'phase'],
      skillKeys: ['identify_parameters_from_equation'],
      tags: ['dao_dong_dieu_hoa', 'phuong_trinh_dao_dong'],
    },
    isActive: true,
  },

  {
    patternId: 'SHM_FIND_PERIOD_FROM_EQUATION',
    subject: 'physics',
    grade: 11,
    chapter: 'dao_dong',
    topic: 'simple_harmonic_motion',
    name: 'Tìm chu kì từ phương trình dao động',
    description:
      'Dạng bài yêu cầu xác định tần số góc ω từ phương trình x = A cos(ωt + φ), sau đó dùng công thức T = 2π / ω để tính chu kì.',
    mainFormula: 'T = 2π / ω',
    requiredParameters: ['omega'],
    optionalParameters: ['A', 'phi'],
    target: ['T'],
    simulationId: 'SIM_SHM_BASIC',
    levels: [
      {
        level: 'recognition',
        description: 'Xác định được ω từ phương trình dao động.',
        generationInstruction:
          'Tạo bài cho phương trình x = A cos(ωt + φ), chỉ yêu cầu xác định ω.',
      },
      {
        level: 'understanding',
        description: 'Tính chu kì T từ tần số góc ω.',
        generationInstruction:
          'Tạo bài cho phương trình dao động, yêu cầu học sinh tính T = 2π / ω.',
      },
      {
        level: 'application',
        description:
          'Tính T rồi kết hợp tính f hoặc trạng thái tại một thời điểm.',
        generationInstruction:
          'Tạo bài yêu cầu tính chu kì, tần số, hoặc li độ tại một thời điểm sau khi xác định ω.',
      },
      {
        level: 'high_application',
        description:
          'Kết hợp chu kì với pha, thời điểm hoặc chiều chuyển động.',
        generationInstruction:
          'Tạo bài có phương trình dao động và yêu cầu suy luận thời điểm vật đi qua một vị trí cho trước.',
      },
    ],
    examples: [
      {
        level: 'understanding',
        question:
          'Một vật dao động điều hòa theo phương trình x = 5cos(4πt + π/3) cm. Tìm chu kì dao động.',
        answer: 'ω = 4π rad/s, T = 2π / 4π = 0,5 s.',
      },
    ],
    metadata: {
      formulaKeys: ['PERIOD_ANGULAR_FREQUENCY'],
      conceptKeys: ['period', 'angular_frequency'],
      skillKeys: ['find_period_from_equation'],
      tags: ['chu_ki', 'omega'],
    },
    isActive: true,
  },

  {
    patternId: 'SHM_POSITION_AT_TIME',
    subject: 'physics',
    grade: 11,
    chapter: 'dao_dong',
    topic: 'simple_harmonic_motion',
    name: 'Tính li độ tại một thời điểm',
    description:
      'Dạng bài yêu cầu thay thời điểm t vào phương trình x = A cos(ωt + φ) để tính li độ x.',
    mainFormula: 'x = A cos(ωt + φ)',
    requiredParameters: ['A', 'omega', 'phi', 't'],
    optionalParameters: [],
    target: ['x'],
    simulationId: 'SIM_SHM_BASIC',
    levels: [
      {
        level: 'recognition',
        description: 'Xác định các đại lượng A, ω, φ, t từ đề.',
        generationInstruction:
          'Tạo bài đơn giản yêu cầu chỉ ra các tham số trong phương trình và thời điểm cần xét.',
      },
      {
        level: 'understanding',
        description: 'Thay t vào phương trình để tính li độ.',
        generationInstruction:
          'Tạo bài có phương trình dao động và một thời điểm t, yêu cầu tính x.',
      },
      {
        level: 'application',
        description:
          'Tính li độ kết hợp đổi đơn vị hoặc giá trị lượng giác đặc biệt.',
        generationInstruction:
          'Tạo bài yêu cầu tính x tại thời điểm có pha là giá trị lượng giác quen thuộc như 0, π/2, π, 3π/2.',
      },
      {
        level: 'high_application',
        description: 'Suy luận thời điểm hoặc trạng thái dựa trên li độ.',
        generationInstruction:
          'Tạo bài yêu cầu tìm thời điểm vật có li độ cho trước hoặc so sánh trạng thái tại nhiều thời điểm.',
      },
    ],
    examples: [
      {
        level: 'application',
        question:
          'Một vật dao động điều hòa theo phương trình x = 6cos(πt) cm. Tính li độ tại t = 1 s.',
        answer: 'x = 6cos(π) = -6 cm.',
      },
    ],
    metadata: {
      formulaKeys: ['SHM_POSITION'],
      conceptKeys: ['position', 'phase'],
      skillKeys: ['calculate_position_at_time'],
      tags: ['li_do', 'thoi_diem'],
    },
    isActive: true,
  },

  {
    patternId: 'SHM_MAX_VELOCITY',
    subject: 'physics',
    grade: 11,
    chapter: 'dao_dong',
    topic: 'simple_harmonic_motion',
    name: 'Tính vận tốc cực đại',
    description:
      'Dạng bài yêu cầu dùng công thức vmax = ωA để tính vận tốc cực đại trong dao động điều hòa.',
    mainFormula: 'vmax = ωA',
    requiredParameters: ['A', 'omega'],
    optionalParameters: [],
    target: ['vmax'],
    simulationId: 'SIM_SHM_BASIC',
    levels: [
      {
        level: 'recognition',
        description: 'Nhận biết công thức vận tốc cực đại.',
        generationInstruction:
          'Tạo bài hỏi công thức tính vận tốc cực đại trong dao động điều hòa.',
      },
      {
        level: 'understanding',
        description: 'Tính vmax khi đã biết A và ω.',
        generationInstruction: 'Tạo bài cho A và ω, yêu cầu tính vmax = ωA.',
      },
      {
        level: 'application',
        description: 'Tính vmax có kèm đổi đơn vị biên độ.',
        generationInstruction:
          'Tạo bài cho A theo cm, yêu cầu đổi sang m nếu cần và tính vận tốc cực đại.',
      },
      {
        level: 'high_application',
        description:
          'Kết hợp vmax với năng lượng hoặc vận tốc tại vị trí bất kì.',
        generationInstruction:
          'Tạo bài kết hợp vận tốc cực đại với công thức v² = ω²(A² - x²) ở mức nâng cao.',
      },
    ],
    examples: [
      {
        level: 'understanding',
        question:
          'Một vật dao động điều hòa với biên độ A = 4 cm và tần số góc ω = 5 rad/s. Tính vận tốc cực đại.',
        answer: 'vmax = ωA = 5 × 4 = 20 cm/s.',
      },
    ],
    metadata: {
      formulaKeys: ['SHM_MAX_VELOCITY'],
      conceptKeys: ['velocity', 'amplitude', 'angular_frequency'],
      skillKeys: ['calculate_max_velocity'],
      tags: ['van_toc_cuc_dai'],
    },
    isActive: true,
  },

  {
    patternId: 'SHM_ENERGY_BASIC',
    subject: 'physics',
    grade: 11,
    chapter: 'dao_dong',
    topic: 'shm_energy',
    name: 'Tính cơ năng dao động điều hòa',
    description:
      'Dạng bài yêu cầu tính cơ năng của con lắc lò xo dao động điều hòa bằng công thức W = 1/2 kA².',
    mainFormula: 'W = 1/2 kA²',
    requiredParameters: ['k', 'A'],
    optionalParameters: [],
    target: ['W'],
    simulationId: 'SIM_SHM_ENERGY',
    levels: [
      {
        level: 'recognition',
        description: 'Nhận biết công thức cơ năng của con lắc lò xo.',
        generationInstruction:
          'Tạo bài hỏi công thức tính cơ năng W = 1/2 kA².',
      },
      {
        level: 'understanding',
        description: 'Tính W khi biết k và A.',
        generationInstruction: 'Tạo bài cho k và A, yêu cầu tính cơ năng.',
      },
      {
        level: 'application',
        description: 'Tính cơ năng có kèm đổi đơn vị biên độ.',
        generationInstruction:
          'Tạo bài cho A theo cm, yêu cầu đổi sang m rồi tính W.',
      },
      {
        level: 'high_application',
        description:
          'Kết hợp cơ năng với động năng hoặc thế năng tại vị trí x.',
        generationInstruction:
          'Tạo bài yêu cầu tính cơ năng, sau đó tính động năng hoặc thế năng tại một li độ cho trước.',
      },
    ],
    examples: [
      {
        level: 'application',
        question:
          'Một con lắc lò xo có độ cứng k = 20 N/m, dao động điều hòa với biên độ A = 0,1 m. Tính cơ năng.',
        answer: 'W = 1/2 × 20 × (0,1)² = 0,1 J.',
      },
    ],
    metadata: {
      formulaKeys: ['SHM_TOTAL_ENERGY'],
      conceptKeys: ['energy', 'spring_oscillator'],
      skillKeys: ['calculate_total_energy'],
      tags: ['nang_luong', 'co_nang'],
    },
    isActive: true,
  },
];
