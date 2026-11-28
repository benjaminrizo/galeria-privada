<#
    PASO 1 de 2: separa el monorepo en 8 repositorios independientes.

    Cada componente conserva SU PROPIO historial de commits: se usa
    "git subtree split", que reescribe la historia quedándose solo con los
    commits que tocaron esa carpeta, y poniendo la carpeta como raíz.

    No modifica tu copia local: solo crea ramas auxiliares y publica.
    Es repetible: los repositorios que ya existan se actualizan.

    Requisitos: gh instalado y con sesión (gh auth login), y la organización
    ya creada en github.com/account/organizations/new

    Uso:
      powershell -ExecutionPolicy Bypass -File scripts\1-separar-repositorios.ps1 NOMBRE-DE-LA-ORG -SoloMirar
      powershell -ExecutionPolicy Bypass -File scripts\1-separar-repositorios.ps1 NOMBRE-DE-LA-ORG
#>
param(
    [Parameter(Mandatory = $true)][string]$Org,
    [ValidateSet('public', 'private')][string]$Visibilidad = 'public',
    [switch]$SoloMirar
)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$raiz = Split-Path -Parent $PSScriptRoot
Set-Location $raiz

$componentes = @(
    @{ Ruta = 'services/ms-auth';           Nombre = 'ms-auth';           Desc = 'Microservicio de identidad: registro, inicio de sesion y enlaces de acceso' },
    @{ Ruta = 'services/ms-galerias';       Nombre = 'ms-galerias';       Desc = 'Microservicio de galerias: sesiones, datos del cliente, limite y estado' },
    @{ Ruta = 'services/ms-media';          Nombre = 'ms-media';          Desc = 'Microservicio de medios: subida de fotos, miniaturas y entrega protegida' },
    @{ Ruta = 'services/ms-seleccion';      Nombre = 'ms-seleccion';      Desc = 'Microservicio de seleccion: fotos elegidas, comentarios y envio final' },
    @{ Ruta = 'services/ms-notificaciones'; Nombre = 'ms-notificaciones'; Desc = 'Microservicio de notificaciones: correos al fotografo y al cliente' },
    @{ Ruta = 'services/ms-pagos';          Nombre = 'ms-pagos';          Desc = 'Microservicio de pagos: pedidos y pago simulado de fotos extra' },
    @{ Ruta = 'gateway';                    Nombre = 'gateway';           Desc = 'API Gateway: unico punto de entrada, valida el token y orquesta' },
    @{ Ruta = 'frontend';                   Nombre = 'frontend';          Desc = 'Interfaz web en React para el fotografo y el cliente' }
)

# --------------------------------------------------------------- comprobaciones
Write-Host "Comprobando..." -ForegroundColor Cyan
& git rev-parse --is-inside-work-tree 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "No estas dentro del repositorio. Ejecutalo desde la carpeta del proyecto." -ForegroundColor Red; exit 1 }

$sucio = & git status --porcelain
if ($sucio) { Write-Host "Tienes cambios sin confirmar. Haz 'git add -A; git commit' antes de separar." -ForegroundColor Red; exit 1 }

& gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) { Write-Host "gh no tiene sesion. Ejecuta: gh auth login" -ForegroundColor Red; exit 1 }

$existeOrg = & gh api "orgs/$Org" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "No encuentro la organizacion '$Org'. Creala primero en:" -ForegroundColor Red
    Write-Host "  https://github.com/account/organizations/new" -ForegroundColor Yellow
    exit 1
}
Write-Host "  organizacion '$Org': existe" -ForegroundColor Green

foreach ($c in $componentes) {
    if (-not (Test-Path -LiteralPath $c.Ruta)) { Write-Host "  FALTA la carpeta $($c.Ruta)" -ForegroundColor Red; exit 1 }
}
Write-Host "  las 8 carpetas existen" -ForegroundColor Green
Write-Host ""

if ($SoloMirar) {
    Write-Host "Se crearian estos repositorios en https://github.com/$Org :" -ForegroundColor Cyan
    foreach ($c in $componentes) {
        $n = (& git log --oneline -- $c.Ruta | Measure-Object -Line).Lines
        Write-Host ("  {0,-20} <- {1,-30} ({2} commits de historial)" -f $c.Nombre, $c.Ruta, $n)
    }
    Write-Host "`n(modo solo mirar: no se toco nada)" -ForegroundColor Cyan
    exit
}

# --------------------------------------------------------------------- separar
$ok = 0; $fallos = @()
foreach ($c in $componentes) {
    $nombre = $c.Nombre
    Write-Host "$nombre" -ForegroundColor Cyan

    $rama = "separado/$nombre"
    & git branch -D $rama 2>&1 | Out-Null
    & git subtree split --prefix="$($c.Ruta)" -b $rama 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Host "  fallo el subtree split" -ForegroundColor Red; $fallos += $nombre; continue }
    $commits = (& git log --oneline $rama | Measure-Object -Line).Lines
    Write-Host "  historial separado: $commits commits" -ForegroundColor DarkGray

    & gh api "repos/$Org/$nombre" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        & gh repo create "$Org/$nombre" "--$Visibilidad" --description $c.Desc 2>&1 | Out-Null
        if ($LASTEXITCODE -ne 0) { Write-Host "  no se pudo crear el repositorio" -ForegroundColor Red; $fallos += $nombre; continue }
        Write-Host "  repositorio creado" -ForegroundColor DarkGray
    } else {
        Write-Host "  el repositorio ya existia" -ForegroundColor DarkGray
    }

    & git push --force "https://github.com/$Org/$nombre.git" "${rama}:main" 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { Write-Host "  fallo el push" -ForegroundColor Red; $fallos += $nombre; continue }

    Write-Host "  https://github.com/$Org/$nombre" -ForegroundColor Green
    $ok++
}

Write-Host ""
Write-Host "Publicados $ok de $($componentes.Count) repositorios." -ForegroundColor Green
if ($fallos.Count -gt 0) { Write-Host ("Fallaron: " + ($fallos -join ', ')) -ForegroundColor Red }
else { Write-Host "Ahora ejecuta el paso 2: scripts\2-convertir-en-sombrilla.ps1 $Org" -ForegroundColor Yellow }
