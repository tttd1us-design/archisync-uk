using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Windows.Forms;

namespace ArchiSync
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            try
            {
                string appDir = AppDomain.CurrentDomain.BaseDirectory;
                string serverScript = Path.Combine(appDir, "server.ps1");

                // If running from Desktop without server.ps1, look into local installed path
                if (!File.Exists(serverScript))
                {
                    string localAppDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "Programs", "ArchiSync_UK");
                    if (File.Exists(Path.Combine(localAppDir, "server.ps1")))
                    {
                        appDir = localAppDir;
                        serverScript = Path.Combine(localAppDir, "server.ps1");
                    }
                }

                // 1. Ensure Documents storage directory exists
                string docDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.MyDocuments), "ArchiSync_실시간통역");
                if (!Directory.Exists(docDir))
                {
                    Directory.CreateDirectory(docDir);
                }

                // 2. Check if port 5173 is already open
                bool isPortOpen = IsPortInUse(5173);
                if (!isPortOpen && File.Exists(serverScript))
                {
                    ProcessStartInfo serverPsi = new ProcessStartInfo();
                    serverPsi.FileName = "powershell.exe";
                    serverPsi.Arguments = string.Format("-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File \"{0}\"", serverScript);
                    serverPsi.WorkingDirectory = appDir;
                    serverPsi.CreateNoWindow = true;
                    serverPsi.UseShellExecute = false;
                    serverPsi.WindowStyle = ProcessWindowStyle.Hidden;
                    Process.Start(serverPsi);
                    Thread.Sleep(800);
                }

                // 3. Launch Chrome in GPU-accelerated App Mode
                string chromePath = @"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe";
                if (!File.Exists(chromePath))
                {
                    chromePath = @"C:\Program Files\Google\Chrome\Application\chrome.exe";
                }

                string url = "http://localhost:5173";
                string gpuFlags = "--enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist --enable-features=VaapiVideoDecoder --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-renderer-backgrounding";

                if (File.Exists(chromePath))
                {
                    ProcessStartInfo chromePsi = new ProcessStartInfo();
                    chromePsi.FileName = chromePath;
                    chromePsi.Arguments = string.Format("{0} --app=\"{1}\"", gpuFlags, url);
                    Process.Start(chromePsi);
                }
                else
                {
                    Process.Start(url);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show("ArchiSync 실행 중 오류가 발생했습니다: " + ex.Message, "ArchiSync UK", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        static bool IsPortInUse(int port)
        {
            try
            {
                using (TcpClient client = new TcpClient())
                {
                    var result = client.BeginConnect("127.0.0.1", port, null, null);
                    bool success = result.AsyncWaitHandle.WaitOne(200);
                    if (success)
                    {
                        client.EndConnect(result);
                        return true;
                    }
                    return false;
                }
            }
            catch
            {
                return false;
            }
        }
    }
}
