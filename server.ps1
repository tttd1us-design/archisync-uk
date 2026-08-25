# ArchiSync UK - Ultra-Lightweight Standalone Offline Web Server (0% CPU, 10MB RAM)
$ErrorActionPreference = "SilentlyContinue"
$Port = 5173
$RootPath = Join-Path $PSScriptRoot "dist"

if (-not (Test-Path $RootPath)) {
    $RootPath = $PSScriptRoot
}

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add("http://localhost:$Port/")
$Listener.Prefixes.Add("http://127.0.0.1:$Port/")

try {
    $Listener.Start()
} catch {
    # If already running on 5173, just exit gracefully
    exit 0
}

$MimeTypes = @{
    ".html" = "text/html; charset=utf-8";
    ".htm"  = "text/html; charset=utf-8";
    ".js"   = "application/javascript; charset=utf-8";
    ".mjs"  = "application/javascript; charset=utf-8";
    ".css"  = "text/css; charset=utf-8";
    ".json" = "application/json; charset=utf-8";
    ".png"  = "image/png";
    ".jpg"  = "image/jpeg";
    ".jpeg" = "image/jpeg";
    ".svg"  = "image/svg+xml";
    ".ico"  = "image/x-icon";
    ".webm" = "audio/webm";
    ".wav"  = "audio/wav";
    ".txt"  = "text/plain; charset=utf-8"
}

# Ensure Documents\음성 folder exists for offline storage
$VoiceDir = Join-Path ([System.Environment]::GetFolderPath('MyDocuments')) "음성"
if (-not (Test-Path $VoiceDir)) {
    New-Item -ItemType Directory -Path $VoiceDir -Force | Out-Null
}

while ($Listener.IsListening) {
    try {
        $Context = $Listener.GetContext()
        $Request = $Context.Request
        $Response = $Context.Response

        $UrlPath = $Request.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($UrlPath) -or $UrlPath -eq "/") {
            $UrlPath = "index.html"
        }

        # 1. API: Save Audio file to Documents\음성
        if ($Request.HttpMethod -eq "POST" -and $UrlPath -eq "api/save-audio") {
            $Timestamp = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
            $Filename = "voice_recording_$Timestamp.webm"
            $FilePath = Join-Path $VoiceDir $Filename
            
            $FileStream = [System.IO.File]::Create($FilePath)
            $Request.InputStream.CopyTo($FileStream)
            $FileStream.Close()

            $Json = "{`"success`":true,`"filename`":`"$Filename`",`"path`":`"$($FilePath.Replace('\','/'))`",`"directory`":`"$($VoiceDir.Replace('\','/'))`"}"
            $Buffer = [System.Text.Encoding]::UTF8.GetBytes($Json)
            $Response.ContentType = "application/json; charset=utf-8"
            $Response.ContentLength64 = $Buffer.Length
            $Response.OutputStream.Write($Buffer, 0, $Buffer.Length)
            $Response.Close()
            continue
        }

        # 2. API: Save Transcript to Documents\음성
        if ($Request.HttpMethod -eq "POST" -and $UrlPath -eq "api/save-transcript") {
            $Reader = New-Object System.IO.StreamReader($Request.InputStream, [System.Text.Encoding]::UTF8)
            $Body = $Reader.ReadToEnd()
            $Timestamp = (Get-Date).ToString("yyyy-MM-dd_HH-mm-ss")
            $Filename = "${Timestamp}_실시간대화록.txt"
            $FilePath = Join-Path $VoiceDir $Filename

            try {
                $Parsed = ConvertFrom-Json $Body -ErrorAction SilentlyContinue
                if ($Parsed.content) { $Body = $Parsed.content }
            } catch {}

            [System.IO.File]::WriteAllText($FilePath, $Body, [System.Text.Encoding]::UTF8)

            $Json = "{`"success`":true,`"filename`":`"$Filename`",`"path`":`"$($FilePath.Replace('\','/'))`",`"directory`":`"$($VoiceDir.Replace('\','/'))`"}"
            $Buffer = [System.Text.Encoding]::UTF8.GetBytes($Json)
            $Response.ContentType = "application/json; charset=utf-8"
            $Response.ContentLength64 = $Buffer.Length
            $Response.OutputStream.Write($Buffer, 0, $Buffer.Length)
            $Response.Close()
            continue
        }

        # 3. Static File Serving (dist/ assets)
        $FilePath = Join-Path $RootPath $UrlPath
        if (-not (Test-Path $FilePath) -or (Get-Item $FilePath).PSIsContainer) {
            $FilePath = Join-Path $RootPath "index.html"
        }

        if (Test-Path $FilePath) {
            $Ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $ContentType = $MimeTypes[$Ext]
            if (-not $ContentType) { $ContentType = "application/octet-stream" }

            $Buffer = [System.IO.File]::ReadAllBytes($FilePath)
            $Response.ContentType = $ContentType
            $Response.ContentLength64 = $Buffer.Length
            
            # High-performance caching header for fast sub-millisecond RAM caching
            $Response.AddHeader("Cache-Control", "public, max-age=31536000")
            $Response.OutputStream.Write($Buffer, 0, $Buffer.Length)
        } else {
            $Response.StatusCode = 404
        }
        $Response.Close()
    } catch {
        # Silent robust exception handler
    }
}
