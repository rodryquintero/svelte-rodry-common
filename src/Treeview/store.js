import { writable } from "svelte/store";

const initialState = {
  currentUrl: window.location.hash,
};

export const store = writable(initialState);
