<#
    Devuelve a cada issue abierto las etiquetas y el hito que le tocan según
    docs/Backlog/manifest.tsv. No toca el texto ni crea ni borra nada, así que
    es seguro ejecutarlo cuantas veces haga falta.

    Con -SoloMirar dice qué está descuadrado sin cambiar nada.

    Uso:
      powershell -ExecutionPolicy Bypass -File sincronizar-etiquetas.ps1 benjaminrizo/galeria-privada -SoloMirar
      powershell -ExecutionPolicy Bypass -File sincronizar-etiquetas.ps1 benjaminrizo/galeria-privada
#>
param(
    [Parameter(Mandatory = $true)][string]$Repo,
    [switch]$SoloMirar
)

Set-Location $PSScriptRoot
[Environment]::CurrentDirectory = $PSScriptRoot
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$sinBom = New-Object System.Text.UTF8Encoding $false
$utf8   = [System.Text.Encoding]::UTF8

$numHito = @{}
foreach ($m in (& gh api "repos/$Repo/milestones?state=all" | Out-String | ConvertFrom-Json)) { $numHito[$m.title] = $m.number }

$actual = @{}
$pagina = 1
while ($true) {
    $lote = & gh api "repos/$Repo/issues?state=open&per_page=100&page=$pagina" | Out-String | ConvertFrom-Json
    if (-not $lote -or $lote.Count -eq 0) { break }
    foreach ($i in $lote) {
        if ($i.pull_request) { continue }
        if ($i.title -match '^\[([^\]]+)\]') {
            $actual[$Matches[1]] = [pscustomobject]@{
                Numero    = $i.number
                Etiquetas = (@($i.labels | ForEach-Object { $_.name }) | Sort-Object) -join ','
                Hito      = $(if ($i.milestone) { $i.milestone.title } else { '' })
            }
        }
    }
    if ($lote.Count -lt 100) { break }
    $pagina++
}

$revisados = 0; $corregidos = 0; $ausentes = @()
foreach ($l in [System.IO.File]::ReadAllLines((Join-Path $PSScriptRoot 'manifest.tsv'), $utf8)) {
    if ($l.Trim() -eq '') { continue }
    $c = $l -split "`t"
    if ($c.Count -lt 4) { continue }
    $id = $c[0]; $etq = @($c[2] -split ',')
    if (-not $actual.ContainsKey($id)) { $ausentes += $id; continue }
    $revisados++

    $hito = ''
    foreach ($p in @('MVP', 'Despues', 'Extra')) { if ($etq -contains $p) { $hito = $p; break } }

    $a = $actual[$id]
    $esperado = ($etq | Sort-Object) -join ','
    if ($a.Etiquetas -eq $esperado -and $a.Hito -eq $hito) { continue }

    Write-Host ("  {0,-7} #{1}" -f $id, $a.Numero) -ForegroundColor Yellow
    Write-Host ("          etiquetas: {0}  ->  {1}" -f $(if ($a.Etiquetas) { $a.Etiquetas } else { '(ninguna)' }), $esperado)
    if ($a.Hito -ne $hito) { Write-Host ("          hito: {0}  ->  {1}" -f $(if ($a.Hito) { $a.Hito } else { '(ninguno)' }), $(if ($hito) { $hito } else { '(ninguno)' })) }
    $corregidos++
    if ($SoloMirar) { continue }

    $datos = @{ labels = $etq }
    if ($hito -and $numHito.ContainsKey($hito)) { $datos.milestone = $numHito[$hito] } else { $datos.milestone = $null }
    $tmp = [System.IO.Path]::GetTempFileName()
    [System.IO.File]::WriteAllText($tmp, ($datos | ConvertTo-Json -Depth 5 -Compress), $sinBom)
    & gh api "repos/$Repo/issues/$($a.Numero)" --method PATCH --input $tmp 2>&1 | Out-Null
    Remove-Item $tmp -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 400
}

Write-Host ""
if ($corregidos -eq 0) { Write-Host "Los $revisados issues estan correctos. No habia nada que arreglar." -ForegroundColor Green }
elseif ($SoloMirar)    { Write-Host "$corregidos descuadrados de $revisados. Vuelve a ejecutarlo sin -SoloMirar para arreglarlos." -ForegroundColor Yellow }
else                   { Write-Host "$corregidos arreglados de $revisados." -ForegroundColor Green }
if ($ausentes.Count -gt 0) { Write-Host ("No se encontraron en GitHub: " + ($ausentes -join ', ')) -ForegroundColor Red }
