---
name: visual-completion-proof
description: Verify completed tasks that produce or change a user-visible visual result, then communicate successful completion with a current screenshot. Use automatically as the final verification step after implementing or modifying websites, apps, UI, visualizations, documents, slides, images, PDFs, or other rendered visual artifacts; use when a user asks to confirm a visual task is done.
---

# Visual Completion Proof

Use this skill as the last step of a task with a visual outcome. Do not report the visual portion as verified without a current rendered check.

## Verification workflow

1. Identify the finished state the user asked for and the smallest relevant rendered surface: screen, route, document page, slide, image, or PDF page.
2. Open or render the current artifact. For interactive interfaces, verify the relevant desktop view and a mobile view when responsive behavior is in scope. For static artifacts, render the relevant page or image at readable size.
3. Check the relevant state, not only the default view, against the task's acceptance criteria. Confirm that the requested result is present, legible, and free of obvious regressions such as clipping, overflow, missing content, broken assets, or incorrect loading, empty, or error states.
4. If the result does not look correct, continue fixing and verifying. Do not take a screenshot as proof until it does.
5. Take a current screenshot of the verified final state. Use a screenshot tool or an existing render; never reuse an outdated image or substitute a mockup.
6. Run the relevant non-visual validation required by the project's instructions.
7. In the final response, state what was visually verified and embed the screenshot using an absolute local path or the platform's image output mechanism. Keep any accompanying test summary concise.

## Limits and failures

- Treat screenshots as proof of appearance, not proof of all functional, accessibility, data, or security requirements. Run relevant non-visual checks too.
- If the artifact cannot be rendered or screenshotted, report the blocker plainly. Do not say the task is fully done.
- For a change with no visual outcome, do not force a screenshot; report the appropriate verification instead.
- Keep screenshots and other verification artifacts out of the repository unless the task explicitly requests them.
