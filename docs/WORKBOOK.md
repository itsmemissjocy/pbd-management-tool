# Workbook inspection

The actual root file is **dskp-reference.xlsx**, not the requested underscore spelling. The original binary is preserved. Full observed sheet list, sample cell locations/text, first 25 merged ranges per sheet, formula counts and all 48 named-range definitions are recorded in `workbook-inspection.json`, including the original SHA-256. Inspection read the zipped OOXML directly and did not evaluate or change formulas.

Nine observed worksheets: MENU, AHAD, ISNIN, SELASA, RABU, KHAMIS, RPT, DSKP, DATA. Sheet dimensions are not supplied in the workbook XML. Formula counts: MENU 2026; AHAD 4354; ISNIN 759; SELASA 719; RABU 759; KHAMIS 1924; RPT 5163; DSKP 0; DATA 591.

DSKP row 1 includes SUBJEK, TAHUN, TEMA/BIDANG/TERAS, tema2, TAJUK/KEMAHIRAN/NILAITERAS, tajuk2, SK, SP, NTERAS and TSIVIK:. This is the primary candidate source for curriculum extraction. MENU is navigation/configuration; DATA has lookup headings including KELAS, MASA, BBM, EMK, NILAI-NILAI MURNI and other teaching-related lists. RPT is an annual-plan candidate; daily named sheets are lesson template candidates. Their formula-driven layouts need a separate reviewed mapping rather than treating every sheet as a flat table.

School-type distinctions and objective fields are not inferred from absent headers. The sampled rows and formula caches do not prove every curriculum row is valid, current or applicable to each school type. Phase 2 must profile all rows, inspect full merge ranges, resolve named-range/formula dependencies and review missing metadata before designing an import preview. Preserve exact SK/SP text, worksheet and row provenance; do not translate or invent standards. Phase 1 does not import this workbook into the application.
