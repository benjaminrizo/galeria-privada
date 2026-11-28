<#
    Deja el backlog de GitHub exactamente igual al de docs/Backlog:

      1. borra los issues duplicados (se queda con el número más bajo de cada uno)
      2. a los que quedan les pone el cuerpo, las etiquetas y el hito correctos
      3. crea los que falten

    Empareja por el identificador entre corchetes del título ([E1], [HU-01],
    [HT-01]), que es texto simple, para que los acentos no rompan la búsqueda.

    Se puede ejecutar las veces que haga falta.

    Uso:
      powershell -ExecutionPolicy Bypass -File limpiar-y-reparar.ps1 benjaminrizo/galeria-privada
#>
param(
    [Parameter(Mandatory = $true)][string]$Repo,
    [switch]$SoloMirar
)

$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot
[Environment]::CurrentDirectory = $PSScriptRoot
# Sin esto, PowerShell 5.1 lee la salida de gh con la página de códigos de la
# consola y destroza los acentos: por eso antes no encontraba los títulos.
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$sinBom = New-Object System.Text.UTF8Encoding $false
$utf8   = [System.Text.Encoding]::UTF8

function Llamar($metodo, $ruta, $datos) {
    $tmp = [System.IO.Path]::GetTempFileName()
    try {
        [System.IO.File]::WriteAllText($tmp, ($datos | ConvertTo-Json -Depth 6 -Compress), $sinBom)
        $resp = & gh api $ruta --method $metodo --input $tmp 2>&1
        if ($LASTEXITCODE -ne 0) { Write-Host ("    " + ($resp | Out-String).Trim()) -ForegroundColor DarkGray; return $null }
        return ($resp | Out-String | ConvertFrom-Json)
    } catch { return $null } finally { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
}

function CuerpoDe($ruta) {
    $completa = Join-Path $PSScriptRoot $ruta
    if (-not (Test-Path -LiteralPath $completa)) { Write-Host "    FALTA: $completa" -ForegroundColor Red; return $null }
    $lineas = [System.IO.File]::ReadAllText($completa, $utf8) -split "`r?`n"
    $i = 0
    if ($lineas.Count -gt 0 -and $lineas[0] -like '# *') { $i = 1 }
    while ($i -lt $lineas.Count -and $lineas[$i].Trim() -eq '') { $i++ }
    if ($i -ge $lineas.Count) { return '' }
    return (($lineas[$i..($lineas.Count - 1)]) -join "`n").TrimEnd()
}

# ------------------------------------------------ inventario de lo que hay
Write-Host "Leyendo $Repo..." -ForegroundColor Cyan
$todos = @()
$pagina = 1
while ($true) {
    $lote = & gh api "repos/$Repo/issues?state=all&per_page=100&page=$pagina" | Out-String | ConvertFrom-Json
    if (-not $lote -or $lote.Count -eq 0) { break }
    foreach ($i in $lote) { if (-not $i.pull_request) { $todos += $i } }
    if ($lote.Count -lt 100) { break }
    $pagina++
}
Write-Host "  $($todos.Count) issues en el repositorio."

# Agrupa por el identificador entre corchetes del título.
$porId = @{}
foreach ($i in $todos) {
    # Los sobrantes ya cerrados de una pasada anterior no cuentan como issues
    # del backlog: ni se tocan ni se vuelven a cerrar.
    if ($i.title -eq '[duplicado] borrar') { continue }
    if ($i.title -match '^\[([^\]]+)\]') {
        $id = $Matches[1]
        if (-not $porId.ContainsKey($id)) { $porId[$id] = @() }
        $porId[$id] += $i.number
    }
}

$aBorrar = @()
$sobrevive = @{}
foreach ($id in $porId.Keys) {
    $nums = @($porId[$id] | Sort-Object)
    $sobrevive[$id] = $nums[0]
    if ($nums.Count -gt 1) { $aBorrar += $nums[1..($nums.Count - 1)] }
}
$aBorrar = @($aBorrar | Sort-Object)

Write-Host "  identificadores distintos: $($porId.Count)"
Write-Host "  duplicados a borrar: $($aBorrar.Count)  $(if ($aBorrar.Count) { '(#' + ($aBorrar -join ', #') + ')' })" -ForegroundColor Yellow

if ($SoloMirar) { Write-Host "`n(modo solo mirar: no se tocó nada)" -ForegroundColor Cyan; exit }

# ------------------------------------------------------- borrar duplicados
$borrados = 0; $cerrados = 0; $sinPermiso = $false
foreach ($n in $aBorrar) {
    if (-not $sinPermiso) {
        & gh issue delete $n --repo $Repo --yes 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) { $borrados++; Write-Host "  #$n borrado" -ForegroundColor DarkGray; Start-Sleep -Milliseconds 300; continue }
        $sinPermiso = $true
        Write-Host "  No tienes permiso de administrador para borrar issues; se cerrarán en su lugar." -ForegroundColor Yellow
    }
    if (Llamar 'PATCH' "repos/$Repo/issues/$n" @{ state = 'closed'; labels = @(); milestone = $null; title = "[duplicado] borrar" }) {
        $cerrados++; Write-Host "  #$n cerrado como duplicado" -ForegroundColor DarkGray
    }
    Start-Sleep -Milliseconds 300
}

# ---------------------------------------------------------------- hitos
$numHito = @{}
foreach ($m in (& gh api "repos/$Repo/milestones?state=all" | Out-String | ConvertFrom-Json)) { $numHito[$m.title] = $m.number }

# ------------------------------------------------------------ manifiesto
$filas = @()
foreach ($l in [System.IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'manifest.tsv'), $utf8)) {
    if ($l.Trim() -eq '') { continue }
    $c = $l -split "`t"
    if ($c.Count -lt 4) { continue }
    $filas += [pscustomobject]@{ Id = $c[0]; Titulo = $c[1]; Etiquetas = $c[2]; Archivo = $c[3] }
}

$arreglados = 0; $nuevos = 0; $fallidos = @()

function Publicar($fila, $cuerpo) {
    $etq   = @($fila.Etiquetas -split ',')
    $datos = @{ title = $fila.Titulo; body = $cuerpo; labels = $etq }
    foreach ($p in @('MVP', 'Despues', 'Extra')) {
        if ($etq -contains $p -and $script:numHito.ContainsKey($p)) { $datos.milestone = $script:numHito[$p]; break }
    }
    if ($script:sobrevive.ContainsKey($fila.Id)) {
        $n = $script:sobrevive[$fila.Id]
        if (Llamar 'PATCH' "repos/$Repo/issues/$n" $datos) {
            Write-Host ("  {0,-6} #{1} corregido" -f $fila.Id, $n) -ForegroundColor Green
            $script:arreglados++; return $n
        }
    } else {
        $r = Llamar 'POST' "repos/$Repo/issues" $datos
        if ($r) {
            Write-Host ("  {0,-6} #{1} creado" -f $fila.Id, $r.number) -ForegroundColor Cyan
            $script:sobrevive[$fila.Id] = $r.number; $script:nuevos++; return $r.number
        }
    }
    Write-Host ("  {0,-6} ERROR" -f $fila.Id) -ForegroundColor Red
    $script:fallidos += $fila.Id
    return $null
}

Write-Host "`nÉpicas:" -ForegroundColor Cyan
$numEpica = @{}
foreach ($f in ($filas | Where-Object { $_.Id -match '^E\d$' })) {
    $cuerpo = CuerpoDe $f.Archivo
    if ($null -eq $cuerpo) { $fallidos += $f.Id; continue }
    $n = Publicar $f $cuerpo
    if ($n) { $numEpica[$f.Id] = $n }
    Start-Sleep -Milliseconds 500
}

Write-Host "`nHistorias:" -ForegroundColor Cyan
foreach ($f in ($filas | Where-Object { $_.Id -notmatch '^E\d$' })) {
    $cuerpo = CuerpoDe $f.Archivo
    if ($null -eq $cuerpo) { $fallidos += $f.Id; continue }
    $epica = @($f.Etiquetas -split ',') | Where-Object { $_ -match '^E\d$' } | Select-Object -First 1
    if ($epica -and $numEpica.ContainsKey($epica)) { $cuerpo += "`n`n---`n`nParte de #" + $numEpica[$epica] }
    Publicar $f $cuerpo | Out-Null
    Start-Sleep -Milliseconds 500
}

Write-Host ""
Write-Host "Duplicados borrados: $borrados   cerrados: $cerrados" -ForegroundColor Green
Write-Host "Issues corregidos: $arreglados   creados: $nuevos   (deberian ser $($filas.Count) en total)" -ForegroundColor Green
if ($fallidos.Count -gt 0) { Write-Host ("Fallaron: " + ($fallidos -join ', ')) -ForegroundColor Red }
Write-Host "  https://github.com/$Repo/issues"
