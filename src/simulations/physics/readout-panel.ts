import './readout-panel.less';

interface ReadoutDefinition {
	key: string;
	label: string;
	unit?: string;
}

interface ReadoutPanel {
	element: HTMLDListElement;
	definitions?: ReadonlyArray<ReadoutDefinition>;
	values: Map<string, HTMLSpanElement>;
	dispose: () => void;
}

const numberFormat = new Intl.NumberFormat('vi-VN', {
	maximumFractionDigits: 2,
});

export function createReadoutPanel(container: HTMLElement): ReadoutPanel {
	const element = document.createElement('dl');
	element.className = 'sim-readouts';
	element.setAttribute('aria-label', 'Số đo mô phỏng');
	container.appendChild(element);
	return { element, values: new Map(), dispose: () => element.remove() };
}

export function drawStats(
	panel: ReadoutPanel,
	definitions: ReadonlyArray<ReadoutDefinition>,
	values: Record<string, string>,
) {
	if (panel.definitions !== definitions) {
		panel.element.replaceChildren();
		panel.values.clear();
		for (const definition of definitions) {
			const field = document.createElement('div');
			const label = document.createElement('dt');
			label.textContent = definition.label;
			const reading = document.createElement('dd');
			const value = document.createElement('span');
			reading.appendChild(value);
			if (definition.unit) {
				const unit = document.createElement('span');
				unit.className = 'sim-readouts__unit';
				unit.textContent = definition.unit;
				reading.appendChild(unit);
			}
			field.append(label, reading);
			panel.element.appendChild(field);
			panel.values.set(definition.key, value);
		}
		panel.definitions = definitions;
	}

	for (const definition of definitions) {
		const rawValue = values[definition.key] ?? '–';
		const numericValue = Number(rawValue);
		const text =
			rawValue.trim() && Number.isFinite(numericValue) && !/[eE]/.test(rawValue)
				? numberFormat.format(numericValue)
				: rawValue;
		const value = panel.values.get(definition.key);
		if (value && value.textContent !== text) value.textContent = text;
	}
}
