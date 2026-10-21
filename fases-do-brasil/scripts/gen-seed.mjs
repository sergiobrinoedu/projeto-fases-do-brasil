// Gera data/07_seed_conteudo.sql a partir de src/infra/data/phases.data.js
// Uso: node scripts/gen-seed.mjs
import fs from 'node:fs';
import { PERIODS, PHASES } from '../src/infra/data/phases.data.js';

const q = (v) => (v === null || v === undefined ? 'NULL' : typeof v === 'number' ? String(v)
  : `'${String(v).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`);
const out = ['-- 07_seed_conteudo.sql — GERADO por scripts/gen-seed.mjs (não edite à mão)', 'USE `fases_do_brasil`;', ''];

out.push('INSERT INTO `periods` (`id`,`name`,`start_year`,`end_year`,`description`,`sort_order`) VALUES');
out.push(PERIODS.map((p, i) => `  (${q(p.id)},${q(p.name)},${p.startYear},${q(p.endYear)},${q(p.description)},${i + 1})`).join(',\n'));
out.push('ON DUPLICATE KEY UPDATE `name`=VALUES(`name`),`start_year`=VALUES(`start_year`),`end_year`=VALUES(`end_year`),`description`=VALUES(`description`),`sort_order`=VALUES(`sort_order`);', '');

out.push('INSERT INTO `phases` (`id`,`period_id`,`title`,`subtitle`,`start_year`,`end_year`,`art`,`summary`,`sort_order`) VALUES');
out.push(PHASES.map((p) => `  (${q(p.id)},${q(p.period)},${q(p.title)},${q(p.subtitle)},${p.startYear},${q(p.endYear)},${q(p.art)},${q(p.summary)},${p.order})`).join(',\n'));
out.push('ON DUPLICATE KEY UPDATE `period_id`=VALUES(`period_id`),`title`=VALUES(`title`),`subtitle`=VALUES(`subtitle`),`start_year`=VALUES(`start_year`),`end_year`=VALUES(`end_year`),`art`=VALUES(`art`),`summary`=VALUES(`summary`),`sort_order`=VALUES(`sort_order`);', '');

const para = PHASES.flatMap((p) => p.description.map((t, i) => `  (${q(p.id)},${i + 1},${q(t)})`));
out.push('INSERT INTO `phase_paragraphs` (`phase_id`,`position`,`content`) VALUES', para.join(',\n'), 'ON DUPLICATE KEY UPDATE `content`=VALUES(`content`);', '');
const hl = PHASES.flatMap((p) => p.highlights.map((t, i) => `  (${q(p.id)},${i + 1},${q(t)})`));
out.push('INSERT INTO `phase_highlights` (`phase_id`,`position`,`text`) VALUES', hl.join(',\n'), 'ON DUPLICATE KEY UPDATE `text`=VALUES(`text`);', '');
const imgs = PHASES.flatMap((p) => (p.images ?? []).map((u, i) => `  (${q(p.id)},${i + 1},${q(u)})`));
if (imgs.length) out.push('INSERT INTO `phase_images` (`phase_id`,`position`,`url`) VALUES', imgs.join(',\n'), 'ON DUPLICATE KEY UPDATE `url`=VALUES(`url`);', '');

fs.writeFileSync(new URL('../data/07_seed_conteudo.sql', import.meta.url), out.join('\n'));
console.log('data/07_seed_conteudo.sql gerado');
