# Pushing to GitHub

Follow these steps to push your Website Ripping Tools repository to GitHub:

## 1. Create a GitHub Repository

1. Go to [GitHub](https://github.com/) and log in to your account
2. Click the "+" icon in the top right corner and select "New repository"
3. Enter a repository name (e.g., "website-ripping-tools")
4. Add an optional description
5. Choose Public or Private visibility
6. **Important**: Do NOT initialize the repository with a README, .gitignore, or license
7. Click "Create repository"

## 2. Initialize Local Git Repository

Run the included batch file to initialize Git:

```
initialize-git.bat
```

This script will:
- Initialize a Git repository
- Add all the files
- Create an initial commit

## 3. Connect and Push to GitHub

Once your GitHub repository is created, you'll see instructions on the GitHub page. 
Use the following commands, replacing YOUR_USERNAME and REPO_NAME with your actual information:

```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

If your default branch is called "master" instead of "main", use:

```bash
git push -u origin master
```

## Troubleshooting

### Authentication Issues

If you encounter authentication issues:

1. **Personal Access Token**: GitHub no longer supports password authentication for Git operations. Generate a Personal Access Token:
   - Go to GitHub Settings → Developer Settings → Personal Access Tokens
   - Generate a new token with "repo" permissions
   - Use this token instead of your password when prompted

2. **GitHub CLI**: Consider using GitHub CLI for easier authentication:
   ```
   gh auth login
   gh repo create REPO_NAME --private --source=. --remote=origin
   git push -u origin main
   ```

3. **SSH Keys**: Set up SSH keys for secure authentication:
   - [GitHub documentation on setting up SSH keys](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)

### Other Issues

- **Error "refusing to merge unrelated histories"**: Use `git pull origin main --allow-unrelated-histories`
- **Files too large**: If you have large files in cloned-sites, you may need to use Git LFS or exclude them
