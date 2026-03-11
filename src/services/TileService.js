import axios from "axios";

const isLocalhost = typeof window !== "undefined" && window.location.hostname === "localhost";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://tiles-warehouse-backend-5.onrender.com";
const API_URL = isLocalhost ? "/tiles" : `${API_BASE_URL}/tiles`;

export const getAllTiles = () => axios.get(API_URL);
export const addTile = (tile) => axios.post(API_URL, tile);
export const updateTile = (id, tile) => axios.put(`${API_URL}/${id}`, tile);
export const deleteTile = (id) => axios.delete(`${API_URL}/${id}`);