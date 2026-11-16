# Install PepperVA on Windows

PepperVA is a free, open-source voice assistant that runs on your own PC: she hears you, thinks and speaks, all locally. Say "Hey Pepper" and talk.

## What you need
- Windows 10 (version 1809 or newer) or Windows 11, 64-bit
- 8 GB of RAM recommended (4 GB works: setup picks a smaller, faster brain)
- About 8 GB of free disk space
- A microphone and speakers or headphones
- Internet for the first setup (about 4 GB of downloads). After that she works offline, except weather

## Install in 3 steps
1. **Download and extract.** Right-click the downloaded zip, choose **Extract All...**, and pick a simple folder such as `C:\PepperVA` or your Documents folder. Don't run anything from inside the zip.
2. **Double-click `Setup PepperVA.bat`.**
   - If Windows says "Windows protected your PC", click **More info**, then **Run anyway**. The setup is a plain script you can read yourself.
   - If Windows asks for permission while installing Python or Ollama, click **Yes**.
   - It installs Python 3.11 and Ollama if you don't have them, then Pepper's packages, voice, hearing and brain models. This takes 15 to 40 minutes depending on your internet. Leave the window open until it says it's done. If it stops, just run it again: it picks up where it left off.
3. **Start PepperVA** from the icon on your Desktop (or the Start Menu). She lives in the system tray (bottom-right, maybe under the ^ arrow). The first start takes about a minute, then she says hello. Say **"Hey Pepper"**.

## Using Assistant
- **Tray icon:** red means listening, grey means paused. Click it to pause or wake her. Right-click for the menu: open the log, run the Doctor, start with Windows, quit.
- **Try saying:** "Hey Pepper, what time is it", "open Chrome", "show my downloads", "set a timer for 5 minutes", "remember that my birthday is April 4th", "what's the weather". The full list is in FEATURES.md.
- **Change settings** without touching code: create `data\settings.json`, for example `{"wake_threshold": 0.4, "followup_s": 8}`. Restart her afterwards.

## If something goes wrong
Right-click the tray icon and choose **Run Doctor**, or double-click `PepperVA Doctor.bat`. It checks your setup and tells you what to fix.

| Problem | What to do |
|---|---|
| She doesn't hear me | Windows Settings > Privacy & security > Microphone: turn on access, including "Let desktop apps access your microphone". Make sure the right mic is the default and its volume is 80-100. |
| Setup stopped with a message | Read it, fix it, and run setup again. Details are in `logs\setup.log`. |
| "winget isn't available" | Install "App Installer" from the Microsoft Store, or install Python 3.11 (tick "Add python.exe to PATH") and Ollama from ollama.com by hand, then run setup again. |
| She says she can't reach her brain | Open the Ollama app from the Start Menu, or restart your PC. Run the Doctor to confirm. |
| Replies are slow | Create `data\settings.json` containing `{"ollama_model": "qwen2.5:1.5b"}` for a smaller, faster brain. |
| Wake word is jumpy or deaf | See WAKE_WORD.md. |
| Antivirus warning | PepperVA is open source and made of plain scripts. If your antivirus complains, check the file it names and allow it if you trust the source you downloaded from. |

## Updating
There's no auto-update yet. Download the new version, extract it into a new folder, run Setup again, and copy your old `data` folder across to keep her memory.

## Uninstalling
Double-click `Uninstall PepperVA.bat`, then delete the folder.

## Privacy
Her hearing, thinking, voice and memory all run on your PC. The internet is used for the setup downloads and for weather and city lookups only.

## Getting help
Run the Doctor and send `logs\doctor.txt` (and `logs\setup.log` if setup failed).

---
PepperVA, built by Aadi.
