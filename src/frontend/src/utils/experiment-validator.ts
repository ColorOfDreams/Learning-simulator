interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export function validateExperiment(objects: Scene.Object[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];

  if (!objects || objects.length === 0) {
    errors.push('Chưa chọn dụng cụ nào. Vui lòng chọn ít nhất 1 dụng cụ.');
    return { valid: false, errors, warnings, suggestions };
  }

  const ids = new Set(objects.map((o) => o.modelName));
  const hasStand = ids.has('Stand');
  const pendulumTypes = ['SimplePendulum', 'SpringPendulum', 'Spring'];
  const pendulums = objects.filter((o) => pendulumTypes.includes(o.modelName));
  const chemicalTypes = ['ChemicalSolid', 'ChemicalLiquid', 'ChemicalGas'];
  const chemicals = objects.filter((o) => chemicalTypes.includes(o.modelName));
  const containers = ['Beaker', 'TestTube', 'ErlenmeyerFlask', 'RoundFlask', 'Burette'];
  const hasContainer = objects.some((o) => containers.includes(o.modelName));
  const hasMeasuringTool = ids.has('Stopwatch') || ids.has('Thermometer');
  const mathTypes = ['CoordinatePlane', 'ParabolaGraph', 'TrigWave', 'GeometryTriangle', 'GeometryCircle', 'Vector2D', 'FunctionPlotter', 'StatisticsChart'];
  const mathObjects = objects.filter((o) => mathTypes.includes(o.modelName));
  const physicsTypes = ['WoodenBlock', 'Stand', 'SimplePendulum', 'SpringPendulum', 'Spring', 'MassBlock', 'Dashpot', 'DrivingMotor', 'EnergyMeter'];
  const chemGlassware = ['Beaker', 'TestTube', 'ErlenmeyerFlask', 'RoundFlask', 'Burette', 'Pipette', 'Condenser'];
  const hasPhysics = objects.some((o) => physicsTypes.includes(o.modelName));
  const hasChemistry = objects.some((o) => chemGlassware.includes(o.modelName) || chemicalTypes.includes(o.modelName));

  // Errors (block save)
  if (pendulums.length > 0 && !hasStand) {
    const name = pendulums.map((p) => {
      if (p.modelName === 'SimplePendulum') return 'Con lắc đơn';
      if (p.modelName === 'SpringPendulum') return 'Con lắc lò xo';
      return 'Lò xo';
    }).join(', ');
    errors.push(`Cần thêm Giá đỡ để treo ${name}. Giá đỡ có điểm kẹp để gắn dụng cụ dao động.`);
    suggestions.push('Stand');
  }

  if (chemicals.length > 0 && !hasContainer) {
    errors.push('Cần thêm dụng cụ chứa (Cốc thủy tinh, Ống nghiệm, Bình tam giác...) để chứa hóa chất.');
    suggestions.push('Beaker');
  }

  // Warnings (can bypass)
  if (objects.length === 1 && !hasMeasuringTool && !mathObjects.length) {
    warnings.push('Chỉ có 1 dụng cụ. Nên thêm ít nhất 1 dụng cụ nữa để có thể tương tác.');
  }

  if (hasStand && objects.length === 1) {
    warnings.push('Giá đỡ cần có dụng cụ treo (con lắc, lò xo) để tạo thí nghiệm.');
  }

  if (hasPhysics && hasChemistry) {
    warnings.push('Bạn đang kết hợp dụng cụ Vật lý và Hóa học. Hai môn này có môi trường phòng khác nhau.');
  }

  if (hasMeasuringTool && objects.length <= 2 && !pendulums.length && !chemicals.length && !mathObjects.length) {
    warnings.push('Dụng cụ đo lường cần có đối tượng để đo. Hãy thêm dụng cụ thí nghiệm.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    suggestions,
  };
}
