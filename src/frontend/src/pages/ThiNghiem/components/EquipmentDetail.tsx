import React, { useState, useEffect } from 'react';
import { Button, InputNumber, Popconfirm } from 'antd';
import {
  CloseOutlined, SettingOutlined, PlayCircleOutlined, PauseCircleOutlined,
  FieldTimeOutlined, UndoOutlined, DeleteOutlined, RotateRightOutlined,
} from '@ant-design/icons';
import MiniPreview from '@/simulations/components/MiniPreview';
import { findChemical } from '@/simulations/chemicals-catalog';
import { layDungCu } from '@/dung-cu/thanh-ghi';
import './EquipmentDetail.less';

interface Props {
  objectId: string | null;
  sceneGraph: Scene.IRecord | null;
  isPlaying: boolean;
  onClose: () => void;
  onUpdateProperty: (objectId: string, key: string, value: any) => void;
  onUpdateAllProperties: (objectId: string, props: Record<string, any>) => void;
  onUpdateRotation: (objectId: string, rotation: [number, number, number]) => void;
  rotationAxis: 'x' | 'y' | 'z' | null;
  onSetRotationAxis: (axis: 'x' | 'y' | 'z' | null) => void;
}

const EquipmentDetail: React.FC<Props> = ({ objectId, sceneGraph, isPlaying, onClose, onUpdateProperty, onUpdateAllProperties, onUpdateRotation, rotationAxis, onSetRotationAxis }) => {
  const object = sceneGraph?.objects?.find((o) => o.id === objectId);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (!object) return;
    const interval = setInterval(() => forceUpdate((n) => n + 1), 200);
    return () => clearInterval(interval);
  }, [object?.id, isPlaying]);

  if (!object) return null;

  const modelName = object.modelName || (object as any).maDungCu;
  const def = layDungCu(modelName);
  const props = { ...object.properties, ...((object as any).thuocTinh || {}) };
  const chemical = props?.kyHieu || props?.symbol ? findChemical(props?.kyHieu || props?.symbol) : undefined;
  const label = def?.tenDungCu || modelName;
  const pos = object.position || (object as any).viTri || [0, 0, 0];

  const removeMeasurement = (id: string) => {
    const measurements = ((props.ketQuaDo || props.measurements || []) as any[]).filter((m: any) => m.id !== id);
    onUpdateProperty(object.id, 'ketQuaDo', measurements);
    onUpdateProperty(object.id, 'measurements', measurements);
  };

  const avgLaps = (): number | null => {
    const laps = (props.ketQuaDo || props.measurements || []).filter((m: any) => m.loai === 'lap' || m.type === 'lap');
    if (!laps.length) return null;
    const sum = laps.reduce((a: number, b: any) => a + (b.giaTri ?? b.value ?? 0), 0);
    return sum / laps.length;
  };

  const renderMeasurementHistory = () => {
    const measurements = props.ketQuaDo || props.measurements || [];
    if (!measurements.length) return null;
    const avg = avgLaps();
    return (
      <div className="ed-history">
        <div className="ed-history-header">Lịch sử đo ({measurements.length})</div>
        {measurements.map((m: any) => (
          <div key={m.id} className="ed-history-row">
            <span className="ed-history-label">{m.nhan || m.label}</span>
            <span className="ed-history-value">{(m.giaTri ?? m.value ?? 0).toFixed(3)}s</span>
            <Popconfirm title="Xóa?" onConfirm={() => removeMeasurement(m.id)} okText="Có" cancelText="Không">
              <Button type="text" size="small" icon={<DeleteOutlined />} className="ed-history-del" />
            </Popconfirm>
          </div>
        ))}
        {avg !== null && (
          <div className="ed-history-avg"><span>Trung bình</span><span>{avg.toFixed(3)}s</span></div>
        )}
      </div>
    );
  };

  const renderProperties = () => {
    const thuocTinh = def?.thuocTinh || [];
    if (!thuocTinh.length) return <div className="ed-prop-empty">Không có thông số chỉnh sửa</div>;

    return thuocTinh.map((tt) => {
      const key = tt.khoa;
      const val = props[key] ?? tt.macDinh;

      if (tt.loai === 'so') {
        return (
          <div className="ed-prop" key={key}>
            <label>{tt.nhan}</label>
            <InputNumber size="small" min={tt.nhoNhat ?? 0} max={tt.lonNhat ?? 100} step={tt.buoc ?? 1}
              value={val} onChange={(v) => onUpdateProperty(object.id, key, v)} style={{ width: '100%' }} />
          </div>
        );
      }
      if (tt.loai === 'mau') {
        return (
          <div className="ed-prop" key={key}>
            <label>{tt.nhan}</label>
            <div className="ed-color">
              <input type="color" value={val} onChange={(e) => onUpdateProperty(object.id, key, e.target.value)} />
              <span>{val}</span>
            </div>
          </div>
        );
      }
      return null;
    });
  };

  const renderControls = () => {
    const dieuKhien = def?.dieuKhien || [];
    if (!dieuKhien.length) return null;

    return (
      <div className="ed-controls">
        {dieuKhien.map((dk) => {
          const curVal = props[dk.hanhDong.khoa || ''] ?? dk.trangThaiMacDinh;

          if (dk.hanhDong.loai === 'dat-thuoc-tinh' && dk.loai === 'bat-tat') {
            const isOn = !!curVal;
            return (
              <React.Fragment key={dk.id}>
                {isOn ? (
                  <Button size="small" icon={<PauseCircleOutlined />}
                    onClick={() => onUpdateProperty(object.id, dk.hanhDong.khoa!, dk.hanhDong.giaTriTat)}>Dừng</Button>
                ) : (
                  <Button size="small" type="primary" icon={<PlayCircleOutlined />}
                    onClick={() => onUpdateProperty(object.id, dk.hanhDong.khoa!, dk.hanhDong.giaTriBat)}>Bắt đầu</Button>
                )}
              </React.Fragment>
            );
          }
          if (dk.id === 'lap' || dk.id === 'ghi-nhan') {
            return (
              <Button key={dk.id} size="small" type="primary" icon={<FieldTimeOutlined />} onClick={() => {
                const elapsed = (props.thoiGian || props.elapsed || 0) as number;
                if (elapsed <= 0) return;
                const doDac = (props.ketQuaDo || props.measurements || []) as any[];
                const count = doDac.filter((m: any) => m.loai === 'lap' || m.type === 'lap').length + 1;
                doDac.push({ id: Date.now().toString(), loai: 'lap', type: 'lap', nhan: 'Lần ' + count, label: 'Lần ' + count, giaTri: parseFloat(elapsed.toFixed(3)), value: parseFloat(elapsed.toFixed(3)), thoiGian: Date.now(), timestamp: Date.now() });
                onUpdateProperty(object.id, 'ketQuaDo', doDac);
                onUpdateProperty(object.id, 'measurements', doDac);
              }}>Lap</Button>
            );
          }
          if (dk.id === 'reset') {
            return (
              <Button key={dk.id} size="small" icon={<UndoOutlined />}
                onClick={() => onUpdateAllProperties(object.id, { ...props, thoiGian: 0, elapsed: 0, dangChay: false, running: false, ketQuaDo: [], measurements: [] })}>Reset</Button>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const renderRealTime = () => {
    if (!def?.thoiGianThuc) return null;
    const rt = def.thoiGianThuc(props, isPlaying);
    if (!rt) return null;
    return (
      <div className="ed-rt">
        <span className="ed-rt-label">{rt.nhan}</span>
        <span className="ed-rt-value" style={rt.mau ? { color: rt.mau } : undefined}>{rt.giaTri}</span>
      </div>
    );
  };

  const renderChemicalInfo = () => {
    if (!chemical) return null;
    return (
      <div className="ed-prop" key="chem-info">
        <div className="ed-chem-card" style={{ borderColor: chemical.color === 'transparent' ? '#e2e8f0' : chemical.color }}>
          <div className="ed-chem-symbol">{chemical.symbol}</div>
          <div className="ed-chem-name">{chemical.name}</div>
          <div className="ed-chem-meta"><span>Số {chemical.atomicNumber}</span><span>·</span><span>Khối {chemical.atomicMass.toFixed(1)}u</span></div>
          <div className="ed-chem-meta"><span>{chemical.state === 'solid' ? 'Rắn' : chemical.state === 'liquid' ? 'Lỏng' : 'Khí'}</span><span>·</span><span>{chemical.groupLabel}</span></div>
        </div>
      </div>
    );
  };

  return (
    <div className="ed-panel">
      <div className="ed-header">
        <span className="ed-title"><SettingOutlined style={{ marginRight: 6 }} />{label}</span>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} className="ed-close" />
      </div>

      <div className="ed-body">
        <div className="ed-preview">
          <MiniPreview modelName={modelName} size={120}
            rotation={object.rotation || (object as any).xoay || [0, 0, 0]}
            onRotate={(rot) => onUpdateRotation(object.id, rot)} />
        </div>
        <div className="ed-id">#{object.id.slice(-6)} · {label}</div>

        {renderRealTime() && <div className="ed-real-time">{renderRealTime()}</div>}
        {renderControls()}
        <div className="ed-props">{renderProperties()}</div>
        {renderChemicalInfo()}
        {renderMeasurementHistory()}

        <div className="ed-position">
          <div className="ed-pos-row">
            <span>X</span><span>{pos[0].toFixed(2)}</span>
            <span>Y</span><span>{pos[1].toFixed(2)}</span>
            <span>Z</span><span>{pos[2].toFixed(2)}</span>
          </div>
        </div>

        <div className="ed-rotation">
          <div className="ed-rot-label">Xoay {rotationAxis ? `(trục ${rotationAxis.toUpperCase()})` : '(kéo ảnh bên trên)'}</div>
          <div className="ed-rot-btns">
            <Button size="small" type={rotationAxis === 'x' ? 'primary' : 'default'}
              icon={<RotateRightOutlined />} onClick={() => {
              onSetRotationAxis(rotationAxis === 'x' ? null : 'x');
            }}>X</Button>
            <Button size="small" type={rotationAxis === 'y' ? 'primary' : 'default'}
              icon={<RotateRightOutlined />} onClick={() => {
              onSetRotationAxis(rotationAxis === 'y' ? null : 'y');
            }}>Y</Button>
            <Button size="small" type={rotationAxis === 'z' ? 'primary' : 'default'}
              icon={<RotateRightOutlined />} onClick={() => {
              onSetRotationAxis(rotationAxis === 'z' ? null : 'z');
            }}>Z</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EquipmentDetail;
