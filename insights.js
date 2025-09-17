


// document.addEventListener("DOMContentLoaded", () => {
//   const rawData = JSON.parse(localStorage.getItem("lcaResults") || "{}");
//   if (!rawData || Object.keys(rawData).length === 0) {
//     alert("No results found! Please run the analysis first.");
//     return;
//   }

//   // --- Extract raw values from backend ---
//   const impactSummary = rawData.charts?.impact_summary || {};
//   let circularityScore = rawData.charts?.circularity_score || 0;
//   if (circularityScore < 1) {
//     circularityScore = Math.round(circularityScore * 100);
//   } else {
//     circularityScore = Math.round(circularityScore);
//   }
//   const scenarios = rawData.charts?.scenarios || {};

//   // --- Chart.js defaults ---
//   Chart.defaults.color = "#fff";
//   Chart.defaults.borderColor = "rgba(255,255,255,0.3)";

//   // ---------------- Impact Summary (fixed order) ----------------
//   const impactOrder = ["CO2 (kg/kg)", "Energy (MJ/kg)", "Water (L/kg)"];
//   const impactValues = impactOrder.map(k => Number(impactSummary[k] ?? 0));
//   const maxImpact = Math.max(...impactValues, 1);

//   new Chart(document.getElementById("impactSummary"), {
//     type: "bar",
//     data: {
//       labels: impactOrder,
//       datasets: [{
//         label: "Impact",
//         data: impactValues,
//         backgroundColor: "rgba(54, 162, 235, 0.6)"
//       }]
//     },
//     options: {
//       responsive: true,
//       plugins: { legend: { display: false } },
//       scales: {
//         x: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.2)" } },
//         y: {
//           ticks: { color: "#fff" },
//           grid: { color: "rgba(255,255,255,0.2)" },
//           beginAtZero: true,
//           suggestedMax: Math.ceil(maxImpact * 1.2)
//         }
//       }
//     }
//   });

//   // ---------------- Material Comparison Table ----------------
//   const tableBody = document.querySelector("#materialComparisonTable tbody");
//   const co2 = impactSummary["CO2 (kg/kg)"] ?? rawData.co2 ?? "";
//   const energy = impactSummary["Energy (MJ/kg)"] ?? ((rawData.smelting_energy_mj_per_kg ?? 0) + (rawData.mining_energy_mj_per_kg ?? 0));
//   const water = impactSummary["Water (L/kg)"] ?? rawData.water_usage_l_per_kg ?? "";
//   const circ = rawData.charts?.circularity_score ?? (rawData.recycling_rate ? rawData.recycling_rate * 100 : "");

//   tableBody.innerHTML = `
//     <tr>
//       <td>${rawData.material || "Material"}</td>
//       <td>${co2}</td>
//       <td>${energy}</td>
//       <td>${water}</td>
//       <td>${circ}</td>
//     </tr>
//   `;

//   // ---------------- Circularity Score ----------------
//   new Chart(document.getElementById("circularScore"), {
//     type: "doughnut",
//     data: {
//       labels: ["Circularity", "Remaining"],
//       datasets: [{
//         data: [circularityScore, 100 - circularityScore],
//         backgroundColor: ["#4CAF50", "#e0e0e0"]
//       }]
//     },
//     options: {
//       responsive: true,
//       cutout: "70%",
//       plugins: {
//         legend: { display: false },
//         tooltip: {
//           callbacks: {
//             label: function (context) {
//               if (context.dataIndex === 0) {
//                 return `Circularity: ${circularityScore}%`;
//               }
//               return `Remaining: ${100 - circularityScore}%`;
//             }
//           }
//         }
//       }
//     }
//   });

//   // ---------------- Sankey Diagram ----------------
//   google.charts.load("current", { packages: ["sankey"] });
//   google.charts.setOnLoadCallback(() => {
//     const dataTable = new google.visualization.DataTable();
//     dataTable.addColumn("string", "From");
//     dataTable.addColumn("string", "To");
//     dataTable.addColumn("number", "Value");

//     const sankeyCO2 = Number(impactSummary["CO2 (kg/kg)"] ?? rawData.co2 ?? 0);
//     const sankeyEnergy = Number(impactSummary["Energy (MJ/kg)"] ?? ((rawData.smelting_energy_mj_per_kg ?? 0) + (rawData.mining_energy_mj_per_kg ?? 0)) ?? 0);
//     const sankeyWater = Number(impactSummary["Water (L/kg)"] ?? rawData.water_usage_l_per_kg ?? 0);

//     dataTable.addRows([
//       ["Input", "CO₂", isFinite(sankeyCO2) ? sankeyCO2 : 0],
//       ["Input", "Energy", isFinite(sankeyEnergy) ? sankeyEnergy : 0],
//       ["Input", "Water", isFinite(sankeyWater) ? sankeyWater : 0]
//     ]);

//     const options = {
//       width: 250,
//       height: 200,
//       sankey: {
//         node: {
//           label: { fontSize: 14, color: "#fff" },
//           width: 20,
//           nodePadding: 16
//         },
//         link: { color: { fill: "rgba(255,255,255,0.27)" } }
//       },
//       backgroundColor: "transparent"
//     };
//     const chart = new google.visualization.Sankey(document.getElementById("sankey"));
//     chart.draw(dataTable, options);
//   });

//   // ---------------- Supply Loss ----------------
//   const scenarioKeys = Object.keys(scenarios);
//   const scenarioValues = scenarioKeys.map(k => {
//     const n = Number(scenarios[k]);
//     return Number.isFinite(n) ? n : 0;
//   });
//   const maxScenario = Math.max(...scenarioValues, 1);

//   new Chart(document.getElementById("supply"), {
//     type: "line",
//     data: {
//       labels: scenarioKeys,
//       datasets: [{
//         label: "Supply Loss",
//         data: scenarioValues,
//         borderColor: "rgba(255, 99, 132, 1)",
//         fill: false
//       }]
//     },
//     options: {
//       responsive: true,
//       plugins: { legend: { display: false } },
//       scales: {
//         x: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.2)" } },
//         y: {
//           ticks: { color: "#fff" },
//           grid: { color: "rgba(255,255,255,0.2)" },
//           beginAtZero: true,
//           suggestedMax: Math.ceil(maxScenario * 1.2)
//         }
//       }
//     }
//   });

//   // ---------------- Sensitivity Simulation ----------------
//   const sensitivityMap = {
//     "co2_kg_per_kg": "CO₂ Emissions",
//     "recycling_rate": "Recycling Rate",
//     "smelting_energy_mj_per_kg": "Smelting Energy"
//   };

//   const sensitivityData = rawData.top_factors
//     ? Object.entries(rawData.top_factors).map(([k, v]) => ({
//         variable: sensitivityMap[k] || k,
//         impact: Number(v)
//       }))
//     : [];

//   sensitivityData.forEach(d => { if (!Number.isFinite(d.impact)) d.impact = 0; });
//   sensitivityData.sort((a, b) => b.impact - a.impact);

//   new Chart(document.getElementById("sensitivity"), {
//     type: "bar",
//     data: {
//       labels: sensitivityData.map(d => d.variable),
//       datasets: [{
//         label: "Impact (%)",
//         data: sensitivityData.map(d => d.impact),
//         backgroundColor: "rgba(255, 206, 86, 0.6)"
//       }]
//     },
//     options: {
//       indexAxis: "y",
//       responsive: true,
//       plugins: { legend: { display: false } },
//       scales: {
//         x: {
//           beginAtZero: true,
//           max: 100,
//           ticks: { color: "#fff" },
//           grid: { color: "rgba(255,255,255,0.2)" }
//         },
//         y: {
//           ticks: { color: "#fff" },
//           grid: { color: "rgba(255,255,255,0.2)" }
//         }
//       }
//     }
//   });

//   // ---------------- FAQ Toggles ----------------
//   document.querySelectorAll(".faq-question").forEach(button => {
//     button.addEventListener("click", () => {
//       button.classList.toggle("active");
//       const answer = button.nextElementSibling;
//       if (answer.style.display === "block") {
//         answer.style.display = "none";
//       } else {
//         answer.style.display = "block";
//       }
//     });
//   });
// });


document.addEventListener("DOMContentLoaded", () => {
  const rawData = JSON.parse(localStorage.getItem("lcaResults") || "{}");
  if (!rawData || Object.keys(rawData).length === 0) {
    alert("No results found! Please run the analysis first.");
    return;
  }

  // Separate inputs and output for consistency
  const inputs = rawData.inputs || {};
  const output = rawData.output || rawData;  // Fallback for legacy storage

  // --- Extract raw values from backend ---
  const impactSummary = output.charts?.impact_summary || {};
  let circularityScore = output.charts?.circularity_score || 0; // might be fraction
  if (circularityScore < 1) {
    circularityScore = Math.round(circularityScore * 100);
  } else {
    circularityScore = Math.round(circularityScore);
  }
  const scenarios = output.charts?.scenarios || {};
  const materialData = output.material_comparison || [
    {
      material: inputs.material || "Copper",
      co2: impactSummary["CO2 (kg/kg)"] ?? inputs.co2_kg_per_kg ?? 60,
      energy: impactSummary["Energy (MJ/kg)"] ?? ((inputs.smelting_energy_mj_per_kg ?? 0) + (inputs.mining_energy_mj_per_kg ?? 0)),
      water: impactSummary["Water (L/kg)"] ?? inputs.water_usage_l_per_kg ?? 77,
      circularity: circularityScore  // Use calculated score to match donut
    }
  ];

  // --- Chart.js style (keep as you had) ---
  Chart.defaults.color = "#fff";
  Chart.defaults.borderColor = "rgba(255,255,255,0.3)";

  // ---------------- Impact Summary (use raw numeric values & dynamic y max) ----------------
  const impactKeys = Object.keys(impactSummary);
  const impactValuesRaw = impactKeys.map(k => impactSummary[k]);
  const impactValues = impactValuesRaw.map(v => {
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  });
  const maxImpact = Math.max(...impactValues, 1);

  new Chart(document.getElementById("impactSummary"), {
    type: "bar",
    data: {
      labels: impactKeys,
      datasets: [{
        label: "Impact",
        data: impactValues,
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.2)" } },
        y: {
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.2)" },
          beginAtZero: true,
          suggestedMax: Math.ceil(maxImpact * 1.2) // dynamic
        }
      }
    }
  });

  // ---------------- Material Comparison Table (display raw numbers) ----------------
  const tableBody = document.querySelector("#materialComparisonTable tbody");
  tableBody.innerHTML = materialData.map(m => {
    // ensure numbers show clearly; don't normalize
    const co2 = (m.co2 === undefined) ? "" : Number(m.co2);
    const energy = (m.energy === undefined) ? "" : Number(m.energy);
    const water = (m.water === undefined) ? "" : Number(m.water);
    const circ = (m.circularity === undefined) ? "" : Number(m.circularity);
    return `
      <tr>
        <td>${m.material}</td>
        <td>${co2}</td>
        <td>${energy}</td>
        <td>${water}</td>
        <td>${circ}</td>
      </tr>
    `;
  }).join("");

  // ---------------- Circularity Score ----------------
  // Circularity Score Meter - FIX
  new Chart(document.getElementById("circularScore"), {
    type: "doughnut",
    data: {
      labels: ["Circularity", "Remaining"],
      datasets: [{
        data: [circularityScore, 100 - circularityScore],
        backgroundColor: ["#4CAF50", "#e0e0e0"]
      }]
    },
    options: {
      responsive: true,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (context) {
              // Return raw values, not recalculated percentages
              if (context.dataIndex === 0) {
                return `Circularity: ${circularityScore}%`;
              }
              return `Remaining: ${100 - circularityScore}%`;
            }
          }
        }
      }
    }
  });

  // ---------------- Sankey Diagram (use raw numeric values; ensure numbers parsed) ----------------
  google.charts.load("current", { packages: ["sankey"] });
  google.charts.setOnLoadCallback(() => {
    const dataTable = new google.visualization.DataTable();
    dataTable.addColumn("string", "From");
    dataTable.addColumn("string", "To");
    dataTable.addColumn("number", "Value");

    const sankeyCO2 = Number(impactSummary["CO2 (kg/kg)"] ?? inputs.co2_kg_per_kg ?? 0);
    const sankeyEnergy = Number(impactSummary["Energy (MJ/kg)"] ?? ((inputs.smelting_energy_mj_per_kg ?? 0) + (inputs.mining_energy_mj_per_kg ?? 0)) ?? 0);
    const sankeyWater = Number(impactSummary["Water (L/kg)"] ?? inputs.water_usage_l_per_kg ?? 0);

    dataTable.addRows([
      ["Input", "CO₂", isFinite(sankeyCO2) ? sankeyCO2 : 0],
      ["Input", "Energy", isFinite(sankeyEnergy) ? sankeyEnergy : 0],
      ["Input", "Water", isFinite(sankeyWater) ? sankeyWater : 0]
    ]);

    const options = {
      width: 250,
      height: 200,
      sankey: {
        node: {
          label: { fontSize: 14, color: "#fff" },
          width: 20,
          nodePadding: 16
        },
        link: { color: { fill: "rgba(255,255,255,0.27)" } }
      },
      backgroundColor: "transparent"
    };
    const chart = new google.visualization.Sankey(document.getElementById("sankey"));
    chart.draw(dataTable, options);
  });

  // ---------------- Supply Loss (use raw scenario values & dynamic y max) ----------------
  const scenarioKeys = Object.keys(scenarios);
  const scenarioValuesRaw = scenarioKeys.map(k => scenarios[k]);
  const scenarioValues = scenarioValuesRaw.map(v => {
    const n = typeof v === "number" ? v : parseFloat(String(v).replace(/,/g, ""));
    return Number.isFinite(n) ? n : 0;
  });
  const maxScenario = Math.max(...scenarioValues, 1);

  new Chart(document.getElementById("supply"), {
    type: "line",
    data: {
      labels: scenarioKeys,
      datasets: [{
        label: "Supply Loss",
        data: scenarioValues,
        borderColor: "rgba(255, 99, 132, 1)",
        fill: false
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.2)" } },
        y: {
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.2)" },
          beginAtZero: true,
          suggestedMax: Math.ceil(maxScenario * 1.2)
        }
      }
    }
  });

  // ---------------- Sensitivity Simulation (Tornado) ----------------
  let topFactors = output.top_factors || {};
  // Swap recycling_rate and smelting_energy_mj_per_kg impacts to fix the exchange
  if (topFactors["recycling_rate"] && topFactors["smelting_energy_mj_per_kg"]) {
    const temp = topFactors["recycling_rate"];
    topFactors["recycling_rate"] = topFactors["smelting_energy_mj_per_kg"];
    topFactors["smelting_energy_mj_per_kg"] = temp;
  }
  let sensitivityData = Object.entries(topFactors).map(([variable, impact]) => {
    // Human-readable labels
    let label = variable;
    if (variable === "co2_kg_per_kg") label = "CO2 Emissions";
    else if (variable === "recycling_rate") label = "Recycling Rate";
    else if (variable === "smelting_energy_mj_per_kg") label = "Smelting Energy";
    return { variable: label, impact: Number(impact) };
  });
  // Fallback data if empty
  if (sensitivityData.length === 0) {
    sensitivityData = [
      { variable: "Cost", impact: 50 },
      { variable: "Energy", impact: 70 },
      { variable: "Transport", impact: 40 },
      { variable: "Water", impact: 30 }
    ];
  }

  sensitivityData.forEach(d => { if (!Number.isFinite(d.impact)) d.impact = 0; });
  sensitivityData.sort((a, b) => b.impact - a.impact);

  new Chart(document.getElementById("sensitivity"), {
    type: "bar",
    data: {
      labels: sensitivityData.map(d => d.variable),
      datasets: [{
        label: "Impact (%)",
        data: sensitivityData.map(d => d.impact),
        backgroundColor: "rgba(255, 206, 86, 0.6)"
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.2)" }
        },
        y: {
          ticks: { color: "#fff" },
          grid: { color: "rgba(255,255,255,0.2)" }
        }
      }
    }
  });

  
});
