import fs from 'fs';
import crypto from 'crypto';

await process.loadEnvFile('.env');

const required = ['API_URL', 'NAME', 'EMAIL'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ Missing ${key} in .env file`);
    process.exit(1);
  }
}

const name = process.env.NAME;
const email = process.env.EMAIL;
const years = process.env.EXP_YEARS;
const salaryAmount = process.env.SALARY;
const role = process.env.ROLE;
const level = process.env.EXP_LEVEL;
const message = process.env.MESSAGE;

const payload = {
  name,
  email
};

if (years) {
  const experienceYears = Number(years);
  if (Number.isNaN(experienceYears)) {
    console.error('❌ EXP_YEARS is not a valid number');
    process.exit(1);
  }

  payload.experienceYears = experienceYears;
}

if (salaryAmount) {
  const salary = Number(salaryAmount);
  if (Number.isNaN(salary)) {
    console.error('❌ SALARY is not a valid number');
    process.exit(1);
  }

  payload.salary = salary;
}

if (role) {
  if (!['frontend', 'backend', 'fullstack'].includes(role)) {
    console.error('❌ ROLE must be one of: frontend, backend, fullstack');
    process.exit(1);
  }

  payload.role = role;
}

if (level) {
  if (!['junior', 'mid', 'senior', 'lead'].includes(level)) {
    console.error('❌ EXP_LEVEL must be one of: junior, mid, senior, lead');
    process.exit(1);
  }

  payload.experienceLevel = level;
}

if (message && message.trim().length > 0) {
  payload.message = message;
}

const timestamp = Date.now();
const stringToSign = `${name}-${timestamp}`;

if (process.argv.includes('--dry-run')) {
  console.log(`🔏 Signing string: ${stringToSign}`);
}

const encoder = new TextEncoder();
const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(stringToSign));
const signature = Buffer.from(hashBuffer).toString('hex');

const cvDir = './CV';
const files = await fs.promises.readdir(cvDir);
const pdfFiles = files.filter(f => f.toLowerCase().endsWith('.pdf'));

if (pdfFiles.length === 0) {
  console.error('❌ No PDF files found in ./CV folder.');
  process.exit(1);
}

const pdfPath = `${cvDir}/${pdfFiles[0]}`;
console.log(`📄 Using PDF file: ${pdfPath}`);

const stats = await fs.promises.stat(pdfPath);
if (stats.size > 5 * 1024 * 1024) {
  console.error("❌ PDF exceeds 5MB limit");
  process.exit(1);
}

const pdfData = await fs.promises.readFile(pdfPath);
const pdfFile = new File([pdfData], pdfFiles[0], { type: 'application/pdf' });

const form = new FormData();
form.append('cv', pdfFile, pdfFiles[0]);
form.append('payload', JSON.stringify(payload));

const apiUrl = process.env.API_URL;
if (!apiUrl.startsWith('http')) {
  console.error('❌ API_URL must start with http/https');
  process.exit(1);
}

const isDryRun = process.argv.includes('--dry-run');
console.log(isDryRun ? '🚧 Dry-run enabled' : '🚀 Sending real submission');

let response;
try {
  response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'x-timestamp': timestamp.toString(),
      'x-signature': signature,
      ...(isDryRun ? { 'x-dry-run': 'true' } : {})
    },
    body: form
  });
} catch (err) {
  console.error('❌ Network error:', err.message);
  process.exit(1);
}

if (response.status >= 400) {
  console.error(`❌ API error ${response.status}`);
  console.error(await response.text());
  process.exit(1);
}

console.log('STATUS:', response.status);
console.log(await response.text());