import axios from "axios";

const API_URL = "/tiles";

export const getAllTiles = () => axios.get(API_URL);
export const addTile = (tile) => axios.post(API_URL, tile);
export const updateTile = (id, tile) => axios.put(`${API_URL}/${id}`, tile);
export const deleteTile = (id) => axios.delete(`${API_URL}/${id}`);