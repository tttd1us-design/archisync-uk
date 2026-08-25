using System;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Threading;
using System.Windows.Forms;

namespace ArchiSyncInstaller
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            try
            {
                string targetDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "ArchiSync_UK");
                if (!Directory.Exists(targetDir))
                {
                    Directory.CreateDirectory(targetDir);
                }

                // 1. Extract embedded payload zip if present, or copy from current directory
                string currentDir = AppDomain.CurrentDomain.BaseDirectory;
                
                // Copy directory contents
                CopyDirectory(currentDir, targetDir);

                // 2. Ensure Documents storage directory exists
                string docDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "ArchiSync_실시간통역");
                if (!Directory.Exists(docDir))
                {
                    Directory.CreateDirectory(docDir);
                }

                // 3. Place standalone EXE directly on Desktop
                string desktopPath = Environment.GetFolderPath(Environment.SpecialFolder.Desktop);
                string launcherSource = Path.Combine(targetDir, "ArchiSync_실시간통역.exe");
                string launcherDesktop = Path.Combine(desktopPath, "ArchiSync_실시간통역.exe");

                if (File.Exists(launcherSource))
                {
                    File.Copy(launcherSource, launcherDesktop, true);
                }

                // 4. Create Desktop Shortcut (.lnk)
                CreateShortcut(
                    Path.Combine(desktopPath, "ArchiSync UK 실시간통역.lnk"),
                    launcherSource,
                    targetDir,
                    "ArchiSync UK 실시간 다국어 음성 통역 시스템"
                );

                // 5. Create Start Menu Shortcut
                string startMenuPath = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.StartMenu), "Programs");
                CreateShortcut(
                    Path.Combine(startMenuPath, "ArchiSync UK 실시간통역.lnk"),
                    launcherSource,
                    targetDir,
                    "ArchiSync UK 실시간 다국어 음성 통역 시스템"
                );

                // 6. Launch Application
                if (File.Exists(launcherSource))
                {
                    Process.Start(launcherSource);
                }
                else if (File.Exists(launcherDesktop))
                {
                    Process.Start(launcherDesktop);
                }

                MessageBox.Show(
                    "🎉 ArchiSync UK 실시간 통역 시스템이 성공적으로 설치되었습니다!\n\n" +
                    "• 설치 위치: " + targetDir + "\n" +
                    "• 바탕화면에 [ArchiSync_실시간통역.exe] 실행파일이 생성되었습니다.\n" +
                    "• 내 문서 저장소: 내 문서\\ArchiSync_실시간통역\n\n" +
                    "프로그램이 지금 즉시 실행됩니다.",
                    "ArchiSync UK 설치 완료",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Information
                );
            }
            catch (Exception ex)
            {
                MessageBox.Show("설치 중 오류가 발생했습니다: " + ex.Message, "ArchiSync 설치 오류", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        static void CopyDirectory(string sourceDir, string destinationDir)
        {
            DirectoryInfo dir = new DirectoryInfo(sourceDir);
            if (!dir.Exists) return;

            DirectoryInfo[] dirs = dir.GetDirectories();
            if (!Directory.Exists(destinationDir))
            {
                Directory.CreateDirectory(destinationDir);
            }

            FileInfo[] files = dir.GetFiles();
            foreach (FileInfo file in files)
            {
                // Skip installer itself to avoid lock
                if (file.Name.IndexOf("설치프로그램", StringComparison.OrdinalIgnoreCase) >= 0 || file.Name.IndexOf("Installer", StringComparison.OrdinalIgnoreCase) >= 0)
                    continue;

                string temppath = Path.Combine(destinationDir, file.Name);
                file.CopyTo(temppath, true);
            }

            foreach (DirectoryInfo subdir in dirs)
            {
                if (subdir.Name.Equals(".git", StringComparison.OrdinalIgnoreCase) || subdir.Name.Equals("node_modules", StringComparison.OrdinalIgnoreCase))
                    continue;

                string temppath = Path.Combine(destinationDir, subdir.Name);
                CopyDirectory(subdir.FullName, temppath);
            }
        }

        static void CreateShortcut(string shortcutPath, string targetPath, string workingDir, string description)
        {
            try
            {
                Type shellType = Type.GetTypeFromProgID("WScript.Shell");
                dynamic shell = Activator.CreateInstance(shellType);
                dynamic shortcut = shell.CreateShortcut(shortcutPath);
                shortcut.TargetPath = targetPath;
                shortcut.WorkingDirectory = workingDir;
                shortcut.Description = description;
                shortcut.Save();
            }
            catch { }
        }
    }
}
