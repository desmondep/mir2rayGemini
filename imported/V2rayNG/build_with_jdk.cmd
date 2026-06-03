@echo off
setlocal
set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
echo JAVA_HOME=%JAVA_HOME%
cd /d %~dp0
call gradlew.bat assembleFdroidDebug --stacktrace
endlocal
