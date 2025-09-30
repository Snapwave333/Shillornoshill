// Liquid Glass Theme adaptive script
// Applies system accent and theme, with web fallbacks

(function(){
  const root = document.documentElement;
  const body = document.body;

  function setVar(name, value){ try { root.style.setProperty(name, value); } catch(_){} }
  function clamp(n, min, max){ return Math.min(max, Math.max(min, n)); }

  function hexToRgb(hex){
    hex = hex.replace(/^#/, '');
    if (hex.length === 8) hex = hex.slice(2); // drop alpha if provided
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function rgbToHex(r,g,b){
    const h = (x) => x.toString(16).padStart(2, '0');
    return `#${h(r)}${h(g)}${h(b)}`;
  }

  function adjust(rgb, amt){
    return {
      r: clamp(Math.round(rgb.r + amt), 0, 255),
      g: clamp(Math.round(rgb.g + amt), 0, 255),
      b: clamp(Math.round(rgb.b + amt), 0, 255),
    };
  }

  async function applyAccentFromDesktop(){
    const api = window.desktopTheme;
    let accent = null;
    if (api && typeof api.getAccentColor === 'function'){
      try { accent = await api.getAccentColor(); } catch(_){}
    }
    if (!accent){
      // Fallback: CSS default
      accent = getComputedStyle(root).getPropertyValue('--lg-accent')?.trim() || '#21CBF3';
    }
    const rgb = hexToRgb(accent);
    const alt = adjust(rgb, -40);
    setVar('--lg-accent', accent);
    setVar('--lg-accent-2', rgbToHex(alt.r, alt.g, alt.b));
  }

  function applyThemeMode(){
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const api = window.desktopTheme;
    let mode = prefersDark ? 'dark' : 'light';
    if (api && typeof api.getMode === 'function'){
      api.getMode().then(m => {
        if (m === 'dark' || m === 'light') setThemeClass(m);
      }).catch(() => setThemeClass(mode));
    } else {
      setThemeClass(mode);
    }
  }

  function setThemeClass(mode){
    body.classList.add('liquid-glass-theme');
    body.classList.toggle('lg-dark', mode === 'dark');
    body.classList.toggle('lg-light', mode === 'light');
  }

  function bindModeChanges(){
    const api = window.desktopTheme;
    if (api && typeof api.onModeChange === 'function'){
      try { api.onModeChange(setThemeClass); } catch(_){}
    }
    if (window.matchMedia){
      try {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', () => applyThemeMode());
      } catch(_){}
    }
  }

  function init(){
    applyThemeMode();
    applyAccentFromDesktop();
    bindModeChanges();
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();