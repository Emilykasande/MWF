# PowerShell script to update logout links in pug files
$files = Get-ChildItem -Path "views" -Filter "*.pug" | Where-Object {
    Select-String -Path $_.FullName -Pattern 'href="/logout"' -Quiet
}

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # Skip if already updated
    if ($content -match 'onclick="showLogoutConfirmation()"') {
        Write-Host "Already updated: $($file.Name)"
        continue
    }
    Write-Host "Updating: $($file.Name)"

    # Update logout link
    $content = $content -replace 'href="/logout" class="btn-logout"', 'href="#" onclick="showLogoutConfirmation()" class="btn-logout"'

    # Add modal and script before footer
    $modalAndScript = @"

    // Logout Confirmation Modal
    #logoutModal.modal(style="display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);")
      .modal-content(style="background-color: white; margin: 15% auto; padding: 20px; border-radius: 8px; width: 80%; max-width: 400px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);")
        .modal-header(style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px;")
          h3(style="margin: 0; color: #d9534f;") Confirm Logout
        .modal-body(style="margin-bottom: 20px;")
          p#logoutMessage(style="margin: 0;") Are you sure you want to log out?
        .modal-footer(style="text-align: right;")
          button.btn.btn-danger(type="button", onclick="confirmLogout()") Logout
          button.btn.btn-secondary(type="button", onclick="closeLogoutModal()", style="margin-left: 10px;") Cancel

    script.
      function showLogoutConfirmation() {
        document.getElementById('logoutModal').style.display = 'block';
      }

      function closeLogoutModal() {
        document.getElementById('logoutModal').style.display = 'none';
      }

      function confirmLogout() {
        // Redirect to logout route
        window.location.href = '/logout';
      }

      // Close modal when clicking outside of it
      window.onclick = function(event) {
        const modal = document.getElementById('logoutModal');
        if (event.target === modal) {
          modal.style.display = 'none';
        }
      }
"@

    # Insert before footer
    $content = $content -replace '(footer)', ($modalAndScript + '$1')

    Set-Content -Path $file.FullName -Value $content
}
