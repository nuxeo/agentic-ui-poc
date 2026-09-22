const baseline = {
  "adf-hx-bridge": { sTotal: 2256, sCovered: 2100 },
  "administration": { sTotal: 1078, sCovered: 651 },
  "browse": { sTotal: 3307, sCovered: 3266 },
  "collections": { sTotal: 699, sCovered: 665 },
  "core": { sTotal: 7, sCovered: 7 },
  "document-detail": { sTotal: 4850, sCovered: 4490 },
  "knowledge-discovery": { sTotal: 1081, sCovered: 703 },
  "nuxeo-client": { sTotal: 4787, sCovered: 4318 },
  "search": { sTotal: 1016, sCovered: 962 },
  "shared-app-config": { sTotal: 475, sCovered: 473 },
  "shared-extensions": { sTotal: 768, sCovered: 733 },
  "shared-kd-client": { sTotal: 724, sCovered: 722 },
  "shared-ke-client": { sTotal: 247, sCovered: 247 },
  "ui": { sTotal: 537, sCovered: 525 },
  "permission-dialogs": { sTotal: 476, sCovered: 459 },
  "acme-extensions": { sTotal: 101, sCovered: 101 },
  "assets": { sTotal: 78, sCovered: 76 },
  "shared-ai-client": { sTotal: 219, sCovered: 35 },
  "tasks": { sTotal: 705, sCovered: 304 }
};

let totalStmts = 0;
let totalCovered = 0;

for (const [project, data] of Object.entries(baseline)) {
  totalStmts += data.sTotal;
  totalCovered += data.sCovered;
}

const percentage = ((totalCovered / totalStmts) * 100).toFixed(2);

console.log('');
console.log('=== CONSOLIDATED COVERAGE (All 19 Projects) ===');
console.log('');
console.log(`Total Statements:     ${totalStmts.toLocaleString()}`);
console.log(`Covered Statements:   ${totalCovered.toLocaleString()}`);
console.log(`Uncovered Statements: ${(totalStmts - totalCovered).toLocaleString()}`);
console.log('');
console.log(`OVERALL COVERAGE: ${percentage}%`);
console.log('');

// Also show in-scope only
const inScope = [
  "adf-hx-bridge", "browse", "collections", "core", "document-detail",
  "nuxeo-client", "search", "shared-app-config", "shared-extensions",
  "shared-kd-client", "shared-ke-client", "ui", "permission-dialogs"
];

let inScopeTotal = 0;
let inScopeCovered = 0;

for (const project of inScope) {
  inScopeTotal += baseline[project].sTotal;
  inScopeCovered += baseline[project].sCovered;
}

const inScopePercentage = ((inScopeCovered / inScopeTotal) * 100).toFixed(2);

console.log('=== IN-SCOPE (BETA) COVERAGE (13 Projects) ===');
console.log('');
console.log(`Total Statements:     ${inScopeTotal.toLocaleString()}`);
console.log(`Covered Statements:   ${inScopeCovered.toLocaleString()}`);
console.log(`Uncovered Statements: ${(inScopeTotal - inScopeCovered).toLocaleString()}`);
console.log('');
console.log(`IN-SCOPE COVERAGE: ${inScopePercentage}%`);
console.log('');

// Show improvement from initial baseline
const initialBaseline = 88.67;
const improvement = (parseFloat(percentage) - initialBaseline).toFixed(2);
console.log('=== IMPROVEMENT ===');
console.log('');
console.log(`Initial Overall Baseline: ${initialBaseline}%`);
console.log(`Current Overall Coverage: ${percentage}%`);
console.log(`Improvement: +${improvement} percentage points`);
console.log('');
