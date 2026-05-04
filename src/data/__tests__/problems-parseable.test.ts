import { describe, expect, it } from 'vitest';
import { problems } from '../problems';
import { classifyAnswer } from '../../lib/normalizer';

describe('every problem canonical answer is self-consistent', () => {
  for (const p of problems) {
    if (p.time_complexity) {
      it(`${p.id}: time canonical "${p.time_complexity}" matches itself`, () => {
        const r = classifyAnswer(p.time_complexity!, p.time_complexity!);
        expect(r.result).toBe('correct');
      });
    }

    if (p.kind === 'code' && p.method_times) {
      for (const m of p.method_times) {
        it(`${p.id}: ${m.method} canonical "${m.time_complexity}" matches itself`, () => {
          const r = classifyAnswer(m.time_complexity, m.time_complexity);
          expect(r.result).toBe('correct');
        });
      }
    }

    if (p.space_complexity) {
      it(`${p.id}: space canonical "${p.space_complexity}" matches itself`, () => {
        const r = classifyAnswer(p.space_complexity!, p.space_complexity!);
        expect(r.result).toBe('correct');
      });
    }
  }
});

describe('every accepted equivalent form is parseable and matches canonical', () => {
  for (const p of problems) {
    const eqTime = p.accepted_equivalent_forms?.time ?? [];
    const eqSpace = p.accepted_equivalent_forms?.space ?? [];

    if (p.time_complexity) {
      for (const eq of eqTime) {
        it(`${p.id}: time equivalent "${eq}" → correct vs canonical "${p.time_complexity}"`, () => {
          const r = classifyAnswer(eq, p.time_complexity!, eqTime);
          expect(r.result).toBe('correct');
        });
      }
    }

    if (p.kind === 'code' && p.method_times) {
      for (const m of p.method_times) {
        for (const eq of m.accepted_equivalent_forms ?? []) {
          it(`${p.id}: ${m.method} equivalent "${eq}" → correct`, () => {
            const r = classifyAnswer(
              eq,
              m.time_complexity,
              m.accepted_equivalent_forms
            );
            expect(r.result).toBe('correct');
          });
        }
      }
    }

    if (p.space_complexity) {
      for (const eq of eqSpace) {
        it(`${p.id}: space equivalent "${eq}" → correct vs canonical "${p.space_complexity}"`, () => {
          const r = classifyAnswer(eq, p.space_complexity!, eqSpace);
          expect(r.result).toBe('correct');
        });
      }
    }
  }
});
