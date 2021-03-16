@echo off

set ROOT=%cd%
set CODE=%ROOT%\code
set EXCELS=%ROOT%\excels
set EXPORT_DB=%ROOT%\export_db
set EXPORT_JSON=%ROOT%\export_json
set EXPORT_PB=%ROOT%\protoc_out

:loop
echo "----------------------------------------------------------------------------------------------"
cls
cd %ROOT%

@REM echo %CODE%
@REM echo %EXCELS%
@REM echo %EXPORT_DB%
@REM echo %EXPORT_JSON%

@REM for /f "tokens=1,2 delims==" %%i in (config.ini) do (
@REM     @REM set %%i=%%j
@REM     param=%param%%%i%%j
@REM )
@REM cd %CODE%
@REM node main.js %param%


for /f "tokens=*" %%i in (config.ini) do (
    set param=%%i
)
cd %CODE%
node main.js %param%

cd %ROOT%
cd protoc_out

del /f /s /q cpp\*.*
del /f /s /q csharp\*.*
del /f /s /q java\*.*
del /f /s /q js\*.*

protoc --cpp_out=./cpp ./game_config.proto
protoc --csharp_out=./csharp ./game_config.proto
protoc --java_out=./java ./game_config.proto
protoc --js_out=./js ./game_config.proto
protoc -o game_config.pb game_config.proto

cd %EXPORT_JSON%
for /R %EXPORT_JSON% %%f in (*.json) do ( 
	node %CODE%\json2lua.js %%f
    @REM echo %%f
) 

echo --- Bat Success! ---

pause
goto loop
