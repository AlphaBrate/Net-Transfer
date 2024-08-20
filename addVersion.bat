@echo off

echo (C) AlphaBrate 2022-2024.

set /p version=Enter version number: 

echo Adding Version %version%

mkdir compiled 2>nul
mkdir compiled\mac 2>nul
mkdir compiled\win 2>nul
mkdir compiled\mac\%version% 2>nul
mkdir compiled\win\%version% 2>nul

echo. 
echo Moving files...

if exist dist\nettransfer-macos (
    move dist\nettransfer-macos compiled\mac\%version%\transfer-macos
) else (
    echo dist\nettransfer-macos not found.
)

if exist dist\nettransfer-win.exe (
    move dist\nettransfer-win.exe compiled\win\%version%\transfer.exe
) else (
    echo dist\nettransfer-win.exe not found.
)

echo File moved...
echo. 
echo Copying files...

xcopy /E /I /Y files compiled\mac\%version%\files >nul
xcopy /E /I /Y files compiled\win\%version%\files >nul

echo Files copied...
echo. 
echo Done.

pause