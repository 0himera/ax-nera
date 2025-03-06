import React, { useState, useEffect, useRef } from 'react';

const BAR_COUNT = 10;         // Количество баров
const TOTAL_WIDTH = 200;      // Общая ширина контейнера (px)
const CYCLE_DURATION = 6000;  // Длительность полного цикла (мс)
const BAR_HEIGHT = 16;        // Высота каждого бара

const GAP_REDUCTION = 3;      // Насколько уменьшается отступ, если левый бар активен
const GAP_MIN = 2;            // Минимальный отступ между барами

// Диапазоны для базовой ширины баров и дополнительного расширения
const BASE_WIDTH_MIN = 2;
const BASE_WIDTH_MAX = 35;
const EXTRA_WIDTH_MIN = 40;
const EXTRA_WIDTH_MAX = 120;

const COLOR_START = "#d256ff";
const COLOR_END = "#bfabbf";

// Функции для работы с цветами
const hexToRgb = (hex) => {
  hex = hex.replace('#', '');
  const bigint = parseInt(hex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
};

const rgbToHex = (r, g, b) => {
  const compToHex = (c) => {
    const hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  return "#" + compToHex(r) + compToHex(g) + compToHex(b);
};

const interpolateColor = (color1, color2, fraction) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const r = Math.round(rgb1.r + fraction * (rgb2.r - rgb1.r));
  const g = Math.round(rgb1.g + fraction * (rgb2.g - rgb1.g));
  const b = Math.round(rgb1.b + fraction * (rgb2.b - rgb1.b));
  return rgbToHex(r, g, b);
};

const Barcode = () => {
  // Базовые случайные ширины баров (не меняются)
  const barBaseRef = useRef([]);
  if (barBaseRef.current.length === 0) {
    for (let i = 0; i < BAR_COUNT; i++) {
      barBaseRef.current.push(
        Math.random() * (BASE_WIDTH_MAX - BASE_WIDTH_MIN) + BASE_WIDTH_MIN
      );
    }
  }

  // Базовые случайные отступы между барами (не меняются)
  const gapBaseRef = useRef([]);
  if (gapBaseRef.current.length === 0) {
    for (let i = 0; i < BAR_COUNT - 1; i++) {
      gapBaseRef.current.push(
        Math.random() * (BASE_WIDTH_MAX - BASE_WIDTH_MIN) + BASE_WIDTH_MIN
      );
    }
  }

  // Дополнительное расширение для каждого бара, обновляется при активации
  const extraWidthsRef = useRef([]);
  if (extraWidthsRef.current.length === 0) {
    for (let i = 0; i < BAR_COUNT; i++) {
      extraWidthsRef.current.push(
        Math.random() * (EXTRA_WIDTH_MAX - EXTRA_WIDTH_MIN) + EXTRA_WIDTH_MIN
      );
    }
  }

  // Для отслеживания смены активного бара
  const prevActiveRef = useRef(null);

  const [layout, setLayout] = useState({
    finalBars: new Array(BAR_COUNT).fill(0),
    finalGaps: new Array(BAR_COUNT - 1).fill(0),
  });

  const [phase, setPhase] = useState(0);

  useEffect(() => {
    let animationFrame;
    let start;
    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      // phase меняется от 0 до BAR_COUNT циклично
      const newPhase = ((elapsed / CYCLE_DURATION) * BAR_COUNT) % BAR_COUNT;
      setPhase(newPhase);

      const activeIndex = Math.floor(newPhase);
      const frac = newPhase - activeIndex;
      const nextActive = (activeIndex + 1) % BAR_COUNT;

      // При смене активного бара обновляем его extraWidth случайным значением
      if (prevActiveRef.current !== activeIndex) {
        extraWidthsRef.current[activeIndex] =
          Math.random() * (EXTRA_WIDTH_MAX - EXTRA_WIDTH_MIN) + EXTRA_WIDTH_MIN;
        prevActiveRef.current = activeIndex;
      }

      // Для каждого бара вычисляем активацию:
      // Только текущий бар и следующий получают ненулевую активацию для плавного перехода
      const rawBars = [];
      for (let i = 0; i < BAR_COUNT; i++) {
        let activation = 0;
        if (i === activeIndex) {
          activation = 1 - frac;
        } else if (i === nextActive) {
          activation = frac;
        }
        rawBars[i] =
          barBaseRef.current[i] + extraWidthsRef.current[i] * activation;
      }

      // Отступы: уменьшаем отступ, если левый бар активен
      const rawGaps = [];
      for (let j = 0; j < BAR_COUNT - 1; j++) {
        let activation = 0;
        if (j === activeIndex) {
          activation = 1 - frac;
        }
        const gap = gapBaseRef.current[j] - GAP_REDUCTION * activation;
        rawGaps[j] = Math.max(gap, GAP_MIN);
      }

      // Нормализация: суммарная ширина (баров + отступов) должна равняться TOTAL_WIDTH
      const sumRawBars = rawBars.reduce((sum, w) => sum + w, 0);
      const sumRawGaps = rawGaps.reduce((sum, g) => sum + g, 0);
      const totalRaw = sumRawBars + sumRawGaps;
      const factor = TOTAL_WIDTH / totalRaw;

      const finalBars = rawBars.map((w) => w * factor);
      const finalGaps = rawGaps.map((g) => g * factor);

      setLayout({ finalBars, finalGaps });
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  // Вычисляем смещения (offsets) для интерполяции цвета по всей ширине
  let left = 0;
  const offsets = layout.finalBars.map((w, i) => {
    const current = left;
    left += w + (layout.finalGaps[i] || 0);
    return current;
  });

  return (
    <div
      className="relative flex overflow-hidden"
      style={{ width: `${TOTAL_WIDTH}px` }}
    >
      {layout.finalBars.map((w, i) => {
        const center = offsets[i] + w / 2;
        const fraction = center / TOTAL_WIDTH;
        const barColor = interpolateColor(COLOR_START, COLOR_END, fraction);
        return (
          <div
            key={i}
            className="mb-3"
            style={{
              height: `${BAR_HEIGHT}px`,
              width: `${w}px`,
              backgroundColor: barColor,
              marginRight: i < layout.finalGaps.length ? `${layout.finalGaps[i]}px` : "0px",
              // Увеличил время transition для плавного уменьшения
              transition: "width 0.1s linear, margin-right 0.1s linear, background-color 0.1s linear",
            }}
          />
        );
      })}
    </div>
  );
};

export default Barcode;
