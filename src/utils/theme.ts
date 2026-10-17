export type Theme = 'dark' | 'light';
export const THEME_STORAGE_KEY = 'joy-portfolio-theme';

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#121311' : '#ede8dd');
}

// Runs in the head before paint, so a saved light theme never flashes dark.
export const themeInitScript = `(()=>{let t='dark';try{const s=localStorage.getItem('${THEME_STORAGE_KEY}');if(s==='light'||s==='dark')t=s}catch{}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',t==='dark'?'#121311':'#ede8dd')})()`;
