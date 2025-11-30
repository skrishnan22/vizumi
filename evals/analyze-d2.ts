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

async function run() {
    const inputPath = path.join(process.cwd(), 'evals', 'results', 'd2-eval.jsonl');
    const outputPath = path.join(process.cwd(), 'evals', 'results', 'report.html');

    console.log(`Reading results from ${inputPath}`);

    let fileContent;
    try {
        fileContent = await fs.readFile(inputPath, 'utf-8');
    } catch (e) {
        console.error(`Error reading file: ${e}`);
        return;
    }

    const results: EvalIterationResult[] = fileContent
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => JSON.parse(line));

    console.log(`Loaded ${results.length} results.`);

    // --- Analysis ---

    const stats = {
        totalDiagrams: 0,
        totalFailures: 0,
        byPrompt: {} as Record<string, { total: number; failures: number }>,
        byModel: {} as Record<string, { total: number; failures: number }>,
        byCombination: {} as Record<string, { total: number; failures: number; promptId: string; modelId: string }>,
    };

    for (const result of results) {
        const { promptId, modelId } = result.metadata;
        const comboKey = `${promptId}::${modelId}`;

        if (!stats.byPrompt[promptId]) stats.byPrompt[promptId] = { total: 0, failures: 0 };
        if (!stats.byModel[modelId]) stats.byModel[modelId] = { total: 0, failures: 0 };
        if (!stats.byCombination[comboKey]) stats.byCombination[comboKey] = { total: 0, failures: 0, promptId, modelId };

        for (const check of result.d2Checks) {
            stats.totalDiagrams++;
            stats.byPrompt[promptId].total++;
            stats.byModel[modelId].total++;
            stats.byCombination[comboKey].total++;

            if (!check.success) {
                stats.totalFailures++;
                stats.byPrompt[promptId].failures++;
                stats.byModel[modelId].failures++;
                stats.byCombination[comboKey].failures++;
            }
        }
    }

    // --- HTML Generation ---

    const prompts = Object.keys(stats.byPrompt).sort();
    const models = Object.keys(stats.byModel).sort();

    const promptErrorRates = prompts.map(p => {
        const s = stats.byPrompt[p];
        return s.total > 0 ? parseFloat(((s.failures / s.total) * 100).toFixed(1)) : 0;
    });

    const modelErrorRates = models.map(m => {
        const s = stats.byModel[m];
        return s.total > 0 ? parseFloat(((s.failures / s.total) * 100).toFixed(1)) : 0;
    });

    // Sketchy/Marker Palette
    const palette = [
        '#3b82f6', // Blue
        '#10b981', // Emerald
        '#8b5cf6', // Violet
        '#f59e0b', // Amber
        '#ec4899', // Pink
        '#6366f1', // Indigo
    ];

    // Grouped Bar Chart Data (Success Rate by Prompt/Model)
    const groupedDatasets = models.map((model, index) => {
        const data = prompts.map(prompt => {
            const key = `${prompt}::${model}`;
            const s = stats.byCombination[key];
            if (!s || s.total === 0) return 0;
            return parseFloat((((s.total - s.failures) / s.total) * 100).toFixed(1)); // Success Rate
        });

        const color = palette[index % palette.length];
        return {
            label: model,
            data: data,
            borderColor: color,
            borderWidth: 2,
            backgroundColor: 'transparent', // Will be replaced by pattern in JS
            // Custom property to pass color to pattern generator
            _color: color
        };
    });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>D2 Evaluation Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2.0.0"></script>
    <link href="https://fonts.googleapis.com/css2?family=Patrick+Hand&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; margin: 2rem; background: #fff; color: #1f2937; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }

        h1 { font-family: 'Patrick Hand', cursive; font-size: 3rem; color: #111; margin-bottom: 0.5rem; text-align: center; }
        .meta { color: #6b7280; text-align: center; margin-bottom: 3rem; font-family: 'Patrick Hand', cursive; font-size: 1.2rem; }

        h2 { font-family: 'Patrick Hand', cursive; font-size: 2rem; margin-top: 3rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.5rem; }

        .metrics-row { display: flex; justify-content: center; gap: 2rem; margin-bottom: 4rem; flex-wrap: wrap; }
        .metric-card {
            background: #fff;
            padding: 1.5rem 2rem;
            border: 2px solid #1f2937;
            border-radius: 2px;
            box-shadow: 4px 4px 0px #1f2937;
            min-width: 180px;
            text-align: center;
        }
        .metric-label { font-family: 'Patrick Hand', cursive; font-size: 1.2rem; color: #4b5563; display: block; margin-bottom: 0.5rem; }
        .metric-value { font-size: 2.5rem; font-weight: 700; color: #111; line-height: 1; }

        .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-bottom: 3rem; }
        .chart-container {
            background: #fff;
            padding: 1.5rem;
            border: 2px solid #e5e7eb;
            border-radius: 4px;
        }
        .full-width { grid-column: 1 / -1; }

        /* Table Styles */
        .table-container { overflow-x: auto; border: 2px solid #e5e7eb; border-radius: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 0.95rem; }
        th, td { padding: 1rem; text-align: left; border-bottom: 1px solid #e5e7eb; }
        th { background-color: #f9fafb; font-weight: 600; color: #374151; font-family: 'Patrick Hand', cursive; font-size: 1.1rem; letter-spacing: 0.05em; }
        tr:last-child td { border-bottom: none; }
        tr:hover { background-color: #f3f4f6; }

        .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-weight: 600; font-size: 0.8rem; border: 1px solid currentColor; }
        .success { color: #059669; background-color: #ecfdf5; }
        .failure { color: #dc2626; background-color: #fef2f2; }
        .failure-text { color: #dc2626; font-weight: bold; }

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
        <h1>D2 Evaluation Report</h1>
        <p class="meta">Generated on ${new Date().toLocaleString()}</p>

        <div class="metrics-row">
            <div class="metric-card">
                <span class="metric-label">Total Diagrams</span>
                <span class="metric-value">${stats.totalDiagrams}</span>
            </div>
            <div class="metric-card">
                <span class="metric-label">Total Failures</span>
                <span class="metric-value" style="color: ${stats.totalFailures > 0 ? '#dc2626' : 'inherit'}">${stats.totalFailures}</span>
            </div>
             <div class="metric-card">
                <span class="metric-label">Error Rate</span>
                <span class="metric-value">${stats.totalDiagrams > 0 ? ((stats.totalFailures / stats.totalDiagrams) * 100).toFixed(1) : 0}%</span>
            </div>
        </div>

        <div class="charts">
            <div class="chart-container">
                <canvas id="promptChart"></canvas>
            </div>
            <div class="chart-container">
                <canvas id="modelChart"></canvas>
            </div>
            <div class="chart-container full-width">
                <canvas id="groupedChart" height="100"></canvas>
            </div>
        </div>

        <h2>Detailed Results</h2>

        <div class="filters">
            <div class="filter-group">
                <span class="filter-label">Filter by Prompt</span>
                <div class="checkbox-group" id="promptFilters">
                    ${prompts.map(p => `
                        <label class="checkbox-label">
                            <input type="checkbox" value="${p}" checked onchange="filterTable()"> ${p}
                        </label>
                    `).join('')}
                </div>
            </div>
            <div class="filter-group">
                <span class="filter-label">Filter by Model</span>
                <div class="checkbox-group" id="modelFilters">
                    ${models.map(m => `
                        <label class="checkbox-label">
                            <input type="checkbox" value="${m}" checked onchange="filterTable()"> ${m}
                        </label>
                    `).join('')}
                </div>
            </div>
        </div>

        <div class="table-container">
            <table id="resultsTable">
                <thead>
                    <tr>
                        <th>Prompt</th>
                        <th>Model</th>
                        <th>Diagrams</th>
                        <th>Failures</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${results.map(r => {
        const failures = r.d2Checks.filter(c => !c.success).length;
        const total = r.d2Checks.length;
        const statusClass = failures === 0 ? 'success' : 'failure';
        return `
                        <tr data-prompt="${r.metadata.promptId}" data-model="${r.metadata.modelId}">
                            <td><strong>${r.metadata.promptId}</strong></td>
                            <td>${r.metadata.modelId}</td>
                            <td>${total}</td>
                            <td class="${failures > 0 ? 'failure-text' : ''}">${failures}</td>
                            <td><span class="status-badge ${statusClass}">${failures === 0 ? 'PASS' : 'FAIL'}</span></td>
                        </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    </div>

    <script>
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

        const commonOptions = {
            plugins: {
                datalabels: {
                    color: '#1f2937',
                    font: { weight: 'bold', size: 12 },
                    formatter: (value) => value > 0 ? value + '%' : '',
                    anchor: 'end',
                    align: 'top',
                    offset: -5
                },
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: { color: '#f3f4f6', borderDash: [4, 4] },
                    border: { display: false }
                },
                x: {
                    grid: { display: false },
                    border: { display: false }
                }
            },
            layout: { padding: { top: 25 } },
            elements: {
                bar: {
                    borderWidth: 2,
                    borderRadius: 4,
                    borderSkipped: false
                }
            }
        };

        // Prompt Error Rate Chart
        const promptCtx = document.getElementById('promptChart').getContext('2d');
        new Chart(promptCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(prompts)},
                datasets: [{
                    label: 'Error Rate (%)',
                    data: ${JSON.stringify(promptErrorRates)},
                    borderColor: '#ef4444',
                    backgroundColor: createDiagonalPattern('#ef4444'),
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: 'Error Rate by Prompt',
                        font: { family: '"Patrick Hand", cursive', size: 20, weight: 'normal' },
                        color: '#111',
                        padding: { bottom: 20 }
                    }
                }
            }
        });

        // Model Error Rate Chart
        const modelCtx = document.getElementById('modelChart').getContext('2d');
        new Chart(modelCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(models)},
                datasets: [{
                    label: 'Error Rate (%)',
                    data: ${JSON.stringify(modelErrorRates)},
                    borderColor: '#3b82f6',
                    backgroundColor: createDiagonalPattern('#3b82f6'),
                }]
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        display: true,
                        text: 'Error Rate by Model',
                        font: { family: '"Patrick Hand", cursive', size: 20, weight: 'normal' },
                        color: '#111',
                        padding: { bottom: 20 }
                    }
                }
            }
        });

        // Grouped Bar Chart (Success Rate)
        const groupedData = ${JSON.stringify(groupedDatasets)};
        // Apply patterns to grouped data
        groupedData.forEach(dataset => {
            dataset.backgroundColor = createDiagonalPattern(dataset.borderColor);
        });

        const groupedCtx = document.getElementById('groupedChart').getContext('2d');
        new Chart(groupedCtx, {
            type: 'bar',
            data: {
                labels: ${JSON.stringify(prompts)},
                datasets: groupedData
            },
            options: {
                responsive: true,
                layout: { padding: { top: 30 } },
                plugins: {
                    title: {
                        display: true,
                        text: 'Success Rate (%) by Prompt & Model',
                        font: { family: '"Patrick Hand", cursive', size: 20, weight: 'normal' },
                        color: '#111',
                        padding: { bottom: 20 }
                    },
                    datalabels: {
                        color: '#1f2937',
                        font: { weight: 'bold', size: 11 },
                        anchor: 'center',
                        align: 'center',
                        formatter: (value) => value > 0 ? Math.round(value) + '%' : ''
                    },
                    legend: {
                        position: 'top',
                        labels: { font: { family: '"Inter", sans-serif', size: 12 }, usePointStyle: true, pointStyle: 'rectRounded' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: { color: '#f3f4f6', borderDash: [4, 4] },
                        border: { display: false }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false }
                    }
                }
            }
        });

        function filterTable() {
            const checkedPrompts = Array.from(document.querySelectorAll('#promptFilters input:checked')).map(cb => cb.value);
            const checkedModels = Array.from(document.querySelectorAll('#modelFilters input:checked')).map(cb => cb.value);

            const rows = document.querySelectorAll('#resultsTable tbody tr');

            rows.forEach(row => {
                const prompt = row.getAttribute('data-prompt');
                const model = row.getAttribute('data-model');

                const promptMatch = checkedPrompts.length === 0 || checkedPrompts.includes(prompt);
                const modelMatch = checkedModels.length === 0 || checkedModels.includes(model);

                if (promptMatch && modelMatch) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }
    </script>
</body>
</html>
  `;

    await fs.writeFile(outputPath, html, 'utf-8');
    console.log(`Report generated at ${outputPath}`);
}

run().catch(console.error);
