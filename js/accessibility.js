// Button semantics for the elements that behave like buttons but aren't <button>: the
// positioned body markers, breadcrumb segments, list rows built from template strings, the
// projected 3D site labels, and the cell dots. One helper wires the role, the tab order and
// the Enter/Space handler, and the click listener lives here too — so a keyboard activation
// is guaranteed to run the identical function a click runs, with no second copy to drift.
//
// opts.label       — accessible name, for targets whose visible text is absent or ambiguous.
// opts.pointerGuard — pointer-only veto, applied to the click path but NOT the key path.
export function makeActivatable(el, activate, opts){
  const options = opts || {};
  el.setAttribute('role', 'button');
  el.setAttribute('tabindex', '0');
  if(options.label) el.setAttribute('aria-label', options.label);
  el.addEventListener('click', (e)=>{
    e.stopPropagation();
    // A guard like "this click was the tail of a rotate gesture" only makes sense for a
    // pointer. Keyboard activation has no drag to disambiguate, so it skips the guard.
    if(options.pointerGuard && !options.pointerGuard()) return;
    activate();
  });
  el.addEventListener('keydown', (e)=>{
    if(e.key !== 'Enter' && e.key !== ' ') return;
    // Space scrolls the organ screen and Enter can submit; a real <button> suppresses both.
    e.preventDefault();
    e.stopPropagation();
    activate();
  });
}

// Every navigation destroys or disables the control that triggered it: renderCrumbs() rebuilds
// the breadcrumb from scratch, and setScreen()/txGoLevel() mark whole layers inert. Focus would
// therefore fall back to <body> and the next Tab would restart from the top of the document, so
// put it on the view just arrived at instead. Targeting the labelled region rather than its
// first control gives a screen reader an arrival announcement, and the controls are one Tab
// away. preventScroll matters because #screenOrgan is itself the scroll container.
export function landFocus(el){
  if(el && !el.closest('[inert]')) el.focus({preventScroll:true});
}
