import { app, port } from './app';

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(Number(port), '0.0.0.0', () => {
  console.log(`Lumière Backend server running on port ${port} (0.0.0.0)`);
});
