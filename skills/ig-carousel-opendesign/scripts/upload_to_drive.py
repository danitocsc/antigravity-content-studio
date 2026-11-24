#!/usr/bin/env python3
"""Upload a rendered carousel directory to Google Drive and return a shareable folder URL."""
import configparser
import json
import os
import subprocess
import sys
import urllib.parse
import urllib.request


def main() -> None:
    if len(sys.argv) < 3:
        print("Usage: python3 upload_to_drive.py <local_dir> <drive_remote_subpath> [editor_email]")
        sys.exit(1)

    local_dir = os.path.abspath(sys.argv[1])
    drive_subpath = sys.argv[2].strip("/")
    editor_email = sys.argv[3] if len(sys.argv) > 3 else os.environ.get("DRIVE_EDITOR_EMAIL", "tu-correo@gmail.com")
    folder_name = os.path.basename(drive_subpath)

    subprocess.run(
        ["rclone", "copy", local_dir, f"gdrive:{drive_subpath}", "--transfers", "4"],
        check=True,
    )

    cp = configparser.ConfigParser()
    cp.read(os.path.expanduser("~/.config/rclone/rclone.conf"))
    token = json.loads(cp["gdrive"]["token"])["access_token"]
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    escaped = folder_name.replace("'", "\\'")
    q = urllib.parse.quote(
        f"name = '{escaped}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false"
    )
    req = urllib.request.Request(
        f"https://www.googleapis.com/drive/v3/files?q={q}&fields=files(id,name,webViewLink,parents)",
        headers=headers,
    )
    with urllib.request.urlopen(req) as resp:
        files = json.loads(resp.read().decode()).get("files", [])

    if not files:
        print("Uploaded, but could not retrieve Drive folder ID.")
        sys.exit(1)

    fid = files[0]["id"]
    link = files[0]["webViewLink"]

    for perm_body in [
        {"type": "anyone", "role": "reader"},
        {"type": "user", "role": "writer", "emailAddress": editor_email},
    ]:
        try:
            preq = urllib.request.Request(
                f"https://www.googleapis.com/drive/v3/files/{fid}/permissions?fields=id,type,role",
                data=json.dumps(perm_body).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(preq):
                pass
        except Exception as exc:
            print(f"Warning setting permission {perm_body}: {exc}", file=sys.stderr)

    print(f"Drive Folder: {folder_name}")
    print(f"Drive URL: {link}")


if __name__ == "__main__":
    main()
