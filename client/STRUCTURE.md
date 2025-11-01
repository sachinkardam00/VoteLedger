# VoteLedger Frontend Structure

## 📁 Directory Organization

```
src/
├── assets/              # Static assets (images, icons, fonts)
│   └── images/
│
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Navigation, Footer, etc.)
│   │   ├── Navigation.jsx
│   │   └── index.js
│   ├── shared/         # Shared/common components (Buttons, Cards, Modals, etc.)
│   └── index.js        # Barrel exports
│
├── config/              # Configuration files
│   ├── index.js        # Main config (CONTRACT_ADDRESS, ABI, etc.)
│   ├── wagmi.js        # Wagmi configuration
│   └── VotingDAO.abi.json
│
├── hooks/               # Custom React hooks
│   ├── useContractWrite.js
│   ├── useElectionState.js
│   ├── useElectionStateWagmi.js
│   └── index.js        # Barrel exports
│
├── pages/               # Page components (route-level components)
│   ├── Admin/
│   │   └── index.jsx
│   ├── Home/
│   │   └── index.jsx
│   ├── Landing/
│   │   ├── index.jsx
│   │   └── styles.css
│   ├── Registration/
│   │   └── index.jsx
│   ├── Results/
│   │   └── index.jsx
│   ├── Voting/
│   │   └── index.jsx
│   └── index.js        # Barrel exports
│
├── services/            # External services (API calls, IPFS, etc.)
│   ├── pinataService.js
│   └── index.js        # Barrel exports
│
├── styles/              # Global styles and CSS modules
│   └── global.css
│
├── utils/               # Utility functions and helpers
│   ├── eventBus.js
│   └── index.js        # Barrel exports
│
├── App.jsx              # Main application component
└── main.jsx             # Application entry point
```

## 🎯 Benefits of This Structure

### 1. **Modularity**

- Each feature/page is self-contained in its own folder
- Easy to locate and modify specific functionality
- Reduces merge conflicts in team development

### 2. **Scalability**

- Easy to add new pages, components, or services
- Clear separation of concerns
- Barrel exports (`index.js`) make imports cleaner

### 3. **Maintainability**

- Consistent organization makes onboarding easier
- Related files are grouped together
- Clear naming conventions

### 4. **Clean Imports**

Instead of:

```jsx
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import useElectionStateWagmi from "./hooks/useElectionStateWagmi";
```

You can write:

```jsx
import { LandingPage, AdminDashboard } from "@/pages";
import { useElectionStateWagmi } from "@/hooks";
```

## 📝 Naming Conventions

- **Folders**: camelCase (e.g., `components`, `hooks`, `services`)
- **Components**: PascalCase (e.g., `Navigation.jsx`, `LandingPage`)
- **Utilities/Services**: camelCase (e.g., `eventBus.js`, `pinataService.js`)
- **Styles**: kebab-case or same as component (e.g., `global.css`, `styles.css`)

## 🔄 Adding New Features

### Adding a New Page:

1. Create folder: `src/pages/NewPage/`
2. Create component: `src/pages/NewPage/index.jsx`
3. Add styles (if needed): `src/pages/NewPage/styles.css`
4. Export in `src/pages/index.js`:
   ```js
   export { default as NewPage } from "./NewPage";
   ```

### Adding a New Component:

1. Determine if it's layout or shared
2. Create in appropriate folder: `src/components/shared/Button.jsx`
3. Export in `src/components/shared/index.js`:
   ```js
   export { default as Button } from "./Button";
   ```

### Adding a New Hook:

1. Create in `src/hooks/useNewHook.js`
2. Export in `src/hooks/index.js`:
   ```js
   export { default as useNewHook } from "./useNewHook";
   ```

## 🎨 Component Organization

Each page folder can contain:

- `index.jsx` - Main component
- `styles.css` - Component-specific styles
- `components/` - Page-specific sub-components (if needed)
- `hooks/` - Page-specific hooks (if needed)
- `utils.js` - Page-specific utilities (if needed)

## 📦 Barrel Exports (index.js)

Barrel files simplify imports and provide a clean public API:

```js
// src/pages/index.js
export { default as LandingPage } from "./Landing";
export { default as HomePage } from "./Home";
export { default as AdminDashboard } from "./Admin";
export { default as RegistrationPage } from "./Registration";
export { default as VotingPage } from "./Voting";
export { default as ResultsPage } from "./Results";
```

## 🚀 Quick Start

After restructuring, imports in your components look like this:

```jsx
// App.jsx
import { Navigation } from "@/components";
import { LandingPage, HomePage, AdminDashboard } from "@/pages";
import { useElectionStateWagmi, useContractWrite } from "@/hooks";
import { ElectionStatus, validateConfig } from "@/config";
```

All path aliases (`@/...`) are configured in `vite.config.js`.

## ✅ Migration Checklist

- [x] Created organized folder structure
- [x] Moved all pages to individual folders
- [x] Extracted Navigation to layout component
- [x] Created barrel export files (index.js)
- [x] Updated all imports in App.jsx
- [x] Updated styles import in main.jsx
- [x] Maintained all existing functionality
- [ ] Test application thoroughly
- [ ] Remove old files after verification
