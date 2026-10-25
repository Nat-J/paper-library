on run
    try
        set appPath to POSIX path of (path to me)
        set libraryPath to do shell script "/usr/bin/dirname " & quoted form of appPath
        do shell script "/usr/bin/python3 " & quoted form of (libraryPath & "/reader/launcher.py")
    on error errorMessage
        display alert "Paper Library 无法打开" message errorMessage as critical
    end try
end run
