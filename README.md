# Easy Cheesy

A single-page Next.js food-ordering experience backed by MongoDB Atlas. It includes a public menu, customer accounts, and an owner-only admin workspace without separate login or dashboard pages.

Created and maintained by **Navanith Krishna R**.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and replace its placeholder values.

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000). Customer sign-up, customer login, and owner login are available directly from the home page.

## Validation

```bash
npm run lint
npm run build
```

The MongoDB Atlas IP access list must permit the machine or deployment that runs the application.
