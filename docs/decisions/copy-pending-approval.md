# Survivor-facing copy pending founder approval

Drafted 2026-10-18 by engineering. **Not final.** Spanish is a draft that needs review by a native speaker.
To approve: tick the box, or edit the text and note the change here, then update the source file.

## D5 — Turning saving off while items exist

Source: `src/components/portal/PrivacyChoice.tsx`, `src/lib/es.ts`

|            | English (draft)                                                                                                 | Spanish (draft)                                                                                                                             |
| ---------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [ ] Title  | What should happen to your saved items?                                                                         | ¿Qué quieres hacer con tus elementos guardados?                                                                                             |
| [ ] Body   | New items will not be saved. Items you already saved stay in this browser on this device until you delete them. | No se guardarán elementos nuevos. Los elementos que ya guardaste permanecen en este navegador, en este dispositivo, hasta que los elimines. |
| [ ] Button | Keep my saved items                                                                                             | Conservar mis elementos guardados                                                                                                           |
| [ ] Button | Delete them now → second step: "Permanently delete all saved items?" / "Delete permanently"                     | Eliminarlos ahora → «¿Eliminar permanentemente…?» / «Eliminar permanentemente»                                                              |

## D4 — Esc key no longer exits while typing or with a dialog open

|     | Where                               | English (draft)                                                                                                                                                 | Spanish (draft)                                                                                                                                                          |
| --- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [ ] | Intro step 2 (`Intro.tsx`)          | Tap "Quick exit" (top corner) anytime to leave instantly for a neutral page. When you aren't typing, you can also press the Esc key.                            | Toca "Salida rápida" (en la esquina) en cualquier momento para ir de inmediato a una página neutral. Cuando no estés escribiendo, también puedes presionar la tecla Esc. |
| [ ] | Home FAQ (`routes/index.tsx`)       | Quick Exit (or the Esc key, when you aren't typing) immediately leaves the Portal and opens a neutral website. It does not erase your browser history.          | _(FAQ answers are untranslated; they need approval first)_                                                                                                               |
| [ ] | Privacy page (`routes/privacy.tsx`) | The Esc key does not leave while you are typing, drawing or have a window open, so a stray key press cannot lose your work. The Quick Exit button always works. | _(page not yet translated)_                                                                                                                                              |
| [ ] | Footer (`Shell.tsx`)                | No sign-up. No profiles. No trackers. Use Quick Exit or press Esc to leave.                                                                                     | _(footer not yet translated)_                                                                                                                                            |

## Also pending

- [ ] Quick Exit destination: currently `https://www.weather.com` (`QUICK_EXIT_URL` in `Shell.tsx`)
- [ ] All FAQ answers on the home page (currently tagged "Needs approval")

Fixed along the way: the Spanish translation of the intro's Quick Exit line never displayed, because its dictionary key didn't match the English text.
