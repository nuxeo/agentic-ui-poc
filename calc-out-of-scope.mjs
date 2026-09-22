const projects = {
  "tasks": { current: 43.12, sTotal: 705, sCovered: 304 },
  "acme-extensions": { current: 53.47, sTotal: 101, sCovered: 54 },
  "administration": { current: 60.39, sTotal: 1078, sCovered: 651 }
};

console.log('=== OUT-OF-SCOPE PROJECTS TO 90% ===\n');

let totalGap = 0;

for (const [name, data] of Object.entries(projects)) {
  const target = Math.ceil(data.sTotal * 0.9);
  const gap = target - data.sCovered;
  const gapPP = (90 - data.current).toFixed(2);

  totalGap += gap;

  console.log(`${name}:`);
  console.log(`  Current: ${data.current}% (${data.sCovered}/${data.sTotal})`);
  console.log(`  Target:  90% (${target}/${data.sTotal})`);
  console.log(`  Gap:     ${gap} statements (${gapPP}pp)`);
  console.log('');
}

console.log(`TOTAL STATEMENTS NEEDED: ${totalGap}`);
console.log(`ESTIMATED EFFORT: ${Math.ceil(totalGap / 20)}-${Math.ceil(totalGap / 10)} hours`);
console.log('');
