# Source Data

## Bluskyo/JLPT_Vocabulary

- Repository: https://github.com/Bluskyo/JLPT_Vocabulary
- Downloaded file: `bluskyo_jlpt_vocab_all.csv`
- Local license copy: `BLUSKYO_JLPT_VOCABULARY_LICENSE.txt`
- Repository license: MIT
- Upstream data note from the repository README: data from Tanos/Jonathan Waller is licensed under Creative Commons BY.

## Merge Policy

`scripts/merge_bluskyo_vocab.js` imports only N4 and N3 rows from the source CSV.

The source CSV contains Japanese expression, reading, and level only. Rows added from this source therefore use:

- `meaningKo`: `뜻 자동 생성 필요`
- `partOfSpeech`: `미분류`

`scripts/generate_cards.js` and `scripts/prompt_template.txt` are configured to let Claude fill those fields during card generation.

## JLPT Lab Sync

- Source page: https://jlptlab.com/vocabularies
- Local source files:
  - `jlptlab_n4_words.csv`
  - `jlptlab_n3_words.csv`
- Sync script: `scripts/sync_jlptlab_vocab.js`

JLPT Lab shows N4 as 566 entries and N3 as 1,669 entries. The local CSVs store one card per unique `expression + reading` pair, so duplicate site entries are collapsed:

- N4: 523 unique word-reading pairs
- N3: 1,564 unique word-reading pairs

Only the Japanese expression, reading, and level are used for the local scope list. Meanings, examples, and other explanatory content from JLPT Lab are not copied. Korean meanings and memory-card fields are generated separately by this project.
