<template>
  <div id="app">
    <title>Planning Poker</title>
    <router-view/>
  </div>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  /* Gray scale - Untitled UI inspired */
  --gray-25: #FCFCFD;
  --gray-50: #F9FAFB;
  --gray-100: #F2F4F7;
  --gray-200: #EAECF0;
  --gray-300: #D0D5DD;
  --gray-400: #98A2B3;
  --gray-500: #667085;
  --gray-600: #475467;
  --gray-700: #344054;
  --gray-800: #1D2939;
  --gray-900: #101828;

  /* Primary - Indigo */
  --primary-25: #F5F8FF;
  --primary-50: #EEF4FF;
  --primary-100: #E0EAFF;
  --primary-200: #C7D7FE;
  --primary-300: #A4BCFD;
  --primary-400: #8098F9;
  --primary-500: #6172F3;
  --primary-600: #444CE7;
  --primary-700: #3538CD;
  --primary-800: #2D31A6;
  --primary-900: #2D3282;

  /* Success */
  --success-50: #ECFDF3;
  --success-500: #12B76A;
  --success-700: #027A48;

  /* Error */
  --error-50: #FEF3F2;
  --error-500: #F04438;
  --error-700: #B42318;

  /* Warning */
  --warning-50: #FFFAEB;
  --warning-500: #F79009;
  --warning-700: #B54708;

  /* Semantic aliases */
  --pf-page-bg: var(--gray-50);
  --pf-card-bg: #ffffff;
  --pf-muted-bg: var(--gray-100);
  --pf-border: var(--gray-200);
  --pf-border-hover: var(--gray-300);
  --pf-text-primary: var(--gray-900);
  --pf-text-secondary: var(--gray-600);
  --pf-text-tertiary: var(--gray-500);
  --pf-text-placeholder: var(--gray-400);
  --pf-accent: var(--primary-600);
  --pf-accent-hover: var(--primary-700);
  --pf-accent-light: var(--primary-50);

  /* Spacing scale */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;

  /* Border radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 20px;
  --radius-full: 9999px;

  /* Shadows - Untitled UI style */
  --shadow-xs: 0px 1px 2px rgba(16, 24, 40, 0.05);
  --shadow-sm: 0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-md: 0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06);
  --shadow-lg: 0px 12px 16px -4px rgba(16, 24, 40, 0.08), 0px 4px 6px -2px rgba(16, 24, 40, 0.03);
  --shadow-xl: 0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03);

  /* Focus ring */
  --focus-ring: 0px 0px 0px 4px var(--primary-100), 0px 1px 2px 0px rgba(16, 24, 40, 0.05);
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  height: 100%;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  background: var(--pf-page-bg);
  color: var(--pf-text-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100%;
}

p, h1, h2, h3, h4, h5, h6 {
  margin: 0;
}

h1 {
  font-size: 30px;
  font-weight: 600;
  line-height: 1.25;
}

h2 {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
}

h3 {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
}

h4 {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

button {
  font-family: inherit;
}

/* Focus visible styles */
:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
</style>
