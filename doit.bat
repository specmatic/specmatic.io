@echo off

:: Remove the docs directory
echo Removing docs directory...
rmdir /s /q docs

:: Create the docs directory
echo Creating docs directory...
mkdir docs

:: Unzip website.zip into the docs directory
echo Unpacking website.zip into docs...
if exist tmp\website.zip (
    powershell -Command "Expand-Archive -Path tmp\website.zip -DestinationPath docs -Force"
    echo Unpacking complete.
) else (
    echo website.zip not found in tmp directory. Exiting.
    exit /b 1
)

:: Copy contents of extra-files into the docs directory
echo Copying extra files from extra-files to docs...
if exist extra-files (
    xcopy extra-files\* docs\ /e /i /q /y
    echo Extra files copied successfully.
) else (
    echo Directory extra-files does not exist. Skipping extra files setup.
)

echo All tasks completed.
