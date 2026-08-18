BEGIN;

/*
  V1 release metadata and audit evidence.

  `published` here means published in the product's internal editorial
  candidate channel.  It does not claim that an external university, library,
  legal counsel, or language reviewer has signed the project.
*/

UPDATE works
   SET mode_reason = 'A text-first mythographic atlas. V1 publishes a reviewed internal candidate for the first Queshan mountain route; textual water references, scholarly place candidates, modern comparison, and artistic interpretation remain explicitly separate.'
 WHERE slug = 'shanhaijing';

UPDATE work_translations
   SET summary = CASE locale
     WHEN 'zh-CN' THEN '以原文段落为根，分离异兽概念、文本提及、山系路线、水名证据、学术候选与艺术总览。首版发布《南山经》鹊山首列的内部编辑候选，不等同于外部学术背书。'
     ELSE 'A passage-rooted atlas separating creature concepts, textual occurrences, mountain-route topology, water-name evidence, scholarly candidates, and artistic interpretation. V1 is an internally reviewed editorial candidate, not external scholarly endorsement.'
   END
 WHERE work_id = '10000000-0000-4000-8000-000000000011';

UPDATE shj_text_editions
   SET edition_reference = 'Nanshan Jing, first Queshan route, nine-passage V1 segmentation',
       responsible_editor = 'Shanhaijing Atlas editorial team',
       retrieved_at = DATE '2026-08-15',
       source_file_checksum_sha256 = checksum_sha256,
       transcription_checksum_sha256 = checksum_sha256,
       license_note = 'Ancient source wording is treated as public-domain text. The Chinese Text Project page is a cross-check source and is not bundled as a copied page image or database dump.',
       segmentation_version = 'nanshan-queshan-v1',
       reviewer_role = 'R-CLASSICS; R-RIGHTS pending external sign-off',
       reviewed_at = DATE '2026-08-17'
 WHERE id = '11000000-0000-4000-8000-000000000001';

UPDATE shj_text_sections
   SET summary_zh = '从招摇之山向东至箕尾之山的首条山系序列；V1 结构化实现以山序、方向与里距为主，保留水名作为原文证据，不把水系关系扩写为完整水文网络，也不映射现代经纬度。',
       summary_en = 'The first mountain sequence from Mount Zhaoyao eastward to Mount Jiwei. V1 structurally implements mountain order, direction, and li-distance; water names remain textual evidence rather than a complete hydrological network, and no modern coordinates are assigned.'
 WHERE id = '12000000-0000-4000-8000-000000000001';

UPDATE shj_passage_translations
   SET translation_kind = 'original_editorial_summary',
       glossary_version = 'shj-glossary-v1-internal',
       translator_or_editor = CASE locale WHEN 'zh-CN' THEN 'R-BILINGUAL-ZH' ELSE 'R-BILINGUAL-EN' END,
       reviewer_role = CASE locale WHEN 'zh-CN' THEN 'R-BILINGUAL-ZH' ELSE 'R-BILINGUAL-EN' END,
       reviewed_at = DATE '2026-08-17';

UPDATE shj_creature_translations
   SET translation_kind = 'original_editorial_summary',
       glossary_version = 'shj-glossary-v1-internal',
       translator_or_editor = CASE locale WHEN 'zh-CN' THEN 'R-BILINGUAL-ZH' ELSE 'R-BILINGUAL-EN' END,
       reviewer_role = CASE locale WHEN 'zh-CN' THEN 'R-BILINGUAL-ZH' ELSE 'R-BILINGUAL-EN' END,
       reviewed_at = DATE '2026-08-17'
 WHERE creature_id IN (
   SELECT id FROM shj_creatures
    WHERE work_id = '10000000-0000-4000-8000-000000000011'
 );

UPDATE shj_textual_place_translations
   SET translation_kind = 'original_editorial_summary',
       glossary_version = 'shj-glossary-v1-internal',
       translator_or_editor = CASE locale WHEN 'zh-CN' THEN 'R-BILINGUAL-ZH' ELSE 'R-BILINGUAL-EN' END,
       reviewer_role = CASE locale WHEN 'zh-CN' THEN 'R-BILINGUAL-ZH' ELSE 'R-BILINGUAL-EN' END,
       reviewed_at = DATE '2026-08-17'
 WHERE place_id IN (
   SELECT id FROM shj_textual_places
    WHERE work_id = '10000000-0000-4000-8000-000000000011'
 );

/*
  Keep the canonical concept for the V1 display, but make the editorial
  decision and the unresolved orthographic reading explicit.
*/
UPDATE shj_creature_occurrences
   SET surface_form = '旋龜',
       evidence_note = 'The passage also contains the nearby reading 玄龜; the occurrence keeps 旋龜 as the named form and records 玄龜 as a variant candidate.'
 WHERE id = '16000000-0000-4000-8000-000000000003';

INSERT INTO shj_passage_audits(
  passage_id,audit_status,segmentation_version,input_checksum_sha256,
  reviewer_role,reviewed_at,evidence_note
)
SELECT p.id,'reviewed','nanshan-queshan-v1',p.checksum_sha256,
       'R-CLASSICS',DATE '2026-08-17',
       'Passage included in the nine-passage V1 inventory; text checksum is retained in the passage row.'
  FROM shj_text_passages p
  JOIN shj_text_sections s ON s.id=p.section_id
  JOIN shj_text_editions e ON e.id=s.edition_id
 WHERE e.work_id='10000000-0000-4000-8000-000000000011'
   AND e.is_baseline
ON CONFLICT (passage_id) DO UPDATE SET
  audit_status=EXCLUDED.audit_status,
  segmentation_version=EXCLUDED.segmentation_version,
  input_checksum_sha256=EXCLUDED.input_checksum_sha256,
  reviewer_role=EXCLUDED.reviewer_role,
  reviewed_at=EXCLUDED.reviewed_at,
  evidence_note=EXCLUDED.evidence_note;

INSERT INTO shj_editorial_decisions(
  id,work_id,decision_key,decision_type,subject_kind,subject_ref,
  decision_status,rationale,evidence_note,reviewer_role,decided_at
) VALUES
('19000000-0000-4000-8000-000000000101','10000000-0000-4000-8000-000000000011','canonical-xingxing','canonical_name','creature','xingxing','accepted','Use 狌狌 as the V1 concept label while preserving the original description and avoiding modern species identification.','Named in the Zhaoyao passage.','R-CLASSICS',DATE '2026-08-17'),
('19000000-0000-4000-8000-000000000102','10000000-0000-4000-8000-000000000011','canonical-lushu','canonical_name','creature','lushu','accepted','Use 鹿蜀 as the V1 concept label; effects remain textual claims.','Named in the Niuyang passage.','R-CLASSICS',DATE '2026-08-17'),
('19000000-0000-4000-8000-000000000103','10000000-0000-4000-8000-000000000011','xuangui-orthographic-variant','variant','creature','xuangui','provisional','Retain 旋龜 as the named occurrence and record 玄龜 as a nearby orthographic/edition reading pending full multi-edition collation.','The same passage contains both readings in adjacent textual contexts.','R-CLASSICS',DATE '2026-08-17'),
('19000000-0000-4000-8000-000000000104','10000000-0000-4000-8000-000000000011','canonical-lu','canonical_name','creature','lu','accepted','Use 鯥 as the V1 concept label without converting the description into modern zoology.','Named in the Di passage.','R-CLASSICS',DATE '2026-08-17'),
('19000000-0000-4000-8000-000000000105','10000000-0000-4000-8000-000000000011','canonical-lei','canonical_name','creature','lei','accepted','Use 类 as the V1 concept label and retain the compound sex description as text.','Named in the Danyuan passage.','R-CLASSICS',DATE '2026-08-17'),
('19000000-0000-4000-8000-000000000106','10000000-0000-4000-8000-000000000011','canonical-boyi','canonical_name','creature','boyi','accepted','Use 猼訑 as the V1 concept label and present its effect as an ancient textual claim.','Named in the Ji passage.','R-CLASSICS',DATE '2026-08-17'),
('19000000-0000-4000-8000-000000000107','10000000-0000-4000-8000-000000000011','canonical-guanguan','canonical_name','creature','guanguan','accepted','Use 灌灌 as the V1 concept label without treating its sound comparison as an audio reconstruction.','Named in the Qingqiu passage.','R-CLASSICS',DATE '2026-08-17'),
('19000000-0000-4000-8000-000000000108','10000000-0000-4000-8000-000000000011','canonical-nine-tailed-fox','canonical_name','creature','nine-tailed-fox','accepted','Use 九尾狐 as the V1 concept label and disclose its artistic and textual status separately.','Named in the Qingqiu passage.','R-CLASSICS',DATE '2026-08-17'),
('19000000-0000-4000-8000-000000000109','10000000-0000-4000-8000-000000000011','canonical-chiru','canonical_name','creature','chiru','accepted','Use 赤鱬 as the V1 concept label without modern species identification.','Named in the Qingqiu passage.','R-CLASSICS',DATE '2026-08-17'),
('19000000-0000-4000-8000-000000000110','10000000-0000-4000-8000-000000000011','queshan-route-scope','topology','passage','queshan-first-route','provisional','Publish the first route as textual mountain order and distance; do not imply a complete water network or modern geographic candidate layer.','Scope decision for V1 vertical Pilot.','R-GEO',DATE '2026-08-17')
ON CONFLICT (id) DO UPDATE SET
  decision_status=EXCLUDED.decision_status,
  rationale=EXCLUDED.rationale,
  evidence_note=EXCLUDED.evidence_note,
  reviewer_role=EXCLUDED.reviewer_role,
  decided_at=EXCLUDED.decided_at;

INSERT INTO shj_occurrence_candidates(
  id,passage_id,surface_form,start_char,end_char,disposition,
  creature_id,occurrence_id,evidence_note,reviewer_role,reviewed_at
) VALUES
('1b000000-0000-4000-8000-000000000001','13000000-0000-4000-8000-000000000001','狌狌',NULL,NULL,'included','14000000-0000-4000-8000-000000000001','16000000-0000-4000-8000-000000000001','Named occurrence selected for V1.','R-CLASSICS',DATE '2026-08-17'),
('1b000000-0000-4000-8000-000000000002','13000000-0000-4000-8000-000000000004','鹿蜀',NULL,NULL,'included','14000000-0000-4000-8000-000000000002','16000000-0000-4000-8000-000000000002','Named occurrence selected for V1.','R-CLASSICS',DATE '2026-08-17'),
('1b000000-0000-4000-8000-000000000003','13000000-0000-4000-8000-000000000004','玄龜',NULL,NULL,'pending_review','14000000-0000-4000-8000-000000000003',NULL,'Nearby reading is retained as a variant candidate, not silently collapsed into a second occurrence.','R-CLASSICS',DATE '2026-08-17'),
('1b000000-0000-4000-8000-000000000004','13000000-0000-4000-8000-000000000004','旋龜',NULL,NULL,'included','14000000-0000-4000-8000-000000000003','16000000-0000-4000-8000-000000000003','Named occurrence selected for V1.','R-CLASSICS',DATE '2026-08-17'),
('1b000000-0000-4000-8000-000000000005','13000000-0000-4000-8000-000000000005','鯥',NULL,NULL,'included','14000000-0000-4000-8000-000000000004','16000000-0000-4000-8000-000000000004','Named occurrence selected for V1.','R-CLASSICS',DATE '2026-08-17'),
('1b000000-0000-4000-8000-000000000006','13000000-0000-4000-8000-000000000006','類',NULL,NULL,'included','14000000-0000-4000-8000-000000000005','16000000-0000-4000-8000-000000000005','Named occurrence selected for V1.','R-CLASSICS',DATE '2026-08-17'),
('1b000000-0000-4000-8000-000000000007','13000000-0000-4000-8000-000000000007','猼訑',NULL,NULL,'included','14000000-0000-4000-8000-000000000006','16000000-0000-4000-8000-000000000006','Named occurrence selected for V1.','R-CLASSICS',DATE '2026-08-17'),
('1b000000-0000-4000-8000-000000000008','13000000-0000-4000-8000-000000000008','灌灌',NULL,NULL,'included','14000000-0000-4000-8000-000000000007','16000000-0000-4000-8000-000000000007','Named occurrence selected for V1.','R-CLASSICS',DATE '2026-08-17'),
('1b000000-0000-4000-8000-000000000009','13000000-0000-4000-8000-000000000008','九尾狐',NULL,NULL,'included','14000000-0000-4000-8000-000000000008','16000000-0000-4000-8000-000000000008','Named occurrence selected for V1.','R-CLASSICS',DATE '2026-08-17'),
('1b000000-0000-4000-8000-000000000010','13000000-0000-4000-8000-000000000008','赤鱬',NULL,NULL,'included','14000000-0000-4000-8000-000000000009','16000000-0000-4000-8000-000000000009','Named occurrence selected for V1.','R-CLASSICS',DATE '2026-08-17')
ON CONFLICT (id) DO UPDATE SET
  disposition=EXCLUDED.disposition,
  creature_id=EXCLUDED.creature_id,
  occurrence_id=EXCLUDED.occurrence_id,
  evidence_note=EXCLUDED.evidence_note,
  reviewer_role=EXCLUDED.reviewer_role,
  reviewed_at=EXCLUDED.reviewed_at;

INSERT INTO shj_text_variants(
  id,passage_id,occurrence_candidate_id,variant_form,variant_type,
  source_note,decision_key,reviewer_role,reviewed_at
) VALUES (
  '1c000000-0000-4000-8000-000000000001',
  '13000000-0000-4000-8000-000000000004',
  '1b000000-0000-4000-8000-000000000003',
  '玄龜',
  'edition_reading',
  'The passage contains 玄龜 in the surrounding textual context while the named creature sentence reads 旋龜; full multi-edition collation remains pending.',
  'xuangui-orthographic-variant',
  'R-CLASSICS',
  DATE '2026-08-17'
)
ON CONFLICT (id) DO UPDATE SET
  variant_form=EXCLUDED.variant_form,
  source_note=EXCLUDED.source_note,
  decision_key=EXCLUDED.decision_key,
  reviewer_role=EXCLUDED.reviewer_role,
  reviewed_at=EXCLUDED.reviewed_at;

COMMIT;
