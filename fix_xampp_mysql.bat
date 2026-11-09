@echo off
title WorkTrack - XAMPP MySQL Repair Tool
echo ========================================================
echo WorkTrack - Automatic XAMPP MariaDB Aria System Repair
echo ========================================================
echo.

:check_running
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [!] MySQL is currently RUNNING in XAMPP.
    echo.
    echo Please go to your XAMPP Control Panel and click "Stop" next to MySQL.
    echo Once MySQL is stopped, press any key here to continue...
    pause >nul
    goto check_running
)

echo.
echo [*] Backing up corrupted mysql system tables to mysql_corrupted...
if exist "C:\xampp\mysql\data\mysql_corrupted" rd /s /q "C:\xampp\mysql\data\mysql_corrupted"
if exist "C:\xampp\mysql\data\mysql" move "C:\xampp\mysql\data\mysql" "C:\xampp\mysql\data\mysql_corrupted" >nul

echo [*] Restoring clean default system permission tables from C:\xampp\mysql\backup\mysql...
xcopy /E /I /Q /Y "C:\xampp\mysql\backup\mysql" "C:\xampp\mysql\data\mysql" >nul

echo.
echo ========================================================
echo [SUCCESS] MariaDB Aria system tables repaired!
echo.
echo NEXT STEPS:
echo 1. In XAMPP Control Panel, click "Start" next to MySQL.
echo 2. Refresh http://localhost/phpmyadmin/ in your browser.
echo 3. Start your WorkTrack backend server (npm run dev in server/).
echo ========================================================
echo.
pause

