// Grafici SVG leggeri, senza dipendenze esterne (funzionano offline nella PWA).
const Charts = {
  donut(segments, { size = 180, thickness = 22, centerLabel = '', centerSub = '' } = {}) {
    const total = segments.reduce((s, seg) => s + Math.max(0, seg.value), 0);
    const radius = (size - thickness) / 2;
    const circumference = 2 * Math.PI * radius;
    const cx = size / 2;
    const cy = size / 2;
    let offset = 0;

    const tracks = total > 0
      ? segments.map((seg) => {
          const fraction = Math.max(0, seg.value) / total;
          const dash = fraction * circumference;
          const circle = `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${seg.color}"
            stroke-width="${thickness}" stroke-dasharray="${dash} ${circumference - dash}"
            stroke-dashoffset="${-offset}" stroke-linecap="butt" class="donut-seg" />`;
          offset += dash;
          return circle;
        }).join('')
      : `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="var(--track)" stroke-width="${thickness}" />`;

    return `
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" class="donut-chart" role="img" aria-label="Ripartizione fondi">
        <g transform="rotate(-90 ${cx} ${cy})">${tracks}</g>
        <text x="${cx}" y="${cy - 6}" text-anchor="middle" class="donut-center-value">${centerLabel}</text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" class="donut-center-sub">${centerSub}</text>
      </svg>`;
  },

  // Grafico a barre per entrate/uscite mensili o crescita di un fondo.
  bars(points, { width = 320, height = 160, positiveColor = 'var(--accent)', negativeColor = 'var(--danger)' } = {}) {
    if (!points.length) return `<div class="chart-empty">Nessun dato ancora</div>`;
    const padding = { top: 14, right: 8, bottom: 22, left: 8 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const maxAbs = Math.max(1, ...points.map((p) => Math.abs(p.value)));
    const barW = innerW / points.length;
    const zeroY = padding.top + innerH / 2;

    const bars = points.map((p, i) => {
      const barH = (Math.abs(p.value) / maxAbs) * (innerH / 2 - 4);
      const x = padding.left + i * barW + barW * 0.18;
      const w = barW * 0.64;
      const y = p.value >= 0 ? zeroY - barH : zeroY;
      const color = p.value >= 0 ? positiveColor : negativeColor;
      return `<rect x="${x}" y="${y}" width="${w}" height="${Math.max(2, barH)}" rx="3" fill="${color}"><title>${p.label}: ${formatMoney(p.value)}</title></rect>`;
    }).join('');

    const labels = points.map((p, i) => {
      const x = padding.left + i * barW + barW / 2;
      return `<text x="${x}" y="${height - 6}" text-anchor="middle" class="bar-label">${p.label}</text>`;
    }).join('');

    return `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" class="bars-chart" role="img" aria-label="Andamento mensile">
        <line x1="${padding.left}" y1="${zeroY}" x2="${width - padding.right}" y2="${zeroY}" class="bar-zeroline" />
        ${bars}
        ${labels}
      </svg>`;
  },

  // Linea di crescita cumulativa (es. saldo di un fondo nel tempo).
  line(points, { width = 320, height = 140, color = 'var(--accent)' } = {}) {
    if (points.length < 2) return `<div class="chart-empty">Servono più dati per il grafico</div>`;
    const padding = { top: 12, right: 10, bottom: 10, left: 10 };
    const innerW = width - padding.left - padding.right;
    const innerH = height - padding.top - padding.bottom;
    const values = points.map((p) => p.value);
    const min = Math.min(...values, 0);
    const max = Math.max(...values, 1);
    const range = max - min || 1;

    const coords = points.map((p, i) => {
      const x = padding.left + (i / (points.length - 1)) * innerW;
      const y = padding.top + innerH - ((p.value - min) / range) * innerH;
      return [x, y];
    });

    const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const areaPath = `${path} L${coords[coords.length - 1][0].toFixed(1)},${padding.top + innerH} L${coords[0][0].toFixed(1)},${padding.top + innerH} Z`;
    const gradientId = `grad-${Math.random().toString(36).slice(2, 8)}`;

    return `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" class="line-chart" role="img" aria-label="Crescita nel tempo">
        <defs>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${color}" stop-opacity="0.35" />
            <stop offset="100%" stop-color="${color}" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#${gradientId})" stroke="none" />
        <path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        ${coords.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="${color}" />`).join('')}
      </svg>`;
  },

  progress(percent, color = 'var(--accent)') {
    const clamped = Math.max(0, Math.min(100, percent));
    return `
      <div class="progress-track">
        <div class="progress-fill" style="width:${clamped}%; background:${color}"></div>
      </div>`;
  }
};

window.Charts = Charts;
