<#
    Borra definitivamente los issues sobrantes, los que quedaron titulados
    "[duplicado] borrar" y ya están cerrados.

    Solo funciona para el DUEÑO del repositorio: GitHub exige permiso de
    administrador para borrar issues, y en un repositorio personal los
    colaboradores no pueden tenerlo.

    Uso (lo ejecuta Benjamín):
      powershell -ExecutionPolicy Bypass -File borrar-duplicados.ps1 benjaminrizo/galeria-privada
#>
param([Parameter(Mandatory = $true)][string]$Repo)

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$sobrantes = @()
$pagina = 1
while ($true) {
    $lote = & gh api "repos/$Repo/issues?state=closed&per_page=100&page=$pagina" | Out-String | ConvertFrom-Json
    if (-not $lote -or $lote.Count -eq 0) { break }
    foreach ($i in $lote) { if (-not $i.pull_request -and $i.title -eq '[duplicado] borrar') { $sobrantes += $i.number } }
    if ($lote.Count -lt 100) { break }
    $pagina++
}

if ($sobrantes.Count -eq 0) { Write-Host "No hay nada que borrar." -ForegroundColor Green; exit }

Write-Host "Se van a borrar $($sobrantes.Count) issues sobrantes: #$($sobrantes -join ', #')" -ForegroundColor Yellow
$ok = 0
foreach ($n in ($sobrantes | Sort-Object)) {
    & gh issue delete $n --repo $Repo --yes 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) { $ok++; Write-Host "  #$n borrado" -ForegroundColor DarkGray }
    else { Write-Host "  #$n NO se pudo borrar (hace falta ser dueño o administrador)" -ForegroundColor Red; break }
    Start-Sleep -Milliseconds 300
}
Write-Host "`nBorrados $ok de $($sobrantes.Count)." -ForegroundColor Green
