<#
    PASO 2 de 2: convierte este repositorio en el REPOSITORIO SOMBRILLA
    (umbrella project, capitulo 9).

    El sombrilla no contiene el codigo de los servicios: cada uno vive en su
    propio repositorio y aqui queda ignorado por .gitignore. El sombrilla se
    queda con lo que integra el sistema: el docker-compose, la documentacion,
    la infraestructura, el Makefile y los scripts.

    IMPORTANTE: los archivos NO se borran de tu disco. Solo dejan de estar
    versionados en este repositorio, porque ya lo estan en el suyo.

    Antes de empezar crea la rama de respaldo "antes-de-separar".

    Uso:
      powershell -ExecutionPolicy Bypass -File scripts\2-convertir-en-sombrilla.ps1 NOMBRE-DE-LA-ORG
#>
param(
    [Parameter(Mandatory = $true)][string]$Org,
    [string]$Nombre = 'galeria-privada',
    [ValidateSet('public', 'private')][string]$Visibilidad = 'public'
)

$ErrorActionPreference = 'Continue'
Set-Location (Split-Path -Parent $PSScriptRoot)
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$rutas = @('services/ms-auth', 'services/ms-galerias', 'services/ms-media',
           'services/ms-seleccion', 'services/ms-notificaciones', 'services/ms-pagos',
           'gateway', 'frontend')

# --------------------------------------------------------------- comprobaciones
if (& git status --porcelain) {
    Write-Host "Tienes cambios sin confirmar. Haz commit antes de continuar." -ForegroundColor Red; exit 1
}

Write-Host "Comprobando que los 8 repositorios existen en '$Org'..." -ForegroundColor Cyan
foreach ($r in $rutas) {
    $n = Split-Path $r -Leaf
    & gh api "repos/$Org/$n" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  falta https://github.com/$Org/$n  -- ejecuta antes el paso 1" -ForegroundColor Red; exit 1
    }
}
Write-Host "  los 8 existen" -ForegroundColor Green

& git branch -f antes-de-separar HEAD 2>&1 | Out-Null
Write-Host "  respaldo en la rama 'antes-de-separar'" -ForegroundColor Green

# ------------------------------------- dejar de versionar el codigo (sin borrar)
Write-Host "`nSacando el codigo de los servicios del control de versiones..." -ForegroundColor Cyan
foreach ($r in $rutas) {
    & git rm -r --cached --quiet $r 2>&1 | Out-Null   # --cached: NO borra los archivos
    Write-Host "  $r  (los archivos siguen en tu disco)" -ForegroundColor DarkGray
}

# ----------------------------------------------------------------- .gitignore
$lineas = @(
  '',
  '# --- Repositorio sombrilla ---------------------------------------------',
  '# El codigo de cada componente vive en su propio repositorio. Aqui se',
  '# clona (scripts/clonar.sh) pero no se versiona, para que no haya dos',
  '# copias de la misma historia.'
) + ($rutas | ForEach-Object { "$_/" })

$gitignore = '.gitignore'
$actual = if (Test-Path $gitignore) { [System.IO.File]::ReadAllText($gitignore) } else { '' }
if ($actual -notmatch 'Repositorio sombrilla') {
    [System.IO.File]::AppendAllText($gitignore, ($lineas -join "`n") + "`n")
    Write-Host "  .gitignore actualizado" -ForegroundColor Green
}

# ------------------------------------------------------- instrucciones de uso
$filas = ($rutas | ForEach-Object {
    $n = Split-Path $_ -Leaf
    "| [$n](https://github.com/$Org/$n) | se clona en ``$_`` |"
}) -join "`n"

$texto = @"
# Como clonar y levantar el sistema

Este es el **repositorio sombrilla** (umbrella project). No contiene el codigo
de los servicios: cada uno vive en su propio repositorio y cada equipo lo
despliega por su cuenta. Aqui estan el ``docker-compose`` que los integra, la
documentacion y la infraestructura.

## Levantar todo desde cero

``````
git clone https://github.com/$Org/$Nombre.git
cd $Nombre
bash scripts/clonar.sh $Org     # trae los 8 repositorios
make start                      # levanta el sistema completo
``````

Si no tienes ``make``, el equivalente es ``docker compose up -d --build``.

## Los repositorios del sistema

| Repositorio | Donde se monta |
|---|---|
| [$Nombre](https://github.com/$Org/$Nombre) | este: docker-compose, documentacion e infraestructura |
$filas

## Trabajar en un servicio

Cada componente es un repositorio completo, con su propio ``Makefile`` y su
propio ``docker-compose``, asi que se puede trabajar en el **sin levantar el
sistema entero**:

``````
cd services/ms-auth
make start      # solo este servicio y su base de datos
make test
``````

Y para trabajar sobre el sistema completo con recarga en caliente:

``````
make dev        # desde el sombrilla
``````

Son los dos modos que pide el capitulo 8 (Guideline 4): un servicio suelto o
un subsistema entero, y los dos igual de faciles.
"@
[System.IO.File]::WriteAllText('COMO-CLONAR.md', $texto, (New-Object System.Text.UTF8Encoding $false))

& git add -A
& git commit -q -m "Convierte el repositorio en el sombrilla: el codigo de cada componente pasa a su propio repositorio"

# ------------------------------------------------------------ publicar
Write-Host "`nPublicando el sombrilla..." -ForegroundColor Cyan
& gh api "repos/$Org/$Nombre" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    & gh repo create "$Org/$Nombre" "--$Visibilidad" --description "Galeria Privada: repositorio sombrilla con docker-compose, documentacion e infraestructura" 2>&1 | Out-Null
    Write-Host "  repositorio creado (si querias conservar los 40 issues, habria que transferir el antiguo)" -ForegroundColor Yellow
}
& git remote rename origin antiguo 2>&1 | Out-Null
& git remote remove origin 2>&1 | Out-Null
& git remote add origin "https://github.com/$Org/$Nombre.git" 2>&1 | Out-Null
& git push -u origin main
if ($LASTEXITCODE -ne 0) { Write-Host "Fallo el push del sombrilla." -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "Listo. Los 9 repositorios:" -ForegroundColor Green
Write-Host "  https://github.com/$Org/$Nombre   (sombrilla)" -ForegroundColor Green
foreach ($r in $rutas) { Write-Host "  https://github.com/$Org/$(Split-Path $r -Leaf)" }
Write-Host "`nComprueba que todo sigue funcionando con: make start" -ForegroundColor Yellow
