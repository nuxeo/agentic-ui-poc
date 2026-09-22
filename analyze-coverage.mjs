#!/usr/bin/env node
/**
 * Analyze coverage report to find uncovered statements.
 */

import { readFileSync } from 'fs';
import { relative, resolve } from 'path';

const [, , project] = process.argv;
if (!project) {
  console.error('Usage: node analyze-coverage.mjs <project-name>');
  process.exit(1);
}

const coveragePath = `coverage/${project}/coverage-final.json`;
const data = JSON.parse(readFileSync(coveragePath, 'utf8'));

const uncovered = [];

for (const [filePath, fileCoverage] of Object.entries(data)) {
  const statements = fileCoverage.s || {};
  const statementMap = fileCoverage.statementMap || {};
  const branches = fileCoverage.b || {};
  const branchMap = fileCoverage.branchMap || {};

  const uncoveredStatements = [];
  const uncoveredBranches = [];

  // Find uncovered statements
  for (const [id, hitCount] of Object.entries(statements)) {
    if (hitCount === 0 && statementMap[id]) {
      const loc = statementMap[id];
      uncoveredStatements.push({
        line: loc.start.line,
        col: loc.start.column,
      });
    }
  }

  // Find uncovered branches
  for (const [id, branchHits] of Object.entries(branches)) {
    if (branchMap[id]) {
      branchHits.forEach((hits, idx) => {
        if (hits === 0) {
          const loc = branchMap[id].locations[idx];
          if (loc) {
            uncoveredBranches.push({
              line: loc.start.line,
              type: branchMap[id].type,
            });
          }
        }
      });
    }
  }

  if (uncoveredStatements.length > 0 || uncoveredBranches.length > 0) {
    const relPath = relative(process.cwd(), filePath);
    uncovered.push({
      file: relPath,
      uncoveredStatements,
      uncoveredBranches,
      totalStatements: Object.keys(statements).length,
      coveredStatements: Object.values(statements).filter((h) => h > 0).length,
    });
  }
}

// Sort by most uncovered
uncovered.sort((a, b) => b.uncoveredStatements.length - a.uncoveredStatements.length);

console.log(`\nUncovered code in ${project}:\n`);
uncovered.forEach(({ file, uncoveredStatements, uncoveredBranches, totalStatements, coveredStatements }) => {
  const coverage = ((coveredStatements / totalStatements) * 100).toFixed(2);
  console.log(`${file}`);
  console.log(`  Coverage: ${coveredStatements}/${totalStatements} statements (${coverage}%)`);

  if (uncoveredStatements.length > 0) {
    console.log(`  Uncovered statements (${uncoveredStatements.length}):`);
    const groupedByLine = {};
    uncoveredStatements.forEach(({ line }) => {
      groupedByLine[line] = (groupedByLine[line] || 0) + 1;
    });
    Object.entries(groupedByLine)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .forEach(([line, count]) => {
        console.log(`    Line ${line}${count > 1 ? ` (${count} stmts)` : ''}`);
      });
  }

  if (uncoveredBranches.length > 0) {
    console.log(`  Uncovered branches (${uncoveredBranches.length}):`);
    const groupedByLine = {};
    uncoveredBranches.forEach(({ line, type }) => {
      if (!groupedByLine[line]) groupedByLine[line] = [];
      groupedByLine[line].push(type);
    });
    Object.entries(groupedByLine)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .forEach(([line, types]) => {
        console.log(`    Line ${line}: ${types.join(', ')}`);
      });
  }
  console.log();
});

const totalUncoveredStmts = uncovered.reduce((sum, f) => sum + f.uncoveredStatements.length, 0);
const totalUncoveredBranches = uncovered.reduce((sum, f) => sum + f.uncoveredBranches.length, 0);
console.log(`Total uncovered: ${totalUncoveredStmts} statements, ${totalUncoveredBranches} branches\n`);
