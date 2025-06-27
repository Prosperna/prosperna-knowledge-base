---
title: git conventions
---

# git conventions

## Installation & Set-up
### MacOS
### Windows
### Linux

## Core Workflow Command

<table>
  <thead>
    <tr>
      <th>Command</th>
      <th>Purpose</th>
      <th>Best Practices</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>git pull</code></td>
      <td>Fetches changes from a remote repository and merges them into your current branch.</td>
      <td>
        <ul>
          <li>Always run <code>git pull origin &lt;branch-name&gt;</code> before starting work to sync with the latest changes.</li>
          <li>Use <code>git pull --rebase</code> to apply your local commits on top of remote changes to avoid unnecessary merge commits.</li>
        </ul>
      </td>
    </tr>
    <tr>
        <td><code>git push</code></td>
        <td>Uploads local commits to a remote repository.</td>
        <td>
            <ul>
                <li><strong>Avoid</strong> pushing directly to the <code>main</code> branch. Always do your work on a separate branch and push that branch to create a pull request.</li>
                <li><strong>Avoid</strong> force-pushing (<code>git push -f</code>) to shared branches; use it only when necessary and with caution.</li>
            </ul>
        </td>
        </tr>
    <tr>
      <td><code>git add</code></td>
      <td>Stages changes (files or directories) for the next commit.</td>
      <td>
        <ul>
          <li>Stage specific files: <code>git add &lt;file1&gt; &lt;file2&gt;</code>.</li>
          <li>Stage all changes: <code>git add .</code></li>
          <li><strong>Avoid</strong> staging unrelated changes together in a single commit.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>git commit</code></td>
      <td>Saves staged changes to the local repository with a descriptive message.</td>
      <td>
        <ul>
          <li>Use <code>git commit -m "Descriptive message"</code> to keep commit history clear.</li>
          <li>Use <code>git commit -am "Message"</code> to stage and commit modified files in one step.</li>
          <li><strong>Avoid</strong> committing incomplete or broken code.</li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>git status</code></td>
      <td>Displays the current state of the working directory (untracked, modified, or staged files).</td>
      <td>
        <ul>
          <li>Run <code>git status</code> frequently to check your workspace before staging or committing.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>



## History & Inspection Command

<table>
  <thead>
    <tr>
      <th>Command</th>
      <th>Purpose</th>
      <th>Best Practices</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>git log</code></td>
      <td>Displays the commit history, including author, date, and message.</td>
      <td>
        <ul>
          <li>Use <code>git log --oneline</code> for a simplified, compact view.</li>
          <li>Filter history for a specific file with: <code>git log -- &lt;filename&gt;</code>.</li>
        </ul>
      </td>
    </tr>
  </tbody>
</table>


## Undoing Changes

<table>
  <thead>
    <tr>
      <th>Command</th>
      <th>Purpose</th>
      <th>Best Practices</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>git reset</code></td>
      <td>Unstages changes or reverts commits. <strong>Use with caution.</strong></td>
      <td>
        <ul>
          <li>
            <code>git reset --soft HEAD~1</code> removes the most recent commit from history (or rewinds to a specified commit), but <strong>does not modify your files</strong> or their contents. All changes from the removed commits remain <strong>staged</strong> and ready to be re-committed.
          </li>
          <li>
            <code>git reset --hard</code> resets your branch, staging area, and files to match the target commit exactly. It deletes all uncommitted changes and removes all commits and files added after that commit. Use with caution — this is irreversible.
          </li>
        </ul>
      </td>
    </tr>
    <tr>
      <td><code>git checkout</code></td>
      <td>
        Switches branches, restores files, or reverts changes. Being replaced by <code>git switch</code> and <code>git restore</code> in newer Git versions.
      </td>
      <td>
        <ul>
          <li><strong>Switching branches or commits:</strong></li>
          <ul>
            <li><code>git checkout main</code> – switch to a branch</li>
            <li><code>git checkout &lt;commit-hash&gt;</code> – switch to a commit (detached HEAD)</li>
            <li><strong>Avoid</strong> editing in detached HEAD unless creating a new branch</li>
          </ul>
          <li><strong>Restoring file changes:</strong></li>
          <ul>
            <li><code>git checkout -- &lt;file&gt;</code> – discard local changes in a file</li>
            <li><code>git checkout &lt;commit&gt; -- &lt;file&gt;</code> – restore file from a previous commit</li>
            <li><strong>Warning:</strong> this action overwrites local changes irreversibly</li>
          </ul>
        </ul>
      </td>
    </tr>
  </tbody>
</table>

To see more commonly used commands use: `git -h`.




