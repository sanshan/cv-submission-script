# CV Submission Script

A Node.js script that submits a CV PDF and candidate details to an API. It validates basic inputs, signs the payload, and supports a dry-run mode for testing.

## Prerequisites
- Node.js 24 or newer (matches the version in `package.json`).
- A `.env` file in the project root with the required variables below.
- A `CV/` directory in the project root containing the CV PDF to upload.

## Environment variables
Add the following to `.env`:

```
API_URL=...         # Required: full http/https URL for the submission endpoint
NAME=...            # Required: your full name
EMAIL=...           # Required: your email address
EXP_YEARS=...       # Optional: numeric years of experience
SALARY=...          # Optional: expected salary (number)
ROLE=frontend       # Optional: one of frontend, backend, fullstack
EXP_LEVEL=mid       # Optional: one of junior, mid, senior, lead
MESSAGE=...         # Optional: additional note for the submission
```

## CV PDF
- Place your CV PDF in the `CV/` folder at the project root.
- The script uses the first PDF it finds in that directory (`./CV/<file>.pdf`).
- Files over **5 MB** are rejected.

## Running the script
Install dependencies (once):

```
npm install
```

Submit for real:

```
npm start
```

Dry-run (prints the signing string and skips the real submission):

```
npm test
```

Both commands read the configuration from `.env` and the CV PDF from `./CV/`.
