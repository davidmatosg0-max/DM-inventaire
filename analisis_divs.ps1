$filePath = "C:\Users\david\Documents\Gestion-d-inventaire-DM-main\src\app\components\EntradaDonAchat.tsx"
$content = Get-Content $filePath -Raw

# Remover comentarios y strings para análisis más preciso
$cleanContent = $content -replace '/\*[\s\S]*?\*/', '' # Comentarios multi-línea
$cleanContent = $cleanContent -replace '//.*$', '' # Comentarios de línea

# Contar divs
$openDivMatches = [regex]::Matches($cleanContent, '<div(?:\s[^>]*)?>') 
$selfCloseDivMatches = [regex]::Matches($cleanContent, '<div(?:\s[^>]*)?/>') 
$closeDivMatches = [regex]::Matches($cleanContent, '</div>')

Write-Host "=== ANÁLISIS GLOBAL ===" -ForegroundColor Green
Write-Host "Total <div> encontrados: $($openDivMatches.Count)"
Write-Host "Total <div/> auto-cerrados: $($selfCloseDivMatches.Count)"
Write-Host "DIVs que necesitan </div>: $($openDivMatches.Count - $selfCloseDivMatches.Count)"
Write-Host "Total </div> encontrados: $($closeDivMatches.Count)"
Write-Host "DIFERENCIA: $($openDivMatches.Count - $selfCloseDivMatches.Count - $closeDivMatches.Count)" -ForegroundColor $(if (($openDivMatches.Count - $selfCloseDivMatches.Count - $closeDivMatches.Count) -eq 0) { "Green" } else { "Red" })

# Ahora análisis con stack
$lines = $content -split "`n"
$stack = New-Object System.Collections.ArrayList
$lineNum = 0

foreach ($line in $lines) {
    $lineNum++
    
    # Detectar divs auto-cerrados en una o múltiples líneas
    if ($line -match '<div\s') {
        # Mirar las siguientes 15 líneas para ver si hay />
        $lookAhead = ""
        for ($i = 0; $i -lt 15 -and ($lineNum + $i - 1) -lt $lines.Count; $i++) {
            $lookAhead += $lines[$lineNum + $i - 1]
            if ($lookAhead -match '/>') {
                break
            }
        }
        
        # Si NO es auto-cerrado, agregarlo al stack
        if ($lookAhead -notmatch '/>') {
            $className = if ($line -match 'className\s*=\s*"([^"]+)"' -or $line -match 'className\s*=\s*\{[^}]*"([^"]+)"') {
                $matches[1]
            } else {
                "(sin className)"
            }
            
            if ($className.Length -gt 70) {
                $className = $className.Substring(0, 70) + "..."
            }
            
            [void]$stack.Add(@{
                Line = $lineNum
                Class = $className
                Code = $line.Trim().Substring(0, [Math]::Min(100, $line.Trim().Length))
            })
        }
    }
    
    # Contar cierres en esta línea
    $closeCount = ([regex]::Matches($line, '</div>')).Count
    for ($i = 0; $i -lt $closeCount; $i++) {
        if ($stack.Count -gt 0) {
            [void]$stack.RemoveAt($stack.Count - 1)
        }
    }
}

Write-Host "`n=== DIVs SIN CERRAR (STACK ANALYSIS) ===" -ForegroundColor Red
Write-Host "Total: $($stack.Count)`n" -ForegroundColor Yellow

if ($stack.Count -gt 0) {
    foreach ($item in $stack) {
        Write-Host "────────────────────────────────────────" -ForegroundColor DarkGray
        Write-Host "Línea $($item.Line):" -ForegroundColor Cyan
        Write-Host "  className: `"$($item.Class)`"" -ForegroundColor White
        Write-Host "  Código: $($item.Code)" -ForegroundColor Gray
    }
    Write-Host "────────────────────────────────────────" -ForegroundColor DarkGray
} else {
    Write-Host "OK: Todos los divs estan cerrados correctamente" -ForegroundColor Green
}
