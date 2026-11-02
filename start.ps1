$root = "C:\Users\Dell\Documents\reviewguard-ai"

Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\backend'; .\venv\Scripts\python.exe app.py"
Start-Process powershell -ArgumentList "-NoExit","-Command","cd '$root\frontend'; npm run dev"

Start-Sleep -Seconds 6
Start-Process "http://localhost:5173"