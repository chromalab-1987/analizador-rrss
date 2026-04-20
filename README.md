# ChromaLab · Social Analyzer

Analizador de redes sociales con datos reales de Meta Graph API e insights generados por Groq (Llama 3.3 70B).

## Stack

- **Frontend**: Next.js 15 + React 19
- **API Routes**: Next.js (proxy seguro para Meta y Groq)
- **IA**: Groq API — Llama 3.3 70B
- **Datos**: Meta Graph API v19.0
- **Deploy**: Vercel

---

## Setup local

### 1. Clonar y instalar

```bash
git clone https://github.com/TU_USUARIO/chromalab-social.git
cd chromalab-social
npm install
```

### 2. Variables de entorno

Copiá el template y completá los valores:

```bash
cp .env.local.example .env.local
```

Editá `.env.local`:

```env
META_ACCESS_TOKEN=TU_APP_ACCESS_TOKEN
META_FB_PAGE_ID=TU_PAGE_ID          # solo para Instagram Business Discovery
GROQ_API_KEY=gsk_...
```

### 3. Obtener META_ACCESS_TOKEN

1. Ir a [developers.facebook.com](https://developers.facebook.com)
2. Crear una app → tipo "Business"
3. Ir a **Graph API Explorer**
4. Generar un **App Access Token** (formato: `{app-id}|{app-secret}`)
5. Copiar ese token en `META_ACCESS_TOKEN`

> Para analizar páginas de Facebook: solo necesitás el App Token.
> Para analizar cuentas de Instagram Business: también necesitás `META_FB_PAGE_ID` (el ID de una página de Facebook tuya conectada a una cuenta IG Business).

### 4. Correr en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

---

## Deploy en Vercel

### Opción A — Deploy desde GitHub (recomendado)

1. Subir el repo a GitHub
2. Ir a [vercel.com](https://vercel.com) → "New Project"
3. Importar el repositorio
4. En **Environment Variables**, agregar:
   - `META_ACCESS_TOKEN`
   - `META_FB_PAGE_ID` (opcional, para Instagram)
   - `GROQ_API_KEY`
5. Click en **Deploy** ✓

### Opción B — Deploy con CLI

```bash
npm i -g vercel
vercel --prod
```

---

## Estructura del proyecto

```
chromalab-social/
├── app/
│   ├── layout.jsx          # root layout con fonts
│   ├── page.jsx            # frontend completo
│   ├── globals.css         # ChromaLab design system
│   └── api/
│       ├── analyze/
│       │   └── route.js    # proxy → Meta Graph API
│       └── insights/
│           └── route.js    # proxy → Groq API
├── lib/
│   ├── meta.js             # helpers Meta Graph API
│   └── groq.js             # helper Groq API
├── .env.local.example      # template de variables
├── .gitignore
├── next.config.mjs
└── package.json
```

---

## Modo demo

Si `META_ACCESS_TOKEN` no está configurado, la app cae automáticamente a **datos simulados** con un aviso en el dashboard. Groq sigue funcionando con esos datos.

---

## Roadmap

- [ ] Análisis de sentimiento real en comentarios
- [ ] Comparador de cuentas (A vs B)
- [ ] Exportar reporte PDF
- [ ] Autenticación con login de Meta (OAuth) para datos más completos
- [ ] Historial de análisis
