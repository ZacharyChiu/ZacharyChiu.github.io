@echo off
chcp 65001 >nul
echo ========================================
echo        Hexxagon 游戏启动器
echo ========================================
echo.

REM 检查 Python 是否安装
python --version >nul 2>&1
if %errorlevel% == 0 (
    echo [信息] 检测到 Python，正在启动游戏服务器...
    echo.
    echo [提示] 服务器启动后，将在浏览器中自动打开游戏
    echo [提示] 按 Ctrl+C 可以停止服务器
    echo.
    echo ========================================
    echo.

    REM 启动服务器，并在新窗口中运行
    start /B cmd /c "python -m http.server 8000 >nul 2>&1"

    REM 等待服务器启动
    timeout /t 2 /nobreak >nul

    REM 打开浏览器
    start http://localhost:8000

    echo [成功] 游戏已在浏览器中打开！
    echo.
    echo [提示] 服务器正在后台运行，关闭此窗口不会影响游戏
    echo [提示] 如需停止服务器，请关闭命令行窗口或按 Ctrl+C
    echo.
    pause
) else (
    echo [错误] 未检测到 Python！
    echo.
    echo 请先安装 Python：https://www.python.org/downloads/
    echo.
    echo 安装后，请重新运行此脚本。
    echo.
    pause
)
