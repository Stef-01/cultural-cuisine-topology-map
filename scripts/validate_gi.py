#!/usr/bin/env python3
"""
Validate GI values in the dataset and report measured vs. estimated breakdown.

Usage:
    python scripts/validate_gi.py

Output:
    Prints a summary table of measured vs. estimated GI values per cuisine,
    and flags any meals with suspicious or out-of-range GI values.
"""

import json
import os
import sys

def load_data():
    data_path = os.path.join(os.path.dirname(__file__), '..', 'src', 'data', 'cuisines.json')
    with open(data_path, 'r') as f:
        return json.load(f)

def main():
    data = load_data()
    cuisine_ids = list(data['cuisines'].keys())

    print("=" * 80)
    print("GI Validation Report")
    print("=" * 80)

    total_meals = 0
    total_measured = 0
    total_estimated = 0
    flagged = []

    print(f"\n{'Cuisine':<18} {'Total':>6} {'Meas.':>6} {'Est.':>6} {'%Meas':>6} {'AvgGI':>7} {'Avg(M)':>7} {'Avg(E)':>7} {'Delta':>6}")
    print("-" * 80)

    for cid in cuisine_ids:
        cuisine = data['cuisines'][cid]
        meals = cuisine.get('meals', [])

        measured = [m for m in meals if m.get('gi_ref', '').startswith('est.') is False and 'est.' not in m.get('gi_ref', '')]
        estimated = [m for m in meals if 'est.' in m.get('gi_ref', '')]

        avg_all = sum(m['gi'] for m in meals) / len(meals) if meals else 0
        avg_meas = sum(m['gi'] for m in measured) / len(measured) if measured else 0
        avg_est = sum(m['gi'] for m in estimated) / len(estimated) if estimated else 0
        delta = abs(avg_meas - avg_all) if measured else 0

        pct_meas = (len(measured) / len(meals) * 100) if meals else 0

        total_meals += len(meals)
        total_measured += len(measured)
        total_estimated += len(estimated)

        print(f"{cid:<18} {len(meals):>6} {len(measured):>6} {len(estimated):>6} {pct_meas:>5.1f}% {avg_all:>7.1f} {avg_meas:>7.1f} {avg_est:>7.1f} {delta:>6.1f}")

        # Flag suspicious values
        for m in meals:
            if m['gi'] < 0 or m['gi'] > 100:
                flagged.append((cid, m['name'], m['gi'], 'out of range [0-100]'))
            if m['gi'] == 0:
                flagged.append((cid, m['name'], m['gi'], 'GI=0 is suspicious'))

    print("-" * 80)
    pct_total = (total_measured / total_meals * 100) if total_meals else 0
    print(f"{'TOTAL':<18} {total_meals:>6} {total_measured:>6} {total_estimated:>6} {pct_total:>5.1f}%")

    if flagged:
        print(f"\n{'='*80}")
        print(f"FLAGGED MEALS ({len(flagged)}):")
        print(f"{'='*80}")
        for cid, name, gi, reason in flagged:
            print(f"  [{cid}] {name}: GI={gi} — {reason}")
    else:
        print("\nNo flagged meals.")

    print(f"\nSummary:")
    print(f"  Total meals: {total_meals}")
    print(f"  Measured GI: {total_measured} ({pct_total:.1f}%)")
    print(f"  Estimated GI: {total_estimated} ({100-pct_total:.1f}%)")

if __name__ == '__main__':
    main()
