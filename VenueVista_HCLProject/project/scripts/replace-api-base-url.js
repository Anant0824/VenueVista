const fs = require('node:fs');
const path = require('node:path');

const configuredApiBaseUrl = process.env.API_BASE_URL;
if (!configuredApiBaseUrl) {
  throw new Error('API_BASE_URL must be set when building the production frontend.');
}

const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
if (!razorpayKeyId || !razorpayKeyId.startsWith('rzp_test_')) {
  throw new Error('RAZORPAY_KEY_ID must be a Razorpay Test Mode key when building the production frontend.');
}

let apiBaseUrl;
try {
  const parsedUrl = new URL(configuredApiBaseUrl);
  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    throw new Error('URL must use http or https.');
  }
  apiBaseUrl = configuredApiBaseUrl.replace(/\/+$/, '');
} catch (error) {
  throw new Error(`API_BASE_URL must be a valid absolute URL: ${error.message}`);
}

const outputDirectory = path.resolve(__dirname, '..', 'dist', 'angular-frontend');
if (!fs.existsSync(outputDirectory)) {
  throw new Error(`Angular build output was not found: ${outputDirectory}`);
}

let replacements = 0;
function replaceInJavaScript(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      replaceInJavaScript(entryPath);
    } else if (/\.(?:m?js)$/.test(entry.name)) {
      const contents = fs.readFileSync(entryPath, 'utf8');
      const updatedContents = contents
        .replaceAll('${API_BASE_URL}', apiBaseUrl)
        .replaceAll('${RAZORPAY_KEY_ID}', razorpayKeyId);
      if (updatedContents !== contents) {
        fs.writeFileSync(entryPath, updatedContents);
        replacements += 1;
      }
    }
  }
}

replaceInJavaScript(outputDirectory);
if (replacements === 0) {
  throw new Error('Production environment placeholders were not found in the Angular build output.');
}
