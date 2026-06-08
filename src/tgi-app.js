import { tgiCategories, tgiScale } from "./tgi.js";

const tgiControls = {
  category: document.querySelector("#tgiCategorySelect"),
  save: document.querySelector("#tgiSave"),
  copy: document.querySelector("#tgiCopy"),
  csv: document.querySelector("#tgiCsv"),
  print: document.querySelector("#tgiPrint"),
  reset: document.querySelector("#tgiReset")
};

const tgiEls = {
  progress: document.querySelector("#tgiProgress"),
  progressFill: document.querySelector("#tgiProgressFill"),
  scaleGuide: document.querySelector("#tgiScaleGuide"),
  status: document.querySelector("#tgiStatus"),
  title: document.querySelector("#tgiCategoryTitle"),
  description: document.querySelector("#tgiCategoryDescription"),
  badge: document.querySelector("#tgiCategoryBadge"),
  items: document.querySelector("#tgiItems"),
  cats: document.querySelector("#tgiCats"),
  overall: document.querySelector("#tgiOverall"),
  summary: document.querySelector("#tgiSummary"),
  topGoals: document.querySelector("#tgiTopGoals")
};

const TGI_STORAGE_KEY = "ks-chem-tgi-v1";
const tgiTotalItems = tgiCategories.reduce((sum, category) => sum + category.items.length, 0);
let tgiAnswers = loadTgiAnswers();

function tgiItemId(categoryId, itemIndex) {
  return `${categoryId}-${itemIndex}`;
}

function loadTgiAnswers() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TGI_STORAGE_KEY) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveTgiAnswers() {
  localStorage.setItem(TGI_STORAGE_KEY, JSON.stringify(tgiAnswers));
  tgiEls.status.textContent = "保存しました。";
}

function tgiCategoryAverage(category) {
  const values = category.items
    .map((_, index) => tgiAnswers[tgiItemId(category.id, index)])
    .filter((value) => Number.isFinite(value));
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function tgiAllAnsweredItems() {
  return tgiCategories.flatMap((category) => category.items.map((text, index) => ({
    category,
    id: tgiItemId(category.id, index),
    text,
    value: tgiAnswers[tgiItemId(category.id, index)]
  }))).filter((item) => Number.isFinite(item.value));
}

function renderTgiCategoryOptions() {
  tgiControls.category.innerHTML = tgiCategories.map((category) => `
    <option value="${category.id}">${category.title}</option>
  `).join("");
  tgiEls.scaleGuide.innerHTML = tgiScale.map((point) => `
    <div><strong>${point.value}</strong><span>${point.label}</span></div>
  `).join("");
}

function renderTgiItems() {
  const category = tgiCategories.find((item) => item.id === tgiControls.category.value) || tgiCategories[0];
  const average = tgiCategoryAverage(category);
  tgiEls.title.textContent = category.title;
  tgiEls.description.textContent = category.description;
  tgiEls.badge.textContent = average === null ? "未回答" : `平均 ${average.toFixed(2)}`;
  tgiEls.items.innerHTML = category.items.map((text, index) => {
    const id = tgiItemId(category.id, index);
    const answer = tgiAnswers[id];
    const scale = tgiScale.map((point) => `
      <label class="tgiChoice">
        <input type="radio" name="${id}" value="${point.value}" ${answer === point.value ? "checked" : ""} />
        <span>${point.value}</span>
      </label>
    `).join("");
    return `
      <article class="tgiItem">
        <div class="tgiItemText">
          <span>${index + 1}</span>
          <p>${text}</p>
        </div>
        <div class="tgiChoices" aria-label="${text}">
          ${scale}
        </div>
      </article>
    `;
  }).join("");
  tgiEls.cats.innerHTML = category.cats.map((cat) => `
    <article class="tgiCat">
      <strong>${cat.label}</strong>
      <span>${cat.name}</span>
      <p>${cat.use}</p>
    </article>
  `).join("");
}

function renderTgiSummary() {
  const answered = tgiAllAnsweredItems();
  const overall = answered.length
    ? answered.reduce((sum, item) => sum + item.value, 0) / answered.length
    : null;
  tgiEls.progress.textContent = `${answered.length} / ${tgiTotalItems}`;
  tgiEls.progressFill.style.width = `${answered.length / tgiTotalItems * 100}%`;
  tgiEls.overall.textContent = overall === null ? "overall -" : `overall ${overall.toFixed(2)}`;

  tgiEls.summary.innerHTML = tgiCategories.map((category) => {
    const average = tgiCategoryAverage(category);
    const width = average === null ? 0 : average / 5 * 100;
    const answeredCount = category.items.filter((_, index) => Number.isFinite(tgiAnswers[tgiItemId(category.id, index)])).length;
    return `
      <button class="tgiSummaryRow" type="button" data-category="${category.id}">
        <span>${category.shortTitle}</span>
        <div class="tgiBar"><div style="width: ${width}%"></div></div>
        <strong>${average === null ? "-" : average.toFixed(2)}</strong>
        <small>${answeredCount}/${category.items.length}</small>
      </button>
    `;
  }).join("");

  const topGoals = [...answered]
    .sort((a, b) => b.value - a.value || a.category.title.localeCompare(b.category.title, "ja"))
    .slice(0, 8);
  tgiEls.topGoals.innerHTML = topGoals.length ? topGoals.map((item) => `
    <li><strong>${item.value}</strong><span>${item.category.title}</span><p>${item.text}</p></li>
  `).join("") : "<li class=\"tgiEmpty\">まだ回答がありません。</li>";
}

function renderTgi() {
  renderTgiItems();
  renderTgiSummary();
}

function tgiSummaryText() {
  const lines = ["Teaching Goals Inventory 日本語適応版 結果要約"];
  const answered = tgiAllAnsweredItems();
  const overall = answered.length
    ? answered.reduce((sum, item) => sum + item.value, 0) / answered.length
    : null;
  lines.push(`回答済み: ${answered.length}/${tgiTotalItems}`);
  lines.push(`全体平均: ${overall === null ? "-" : overall.toFixed(2)}`);
  lines.push("");
  lines.push("領域別平均:");
  for (const category of tgiCategories) {
    const average = tgiCategoryAverage(category);
    lines.push(`- ${category.title}: ${average === null ? "-" : average.toFixed(2)}`);
  }
  lines.push("");
  lines.push("選択中の領域に対応するCATs:");
  const selectedCategory = tgiCategories.find((category) => category.id === tgiControls.category.value) || tgiCategories[0];
  for (const cat of selectedCategory.cats) {
    lines.push(`- ${cat.label} (${cat.name}): ${cat.use}`);
  }
  lines.push("");
  lines.push("上位目標:");
  for (const item of [...answered].sort((a, b) => b.value - a.value).slice(0, 8)) {
    lines.push(`- ${item.value} ${item.category.title}: ${item.text}`);
  }
  return lines.join("\n");
}

function downloadTgiCsv() {
  const header = ["category", "item", "score"];
  const rows = tgiCategories.flatMap((category) => category.items.map((text, index) => {
    const score = tgiAnswers[tgiItemId(category.id, index)] || "";
    return [category.title, text, score];
  }));
  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "tgi-japanese-adapted-results.csv";
  link.click();
  URL.revokeObjectURL(url);
  tgiEls.status.textContent = "CSVを保存しました。";
}

renderTgiCategoryOptions();

tgiControls.category.addEventListener("input", renderTgi);

tgiEls.items.addEventListener("input", (event) => {
  if (!(event.target instanceof HTMLInputElement)) return;
  if (event.target.type !== "radio") return;
  tgiAnswers[event.target.name] = Number(event.target.value);
  renderTgiSummary();
  tgiEls.badge.textContent = `平均 ${(tgiCategoryAverage(tgiCategories.find((category) => category.id === tgiControls.category.value)) || 0).toFixed(2)}`;
  tgiEls.status.textContent = "未保存の変更があります。";
});

tgiEls.summary.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const row = event.target.closest(".tgiSummaryRow");
  if (!row) return;
  tgiControls.category.value = row.dataset.category;
  renderTgi();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

tgiControls.save.addEventListener("click", saveTgiAnswers);
tgiControls.csv.addEventListener("click", downloadTgiCsv);
tgiControls.print.addEventListener("click", () => window.print());

tgiControls.copy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(tgiSummaryText());
    tgiEls.status.textContent = "要約をコピーしました。";
  } catch {
    tgiEls.status.textContent = "コピーできませんでした。印刷またはCSV保存を使ってください。";
  }
});

tgiControls.reset.addEventListener("click", () => {
  if (!confirm("TGIの回答をすべて消去しますか？")) return;
  tgiAnswers = {};
  localStorage.removeItem(TGI_STORAGE_KEY);
  renderTgi();
  tgiEls.status.textContent = "回答をリセットしました。";
});

renderTgi();
