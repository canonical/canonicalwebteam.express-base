/**
 * Any structure can be followed for the initial data.
 *
 * Each page may have some common data that will be the same in every case
 * (data for the header and footer, etc.) and some data that will be specific
 * for each page.
 *
 * The functions to obtain/load/fetch this data that needs to be available when
 * rendering the page in the server and when hydrating the page in the frontend
 * can be exported here. Then called in the corresponding routing functions for
 * each page (or a generic "use" route for the shared data).
 */

export * from "./initialData";
