# PowerShell Script to Find and List All alert() Calls
# This helps you identify which files need updating

Write-Host "🔍 Searching for alert() calls in the project..." -ForegroundColor Cyan
Write-Host ""

$searchPath = "src"
$pattern = "alert\("

# Find all files with alert calls
$results = Get-ChildItem -Path $searchPath -Recurse -Include *.tsx,*.ts,*.jsx,*.js | 
    Select-String -Pattern $pattern | 
    Group-Object Path | 
    Select-Object @{Name='File';Expression={$_.Name}}, Count | 
    Sort-Object Count -Descending

Write-Host "📊 Found alert() calls in the following files:" -ForegroundColor Yellow
Write-Host ""

$totalAlerts = 0
$fileCount = 0

foreach ($result in $results) {
    $fileCount++
    $totalAlerts += $result.Count
    $fileName = Split-Path $result.File -Leaf
    $relativePath = $result.File.Replace((Get-Location).Path + "\", "")
    
    $color = "White"
    if ($result.Count -ge 6) { $color = "Red" }
    elseif ($result.Count -ge 4) { $color = "Yellow" }
    elseif ($result.Count -ge 2) { $color = "Cyan" }
    
    Write-Host ("{0,2}. " -f $fileCount) -NoNewline
    Write-Host ("{0,-50}" -f $fileName) -NoNewline -ForegroundColor $color
    Write-Host (" ({0} alerts)" -f $result.Count) -ForegroundColor Gray
    Write-Host ("    {0}" -f $relativePath) -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "📈 Summary:" -ForegroundColor Green
Write-Host ("   Total Files: {0}" -f $fileCount) -ForegroundColor White
Write-Host ("   Total Alerts: {0}" -f $totalAlerts) -ForegroundColor White
Write-Host ""
Write-Host "✅ Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Open REPLACE_ALERTS_GUIDE.md for instructions"
Write-Host "   2. Start with files marked in RED (most alerts)"
Write-Host "   3. Follow the replacement pattern in the guide"
Write-Host ""
Write-Host "💡 Tip: Use Ctrl+F in VS Code to find 'alert(' in each file" -ForegroundColor Yellow
