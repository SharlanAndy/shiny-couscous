# GitHub API Endpoint Mapping

## Current API Endpoints → GitHub API Equivalents

### Forms API

| Current Endpoint | Method | GitHub API Equivalent |
|-----------------|--------|----------------------|
| `/api/forms` | GET | `GET /repos/{owner}/{repo}/contents/backend/data/forms.json` |
| `/api/forms/{formId}` | GET | Read `forms.json`, filter by `formId` |
| `/api/forms/{formId}/schema` | GET | Read `forms.json`, extract `schemaData` |
| `/api/admin/forms` | POST | Read `forms.json`, add entry, `PUT /repos/{owner}/{repo}/contents/backend/data/forms.json` |
| `/api/admin/forms/{formId}` | PUT | Read `forms.json`, update entry, `PUT /repos/{owner}/{repo}/contents/backend/data/forms.json` |
| `/api/admin/forms/{formId}` | DELETE | Read `forms.json`, remove entry, `PUT /repos/{owner}/{repo}/contents/backend/data/forms.json` |

### Submissions API

| Current Endpoint | Method | GitHub API Equivalent |
|-----------------|--------|----------------------|
| `/api/submissions` | GET | `GET /repos/{owner}/{repo}/contents/backend/data/submissions.json` |
| `/api/submissions/{submissionId}` | GET | Read `submissions.json`, filter by `submissionId` |
| `/api/forms/{formId}/submit` | POST | Read `submissions.json`, add entry, `PUT /repos/{owner}/{repo}/contents/backend/data/submissions.json` |
| `/api/forms/{formId}/draft` | POST | Read `submissions.json`, add draft entry, `PUT /repos/{owner}/{repo}/contents/backend/data/submissions.json` |
| `/api/submissions/{submissionId}/draft` | PUT | Read `submissions.json`, update entry, `PUT /repos/{owner}/{repo}/contents/backend/data/submissions.json` |
| `/api/admin/submissions/{submissionId}` | PUT | Read `submissions.json`, update entry, `PUT /repos/{owner}/{repo}/contents/backend/data/submissions.json` |
| `/api/admin/submissions/{submissionId}` | DELETE | Read `submissions.json`, remove entry, `PUT /repos/{owner}/{repo}/contents/backend/data/submissions.json` |

### Auth API

| Current Endpoint | Method | GitHub API Equivalent |
|-----------------|--------|----------------------|
| `/api/auth/login` | POST | Read `users_auth.json` or `admins_auth.json`, validate credentials client-side |
| `/api/auth/register` | POST | Read `users_auth.json`, add entry, `PUT /repos/{owner}/{repo}/contents/backend/data/users_auth.json` |
| `/api/auth/profile` | GET | Read `users_auth.json`, filter by user ID |
| `/api/auth/profile` | PUT | Read `users_auth.json`, update entry, `PUT /repos/{owner}/{repo}/contents/backend/data/users_auth.json` |
| `/api/auth/change-password` | POST | Read `users_auth.json`, update password, `PUT /repos/{owner}/{repo}/contents/backend/data/users_auth.json` |
| `/api/auth/account/delete` | POST | Read `users_auth.json`, remove entry, `PUT /repos/{owner}/{repo}/contents/backend/data/users_auth.json` |

### Admin API

| Current Endpoint | Method | GitHub API Equivalent |
|-----------------|--------|----------------------|
| `/api/admin/admins` | GET | `GET /repos/{owner}/{repo}/contents/backend/data/admins_auth.json` |
| `/api/admin/admins` | POST | Read `admins_auth.json`, add entry, `PUT /repos/{owner}/{repo}/contents/backend/data/admins_auth.json` |
| `/api/admin/admins/{adminId}` | PUT | Read `admins_auth.json`, update entry, `PUT /repos/{owner}/{repo}/contents/backend/data/admins_auth.json` |
| `/api/admin/admins/{adminId}` | DELETE | Read `admins_auth.json`, remove entry, `PUT /repos/{owner}/{repo}/contents/backend/data/admins_auth.json` |
| `/api/admin/users` | GET | `GET /repos/{owner}/{repo}/contents/backend/data/users_auth.json` |
| `/api/admin/analytics` | GET | Read `submissions.json` and `forms.json`, calculate statistics |
| `/api/admin/settings` | GET | `GET /repos/{owner}/{repo}/contents/backend/data/settings.json` |
| `/api/admin/settings` | PUT | Read `settings.json`, update, `PUT /repos/{owner}/{repo}/contents/backend/data/settings.json` |

### Files API

| Current Endpoint | Method | GitHub API Equivalent |
|-----------------|--------|----------------------|
| `/api/files/upload` | POST | Upload to GitHub Releases API or store base64 in JSON |
| `/api/files/{fileId}/download` | GET | Read from GitHub Releases or serve from JSON |

## GitHub API Base URL

```
https://api.github.com/repos/{owner}/{repo}/contents/{path}
```

Example:
```
https://api.github.com/repos/clkhoo5211/shiny-couscous/contents/backend/data/forms.json
```

## GitHub API Authentication

Use Personal Access Token (PAT) in Authorization header:
```
Authorization: token {GITHUB_TOKEN}
```

Or use Bearer token:
```
Authorization: Bearer {GITHUB_TOKEN}
```

