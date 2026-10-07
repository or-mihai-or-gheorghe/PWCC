// rf-pur.js — aceeași pădure aleatoare ca în rf.cpp, scrisă direct în JavaScript.
// Folosește același generator de numere aleatoare și aceiași pași, deci construiește exact
// aceiași arbori. Diferența de timp față de varianta WebAssembly vine doar din limbaj.

// Generatorul mulberry32, identic cu clasa Rng din rf.cpp.
function createRng(seed) {
  let state = seed >>> 0;
  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  }
  return { below: (n) => next() % n };
}

function gini(counts, total) {
  let sum = 0;
  for (const c of counts) {
    const p = c / total;
    sum += p * p;
  }
  return 1 - sum;
}

function majority(counts) {
  let best = 0;
  for (let c = 1; c < counts.length; c++) {
    if (counts[c] > counts[best]) best = c;
  }
  return best;
}

export class RandomForestJS {
  constructor(nTrees, maxDepth, minSamplesSplit, seed) {
    this.nTrees = nTrees;
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
    this.rng = createRng(seed);
  }

  fit(x, y, nCols) {
    this.X = x;
    this.Y = y;
    this.d = nCols;
    const n = y.length;
    let maxLabel = 0;
    for (const label of y) if (label > maxLabel) maxLabel = label;
    this.k = maxLabel + 1;
    this.m = Math.max(1, Math.round(Math.sqrt(nCols)));
    this.importance = new Float64Array(nCols);
    this.trees = [];
    for (let t = 0; t < this.nTrees; t++) {
      const sample = new Array(n);
      for (let i = 0; i < n; i++) sample[i] = this.rng.below(n);
      const nodes = [];
      this.build(nodes, sample, 0);
      this.trees.push(nodes);
    }
    const total = this.importance.reduce((a, b) => a + b, 0);
    if (total > 0) this.importance = this.importance.map((v) => v / total);
    this.X = null;
    this.Y = null;
  }

  predict(rows) {
    const d = this.d;
    const count = rows.length / d;
    const result = new Int32Array(count);
    const votes = new Array(this.k);
    for (let r = 0; r < count; r++) {
      votes.fill(0);
      for (const nodes of this.trees) {
        let i = 0;
        while (nodes[i].feature >= 0) {
          i = rows[r * d + nodes[i].feature] <= nodes[i].threshold ? nodes[i].left : nodes[i].right;
        }
        votes[nodes[i].label]++;
      }
      result[r] = majority(votes);
    }
    return result;
  }

  featureImportances() {
    return this.importance;
  }

  build(nodes, idx, depth) {
    const { X, Y, d, k, m } = this;
    const id = nodes.length;
    nodes.push({ feature: -1, threshold: 0, left: -1, right: -1, label: 0 });

    const size = idx.length;
    const counts = new Array(k).fill(0);
    for (const i of idx) counts[Y[i]]++;
    nodes[id].label = majority(counts);

    const parentGini = gini(counts, size);
    if (depth >= this.maxDepth || size < this.minSamplesSplit || parentGini === 0) return id;

    const features = [];
    for (let f = 0; f < d; f++) features.push(f);
    for (let j = 0; j < m; j++) {
      const r = j + this.rng.below(d - j);
      [features[j], features[r]] = [features[r], features[j]];
    }

    let bestFeature = -1;
    let bestThreshold = 0;
    let bestScore = Infinity;
    for (let j = 0; j < m; j++) {
      const f = features[j];
      const column = idx.map((i) => [X[i * d + f], Y[i]]);
      column.sort((a, b) => a[0] - b[0]);
      const left = new Array(k).fill(0);
      const right = counts.slice();
      for (let i = 0; i < size - 1; i++) {
        left[column[i][1]]++;
        right[column[i][1]]--;
        if (column[i][0] === column[i + 1][0]) continue;
        const nLeft = i + 1;
        const nRight = size - nLeft;
        const score = (nLeft * gini(left, nLeft) + nRight * gini(right, nRight)) / size;
        if (score < bestScore) {
          bestScore = score;
          bestFeature = f;
          bestThreshold = (column[i][0] + column[i + 1][0]) / 2;
        }
      }
    }
    if (bestFeature < 0) return id;

    const leftIdx = [];
    const rightIdx = [];
    for (const i of idx) (X[i * d + bestFeature] <= bestThreshold ? leftIdx : rightIdx).push(i);
    this.importance[bestFeature] += size * (parentGini - bestScore);

    nodes[id].feature = bestFeature;
    nodes[id].threshold = bestThreshold;
    nodes[id].left = this.build(nodes, leftIdx, depth + 1);
    nodes[id].right = this.build(nodes, rightIdx, depth + 1);
    return id;
  }
}
