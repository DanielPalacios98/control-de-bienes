
## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
# control-de-bienes


## Environment Variables

- Backend `PORT`: Defaults to `8080`. Can be overridden via `process.env.PORT`. Server binds to `0.0.0.0` for container platforms (AWS App Runner compatible).
- Frontend `VITE_API_URL`: Defaults to `http://localhost:8080/api`. Configure per environment in `frontend/.env`.

### Local Development

- Backend: set `PORT=8080` in [backend/.env](backend/.env).
- Frontend: set `VITE_API_URL=http://localhost:8080/api` in [frontend/.env](frontend/.env).

## AWS App Runner

- Usa el archivo [apprunner.yaml](apprunner.yaml) en la raíz para configurar build y start en un monorepo:
   - Build: `cd backend && npm ci && npm run build`
   - Start: `cd backend && npm run start:prod`
- Asegúrate de que el servicio escuche en el puerto 8080 (el backend lo hace por defecto).
- Health check: puedes usar `/` del backend para verificar el estado.

### AWS App Runner (Frontend)

- Configura el servicio apuntando al directorio `frontend` y al archivo [frontend/apprunner.yaml](frontend/apprunner.yaml).
- Build: `npm ci` seguido de `npm run build` (lo define el archivo de configuración).
- Start: `npm run start:prod` expone el `vite preview` en `0.0.0.0:8080`.
- Define `VITE_API_URL` con la URL pública del backend para generar el bundle con el endpoint correcto.

### Pasos de despliegue
- Conecta el servicio a tu repo/branch.
- Selecciona "Configuration file" y apunta al archivo correspondiente (backend: `apprunner.yaml`, frontend: `frontend/apprunner.yaml`).
- Despliega el último commit y verifica los logs.

### Variables de entorno necesarias en App Runner
- `MONGODB_URI`: cadena de conexión a tu base de datos (Atlas u otra accesible desde internet).
- `JWT_SECRET`: secreto para firmar tokens JWT.
- Opcional: `PORT=8080` (por defecto ya usamos 8080).

Si `MONGODB_URI` no está configurado, el servicio arrancará pero las operaciones de base de datos fallarán. Configura `MONGODB_URI` para un backend funcional.