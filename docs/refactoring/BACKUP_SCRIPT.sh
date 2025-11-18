#!/bin/bash

# Backup Script for GitHub-Only Refactoring
# This script creates a backup branch before starting the refactoring

set -e

PROJECT_DIR="/Users/khoo/Downloads/project4/projects/project-20251117-153458-labuan-fsa-e-submission-system"
BACKUP_BRANCH="backup-before-github-refactor-$(date +%Y%m%d-%H%M%S)"

echo "🔒 Creating backup branch: $BACKUP_BRANCH"

cd "$PROJECT_DIR"

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Error: Not a git repository"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Create backup branch
git checkout -b "$BACKUP_BRANCH"

# Commit all current changes (if any)
if ! git diff-index --quiet HEAD --; then
    echo "📝 Staging all changes..."
    git add -A
    git commit -m "Backup before GitHub-only refactoring - $(date +%Y-%m-%d\ %H:%M:%S)"
fi

# Push backup branch
echo "📤 Pushing backup branch to remote..."
git push -u origin "$BACKUP_BRANCH"

# Return to original branch
git checkout "$CURRENT_BRANCH"

echo "✅ Backup complete!"
echo "   Backup branch: $BACKUP_BRANCH"
echo "   Current branch: $CURRENT_BRANCH"
echo ""
echo "To restore backup:"
echo "  git checkout $BACKUP_BRANCH"

