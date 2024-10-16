@echo off

echo (C) AlphaBrate 2024
echo Net-Transfer Updater

@REM Get parameters from the command line
set currentVersion=%1
set latestVersion=%2

set caller=%3

@REM If no caller, transfer.exe is calling the updater
if "%caller%"=="" (
    set caller=transfer.exe
)

@REM Check if the current version is not provided
if "%currentVersion%"=="" (
    echo Current version is not provided
    pause

    @REM Start the caller with an error message
    start %caller% update failed "current_version_not_provided"

    exit /b 1
)

@REM Check if the latest version is not provided
if "%latestVersion%"=="" (
    echo Latest version is not provided
    pause

    @REM Start the caller with an error message
    start %caller% update failed "latest_version_not_provided"

    exit /b 1
)

echo Current version: %currentVersion%
echo Latest version: %latestVersion%

echo.

@REM Check if the current version is the latest version
if "%currentVersion%"=="%latestVersion%" (
    echo Net-Transfer is already up to date
    pause

    start %caller% update success %currentVersion% %latestVersion%

    exit /b 1

    del "%~f0"
)

if "%currentVersion%" LSS "%latestVersion%" (
    echo Updating Net-Transfer...
    @REM Download the latest version with additional options for debugging
    curl -o transfer.exe -L --retry 3 --retry-delay 5 --fail https://github.com/AlphaBrate/Net-Transfer/releases/download/%latestVersion%/transfer.exe

    echo.

    @REM Check if the download was successful
    if %errorlevel% neq 0 (
        echo Failed to download the latest version. Please check your internet connection or try again later.
        pause

        start %caller% update failed "download_failed"

    ) else (
        echo Net-Transfer updated successfully
        pause

        start %caller% update success %currentVersion% %latestVersion%

    )

    del "%~f0"

    exit /b 1
)
