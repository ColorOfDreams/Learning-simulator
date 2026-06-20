import React, { useState, useEffect } from 'react';
import { Button, InputNumber, Popconfirm } from 'antd';
import {
  CloseOutlined, SettingOutlined, PlayCircleOutlined, PauseCircleOutlined,
  FieldTimeOutlined, UndoOutlined, DeleteOutlined,
} from '@ant-design/icons';
import MiniPreview from '@/simulations/components/MiniPreview';
import { findChemical } from '@/simulations/chemicals-catalog';
import './EquipmentDetail.less';

interface Props {
  objectId: string | null;
  sceneGraph: Scene.IRecord | null;
  isPlaying: boolean;
  onClose: () => void;
  onUpdateProperty: (objectId: string, key: string, value: any) => void;
  onUpdateAllProperties: (objectId: string, props: Record<string, any>) => void;
}

const LABELS: Record<string, string> = {
  Stand: 'Giá đỡ', SimplePendulum: 'Con lắc đơn', SpringPendulum: 'Con lắc lò xo',
  Spring: 'Lò xo', MassBlock: 'Vật nặng', WoodenBlock: 'Khối gỗ',
  Stopwatch: 'Đồng hồ bấm giờ', Ruler: 'Thước đo', Protractor: 'Thước đo góc',
  Dashpot: 'Bộ giảm chấn', DrivingMotor: 'Động cơ rung', EnergyMeter: 'Đồng hồ năng lượng',
  Beaker: 'Cốc thủy tinh', TestTube: 'Ống nghiệm', ErlenmeyerFlask: 'Bình tam giác',
  RoundFlask: 'Bình cầu', Burette: 'Buret', Pipette: 'Pipet',
  Thermometer: 'Nhiệt kế', BunsenBurner: 'Đèn cồn', pHMeter: 'Máy đo pH',
  Condenser: 'Ống sinh hàn', Mortar: 'Cối chày',
  ChemicalSolid: 'Chất rắn', ChemicalLiquid: 'Chất lỏng', ChemicalGas: 'Chất khí',
  CoordinatePlane: 'Mặt phẳng tọa độ', ParabolaGraph: 'Đồ thị Parabol',
  TrigWave: 'Sóng lượng giác', GeometryTriangle: 'Tam giác',
  GeometryCircle: 'Đường tròn', Vector2D: 'Vector 2D',
  FunctionPlotter: 'Bảng vẽ đồ thị', StatisticsChart: 'Biểu đồ thống kê',
};

const EquipmentDetail: React.FC<Props> = ({ objectId, sceneGraph, isPlaying, onClose, onUpdateProperty, onUpdateAllProperties }) => {
  const object = sceneGraph?.objects?.find((o) => o.id === objectId);

  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (!object) return;
    const interval = setInterval(() => forceUpdate((n) => n + 1), 200);
    return () => clearInterval(interval);
  }, [object?.id, isPlaying]);

  if (!object) return null;

  const chemical = object.properties?.symbol ? findChemical(object.properties.symbol) : undefined;
  const label = LABELS[object.modelName] || object.modelName;
  const props = object.properties || {};
  const m = object.modelName;

  const removeMeasurement = (id: string) => {
    const measurements = (props.measurements || []).filter((m: any) => m.id !== id);
    onUpdateProperty(object.id, 'measurements', measurements);
  };

  const avgLaps = () => {
    const laps = (props.measurements || []).filter((m: any) => m.type === 'lap');
    if (!laps.length) return null;
    const sum = laps.reduce((a: number, b: any) => a + b.value, 0);
    return sum / laps.length;
  };

  const renderMeasurementHistory = () => {
    const measurements = props.measurements || [];
    if (!measurements.length) return null;
    const avg = avgLaps();

    return (
      <div className="ed-history">
        <div className="ed-history-header">Lịch sử đo ({measurements.length})</div>
        {measurements.map((m: any) => (
          <div key={m.id} className="ed-history-row">
            <span className="ed-history-label">{m.label}</span>
            <span className="ed-history-value">{m.value.toFixed(3)}s</span>
            <Popconfirm title="Xóa?" onConfirm={() => removeMeasurement(m.id)} okText="Có" cancelText="Không">
              <Button type="text" size="small" icon={<DeleteOutlined />} className="ed-history-del" />
            </Popconfirm>
          </div>
        ))}
        {avg !== null && (
          <div className="ed-history-avg">
            <span>Trung bình</span>
            <span>{avg.toFixed(3)}s</span>
          </div>
        )}
      </div>
    );
  };

  const renderProperties = () => {
    const items: React.ReactNode[] = [];

    if (['SimplePendulum', 'SpringPendulum', 'Spring'].includes(m)) {
      items.push(
        <div className="ed-prop" key="length">
          <label>Chiều dài (m)</label>
          <InputNumber size="small" min={0.1} max={10} step={0.1} value={props.length || 2}
            onChange={(v) => onUpdateProperty(object.id, 'length', v)} style={{ width: '100%' }} />
        </div>
      );
    }
    if (['SimplePendulum', 'SpringPendulum', 'MassBlock', 'WoodenBlock', 'Dashpot', 'DrivingMotor'].includes(m)) {
      items.push(
        <div className="ed-prop" key="mass">
          <label>Khối lượng (kg)</label>
          <InputNumber size="small" min={0.01} max={100} step={0.1} value={props.mass || 1}
            onChange={(v) => onUpdateProperty(object.id, 'mass', v)} style={{ width: '100%' }} />
        </div>
      );
    }
    if (['SpringPendulum', 'Spring'].includes(m)) {
      items.push(
        <div className="ed-prop" key="stiffness">
          <label>Độ cứng (N/m)</label>
          <InputNumber size="small" min={1} max={1000} step={1} value={props.stiffness || 50}
            onChange={(v) => onUpdateProperty(object.id, 'stiffness', v)} style={{ width: '100%' }} />
        </div>
      );
    }
    if (m === 'DrivingMotor') {
      items.push(<div className="ed-prop" key="freq"><label>Tần số (Hz)</label><InputNumber size="small" min={0.1} max={50} step={0.1} value={props.frequency || 2} onChange={(v) => onUpdateProperty(object.id, 'frequency', v)} style={{ width: '100%' }} /></div>);
      items.push(<div className="ed-prop" key="amp"><label>Biên độ (m)</label><InputNumber size="small" min={0.01} max={0.5} step={0.01} value={props.amplitude || 0.3} onChange={(v) => onUpdateProperty(object.id, 'amplitude', v)} style={{ width: '100%' }} /></div>);
    }
    if (['WoodenBlock', 'SimplePendulum', 'SpringPendulum'].includes(m)) {
      items.push(
        <div className="ed-prop" key="color"><label>Màu sắc</label>
          <div className="ed-color"><input type="color" value={props.color || '#feca57'} onChange={(e) => onUpdateProperty(object.id, 'color', e.target.value)} /><span>{props.color || '#feca57'}</span></div>
        </div>
      );
    }
    if (['Beaker', 'TestTube', 'ErlenmeyerFlask', 'RoundFlask'].includes(m)) {
      items.push(<div className="ed-prop" key="vol"><label>Thể tích (ml)</label><InputNumber size="small" min={0} max={500} step={10} value={props.liquidVolume || 0} onChange={(v) => onUpdateProperty(object.id, 'liquidVolume', v)} style={{ width: '100%' }} /></div>);
      items.push(<div className="ed-prop" key="lcolor"><label>Màu chất lỏng</label><div className="ed-color"><input type="color" value={props.liquidColor || '#00a8ff'} onChange={(e) => onUpdateProperty(object.id, 'liquidColor', e.target.value)} /><span>{props.liquidColor || '#00a8ff'}</span></div></div>);
    }
    if (['ChemicalSolid', 'ChemicalLiquid', 'ChemicalGas'].includes(m) && chemical) {
      items.push(
        <div className="ed-prop" key="chem-info">
          <div className="ed-chem-card" style={{ borderColor: chemical.color === 'transparent' ? '#e2e8f0' : chemical.color }}>
            <div className="ed-chem-symbol">{chemical.symbol}</div>
            <div className="ed-chem-name">{chemical.name}</div>
            <div className="ed-chem-meta"><span>Số {chemical.atomicNumber}</span><span>·</span><span>Khối {chemical.atomicMass.toFixed(1)}u</span></div>
            <div className="ed-chem-meta"><span>{chemical.state === 'solid' ? 'Rắn' : chemical.state === 'liquid' ? 'Lỏng' : 'Khí'}</span><span>·</span><span>{chemical.groupLabel}</span></div>
          </div>
        </div>
      );
    }
    if (items.length === 0 && !noPropModels.includes(m)) {
      items.push(<div className="ed-prop-empty" key="none">Không có thông số chỉnh sửa</div>);
    }
    return items;
  };

  const renderControls = () => {
    if (m === 'Stopwatch') {
      return (
        <div className="ed-controls">
          {props.running ? (
            <>
              <Button size="small" icon={<PauseCircleOutlined />} onClick={() => onUpdateAllProperties(object.id, { ...props, running: false })}>Dừng</Button>
              <Button size="small" type="primary" icon={<FieldTimeOutlined />} onClick={() => {
                const elapsed = props.elapsed || 0;
                if (elapsed <= 0) return;
                const measurements = props.measurements || [];
                const count = measurements.filter((m: any) => m.type === 'lap').length + 1;
                measurements.push({ id: Date.now().toString(), type: 'lap', label: 'Lần ' + count, value: parseFloat(elapsed.toFixed(3)), timestamp: Date.now() });
                onUpdateProperty(object.id, 'measurements', measurements);
              }}>Lap</Button>
            </>
          ) : (
            <Button size="small" type="primary" icon={<PlayCircleOutlined />} onClick={() => onUpdateAllProperties(object.id, { ...props, running: true })}>Bắt đầu</Button>
          )}
          <Button size="small" icon={<UndoOutlined />} onClick={() => onUpdateAllProperties(object.id, { ...props, elapsed: 0, running: false, measurements: [] })}>Reset</Button>
        </div>
      );
    }
    if (m === 'Thermometer') {
      return (
        <div className="ed-controls">
          <Button size="small" icon={<FieldTimeOutlined />} onClick={() => {
            const temp = props.temperature || 25;
            const measurements = props.measurements || [];
            const count = measurements.length + 1;
            measurements.push({ id: Date.now().toString(), type: 'manual', label: 'Lần ' + count, value: parseFloat(temp.toFixed(1)), timestamp: Date.now() });
            onUpdateProperty(object.id, 'measurements', measurements);
          }}>Ghi nhận</Button>
          <Button size="small" icon={<UndoOutlined />} onClick={() => onUpdateProperty(object.id, 'measurements', [])}>Reset</Button>
        </div>
      );
    }
    return null;
  };

  const renderRealTime = () => {
    if (m === 'Stopwatch') {
      const elapsed = props.elapsed || 0;
      return <div className="ed-rt"><span className="ed-rt-label">⏱ Thời gian</span><span className="ed-rt-value">{elapsed.toFixed(1)}s</span></div>;
    }
    if (m === 'Thermometer') {
      const t = props.temperature || 25;
      return <div className="ed-rt"><span className="ed-rt-label">🌡 Nhiệt độ</span><span className="ed-rt-value" style={{ color: t > 100 ? '#ef4444' : t > 50 ? '#f59e0b' : '#22c55e' }}>{t.toFixed(0)}°C</span></div>;
    }
    if (m === 'pHMeter') {
      const ph = props.pH || 7;
      return <div className="ed-rt"><span className="ed-rt-label">🧪 pH</span><span className="ed-rt-value" style={{ color: ph < 6 ? '#ef4444' : ph > 8 ? '#3b82f6' : '#22c55e' }}>{ph.toFixed(1)}</span></div>;
    }
    if (m === 'BunsenBurner') {
      return <div className="ed-rt"><span className="ed-rt-label">🔥 Trạng thái</span><span className="ed-rt-value">{isPlaying ? 'Đang cháy' : 'Tắt'}</span></div>;
    }
    if (m === 'SimplePendulum' && isPlaying) {
      const l = props.length || 2;
      return <div className="ed-rt"><span className="ed-rt-label">⏱ Chu kì T</span><span className="ed-rt-value">{(2 * Math.PI * Math.sqrt(l / 9.81)).toFixed(2)}s</span></div>;
    }
    if (m === 'SpringPendulum' && isPlaying) {
      const mass = props.mass || 1;
      const k = props.stiffness || 50;
      return <div className="ed-rt"><span className="ed-rt-label">⏱ Chu kì T</span><span className="ed-rt-value">{(2 * Math.PI * Math.sqrt(mass / k)).toFixed(2)}s</span></div>;
    }
    return null;
  };

  return (
    <div className="ed-panel">
      <div className="ed-header">
        <span className="ed-title"><SettingOutlined style={{ marginRight: 6 }} />{label}</span>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} className="ed-close" />
      </div>

      <div className="ed-body">
        <div className="ed-preview">
          <MiniPreview modelName={object.modelName} size={120} />
        </div>
        <div className="ed-id">#{object.id.slice(-6)} · {LABELS[object.modelName] || object.modelName}</div>

        {renderRealTime() && <div className="ed-real-time">{renderRealTime()}</div>}

        {renderControls()}

        <div className="ed-props">{renderProperties()}</div>

        {renderMeasurementHistory()}

        <div className="ed-position">
          <div className="ed-pos-row">
            <span>X</span><span>{object.position[0].toFixed(2)}</span>
            <span>Y</span><span>{object.position[1].toFixed(2)}</span>
            <span>Z</span><span>{object.position[2].toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const noPropModels = ['Stopwatch', 'Thermometer', 'pHMeter', 'EnergyMeter', 'BunsenBurner', 'Ruler', 'Protractor', 'CoordinatePlane', 'ParabolaGraph', 'TrigWave', 'GeometryTriangle', 'GeometryCircle', 'Vector2D', 'FunctionPlotter', 'StatisticsChart', 'Condenser', 'Mortar'];

export default EquipmentDetail;
