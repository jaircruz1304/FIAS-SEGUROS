# Corrección: la web debe leer únicamente desde OneDrive

Esta versión evita que la página publique JSON viejo guardado en el repositorio.

## Qué cambia

- El workflow descarga el Excel real desde OneDrive/SharePoint en cada ejecución.
- El JSON se genera dentro de `public/data/seguros/` solo durante el workflow.
- GitHub Pages publica la carpeta `public`.
- El workflow ya NO hace `git add`, `git commit` ni `git push` de `data/seguros`.
- Los JSON de `data/seguros/*.json` quedan ignorados por `.gitignore`.
- `app.js` usa `?v=Date.now()` y `cache:no-store` para evitar caché del navegador.

## Archivos que debes reemplazar

- `.github/workflows/deploy-pages.yml`
- `.github/workflows/update-seguros-fias.yml`
- `.gitignore`
- `assets/js/app.js`

También se incluye:
- `data/seguros/.gitkeep`

## Paso obligatorio para eliminar data vieja versionada

Aunque `.gitignore` esté actualizado, si los JSON ya estaban versionados, Git los seguirá rastreando.
Debes quitarlos del repositorio una sola vez:

```bash
git rm --cached data/seguros/*.json
git add .gitignore data/seguros/.gitkeep .github/workflows/deploy-pages.yml .github/workflows/update-seguros-fias.yml assets/js/app.js
git commit -m "Publicar datos desde OneDrive sin versionar JSON"
git push
```

Si usas GitHub Desktop:
1. Elimina del repositorio los JSON dentro de `data/seguros`.
2. Deja solo `.gitkeep` dentro de `data/seguros`.
3. Reemplaza los workflows y `app.js`.
4. Haz commit y push.

## Configuración requerida en GitHub Pages

En GitHub:
- Settings → Pages
- Source: **GitHub Actions**

Si está configurado como “Deploy from a branch”, seguirá publicando lo que existe en el repositorio y puede mostrar datos viejos.

## Importante

La página seguirá leyendo `data/seguros/seguros-vehiculares.json`, pero ese archivo ya no vendrá del repositorio:
vendrá del artefacto generado por el workflow con el Excel real de OneDrive.
