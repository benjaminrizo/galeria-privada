<#
    Crea en GitHub todo el backlog: etiquetas, hitos, las 8 épicas,
    las 20 historias de usuario y las 12 historias técnicas.

    Cada historia queda enlazada a su épica con "Parte de #N" y asignada
    al hito que le corresponde según su prioridad.

    Requisitos: GitHub CLI instalado y con sesión iniciada (gh auth login).

    Uso:
      powershell -ExecutionPolicy Bypass -File crear-issues.ps1 benjaminrizo/galeria-privada

    Ojo: ejecutarlo dos veces crea los issues por duplicado.
#>
param(
    [Parameter(Mandatory = $true)][string]$Repo,
    [int]$Proyecto = 0
)

$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot
# .NET no usa la ubicación de PowerShell sino la del proceso: hay que
# fijarla también, o las rutas relativas del manifiesto no se encuentran.
[Environment]::CurrentDirectory = $PSScriptRoot
$sinBom  = New-Object System.Text.UTF8Encoding $false
$utf8    = [System.Text.Encoding]::UTF8
$duenio  = $Repo.Split('/')[0]

# Manda una petición a la API pasando el cuerpo en un archivo, para que los
# acentos no tengan que pasar por la línea de comandos (PowerShell 5.1 los
# estropea al llamar a programas externos).
function Enviar($ruta, $datos) {
    $tmp = [System.IO.Path]::GetTempFileName()
    try {
        [System.IO.File]::WriteAllText($tmp, ($datos | ConvertTo-Json -Depth 6 -Compress), $sinBom)
        $resp = & gh api $ruta --method POST --input $tmp 2>&1
        if ($LASTEXITCODE -ne 0) { return $null }
        return ($resp | Out-String | ConvertFrom-Json)
    } catch { return $null } finally { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
}

function CuerpoDe($ruta) {
    $completa = Join-Path $PSScriptRoot $ruta
    $lineas = [System.IO.File]::ReadAllText($completa, $utf8) -split "`r?`n"
    $i = 0
    if ($lineas.Count -gt 0 -and $lineas[0] -like '# *') { $i = 1 }
    while ($i -lt $lineas.Count -and $lineas[$i].Trim() -eq '') { $i++ }
    if ($i -ge $lineas.Count) { return '' }
    return (($lineas[$i..($lineas.Count - 1)]) -join "`n").TrimEnd()
}

function AlProyecto($url) {
    if ($Proyecto -le 0) { return }
    & gh project item-add $Proyecto --owner $duenio --url $url 2>&1 | Out-Null
}

# ------------------------------------------------------------------ etiquetas
Write-Host "Creando etiquetas en $Repo..." -ForegroundColor Cyan
$etiquetas = @(
    @{ name = 'epica';            color = '5319E7'; description = 'Épica' },
    @{ name = 'historia-usuario'; color = '1D76DB'; description = 'Historia de usuario' },
    @{ name = 'historia-tecnica'; color = '0E8A16'; description = 'Historia técnica' },
    @{ name = 'MVP';              color = 'B60205'; description = 'Lo primero que se construye' },
    @{ name = 'Despues';          color = 'FBCA04'; description = 'Si el MVP va bien' },
    @{ name = 'Extra';            color = 'C5DEF5'; description = 'Solo si sobra tiempo' }
)
1..8 | ForEach-Object { $etiquetas += @{ name = "E$_"; color = 'BFD4F2'; description = "Pertenece a la épica $_" } }
foreach ($e in $etiquetas) { Enviar "repos/$Repo/labels" $e | Out-Null }
Write-Host "  $($etiquetas.Count) etiquetas listas."

# ---------------------------------------------------------------------- hitos
Write-Host "Creando hitos..." -ForegroundColor Cyan
foreach ($h in @(
    @{ title = 'MVP';     description = 'Lo primero que se construye' },
    @{ title = 'Despues'; description = 'Si el MVP va bien' },
    @{ title = 'Extra';   description = 'Solo si sobra tiempo' })) {
    Enviar "repos/$Repo/milestones" $h | Out-Null
}
# Se vuelven a leer para quedarnos con su número, existieran ya o no.
$numHito = @{}
foreach ($m in (& gh api "repos/$Repo/milestones?state=all" | Out-String | ConvertFrom-Json)) {
    $numHito[$m.title] = $m.number
}
Write-Host "  hitos: $($numHito.Keys -join ', ')"

# ------------------------------------------------------------------ manifiesto
$filas = @()
foreach ($l in [System.IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'manifest.tsv'), $utf8)) {
    if ($l.Trim() -eq '') { continue }
    $c = $l -split "`t"
    if ($c.Count -lt 4) { continue }
    $filas += [pscustomobject]@{ Id = $c[0]; Titulo = $c[1]; Etiquetas = $c[2]; Archivo = $c[3] }
}

$numEpica = @{}
$creados  = 0
$fallidos = @()

# --------------------------------------------------------------------- épicas
# Van primero para conocer su número y poder enlazarlas desde cada historia.
Write-Host "Creando las épicas..." -ForegroundColor Cyan
foreach ($f in ($filas | Where-Object { $_.Id -match '^E\d$' })) {
    $r = Enviar "repos/$Repo/issues" @{
        title  = $f.Titulo
        body   = (CuerpoDe $f.Archivo)
        labels = @($f.Etiquetas -split ',')
    }
    if ($r) {
        $numEpica[$f.Id] = $r.number
        $creados++
        Write-Host ("  {0} -> #{1}" -f $f.Id, $r.number)
    } else {
        $fallidos += $f.Id
        Write-Host ("  {0} -> ERROR" -f $f.Id) -ForegroundColor Red
    }
    AlProyecto $r.html_url
    Start-Sleep -Milliseconds 800
}

# ------------------------------------------------------------------ historias
Write-Host "Creando las historias..." -ForegroundColor Cyan
foreach ($f in ($filas | Where-Object { $_.Id -notmatch '^E\d$' })) {
    $etq    = @($f.Etiquetas -split ',')
    $cuerpo = CuerpoDe $f.Archivo

    # La etiqueta E1..E8 dice a qué épica pertenece: se añade el enlace.
    $epica = $etq | Where-Object { $_ -match '^E\d$' } | Select-Object -First 1
    if ($epica -and $numEpica.ContainsKey($epica)) {
        $cuerpo += "`n`n---`n`nParte de #" + $numEpica[$epica]
    }

    $datos = @{ title = $f.Titulo; body = $cuerpo; labels = $etq }
    foreach ($p in @('MVP', 'Despues', 'Extra')) {
        if ($etq -contains $p -and $numHito.ContainsKey($p)) { $datos.milestone = $numHito[$p]; break }
    }

    $r = Enviar "repos/$Repo/issues" $datos
    if ($r) {
        $creados++
        Write-Host ("  {0} -> #{1}" -f $f.Id, $r.number)
    } else {
        $fallidos += $f.Id
        Write-Host ("  {0} -> ERROR" -f $f.Id) -ForegroundColor Red
    }
    AlProyecto $r.html_url
    Start-Sleep -Milliseconds 800
}

Write-Host ""
Write-Host "Creados $creados de $($filas.Count) issues." -ForegroundColor Green
if ($fallidos.Count -gt 0) {
    Write-Host ("No se pudieron crear: " + ($fallidos -join ', ')) -ForegroundColor Red
}
Write-Host "  https://github.com/$Repo/issues"
