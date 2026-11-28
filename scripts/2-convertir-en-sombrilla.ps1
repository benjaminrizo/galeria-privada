<#
    PASO 2 de 2: convierte este repositorio en el repositorio sombrilla.

    Saca las 8 carpetas de codigo y las vuelve a enganchar como SUBMODULOS
    apuntando a los repositorios que publico el paso 1. Las rutas no cambian
    (services/ms-auth sigue siendo services/ms-auth), asi que el
    docker-compose.yml NO hay que tocarlo.

    El sombrilla conserva su historial completo y se queda con la
    documentacion, la infraestructura y el docker-compose.

    Antes de empezar crea la rama de respaldo "antes-de-separar", asi que
    siempre se puede volver atras.

    Uso:
      powershell -ExecutionPolicy Bypass -File scripts\2-convertir-en-sombrilla.ps1 NOMBRE-DE-LA-ORG
#>
param(
    [Parameter(Mandatory = $true)][string]$Org,
    [string]$Nombre = 'galeria-privada',
    [ValidateSet('public', 'private')][string]$Visibilidad = 'public'
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$raiz = Split-Path -Parent $PSScriptRoot
Set-Location $raiz

$rutas = @('services/ms-auth', 'services/ms-galerias', 'services/ms-media',
           'services/ms-seleccion', 'services/ms-notificaciones', 'services/ms-pagos',
           'gateway', 'frontend')

# --------------------------------------------------------------- comprobaciones
$sucio = & git status --porcelain
if ($sucio) { Write-Host "Tienes cambios sin confirmar. Haz commit antes de continuar." -ForegroundColor Red; exit 1 }

Write-Host "Comprobando que los 8 repositorios existen en '$Org'..." -ForegroundColor Cyan
foreach ($r in $rutas) {
    $n = Split-Path $r -Leaf
    & gh api "repos/$Org/$n" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Host "  falta https://github.com/$Org/$n  — ejecuta antes el paso 1" -ForegroundColor Red; exit 1 }
}
Write-Host "  los 8 existen" -ForegroundColor Green

# -------------------------------------------------------------------- respaldo
& git branch -f antes-de-separar HEAD 2>&1 | Out-Null
Write-Host "  respaldo guardado en la rama 'antes-de-separar'" -ForegroundColor Green

# ------------------------------------------------- sacar las carpetas de codigo
Write-Host "`nSacando las carpetas de codigo del repositorio..." -ForegroundColor Cyan
foreach ($r in $rutas) {
    & git rm -r --quiet $r 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Host "  fallo al quitar $r" -ForegroundColor Red; exit 1 }
    Write-Host "  $r" -ForegroundColor DarkGray
}
& git commit -q -m "Saca el codigo de los servicios: pasan a repositorios propios"

# ----------------------------------------------------- engancharlas como submodulos
Write-Host "`nEnganchando los repositorios como submodulos..." -ForegroundColor Cyan
foreach ($r in $rutas) {
    $n = Split-Path $r -Leaf
    & git submodule add --quiet "https://github.com/$Org/$n.git" $r 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Host "  fallo al enganchar $n" -ForegroundColor Red; exit 1 }
    Write-Host "  $r  ->  $Org/$n" -ForegroundColor Green
}

# -------------------------------------------------------- instrucciones de clonado
$texto = @"
# Como clonar y levantar el sistema

Este es el **repositorio sombrilla**. No contiene el codigo de los servicios:
lo referencia como submodulos de git, cada uno en su propio repositorio.

## Clonar todo de una vez

``````
git clone --recurse-submodules https://github.com/$Org/$Nombre.git
cd $Nombre
docker compose up --build
``````

Si ya lo clonaste sin ``--recurse-submodules``, las carpetas de los servicios
estaran vacias. Se arregla con:

``````
git submodule update --init --recursive
``````

## Los repositorios del sistema

| Repositorio | Que contiene |
|---|---|
| [$Nombre](https://github.com/$Org/$Nombre) | Este: docker-compose, documentacion e infraestructura |
$(($rutas | ForEach-Object { $n = Split-Path $_ -Leaf; "| [$n](https://github.com/$Org/$n) | Se monta en ``$_`` |" }) -join "`n")

## Trabajar en un servicio

Cada submodulo es un repositorio completo. Para trabajar en uno:

``````
cd services/ms-auth
git checkout main
# ...cambios, commit y push como en cualquier repositorio...
``````

Despues, en el sombrilla, se registra que version del servicio es la buena:

``````
cd ../..
git add services/ms-auth
git commit -m "Actualiza ms-auth"
git push
``````
"@
[System.IO.File]::WriteAllText((Join-Path $raiz 'COMO-CLONAR.md'), $texto, (New-Object System.Text.UTF8Encoding $false))
& git add .gitmodules COMO-CLONAR.md $rutas
& git commit -q -m "Engancha los servicios como submodulos y documenta el clonado"

# ------------------------------------------------------------ publicar el sombrilla
Write-Host "`nPublicando el repositorio sombrilla..." -ForegroundColor Cyan
& gh api "repos/$Org/$Nombre" 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    & gh repo create "$Org/$Nombre" "--$Visibilidad" --description "Galeria Privada: repositorio sombrilla con docker-compose, documentacion e infraestructura" 2>&1 | Out-Null
}
& git remote rename origin antiguo 2>&1 | Out-Null
& git remote remove sombrilla 2>&1 | Out-Null
& git remote add origin "https://github.com/$Org/$Nombre.git" 2>&1 | Out-Null
& git push -u --force origin main
if ($LASTEXITCODE -ne 0) { Write-Host "Fallo el push del sombrilla." -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "Listo. Los 9 repositorios:" -ForegroundColor Green
Write-Host "  https://github.com/$Org/$Nombre   (sombrilla)" -ForegroundColor Green
foreach ($r in $rutas) { Write-Host "  https://github.com/$Org/$(Split-Path $r -Leaf)" }
Write-Host "`nComprueba que todo sigue funcionando con: docker compose up --build" -ForegroundColor Yellow
