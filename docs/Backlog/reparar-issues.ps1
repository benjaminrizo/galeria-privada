<#
    Deja el backlog de GitHub igual al de docs/Backlog, pase lo que pase:

      - si un issue ya existe (mismo título), le corrige el cuerpo,
        las etiquetas y el hito
      - si no existe, lo crea

    Se puede ejecutar las veces que haga falta: no duplica nada.

    Uso:
      powershell -ExecutionPolicy Bypass -File reparar-issues.ps1 benjaminrizo/galeria-privada
#>
param(
    [Parameter(Mandatory = $true)][string]$Repo,
    [int]$Proyecto = 0
)

$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot
[Environment]::CurrentDirectory = $PSScriptRoot
$sinBom = New-Object System.Text.UTF8Encoding $false
$utf8   = [System.Text.Encoding]::UTF8
$duenio = $Repo.Split('/')[0]

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
    if (-not (Test-Path -LiteralPath $completa)) { Write-Host "    FALTA EL ARCHIVO: $completa" -ForegroundColor Red; return $null }
    $lineas = [System.IO.File]::ReadAllText($completa, $utf8) -split "`r?`n"
    $i = 0
    if ($lineas.Count -gt 0 -and $lineas[0] -like '# *') { $i = 1 }
    while ($i -lt $lineas.Count -and $lineas[$i].Trim() -eq '') { $i++ }
    if ($i -ge $lineas.Count) { return '' }
    return (($lineas[$i..($lineas.Count - 1)]) -join "`n").TrimEnd()
}

# ------------------------------------------------- lo que ya hay en el repo
Write-Host "Leyendo lo que ya existe en $Repo..." -ForegroundColor Cyan
$existentes = @{}
$pagina = 1
while ($true) {
    $lote = & gh api "repos/$Repo/issues?state=all&per_page=100&page=$pagina" | Out-String | ConvertFrom-Json
    if (-not $lote -or $lote.Count -eq 0) { break }
    foreach ($i in $lote) { if (-not $i.pull_request) { $existentes[$i.title] = $i.number } }
    if ($lote.Count -lt 100) { break }
    $pagina++
}
Write-Host "  $($existentes.Count) issues ya creados."

$numHito = @{}
foreach ($m in (& gh api "repos/$Repo/milestones?state=all" | Out-String | ConvertFrom-Json)) { $numHito[$m.title] = $m.number }
Write-Host "  hitos: $(if ($numHito.Count) { $numHito.Keys -join ', ' } else { 'ninguno' })"

# ------------------------------------------------------------------ manifiesto
$filas = @()
foreach ($l in [System.IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'manifest.tsv'), $utf8)) {
    if ($l.Trim() -eq '') { continue }
    $c = $l -split "`t"
    if ($c.Count -lt 4) { continue }
    $filas += [pscustomobject]@{ Id = $c[0]; Titulo = $c[1]; Etiquetas = $c[2]; Archivo = $c[3] }
}
Write-Host "  $($filas.Count) entradas en el manifiesto."
Write-Host ""

$arreglados = 0; $nuevos = 0; $fallidos = @()

function Publicar($fila, $cuerpo) {
    $etq   = @($fila.Etiquetas -split ',')
    $datos = @{ title = $fila.Titulo; body = $cuerpo; labels = $etq }
    foreach ($p in @('MVP', 'Despues', 'Extra')) {
        if ($etq -contains $p -and $numHito.ContainsKey($p)) { $datos.milestone = $numHito[$p]; break }
    }
    if ($script:existentes.ContainsKey($fila.Titulo)) {
        $n = $script:existentes[$fila.Titulo]
        $r = Llamar 'PATCH' "repos/$Repo/issues/$n" $datos
        if ($r) { Write-Host ("  {0,-6} #{1} corregido" -f $fila.Id, $n) -ForegroundColor Yellow; $script:arreglados++; return $r }
    } else {
        $r = Llamar 'POST' "repos/$Repo/issues" $datos
        if ($r) {
            Write-Host ("  {0,-6} #{1} creado" -f $fila.Id, $r.number) -ForegroundColor Green
            $script:existentes[$fila.Titulo] = $r.number; $script:nuevos++
            if ($Proyecto -gt 0) { & gh project item-add $Proyecto --owner $duenio --url $r.html_url 2>&1 | Out-Null }
            return $r
        }
    }
    Write-Host ("  {0,-6} ERROR" -f $fila.Id) -ForegroundColor Red
    $script:fallidos += $fila.Id
    return $null
}

# Primero las épicas, para conocer su número y enlazarlas desde las historias.
Write-Host "Épicas:" -ForegroundColor Cyan
$numEpica = @{}
foreach ($f in ($filas | Where-Object { $_.Id -match '^E\d$' })) {
    $cuerpo = CuerpoDe $f.Archivo
    if ($null -eq $cuerpo) { $fallidos += $f.Id; continue }
    $r = Publicar $f $cuerpo
    if ($r) { $numEpica[$f.Id] = $r.number }
    Start-Sleep -Milliseconds 700
}

Write-Host ""
Write-Host "Historias:" -ForegroundColor Cyan
foreach ($f in ($filas | Where-Object { $_.Id -notmatch '^E\d$' })) {
    $cuerpo = CuerpoDe $f.Archivo
    if ($null -eq $cuerpo) { $fallidos += $f.Id; continue }
    $epica = @($f.Etiquetas -split ',') | Where-Object { $_ -match '^E\d$' } | Select-Object -First 1
    if ($epica -and $numEpica.ContainsKey($epica)) { $cuerpo += "`n`n---`n`nParte de #" + $numEpica[$epica] }
    Publicar $f $cuerpo | Out-Null
    Start-Sleep -Milliseconds 700
}

Write-Host ""
Write-Host "Corregidos: $arreglados   Creados: $nuevos   Total esperado: $($filas.Count)" -ForegroundColor Green
if ($fallidos.Count -gt 0) { Write-Host ("Fallaron: " + ($fallidos -join ', ')) -ForegroundColor Red }
Write-Host "  https://github.com/$Repo/issues"
