import React, { useState, useMemo } from 'react';
import { Input, Select, Button, Modal, Tooltip, Tabs } from 'antd';
import { SearchOutlined, CheckCircleFilled, ExperimentOutlined, ContainerOutlined } from '@ant-design/icons';
import { GRADE_OPTIONS, CHAPTERS, TOPICS, EQUIPMENT_TYPES, INITIAL_Y, EquipmentDef } from '@/simulations/equipment-catalog';
import { layTatCa } from '@/dung-cu/thanh-ghi';
import { ALL_CHEMICALS, COMPOUND_CHEMICALS, GROUP_COLORS, Chemical } from '@/simulations/chemicals-catalog';
import type { CompoundChemical } from '@/simulations/chemicals-catalog';
import { validateExperiment } from '@/utils/experiment-validator';
import MiniPreview from '@/simulations/components/MiniPreview';

interface Props { data: Partial<Scene.IRecord>; onChange: (val: Partial<Scene.IRecord>) => void; filterMode?: 'equipment' | 'chemicals' | 'both'; }

const TYPE_COLORS: Record<string, string> = {
  'co-dinh': '#6b7280', 'dao-dong': '#3b82f6', 'vat-ran': '#f59e0b',
  'do-luong': '#22c55e', 'hien-thi': '#8b5cf6', 'thuy-tinh': '#06b6d4',
  'chat-long': '#06b6d4', 'chat-khi': '#a855f7', 'phan-ung': '#ef4444',
};

const CHEM_GENERICS = ['ChemicalSolid', 'ChemicalLiquid', 'ChemicalGas'];
const CHEM_BOTTLES = ['NuocCat', 'Phenolphtalein', 'QuyTim'];
const REDUNDANT_COMPOUNDS = ['AxitClohidric', 'NatriHidroxit', 'AxitSunfuric', 'AxitSunfuricDac', 'DongSunfat'];
const isChem = (id: string) => CHEM_GENERICS.includes(id) || CHEM_BOTTLES.includes(id);

const BOTTLE_PROPS: Record<string, any> = {
  NuocCat: { symbol: 'H2O' }, AxitClohidric: { symbol: 'HCl' }, NatriHidroxit: { symbol: 'NaOH' },
  AxitSunfuric: { symbol: 'H2SO4' }, AxitSunfuricDac: { symbol: 'H2SO4(dac)' }, DongSunfat: { symbol: 'CuSO4' },
  Phenolphtalein: { symbol: 'phenolphtalein' }, QuyTim: { symbol: 'quy-tim' },
};

const Step2Equipments: React.FC<Props> = ({ data, onChange, filterMode = 'both' }) => {
  const [search, setSearch] = useState('');
  const [grade, setGrade] = useState<number | null>(null);
  const [chapter, setChapter] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [type, setType] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [chemPicker, setChemPicker] = useState<{ type: string } | null>(null);
  const [chemSearch, setChemSearch] = useState('');
  const [activeTab, setActiveTab] = useState('equipment');

  const monToRoom: Record<string, 'physics'|'chemistry'|'math'> = { 'vat-ly':'physics', 'hoa-hoc':'chemistry', 'toan-hoc':'math' };

  const availableChapters = useMemo(() => {
    let list = CHAPTERS[data.roomType || 'physics'] || [];
    if (grade) list = list.filter(c => c.grade === grade);
    return list;
  }, [data.roomType, grade]);

  const availableTopics = useMemo(() => (!chapter ? [] : TOPICS[chapter] || []), [chapter]);

  const allItems = useMemo(() => {
    const expected = data.roomType || 'physics';
    return layTatCa()
      .filter(d => monToRoom[d.monHoc] === expected)
      .map(d => ({ id: d.maDungCu, name: d.tenDungCu, subject: monToRoom[d.monHoc] || 'physics' as const, grade: d.lop, chapter: d.chuong, chapterName: d.chuong, topic: d.chuDe, topicName: d.chuDe, type: d.loai, connections: [] as string[], initialY: d.viTriY } as EquipmentDef))
      .filter(eq => {
        if (grade && eq.grade !== grade) return false;
        if (chapter && eq.chapter !== chapter) return false;
        if (topic && eq.topic !== topic) return false;
        if (type && eq.type !== type) return false;
        if (search && !eq.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (REDUNDANT_COMPOUNDS.includes(eq.id)) return false;
        return true;
      });
  }, [data.roomType, grade, chapter, topic, type, search]);

  const equipments = useMemo(() => allItems.filter(eq => !isChem(eq.id)), [allItems]);
  const chemicals = useMemo(() => allItems.filter(eq => isChem(eq.id)), [allItems]);

  const filteredChems = useMemo(() => {
    if (!chemPicker) return { elements: [] as Chemical[], compounds: [] as CompoundChemical[] };
    const s = chemPicker.type === 'ChemicalSolid', l = chemPicker.type === 'ChemicalLiquid', g = chemPicker.type === 'ChemicalGas';
    let elems = ALL_CHEMICALS.filter(c => (s && c.state === 'solid') || (l && c.state === 'liquid') || (g && c.state === 'gas'));
    let comps = COMPOUND_CHEMICALS.filter(c => (s && c.state === 'solid') || (l && (c.state === 'liquid' || c.state === 'solution')) || (g && c.state === 'gas'));
    if (chemSearch) {
      const q = chemSearch.toLowerCase();
      elems = elems.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
      comps = comps.filter(c => c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q));
    }
    return { elements: elems, compounds: comps };
  }, [chemPicker, chemSearch]);

  const selectedIds = data.objects?.map(o => o.modelName) || [];
  const validation = useMemo(() => validateExperiment(data.objects || []), [data.objects]);

  const addSuggestion = (modelName: string) => {
    const props: any = BOTTLE_PROPS[modelName] || (modelName === 'WoodenBlock' ? { color: '#feca57' } : {});
    onChange({ ...data, objects: [...(data.objects || []), { id: `${modelName}_${Date.now()}`, modelName, position: [0,5,0], rotation: [0,0,0], scale: [1,1,1], properties: props }] });
  };

  const toggleEquip = (eq: EquipmentDef) => {
    if (CHEM_GENERICS.includes(eq.id)) { setChemPicker({ type: eq.id }); return; }
    let objs = [...(data.objects || [])];
    if (selectedIds.includes(eq.id)) {
      objs = objs.filter(o => o.modelName !== eq.id);
    } else {
      const props: any = BOTTLE_PROPS[eq.id] || (eq.id === 'WoodenBlock' ? { color: '#feca57' } : {});
      objs.push({ id: `${eq.id}_${Date.now()}`, modelName: eq.id, position: [0,5,0], rotation: [0,0,0], scale: [1,1,1], properties: props });
    }
    onChange({ ...data, objects: objs });
  };

  const addChemical = (chem: Chemical | CompoundChemical) => {
    if (!chemPicker) return;
    const isSelected = data.objects?.some(o => o.properties?.symbol === chem.symbol && o.modelName === chemPicker.type);
    if (isSelected) {
      const newObjs = data.objects?.filter(o => !(o.properties?.symbol === chem.symbol && o.modelName === chemPicker.type)) || [];
      onChange({ ...data, objects: newObjs });
    } else {
      const c = { id: `${chemPicker.type}_${chem.symbol}_${Date.now()}`, modelName: chemPicker.type,
        position: [0,5,0] as [number,number,number], rotation: [0,0,0] as [number,number,number], scale: [1,1,1] as [number,number,number],
        properties: { symbol: chem.symbol, color: chem.color !== 'transparent' ? chem.color : '#94a3b8', khoiLuong: (chem as Chemical).atomicMass || 100, theTich: 100 } };
      onChange({ ...data, objects: [...(data.objects || []), c] });
    }
  };

  const renderCard = (eq: EquipmentDef) => {
    const sel = selectedIds.includes(eq.id);
    const accent = TYPE_COLORS[eq.type] || '#94a3b8';
    const isGeneric = CHEM_GENERICS.includes(eq.id);
    return (
      <div key={eq.id} className={`s2-card ${sel ? 'selected' : ''}`}
        onClick={() => toggleEquip(eq)} style={{ '--accent': accent, borderColor: isGeneric ? '#0ea5e9' : undefined } as React.CSSProperties}>
        <div className="s2-card-preview" onClick={e => { e.stopPropagation(); setPreview(eq.id); }}>
          <MiniPreview modelName={eq.id} size={64} />
        </div>
        <div className="s2-card-body">
          <div className="s2-card-name">{eq.name}</div>
          <div className="s2-card-meta">
            <span className="s2-card-grade">Lớp {eq.grade}</span>
            <span className="s2-card-type-tag" style={{ color: accent }}>{EQUIPMENT_TYPES.find(t => t.value === eq.type)?.label || eq.type}</span>
          </div>
        </div>
        <div className={`s2-card-check ${sel ? 'show' : ''}`}><CheckCircleFilled /></div>
      </div>
    );
  };

  return (
    <div className="step2">
      <h2 className="s2-heading">
        {filterMode === 'chemicals' ? 'Chọn hóa chất' : 'Chọn dụng cụ thí nghiệm'}
      </h2>
      <p className="s2-desc">{selectedIds.length > 0 ? `Đã chọn ${selectedIds.length} mục` : 'Chọn ít nhất một mục để bắt đầu'}</p>

      <div className="s2-toolbar">
        <Input placeholder="Tìm kiếm..." prefix={<SearchOutlined />} value={search} onChange={e => setSearch(e.target.value)} allowClear style={{ flex: 1 }} />
        <Select placeholder="Lớp" value={grade} onChange={v => { setGrade(v); setChapter(null); setTopic(null); }} options={GRADE_OPTIONS.map(g => ({ value: g.value, label: g.label }))} allowClear style={{ width: 90 }} />
        <Select placeholder="Chương" value={chapter} onChange={v => { setChapter(v); setTopic(null); }} options={availableChapters.map(c => ({ value: c.value, label: c.label }))} allowClear style={{ width: 160 }} />
        <Select placeholder="Chủ đề" value={topic} onChange={v => setTopic(v)} disabled={!chapter} options={availableTopics.map(t => ({ value: t.value, label: t.label }))} allowClear style={{ width: 160 }} />
        <Select placeholder="Loại" value={type} onChange={v => setType(v)} options={EQUIPMENT_TYPES.map(t => ({ value: t.value, label: t.label }))} allowClear style={{ width: 110 }} />
      </div>

      {validation.errors.length > 0 && (
        <div className="s2-validation errors">
          {validation.errors.map((e, i) => (
            <div key={i} className="s2-validation-item">
              <span>⛔ {e}</span>
              {validation.suggestions[i] && <Button size="small" type="primary" onClick={() => addSuggestion(validation.suggestions[i])}>Thêm ngay</Button>}
            </div>
          ))}
        </div>
      )}
      {validation.warnings.length > 0 && (
        <div className="s2-validation warnings">
          {validation.warnings.map((w, i) => <div key={i} className="s2-validation-item">⚠️ {w}</div>)}
        </div>
      )}

      {preview && (
        <div className="s2-preview-overlay" onClick={() => setPreview(null)}>
          <div className="s2-preview-card" onClick={e => e.stopPropagation()}>
            <MiniPreview modelName={preview} size={300} />
            <h3>{layTatCa().find(e => e.maDungCu === preview)?.tenDungCu || preview}</h3>
            <p>{layTatCa().find(e => e.maDungCu === preview)?.chuong || ''}</p>
            <Button onClick={() => setPreview(null)}>Đóng</Button>
          </div>
        </div>
      )}

      <Modal title={<span><ExperimentOutlined style={{ marginRight: 8 }} />Chọn hóa chất</span>}
        open={!!chemPicker} onCancel={() => { setChemPicker(null); setChemSearch(''); }} footer={null} width={700} centered>
        <Input placeholder="Tìm nguyên tố hoặc hợp chất..." prefix={<SearchOutlined />} value={chemSearch} onChange={e => setChemSearch(e.target.value)} allowClear style={{ marginBottom: 12 }} />
        {filteredChems.elements.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748b', marginBottom: 6 }}>NGUYÊN TỐ ({filteredChems.elements.length})</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10, maxHeight: 240, overflow: 'auto', marginBottom: 16 }}>
              {filteredChems.elements.map(chem => {
                const isSelected = data.objects?.some(o => o.properties?.symbol === chem.symbol && o.modelName === chemPicker?.type);
                return (
                <Tooltip key={chem.symbol} title={`${chem.name} - ${chem.appearance}`}>
                  <div onClick={() => addChemical(chem)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 8px', borderRadius: 12, border: `1.5px solid ${isSelected ? '#3b82f6' : '#e2e8f0'}`, cursor: 'pointer', transition: 'all 0.2s', background: isSelected ? '#eff6ff' : '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', position: 'relative' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = isSelected ? '#2563eb' : (GROUP_COLORS[chem.group] || '#3b82f6'); e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isSelected ? '#3b82f6' : '#e2e8f0'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'; }}>
                    {isSelected && <div style={{ position: 'absolute', top: -6, right: -6, background: '#3b82f6', color: '#fff', borderRadius: '50%', padding: 2, display: 'flex' }}><CheckCircleFilled style={{ fontSize: 14 }} /></div>}
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: chem.color === 'transparent' ? '#f1f5f9' : chem.color, border: chem.color === 'transparent' ? '1px dashed #cbd5e1' : 'none', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: chem.color === 'transparent' ? '#64748b' : '#fff' }}>{chem.atomicNumber}</span>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 700, color: isSelected ? '#1e40af' : '#0f172a' }}>{chem.symbol}</span>
                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center', lineHeight: 1.2 }}>{chem.name}</span>
                  </div>
                </Tooltip>
              )})}
            </div>
          </>
        )}
        {filteredChems.compounds.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0ea5e9', marginBottom: 6 }}>HỢP CHẤT ({filteredChems.compounds.length})</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 10, maxHeight: 240, overflow: 'auto' }}>
              {filteredChems.compounds.map(chem => {
                const isConcentrated = chem.symbol.includes('(dac)');
                const isSelected = data.objects?.some(o => o.properties?.symbol === chem.symbol && o.modelName === chemPicker?.type);
                return (
                <Tooltip key={chem.symbol} title={`${chem.name} (${chem.category}) - ${chem.appearance}`}>
                  <div onClick={() => addChemical(chem)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 8px', borderRadius: 12, border: `1.5px solid ${isSelected ? (isConcentrated ? '#ef4444' : '#0ea5e9') : (isConcentrated ? '#fca5a5' : '#bae6fd')}`, cursor: 'pointer', transition: 'all 0.2s', background: isSelected ? (isConcentrated ? '#fef2f2' : '#e0f2fe') : (isConcentrated ? '#fef2f2' : '#f0f9ff'), boxShadow: '0 1px 2px rgba(0,0,0,0.02)', position: 'relative' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = isConcentrated ? '#ef4444' : '#0ea5e9'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = isSelected ? (isConcentrated ? '#ef4444' : '#0ea5e9') : (isConcentrated ? '#fca5a5' : '#bae6fd'); e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.02)'; }}>
                    {isSelected && <div style={{ position: 'absolute', top: -6, left: -6, background: isConcentrated ? '#ef4444' : '#0ea5e9', color: '#fff', borderRadius: '50%', padding: 2, display: 'flex', zIndex: 10 }}><CheckCircleFilled style={{ fontSize: 14 }} /></div>}
                    {isConcentrated && <div style={{ position: 'absolute', top: -6, right: -6, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 10, boxShadow: '0 2px 4px rgba(239,68,68,0.3)' }}>ĐẶC</div>}
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: chem.color || '#94a3b8', marginBottom: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>{chem.category}</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: isSelected ? (isConcentrated ? '#991b1b' : '#0284c7') : (isConcentrated ? '#b91c1c' : '#0369a1'), textAlign: 'center' }}>{chem.symbol}</span>
                    <span style={{ fontSize: 11, color: '#64748b', marginTop: 4, textAlign: 'center', lineHeight: 1.2 }}>{chem.name}</span>
                  </div>
                </Tooltip>
              )})}
            </div>
          </>
        )}
        {filteredChems.elements.length === 0 && filteredChems.compounds.length === 0 && (
          <div style={{ padding: 20, color: '#94a3b8', width: '100%', textAlign: 'center' }}>Không tìm thấy hóa chất</div>
        )}
      </Modal>

      {filterMode === 'both' && (
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={[
          {
            key: 'equipment', label: <span><ContainerOutlined /> Dụng cụ thí nghiệm</span>,
            children: (
              <div className="s2-grid" style={{ marginTop: 8 }}>
                {equipments.map(renderCard)}
                {equipments.length === 0 && <div className="s2-empty">Không tìm thấy dụng cụ phù hợp</div>}
              </div>
            )
          },
          {
            key: 'chemicals', label: <span><ExperimentOutlined /> Hóa chất</span>,
            children: (
              <>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#0ea5e9', margin: '8px 0 6px' }}>Chọn lọ hóa chất có sẵn hoặc chọn nguyên tố/hợp chất</div>
                <div className="s2-grid">
                  {chemicals.map(renderCard)}
                  {chemicals.length === 0 && <div className="s2-empty">Không tìm thấy hóa chất phù hợp</div>}
                </div>
              </>
            )
          },
        ]} />
      )}

      {filterMode === 'equipment' && (
        <div className="s2-grid" style={{ marginTop: 8 }}>
          {equipments.map(renderCard)}
          {equipments.length === 0 && <div className="s2-empty">Không tìm thấy dụng cụ phù hợp</div>}
        </div>
      )}

      {filterMode === 'chemicals' && (
        <>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#0ea5e9', margin: '8px 0 6px' }}>Chọn lọ hóa chất có sẵn hoặc chọn nguyên tố/hợp chất</div>
          <div className="s2-grid">
            {chemicals.map(renderCard)}
            {chemicals.length === 0 && <div className="s2-empty">Không tìm thấy hóa chất phù hợp</div>}
          </div>
        </>
      )}
    </div>
  );
};

export default Step2Equipments;
