// Dipasang di <head> oleh layout server, jalan sebelum paint supaya tema tidak berkedip.
// Kunci "theme" sama dengan components/theme.tsx.
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()`;