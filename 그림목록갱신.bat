@echo off
chcp 65001 >nul
rem 2006 A89 그림목록갱신: assets\pc-desktop\incoming 폴더의 그림 목록을 list.js로 만듭니다.
rem 서버 없이 index.html을 직접 열 때만 필요합니다. 그림을 넣거나 뺀 뒤 한 번 더블클릭하세요.
powershell -NoProfile -ExecutionPolicy Bypass -Command "$d=Join-Path '%~dp0' 'assets\pc-desktop\incoming'; $e='.webp','.png','.jpg','.jpeg','.gif','.bmp'; $f=Get-ChildItem -LiteralPath $d -File | Where-Object { $e -contains $_.Extension.ToLower() } | Sort-Object Name | Select-Object -First 120; $j=($f | ForEach-Object { '{\"name\":' + (ConvertTo-Json $_.Name -Compress) + ',\"size\":' + $_.Length + '}' }) -join ','; [IO.File]::WriteAllText((Join-Path $d 'list.js'),'window.A88_INCOMING=['+$j+'];',(New-Object Text.UTF8Encoding $false)); Write-Host ('그림 '+@($f).Count+'장을 목록에 넣었습니다.')"
echo.
pause
