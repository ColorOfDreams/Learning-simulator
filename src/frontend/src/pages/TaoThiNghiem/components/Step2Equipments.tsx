import React, { useState, useMemo } from 'react';
import { Input, Select, Button, Modal, Tooltip } from 'antd';
import { SearchOutlined, CheckCircleFilled, ExperimentOutlined } from '@ant-design/icons';
import {
  GRADE_OPTIONS, CHAPTERS, TOPICS, EQUIPMENT_TYPES, INITIAL_Y, EquipmentDef,
} from '@/simulations/equipment-catalog';
import { layTatCa } from '@/dung-cu/thanh-ghi';
import { ALL_CHEMICALS, GROUP_COLORS, Chemical } from '@/simulations/chemicals-catalog';
import { validateExperiment } from '@/utils/experiment-validator';
import MiniPreview from '@/simulations/components/MiniPreview';

interface Props {
  data: Partial<Scene.IRecord>;
  onChange: (val: Partial<Scene.IRecord>) => void;
}

const TYPE_COLORS: Record<string, string> = {
  'co-dinh': '#6b7280', 'dao-dong': '#3b82f6', 'vat-ran': '#f59e0b',
  'do-luong': '#22c55e', 'hien-thi': '#8b5cf6', 'thuy-tinh': '#06b6d4',
  'chat-long': '#06b6d4', 'chat-khi': '#a855f7', 'phan-ung': '#ef4444',
};

const Step2Equipments: React.FC<Props> = ({ data, onChange }) => {
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState<number | null>(null);
  const [chapter, setChapter] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [chemPicker, setChemPicker] = useState<{ type: string } | null>(null);
  const [chemSearch, setChemSearch] = useState('');

  const availableChapters = useMemo(() => {
    const sub = data.roomType || 'physics';
    let list = CHAPTERS[sub] || [];
    if (grade) list = list.filter((c) => c.grade === grade);
    return list;
  }, [data.roomType, grade]);

  const availableTopics = useMemo(() => {
    if (!chapter) return [];
    return TOPICS[chapter] || [];
  }, [chapter]);

  const filtered = useMemo(() => {
    const roomToMon: Record<string, string> = { physics: 'vat-ly', chemistry: 'hoa-hoc', math: 'toan-hoc' };
    const monToRoom: Record<string, 'physics' | 'chemistry' | 'math'> = { 'vat-ly': 'physics', 'hoa-hoc': 'chemistry', 'toan-hoc': 'math' };
    const expectedSubject = data.roomType || 'physics';
    const tatCa = layTatCa().map((d) => ({
      id: d.maDungCu,
      name: d.tenDungCu,
      subject: monToRoom[d.monHoc] || 'physics',
      grade: d.lop,
      chapter: d.chuong,
      chapterName: d.chuong,
      topic: d.chuDe,
      topicName: d.chuDe,
      type: d.loai,
      connections: [],
      initialY: d.viTriY,
    } as EquipmentDef));
    return tatCa.filter((eq) => {
      if (eq.subject !== expectedSubject) return false;
      if (grade && eq.grade !== grade) return false;
      if (chapter && eq.chapter !== chapter) return false;
      if (topic && eq.topic !== topic) return false;
      if (type && eq.type !== type) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!eq.name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [data.roomType, grade, chapter, topic, type, search]);

  const filteredChems = useMemo(() => {
    if (!chemPicker) return [];
    let list = ALL_CHEMICALS.filter((c) => {
      if (chemPicker.type === 'ChemicalSolid') return c.state === 'solid';
      if (chemPicker.type === 'ChemicalLiquid') return c.state === 'liquid';
      if (chemPicker.type === 'ChemicalGas') return c.state === 'gas';
      return false;
    });
    if (chemSearch) {
      const q = chemSearch.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    return list;
  }, [chemPicker, chemSearch]);

  const selectedIds = data.objects?.map((o) => o.modelName) || [];
  const validation = useMemo(() => validateExperiment(data.objects || []), [data.objects]);

  const addSuggestion = (modelName: string) => {
    const y = INITIAL_Y[modelName] || 0;
    const newObj: Scene.Object = {
      id: `${modelName}_${Date.now()}`, modelName,
      position: [0, 5, 0] as [number, number, number],
      rotation: [0, 0, 0], scale: [1, 1, 1],
      properties: modelName === 'WoodenBlock' ? { color: '#feca57' } : {},
    };
    onChange({ ...data, objects: [...(data.objects || []), newObj] });
  };

  const addChemical = (chem: Chemical) => {
    if (!chemPicker) return;
    const id = `${chemPicker.type}_${chem.symbol}_${Date.now()}`;
    const y = INITIAL_Y[chemPicker.type] || 0.1;
    const newObj: Scene.Object = {
      id, modelName: chemPicker.type,
      position: [0, 5, 0] as [number, number, number],
      rotation: [0, 0, 0], scale: [1, 1, 1],
      properties: { symbol: chem.symbol, color: chem.color, mass: chem.atomicMass },
    };
    onChange({ ...data, objects: [...(data.objects || []), newObj] });
    setChemPicker(null);
    setChemSearch('');
  };

  const toggleEquip = (eq: EquipmentDef) => {
    if (['ChemicalSolid', 'ChemicalLiquid', 'ChemicalGas'].includes(eq.id)) {
      setChemPicker({ type: eq.id });
      return;
    }
    let newObjects = [...(data.objects || [])];
    if (selectedIds.includes(eq.id)) {
      newObjects = newObjects.filter((o) => o.modelName !== eq.id);
    } else {
      const y = INITIAL_Y[eq.id] || 0;
      newObjects.push({
        id: `${eq.id}_${Date.now()}`,
        modelName: eq.id,
        position: [0, 5, 0] as [number, number, number],
        rotation: [0, 0, 0], scale: [1, 1, 1],
        properties: eq.id === 'WoodenBlock' ? { color: '#feca57' } : {},
      });
    }
    onChange({ ...data, objects: newObjects });
  };

  return (
    <div className="step2">
      <h2 className="s2-heading">Chọn dụng cụ thí nghiệm</h2>
      <p className="s2-desc">
        {selectedIds.length > 0 ? `Đã chọn ${selectedIds.length} dụng cụ` : 'Chọn ít nhất một dụng cụ để bắt đầu'}
      </p>

      <div className="s2-toolbar">
        <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />}
          value={search} onChange={(e) => setSearch(e.target.value)} allowClear style={{ flex: 1 }} />
        <Select placeholder="Lớp" value={grade}
          onChange={(v) => { setGrade(v); setChapter(null); setTopic(null); }}
          options={GRADE_OPTIONS.map((g) => ({ value: g.value, label: g.label }))}
          allowClear style={{ width: 90 }} />
        <Select placeholder="Chương" value={chapter}
          onChange={(v) => { setChapter(v); setTopic(null); }}
          options={availableChapters.map((c) => ({ value: c.value, label: c.label }))}
          allowClear style={{ width: 160 }} />
        <Select placeholder="Chủ đề" value={topic}
          onChange={(v) => setTopic(v)} disabled={!chapter}
          options={availableTopics.map((t) => ({ value: t.value, label: t.label }))}
          allowClear style={{ width: 160 }} />
        <Select placeholder="Loại" value={type}
          onChange={(v) => setType(v)}
          options={EQUIPMENT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
          allowClear style={{ width: 110 }} />
      </div>

      {/* Validation warnings */}
      {validation.errors.length > 0 && (
        <div className="s2-validation errors">
          {validation.errors.map((e, i) => (
            <div key={i} className="s2-validation-item">
              <span>⛔ {e}</span>
              {validation.suggestions[i] && (
                <Button size="small" type="primary" onClick={() => addSuggestion(validation.suggestions[i])}>
                  Thêm ngay
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      {validation.warnings.length > 0 && (
        <div className="s2-validation warnings">
          {validation.warnings.map((w, i) => <div key={i} className="s2-validation-item">⚠️ {w}</div>)}
        </div>
      )}

      {/* 3D Preview Popup */}
      {preview && (
        <div className="s2-preview-overlay" onClick={() => setPreview(null)}>
          <div className="s2-preview-card" onClick={(e) => e.stopPropagation()}>
            <MiniPreview modelName={preview} size={300} />
            <h3>{layTatCa().find((e) => e.maDungCu === preview)?.tenDungCu || preview}</h3>
            <p>{layTatCa().find((e) => e.maDungCu === preview)?.chuong || ''}</p>
            <Button onClick={() => setPreview(null)}>Đóng</Button>
          </div>
        </div>
      )}

      {/* Chemical Element Picker Modal */}
      <Modal
        title={<span><ExperimentOutlined style={{ marginRight: 8 }} />Chọn nguyên tố hóa học</span>}
        open={!!chemPicker}
        onCancel={() => { setChemPicker(null); setChemSearch(''); }}
        footer={null}
        width={700}
        centered
      >
        <Input placeholder="Tìm nguyên tố..." prefix={<SearchOutlined />}
          value={chemSearch} onChange={(e) => setChemSearch(e.target.value)}
          allowClear style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 400, overflow: 'auto' }}>
          {filteredChems.map((chem) => (
            <Tooltip key={chem.symbol} title={`${chem.name} - ${chem.appearance}`}>
              <div
                onClick={() => addChemical(chem)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '8px 10px', borderRadius: 8, border: '1.5px solid #e2e8f0',
                  cursor: 'pointer', minWidth: 52, transition: 'all 0.15s',
                  background: '#fff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = GROUP_COLORS[chem.group] || '#3b82f6';
                  e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.background = '#fff';
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 6,
                  background: chem.color === 'transparent' ? '#e2e8f0' : chem.color,
                  border: chem.color === 'transparent' ? '2px dashed #94a3b8' : 'none',
                  marginBottom: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    color: chem.color === 'transparent' ? '#64748b' : '#fff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                  }}>{chem.atomicNumber}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{chem.symbol}</span>
                <span style={{ fontSize: 8, color: '#94a3b8', marginTop: 1 }}>{chem.name}</span>
              </div>
            </Tooltip>
          ))}
          {filteredChems.length === 0 && (
            <div style={{ padding: 20, color: '#94a3b8', width: '100%', textAlign: 'center' }}>Không tìm thấy nguyên tố</div>
          )}
        </div>
      </Modal>

      {/* Equipment Grid */}
      <div className="s2-grid">
        {filtered.map((eq) => {
          const sel = selectedIds.includes(eq.id);
          const accent = TYPE_COLORS[eq.type] || '#94a3b8';
          const isChem = ['ChemicalSolid', 'ChemicalLiquid', 'ChemicalGas'].includes(eq.id);
          return (
            <div key={eq.id} className={`s2-card ${sel ? 'selected' : ''}`}
              onClick={() => toggleEquip(eq)} style={{ '--accent': accent } as React.CSSProperties}>
              <div className="s2-card-preview" onClick={(e) => { e.stopPropagation(); if (!isChem) setPreview(eq.id); }}>
                {isChem ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                    {eq.id === 'ChemicalSolid' ? '🧪' : eq.id === 'ChemicalLiquid' ? '💧' : '💨'}
                  </div>
                ) : (
                  <MiniPreview modelName={eq.id} size={64} />
                )}
              </div>
              <div className="s2-card-body">
                <div className="s2-card-name">{eq.name}</div>
                <div className="s2-card-meta">
                  <span className="s2-card-grade">Lớp {eq.grade}</span>
                  <span className="s2-card-type-tag" style={{ color: accent }}>
                    {EQUIPMENT_TYPES.find((t) => t.value === eq.type)?.label || eq.type}
                  </span>
                </div>
              </div>
              <div className={`s2-card-check ${sel ? 'show' : ''}`}>
                <CheckCircleFilled />
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="s2-empty">Không tìm thấy dụng cụ phù hợp</div>
      )}
    </div>
  );
};

export default Step2Equipments;
