import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildContentSql, CONTENT_SQL_PATH } from './content-sql';

describe('SQL de conteúdo', () => {
  it('está sincronizado com src/content (rode `npm run gen:sql` se falhar)', () => {
    expect(readFileSync(CONTENT_SQL_PATH, 'utf8')).toBe(buildContentSql());
  });
});
