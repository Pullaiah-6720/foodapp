const axios = require('axios');

/**
 * Service to process food text queries against the external Spoonacular API
 * Calculates weight-based nutritional values (e.g., "150g Chicken Dum Biryani")
 */
class SpoonacularService {
    constructor() {
        this.apiKey = process.env.SPOONACULAR_API_KEY;
        this.baseURL = 'https://api.spoonacular.com/recipes/guessNutrition';
    }

    /**
     * Fetch estimated nutritional data based on the provided title and weight.
     * @param {String} foodName - Name of the food item (e.g., "Chicken Dum Biryani")
     * @param {Number} weightGrams - Requested weight in Grams (e.g., 150)
     * @returns {Array} List of JSONB nutrient objects {name, amount, unit}
     */
    async estimateNutrition(foodName, weightGrams) {
        try {
            if (!this.apiKey) {
                throw new Error('SPOONACULAR_API_KEY is not defined in the environment variables.');
            }

            // 1. Format the semantic title for Spoonacular to process via Natural Language
            // Example Output: "150g Chicken Dum Biryani"
            const queryTitle = `${weightGrams}g ${foodName}`;

            // 2. Fetch data from Spoonacular's guessNutrition Endpoint
            const response = await axios.get(this.baseURL, {
                params: {
                    title: queryTitle,
                    apiKey: this.apiKey,
                },
            });

            const data = response.data; // Spoonacular automatically converts this to a Javascript Object

            // 3. Process the response payload mapping the specific constraints (Calories, Carbs, Fat, Protein + more)
            // Error Handling: API sometimes returns empty bounds if food is unrecognized
            if (!data.calories) {
                return [
                    { name: "Notice", amount: 0, unit: "unknown" }
                ];
            }

            // Spoonacular returns primitive flat properties: `data.calories.value`, `data.protein.value`, `data.fat.value`, `data.carbs.value`
            const nutrients = [
                {
                    name: "Calories",
                    amount: Math.round(data.calories?.value || 0),
                    unit: data.calories?.unit || "kcal"
                },
                {
                    name: "Protein",
                    amount: Math.round(data.protein?.value || 0),
                    unit: data.protein?.unit || "g"
                },
                {
                    name: "Fat",
                    amount: Math.round(data.fat?.value || 0),
                    unit: data.fat?.unit || "g"
                },
                {
                    name: "Carbohydrates",
                    amount: Math.round(data.carbs?.value || 0),
                    unit: data.carbs?.unit || "g"
                }
            ];

            return nutrients;

        } catch (error) {
            console.error('Error fetching data from Spoonacular API:', error.message);

            // In a production environment, you might want to return generic defaults or handle it gracefully 
            // so the vendor is not completely blocked from adding the item.
            throw new Error('Failed to retrieve nutritional information from Spoonacular API. Please try a more general name.');
        }
    }
}

module.exports = new SpoonacularService();
