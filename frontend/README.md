# Labuan FSA E-Submission System - Frontend

**Version**: 1.0.0  
**Framework**: React 18+ with TypeScript  
**Styling**: Tailwind CSS  
**Build Tool**: Vite

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. **Install dependencies**:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. **Set up environment variables** (optional):
```bash
# Create .env.local file
VITE_API_URL=http://localhost:8000
```

3. **Run development server**:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The app will be available at `http://localhost:3000`

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/              # API client
│   │   └── client.ts     # Axios client with interceptors
│   ├── components/       # React components
│   │   ├── base/         # Base field components
│   │   │   ├── InputField.tsx
│   │   │   ├── SelectField.tsx
│   │   │   └── TextAreaField.tsx
│   │   ├── forms/        # Form components
│   │   │   ├── DynamicForm.tsx
│   │   │   └── FormRenderer.tsx
│   │   └── layout/       # Layout components
│   │       └── Layout.tsx
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities
│   │   └── utils.ts      # Helper functions
│   ├── pages/            # Page components
│   │   ├── HomePage.tsx
│   │   ├── FormListPage.tsx
│   │   ├── FormPage.tsx
│   │   ├── SubmissionListPage.tsx
│   │   ├── SubmissionDetailPage.tsx
│   │   └── AdminDashboardPage.tsx
│   ├── types/            # TypeScript types
│   │   └── index.ts      # Type definitions
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
├── tailwind.config.js    # Tailwind config
└── postcss.config.js     # PostCSS config
```

---

## 🎨 Component Architecture

### Base Field Components

- **InputField**: Renders all HTML input types (text, number, email, password, tel, url, search, color)
- **SelectField**: Single/multi-select dropdown with "Other" option
- **TextAreaField**: Multi-line text input
- More field components will be added (checkbox, radio, date, file upload, etc.)

### Form Components

- **DynamicForm**: Main form component that fetches schema and manages form state
- **FormRenderer**: Recursively renders form fields based on API schema

### Layout Components

- **Layout**: Main layout wrapper with header, navigation, and footer

---

## 🔌 API Integration

The frontend communicates with the backend API through the API client (`src/api/client.ts`):

- Forms API: `getForms()`, `getForm()`, `getFormSchema()`
- Submissions API: `validateSubmission()`, `submitForm()`, `saveDraft()`, `getSubmissions()`, `getSubmission()`
- File Upload API: `uploadFile()`

---

## 🎯 Dynamic Form Rendering

Forms are rendered dynamically based on the API schema response:

1. **Fetch Schema**: `DynamicForm` fetches form schema from `/api/forms/{formId}/schema`
2. **Render Fields**: `FormRenderer` renders fields based on `fieldType` in schema
3. **Handle Changes**: Form data is stored in state and sent to backend on submit
4. **Validation**: Client-side validation with server-side validation on submit

---

## 🧪 Development

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## 📝 License

MIT License

