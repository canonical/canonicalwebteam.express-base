/**
 * This class extends pragma's JSXRenderer to add integrity hashes out of the box.
 *
export class JSXIntegrityRenderer<
  TComponent extends ServerEntrypoint<InitialData>,
  InitialData,
> extends JSXRenderer<TComponent, InitialData> {
  constructor() {
    super();
    this.extractor = null;
  }
}
*/
/**
 * Render the page using the normal JSXRenderer.renderToString() method.
 *
 * Then do a second render passing the just rendered page.
 * Extractor gets all script, link and style tags.
 * For each of them computes the hash:
 * - if they are inline (just getting the text content).
 * - if they have "src" then fetching the resource and computing the hash of the response.
 * Creates a React Element with the integrity prop set to the computed hash.
 * Stores the hashes in a script or style set so they can be retrieved later.
 *
 * After rendering the page this time, it sets in the CSP header the stored hashes.
 */
