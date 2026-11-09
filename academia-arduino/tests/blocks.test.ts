import { describe, expect, it } from 'vitest';
import { BLOCK_EXAMPLES, generateCode } from '../src/lib/blocks';
import { checkCode } from '../src/lib/cpp/check';

describe('programação por blocos', () => {
  it('todos os exemplos geram código válido', () => {
    for (const ex of BLOCK_EXAMPLES) {
      const code = generateCode(ex.make());
      const r = checkCode(code);
      expect(r.errors, code).toEqual([]);
      expect(r.warnings, code).toEqual([]);
    }
  });
  it('repetições aninhadas usam variáveis diferentes', () => {
    const p = BLOCK_EXAMPLES[3].make();
    p.loop[0].body!.push({ id: 'x', type: 'repeat', times: 2, body: [{ id: 'y', type: 'wait', ms: 10 }] });
    const code = generateCode(p);
    expect(code).toContain('for (int i = 0; i < 3; i++)');
    expect(code).toContain('for (int j = 0; j < 2; j++)');
    expect(checkCode(code).errors).toEqual([]);
  });
});
