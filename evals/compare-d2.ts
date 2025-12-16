import fs from 'fs/promises';
import path from 'path';

type EvalIterationResult = {
  metadata: {
    contentId: string;
    promptId: string;
    modelId: string;
  };
  jsonParsed: boolean;
  schemaValidated: boolean;
  d2Checks: Array<{
    blockId: string;
    title: string;
    visualType: string;
    success: boolean;
    error?: string;
  }>;
  timestamp: string;
};

type Stats = {
  total: number;
  failures: number;
  successes: number;
};

function getWeightedScore(successes: number, total: number): number {
  if (total === 0) return 0;
  const z = 1.96; // 95% confidence
  const p = successes / total;
  const left = p + (z * z) / (2 * total);
  const right = z * Math.sqrt((p * (1 - p)) / total + (z * z) / (4 * total * total));
  const under = 1 + (z * z) / total;
  return Math.round(((left - right) / under) * 100);
}

async function loadResults(filePath: string): Promise<EvalIterationResult[]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return fileContent
      .split('\n')
      .filter((line) => line.trim())
      .map((line) => JSON.parse(line));
  } catch (e) {
    console.error(`Error reading file ${filePath}: ${e}`);
    return [];
  }
}

async function run() {
  const baselinePath = path.join(process.cwd(), 'evals', 'results', 'd2-eval-main.jsonl');
  const reflectionPath = path.join(process.cwd(), 'evals', 'results', 'd2-eval-reflection.jsonl');
  const outputPath = path.join(process.cwd(), 'evals', 'results', 'comparison-report.html');

  console.log(`Reading baseline from ${baselinePath}`);
  console.log(`Reading reflection from ${reflectionPath}`);

  const [baselineResults, reflectionResults] = await Promise.all([
    loadResults(baselinePath),
    loadResults(reflectionPath),
  ]);

  console.log(`Loaded ${baselineResults.length} baseline results.`);
  console.log(`Loaded ${reflectionResults.length} reflection results.`);

  const comparisonData: Record<string, Record<string, { baseline: Stats; reflection: Stats }>> = {};
  const models = new Set<string>();
  const prompts = new Set<string>();

  for (const result of baselineResults) {
    const { promptId, modelId } = result.metadata;
    models.add(modelId);
    prompts.add(promptId);

    if (!comparisonData[modelId]) comparisonData[modelId] = {};
    if (!comparisonData[modelId][promptId])
      comparisonData[modelId][promptId] = {
        baseline: { total: 0, failures: 0, successes: 0 },
        reflection: { total: 0, failures: 0, successes: 0 },
      };

    for (const check of result.d2Checks) {
      comparisonData[modelId][promptId].baseline.total++;
      if (check.success) {
        comparisonData[modelId][promptId].baseline.successes++;
      } else {
        comparisonData[modelId][promptId].baseline.failures++;
      }
    }
  }

  for (const result of reflectionResults) {
    const { promptId, modelId } = result.metadata;
    models.add(modelId);
    prompts.add(promptId);

    if (!comparisonData[modelId]) comparisonData[modelId] = {};
    if (!comparisonData[modelId][promptId])
      comparisonData[modelId][promptId] = {
        baseline: { total: 0, failures: 0, successes: 0 },
        reflection: { total: 0, failures: 0, successes: 0 },
      };

    for (const check of result.d2Checks) {
      comparisonData[modelId][promptId].reflection.total++;
      if (check.success) {
        comparisonData[modelId][promptId].reflection.successes++;
      } else {
        comparisonData[modelId][promptId].reflection.failures++;
      }
    }
  }

  const sortedModels = Array.from(models).sort();
  const sortedPrompts = Array.from(prompts).sort();

  const modelStats = sortedModels.map((model) => {
    let baseTotal = 0,
      baseSuccess = 0;
    let refTotal = 0,
      refSuccess = 0;

    const promptsForModel = comparisonData[model] || {};
    for (const p of Object.keys(promptsForModel)) {
      const data = promptsForModel[p];
      baseTotal += data.baseline.total;
      baseSuccess += data.baseline.successes;
      refTotal += data.reflection.total;
      refSuccess += data.reflection.successes;
    }

    return {
      model,
      baselineScore: getWeightedScore(baseSuccess, baseTotal),
      reflectionScore: getWeightedScore(refSuccess, refTotal),
    };
  });

  const tableRows = [];
  for (const model of sortedModels) {
    for (const prompt of sortedPrompts) {
      const data = comparisonData[model]?.[prompt];
      if (!data) continue;
      // Only show rows where we have data for at least one
      if (data.baseline.total === 0 && data.reflection.total === 0) continue;

      const baseScore = getWeightedScore(data.baseline.successes, data.baseline.total);
      const refScore = getWeightedScore(data.reflection.successes, data.reflection.total);
      const delta = refScore - baseScore;

      tableRows.push({
        model,
        prompt,
        baseScore,
        refScore,
        delta,
        baseStats: data.baseline,
        refStats: data.reflection,
      });
    }
  }

  tableRows.sort((a, b) => b.delta - a.delta);

  const tableHtml = tableRows
    .map((row) => {
      let deltaClass = 'delta-neutral';
      let deltaSign = '';
      if (row.delta > 0) {
        deltaClass = 'delta-positive';
        deltaSign = '+';
      }
      if (row.delta < 0) {
        deltaClass = 'delta-negative';
      }

      return `
        <tr data-prompt="${row.prompt}">
            <td class="model-cell">${row.model}</td>
            <td>${row.prompt}</td>
            <td class="score-cell">${row.baseScore}% <span style="font-weight:normal; color:#9ca3af; font-size:0.8em">(${row.baseStats.successes}/${row.baseStats.total})</span></td>
            <td class="score-cell">${row.refScore}% <span style="font-weight:normal; color:#9ca3af; font-size:0.8em">(${row.refStats.successes}/${row.refStats.total})</span></td>
            <td class="${deltaClass}">${deltaSign}${row.delta}%</td>
        </tr>
        `;
    })
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D2 Reflection Impact Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
    <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; margin: 2rem; background: #fff; color: #1f2937; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }

        h1 { font-family: 'Patrick Hand', cursive; font-size: 3rem; color: #111; margin-bottom: 0.5rem; text-align: center; }
        .meta { color: #6b7280; text-align: center; margin-bottom: 3rem; font-family: 'Patrick Hand', cursive; font-size: 1.2rem; }

        h2 { font-family: 'Patrick Hand', cursive; font-size: 2rem; margin-top: 3rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }

        .chart-container {
            background: #fff;
            padding: 1.5rem;
            border: 2px solid #e5e7eb;
            border-radius: 4px;
            margin-bottom: 3rem;
        }

        /* Table Styles */
        .table-container { overflow-x: auto; border: 2px solid #e5e7eb; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; font-weight: 600; color: #374151; font-family: 'Patrick Hand', cursive; font-size: 1.1rem; letter-spacing: 0.05em; }
        tr:last-child td { border-bottom: none; }
        tr:hover { background-color: #f3f4f6; }

        .delta-positive { color: #059669; font-weight: bold; }
        .delta-negative { color: #dc2626; font-weight: bold; }
        .delta-neutral { color: #6b7280; }

        .score-cell { font-weight: 600; }
        .model-cell { font-family: 'Inter', monospace; font-size: 0.9em; }

        /* Filters */
        .filters {
            background: #fff;
            padding: 1.5rem;
            border: 2px dashed #cbd5e1;
            border-radius: 4px;
            margin-bottom: 2rem;
        }
        .filter-group { margin-bottom: 1rem; }
        .filter-group:last-child { margin-bottom: 0; }
        .filter-label { display: block; font-family: 'Patrick Hand', cursive; font-size: 1.2rem; margin-bottom: 0.5rem; color: #1f2937; }
        .checkbox-group { display: flex; flex-wrap: wrap; gap: 1.5rem; }
        .checkbox-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.95rem; user-select: none; }
        input[type="checkbox"] { accent-color: #1f2937; width: 1.1em; height: 1.1em; }

    </style>
</head>
<body>
    <div class="container">
        <h1>D2 Reflection Impact Report</h1>
        <p class="meta">Generated on ${new Date().toLocaleString()}</p>

        <div class="chart-container">
            <canvas id="comparisonChart" height="120"></canvas>
        </div>

        <h2>Detailed Comparison</h2>
        <div class="filters">
            <div class="filter-group">
                <span class="filter-label">Filter by Prompt</span>
                <div class="checkbox-group" id="promptFilters">
                    ${sortedPrompts
                      .map(
                        (p) => `
                        <label class="checkbox-label">
                            <input type="checkbox" value="${p}" checked onchange="filterTable()"> ${p}
                        </label>
                    `
                      )
                      .join('')}
                </div>
            </div>
        </div>

        <div class="table-container">
            <table id="resultsTable">
                <thead>
                    <tr>
                        <th>Model</th>
                        <th>Prompt</th>
                        <th>Baseline Score</th>
                        <th>Reflection Score</th>
                        <th>Improvement</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableHtml}
                </tbody>
            </table>
        </div>
    </div>

    <script>
        function filterTable() {
            const checkedPrompts = Array.from(document.querySelectorAll('#promptFilters input:checked')).map(cb => cb.value);
            const rows = document.querySelectorAll('#resultsTable tbody tr');

            rows.forEach(row => {
                const prompt = row.getAttribute('data-prompt');
                if (checkedPrompts.includes(prompt)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }

        Chart.register(ChartDataLabels);
        Chart.defaults.font.family = '"Inter", sans-serif';
        Chart.defaults.color = '#4b5563';

        // Helper to create diagonal pattern
        function createDiagonalPattern(color = 'black') {
            const shape = document.createElement('canvas');
            shape.width = 10;
            shape.height = 10;
            const c = shape.getContext('2d');
            c.strokeStyle = color;
            c.lineWidth = 2;
            c.beginPath();
            c.moveTo(0, 10);
            c.lineTo(10, 0);
            c.stroke();
            return c.createPattern(shape, 'repeat');
        }

        const ctx = document.getElementById('comparisonChart').getContext('2d');
        
        const modelLabels = ${JSON.stringify(modelStats.map((m) => m.model))};
        const baselineScores = ${JSON.stringify(modelStats.map((m) => m.baselineScore))};
        const reflectionScores = ${JSON.stringify(modelStats.map((m) => m.reflectionScore))};

        // Colors: Blue for Baseline, Emerald for Reflection
        const baselineColor = '#3b82f6'; 
        const reflectionColor = '#10b981';

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: modelLabels,
                datasets: [
                    {
                        label: 'Baseline',
                        data: baselineScores,
                        borderColor: baselineColor,
                        backgroundColor: createDiagonalPattern(baselineColor),
                        borderWidth: 2,
                        borderRadius: 4,
                    },
                    {
                        label: 'Reflection',
                        data: reflectionScores,
                        borderColor: reflectionColor,
                        backgroundColor: createDiagonalPattern(reflectionColor),
                        borderWidth: 2,
                        borderRadius: 4,
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Impact of Reflection by Model (Weighted Success Score)',
                        font: { family: '"Patrick Hand", cursive', size: 24, weight: 'normal' },
                        color: '#111',
                        padding: { bottom: 20 }
                    },
                    datalabels: {
                        color: '#1f2937',
                        font: { weight: 'bold', size: 12 },
                        anchor: 'end',
                        align: 'top',
                        offset: -4,
                        formatter: (value) => value > 0 ? value + '%' : ''
                    },
                    legend: {
                        position: 'top',
                        labels: { font: { size: 14 }, usePointStyle: true, pointStyle: 'rectRounded' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#f3f4f6', borderDash: [4, 4] },
                        border: { display: false },
                        title: { display: true, text: 'Weighted Success Score (%)' }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false }
                    }
                },
                layout: { padding: { top: 20 } }
            }
        });
    </script>
</body>
</html>
    `;

  await fs.writeFile(outputPath, html, 'utf-8');
  console.log(`Comparison report generated at ${outputPath}`);
}

run().catch(console.error);
