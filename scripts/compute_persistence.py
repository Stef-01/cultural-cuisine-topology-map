#!/usr/bin/env python3
"""
Compute persistent homology on the compound-cuisine matrix using Ripser.

This script reads the cuisines.json dataset, builds the compound-level
binary presence/absence matrix (333 compounds × 10 cuisines), computes
Hamming distances, and runs Ripser to produce exact persistence diagrams.

Usage:
    pip install -r requirements.txt
    python scripts/compute_persistence.py

Output:
    public/data/persistence.json — persistence diagrams for both
    cuisine-level (n=10, Jaccard distance) and compound-level
    (n=333, Hamming distance) analyses.

Dependencies:
    numpy, ripser, json
"""

import json
import sys
import os
import numpy as np

def load_data():
    """Load the cuisines.json dataset."""
    data_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'cuisines.json')
    with open(data_path, 'r') as f:
        return json.load(f)

def build_compound_matrix(data):
    """Build binary compound × cuisine matrix."""
    cuisine_ids = list(data['cuisines'].keys())
    all_compounds = set()

    for cid in cuisine_ids:
        cuisine = data['cuisines'][cid]
        comps = cuisine.get('all_compounds', cuisine.get('compounds', []))
        # Also gather compounds from meals
        for meal in cuisine.get('meals', []):
            if 'compounds' in meal:
                for c in meal['compounds']:
                    all_compounds.add(c)
        for c in comps:
            all_compounds.add(c)

    compound_list = sorted(all_compounds)
    n_compounds = len(compound_list)
    n_cuisines = len(cuisine_ids)

    print(f"Building matrix: {n_compounds} compounds × {n_cuisines} cuisines")

    matrix = np.zeros((n_compounds, n_cuisines), dtype=np.int8)
    for j, cid in enumerate(cuisine_ids):
        cuisine = data['cuisines'][cid]
        comps = set(cuisine.get('all_compounds', cuisine.get('compounds', [])))
        for i, comp in enumerate(compound_list):
            if comp in comps:
                matrix[i, j] = 1

    return matrix, compound_list, cuisine_ids

def compute_jaccard_distance_matrix(data, cuisine_ids):
    """Compute Jaccard distance matrix from pre-computed values."""
    n = len(cuisine_ids)
    dist = np.zeros((n, n))

    jaccard_matrix = data.get('jaccard_matrix', {})

    for i in range(n):
        for j in range(i + 1, n):
            key1 = f"{cuisine_ids[i]}|{cuisine_ids[j]}"
            key2 = f"{cuisine_ids[j]}|{cuisine_ids[i]}"
            jaccard = jaccard_matrix.get(key1, jaccard_matrix.get(key2, 0))
            d = 1.0 - jaccard
            dist[i, j] = d
            dist[j, i] = d

    return dist

def compute_hamming_distance_matrix(matrix):
    """Compute pairwise Hamming distances between compounds."""
    n = matrix.shape[0]
    ncols = matrix.shape[1]

    print(f"Computing {n}×{n} Hamming distance matrix...")

    # Efficient vectorized computation
    # Hamming distance = number of positions where vectors differ / total positions
    dist = np.zeros((n, n), dtype=np.float64)
    for i in range(n):
        diff = matrix[i] != matrix[i+1:]
        dist[i, i+1:] = diff.sum(axis=1) / ncols
        dist[i+1:, i] = dist[i, i+1:]

    return dist

def run_ripser(distance_matrix, max_dim=1, label=""):
    """Run Ripser on a distance matrix and return persistence diagrams."""
    try:
        from ripser import ripser
    except ImportError:
        print("WARNING: ripser not installed. Install with: pip install ripser")
        print("Falling back to basic persistence (β₀ only via Union-Find)")
        return compute_basic_persistence(distance_matrix, label)

    print(f"Running Ripser on {label} ({distance_matrix.shape[0]} points, max_dim={max_dim})...")
    result = ripser(distance_matrix, maxdim=max_dim, distance_matrix=True)

    diagrams = {}
    for dim, dgm in enumerate(result['dgms']):
        features = []
        for birth, death in dgm:
            features.append({
                'birth': float(birth),
                'death': float(death) if not np.isinf(death) else None,
            })
        diagrams[f'beta{dim}'] = features
        n_finite = sum(1 for f in features if f['death'] is not None)
        n_inf = sum(1 for f in features if f['death'] is None)
        print(f"  β_{dim}: {n_finite} finite features, {n_inf} infinite")

    return diagrams

def compute_basic_persistence(distance_matrix, label=""):
    """Basic β₀ persistence via Union-Find (fallback when ripser unavailable)."""
    n = distance_matrix.shape[0]

    # Build edge list sorted by distance
    edges = []
    for i in range(n):
        for j in range(i + 1, n):
            edges.append((distance_matrix[i, j], i, j))
    edges.sort()

    # Union-Find
    parent = list(range(n))
    rank = [0] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    def union(x, y):
        px, py = find(x), find(y)
        if px == py:
            return False
        if rank[px] < rank[py]:
            px, py = py, px
        parent[py] = px
        if rank[px] == rank[py]:
            rank[px] += 1
        return True

    beta0 = []
    for dist, i, j in edges:
        if union(i, j):
            beta0.append({'birth': 0.0, 'death': float(dist)})

    # One infinite feature
    beta0.append({'birth': 0.0, 'death': None})

    print(f"  β_0 ({label}): {len(beta0) - 1} finite features, 1 infinite")
    return {'beta0': beta0}

def main():
    print("=" * 60)
    print("Cultural Cuisine Topology Map — Persistence Computation")
    print("=" * 60)

    data = load_data()
    matrix, compound_list, cuisine_ids = build_compound_matrix(data)

    # 1. Cuisine-level persistence (n=10, Jaccard distance)
    print("\n--- Cuisine-Level Analysis (n=10) ---")
    jaccard_dist = compute_jaccard_distance_matrix(data, cuisine_ids)
    cuisine_persistence = run_ripser(jaccard_dist, max_dim=1, label="cuisines")

    # 2. Compound-level persistence (n=333, Hamming distance)
    print("\n--- Compound-Level Analysis (n={}) ---".format(len(compound_list)))
    hamming_dist = compute_hamming_distance_matrix(matrix)
    compound_persistence = run_ripser(hamming_dist, max_dim=1, label="compounds")

    # Summary statistics
    cuisine_count_per_compound = matrix.sum(axis=1)
    stats = {
        'unique_to_one': int((cuisine_count_per_compound == 1).sum()),
        'rare_lte_3': int((cuisine_count_per_compound <= 3).sum()),
        'common_gte_7': int((cuisine_count_per_compound >= 7).sum()),
        'universal_all_10': int((cuisine_count_per_compound == 10).sum()),
    }

    # Output
    output = {
        'metadata': {
            'generated_by': 'scripts/compute_persistence.py',
            'n_cuisines': len(cuisine_ids),
            'n_compounds': len(compound_list),
            'cuisine_ids': cuisine_ids,
        },
        'cuisine_level': {
            'distance_metric': 'Jaccard distance (1 - J(A,B))',
            'n_points': len(cuisine_ids),
            'persistence': cuisine_persistence,
        },
        'compound_level': {
            'distance_metric': 'Hamming distance (binary cuisine vectors)',
            'n_points': len(compound_list),
            'persistence': compound_persistence,
            'distribution': stats,
        },
    }

    out_path = os.path.join(os.path.dirname(__file__), '..', 'public', 'data', 'persistence.json')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w') as f:
        json.dump(output, f, indent=2)

    print(f"\nOutput written to: {out_path}")
    print(f"Cuisine-level features: {sum(len(v) for v in cuisine_persistence.values())}")
    print(f"Compound-level features: {sum(len(v) for v in compound_persistence.values())}")
    print(f"Compound distribution: {stats}")
    print("Done.")

if __name__ == '__main__':
    main()
