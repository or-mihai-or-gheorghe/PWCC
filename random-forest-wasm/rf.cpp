// rf.cpp — Random Forest pentru clasificare, compilat în WebAssembly cu Emscripten.
//
// O implementare simplă, didactică, nu una optimizată:
//   - fiecare arbore învață dintr-un eșantion bootstrap (rânduri alese aleator, cu revenire);
//   - la fiecare nod se încearcă doar câteva coloane, alese aleator (aproximativ √d din d);
//   - nodul se împarte după pragul care micșorează cel mai mult impuritatea Gini;
//   - pădurea clasifică prin votul majorității arborilor.
//
// Compilarea (comanda completă este în README.md):
//   emcc rf.cpp -O3 -lembind -sMODULARIZE=1 -sEXPORT_ES6=1 -sEXPORT_NAME=createRandomForest -sALLOW_MEMORY_GROWTH=1 -o rf.js

#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <algorithm>
#include <cmath>
#include <cstdint>
#include <utility>
#include <vector>

using namespace emscripten;

// Generator de numere aleatoare (mulberry32). E mic și se poate reproduce exact în JavaScript,
// așa că varianta din rf-pur.js construiește aceiași arbori, iar timpii se pot compara corect.
class Rng {
public:
    explicit Rng(uint32_t seed) : state(seed) {}

    uint32_t next() {
        uint32_t t = (state += 0x6D2B79F5u);
        t = (t ^ (t >> 15)) * (t | 1u);
        t ^= t + (t ^ (t >> 7)) * (t | 61u);
        return t ^ (t >> 14);
    }

    // un întreg aleator între 0 și n - 1
    int below(int n) { return static_cast<int>(next() % static_cast<uint32_t>(n)); }

private:
    uint32_t state;
};

// Un nod al arborelui: nodurile interne compară o coloană cu un prag, frunzele dau o clasă.
struct Node {
    int feature = -1;       // coloana comparată; -1 înseamnă frunză
    double threshold = 0;   // valorile <= prag merg la stânga, celelalte la dreapta
    int left = -1;          // indicele copilului din stânga
    int right = -1;         // indicele copilului din dreapta
    int label = 0;          // clasa majoritară din nod (răspunsul unei frunze)
};

struct Tree {
    std::vector<Node> nodes;  // nodes[0] este rădăcina

    int predict(const double* row) const {
        int i = 0;
        while (nodes[i].feature >= 0)
            i = row[nodes[i].feature] <= nodes[i].threshold ? nodes[i].left : nodes[i].right;
        return nodes[i].label;
    }
};

// Impuritatea Gini: 0 când toate rândurile au aceeași clasă, mai mare când clasele sunt amestecate.
static double gini(const std::vector<int>& counts, int total) {
    double sum = 0;
    for (int c : counts) {
        double p = static_cast<double>(c) / total;
        sum += p * p;
    }
    return 1 - sum;
}

// Clasa cu cele mai multe apariții; la egalitate, cea cu indicele cel mai mic.
static int majority(const std::vector<int>& counts) {
    int best = 0;
    for (int c = 1; c < static_cast<int>(counts.size()); ++c)
        if (counts[c] > counts[best]) best = c;
    return best;
}

class RandomForest {
public:
    RandomForest(int nTrees, int maxDepth, int minSamplesSplit, int seed)
        : nTrees(nTrees), maxDepth(maxDepth), minSamplesSplit(minSamplesSplit),
          rng(static_cast<uint32_t>(seed)) {}

    // Antrenarea. x: Float64Array cu valorile, rând după rând (n rânduri × nCols coloane);
    // y: Int32Array cu clasa fiecărui rând, numerotată 0, 1, 2...
    void fit(const val& x, const val& y, int nCols) {
        X = convertJSArrayToNumberVector<double>(x);
        Y = convertJSArrayToNumberVector<int>(y);
        d = nCols;
        n = static_cast<int>(Y.size());
        k = *std::max_element(Y.begin(), Y.end()) + 1;
        m = std::max(1, static_cast<int>(std::lround(std::sqrt(d))));
        importance.assign(d, 0.0);
        trees.assign(nTrees, Tree());

        for (Tree& tree : trees) {
            std::vector<int> sample(n);
            for (int& i : sample) i = rng.below(n);  // eșantionul bootstrap
            build(tree, sample, 0);
        }

        double total = 0;
        for (double v : importance) total += v;
        if (total > 0)
            for (double& v : importance) v /= total;

        X.clear();  // datele de antrenare nu mai sunt necesare
        Y.clear();
    }

    // Clasa prezisă pentru fiecare rând din x (Float64Array, rând după rând).
    val predict(const val& x) const {
        std::vector<double> rows = convertJSArrayToNumberVector<double>(x);
        int count = static_cast<int>(rows.size()) / d;
        std::vector<int> result(count);
        std::vector<int> votes(k);
        for (int r = 0; r < count; ++r) {
            std::fill(votes.begin(), votes.end(), 0);
            for (const Tree& tree : trees) votes[tree.predict(&rows[r * d])]++;
            result[r] = majority(votes);
        }
        return val::global("Int32Array").new_(typed_memory_view(result.size(), result.data()));
    }

    // Cât a contribuit fiecare coloană la micșorarea impurității (suma valorilor este 1).
    val featureImportances() const {
        return val::global("Float64Array").new_(typed_memory_view(importance.size(), importance.data()));
    }

    int nodeCount() const {
        int total = 0;
        for (const Tree& tree : trees) total += static_cast<int>(tree.nodes.size());
        return total;
    }

private:
    int nTrees, maxDepth, minSamplesSplit;
    Rng rng;
    std::vector<double> X;
    std::vector<int> Y;
    int n = 0, d = 0, k = 0, m = 0;
    std::vector<Tree> trees;
    std::vector<double> importance;

    // Construiește recursiv nodul pentru rândurile din idx și întoarce indicele lui în arbore.
    int build(Tree& tree, const std::vector<int>& idx, int depth) {
        int id = static_cast<int>(tree.nodes.size());
        tree.nodes.push_back(Node());

        int size = static_cast<int>(idx.size());
        std::vector<int> counts(k, 0);
        for (int i : idx) counts[Y[i]]++;
        tree.nodes[id].label = majority(counts);

        double parentGini = gini(counts, size);
        if (depth >= maxDepth || size < minSamplesSplit || parentGini == 0) return id;  // frunză

        // m coloane alese aleator, fără repetare
        std::vector<int> features(d);
        for (int f = 0; f < d; ++f) features[f] = f;
        for (int j = 0; j < m; ++j) std::swap(features[j], features[j + rng.below(d - j)]);

        int bestFeature = -1;
        double bestThreshold = 0;
        double bestScore = INFINITY;
        std::vector<std::pair<double, int>> column(size);  // (valoare, clasă)

        for (int j = 0; j < m; ++j) {
            int f = features[j];
            for (int i = 0; i < size; ++i) column[i] = {X[idx[i] * d + f], Y[idx[i]]};
            std::sort(column.begin(), column.end(),
                      [](const std::pair<double, int>& a, const std::pair<double, int>& b) { return a.first < b.first; });

            // Se mută rândurile, unul câte unul, din dreapta în stânga și se evaluează fiecare prag posibil.
            std::vector<int> left(k, 0);
            std::vector<int> right = counts;
            for (int i = 0; i < size - 1; ++i) {
                left[column[i].second]++;
                right[column[i].second]--;
                if (column[i].first == column[i + 1].first) continue;  // pragul trebuie să separe valori diferite
                int nLeft = i + 1;
                int nRight = size - nLeft;
                double score = (nLeft * gini(left, nLeft) + nRight * gini(right, nRight)) / size;
                if (score < bestScore) {
                    bestScore = score;
                    bestFeature = f;
                    bestThreshold = (column[i].first + column[i + 1].first) / 2;
                }
            }
        }
        if (bestFeature < 0) return id;  // toate valorile sunt egale: nodul rămâne frunză

        std::vector<int> leftIdx, rightIdx;
        for (int i : idx) (X[i * d + bestFeature] <= bestThreshold ? leftIdx : rightIdx).push_back(i);
        importance[bestFeature] += size * (parentGini - bestScore);

        tree.nodes[id].feature = bestFeature;
        tree.nodes[id].threshold = bestThreshold;
        int leftChild = build(tree, leftIdx, depth + 1);
        int rightChild = build(tree, rightIdx, depth + 1);
        tree.nodes[id].left = leftChild;
        tree.nodes[id].right = rightChild;
        return id;
    }
};

// Clasele și funcțiile vizibile din JavaScript.
EMSCRIPTEN_BINDINGS(random_forest) {
    class_<RandomForest>("RandomForest")
        .constructor<int, int, int, int>()
        .function("fit", &RandomForest::fit)
        .function("predict", &RandomForest::predict)
        .function("featureImportances", &RandomForest::featureImportances)
        .function("nodeCount", &RandomForest::nodeCount);
}
