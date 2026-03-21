import axios from "axios";

const API_BASE_URLS = [
	"https://backendtile-app-a4f6cqcyarcue3ak.centralindia-01.azurewebsites.net",
	"https://tiles-warehouse-backend-5.onrender.com",
];

const withTilesPath = (baseUrl) => `${baseUrl}/tiles`;

const shouldTryFallback = (error) => {
	// Retry on network errors and gateway/server failures from the primary API.
	if (!error.response) return true;
	return error.response.status >= 500;
};

const requestWithFallback = async (requestFactory) => {
	let lastError;

	for (let i = 0; i < API_BASE_URLS.length; i += 1) {
		const baseUrl = API_BASE_URLS[i];

		try {
			return await requestFactory(baseUrl);
		} catch (error) {
			lastError = error;
			const hasMoreTargets = i < API_BASE_URLS.length - 1;

			if (!hasMoreTargets || !shouldTryFallback(error)) {
				throw error;
			}
		}
	}

	throw lastError;
};

export const getAllTiles = () =>
	requestWithFallback((baseUrl) => axios.get(withTilesPath(baseUrl)));

export const addTile = (tile) =>
	requestWithFallback((baseUrl) => axios.post(withTilesPath(baseUrl), tile));

export const updateTile = (id, tile) =>
	requestWithFallback((baseUrl) => axios.put(`${withTilesPath(baseUrl)}/${id}`, tile));

export const deleteTile = (id) =>
	requestWithFallback((baseUrl) => axios.delete(`${withTilesPath(baseUrl)}/${id}`));