let totalCalories = 3500; // Default goal set to 3500 calories
let consumedCalories = 0;
let calorieData = []; // Array to store calorie intake data
let weightData = []; // Array to store weight data
let timePeriod = 'week'; // Default time period for the graphs

// Example high-calorie meal options
const mealOptions = [
    { name: 'BBQ Ribs', calories: 1200 },
    { name: 'Steak and Potatoes', calories: 1000 },
    { name: 'Cheeseburger and Fries', calories: 1100 },
    { name: 'Beef Burrito', calories: 950 },
    { name: 'Lasagna', calories: 850 },
    { name: 'Fried Chicken with Sides', calories: 900 },
    { name: 'Pasta with Alfredo Sauce', calories: 600 },
    { name: 'Chicken Alfredo', calories: 700 },
    { name: 'Salmon with Rice', calories: 750 },
    { name: 'Spaghetti and Meatballs', calories: 700 },
    { name: 'Mac and Cheese', calories: 800 },
    { name: 'Peanut Butter Sandwich', calories: 300 },
    { name: 'Avocado Toast', calories: 300 },
    { name: 'Protein Shake', calories: 400 },
    { name: 'Cheese Pizza Slice', calories: 285 },
    { name: 'Chocolate Bar', calories: 250 },
    { name: 'Burger', calories: 500 },
    { name: 'Granola Bar', calories: 200 },
    { name: 'Bacon and Eggs', calories: 350 }
];

function setCalorieGoal() {
    const goalInput = document.getElementById('calorieGoalInput').value;
    if (goalInput) {
        totalCalories = parseInt(goalInput);
        updateSummary();
    }
}

function addCalories() {
    const input = document.getElementById('caloriesInput').value;
    if (input) {
        consumedCalories += parseInt(input);
        calorieData.push(consumedCalories);
        updateSummary();
        updateGraphs();
    }
}

function updateSummary() {
    const remainingCalories = totalCalories - consumedCalories;
    document.getElementById('remainingCalories').innerText = `Remaining Calories: ${remainingCalories}`;

    // Use the current time from the input box
    const currentTimeInput = document.getElementById('currentTimeInput').value;
    const currentTime = new Date();
    const [hours, minutes] = currentTimeInput.split(':');
    currentTime.setHours(parseInt(hours), parseInt(minutes), 0);

    const endTime = new Date();
    endTime.setHours(21, 0, 0); // 9 PM today

    const hoursRemaining = (endTime - currentTime) / (1000 * 60 * 60);
    const caloriesPerHour = (remainingCalories > 0 && hoursRemaining > 0) ? remainingCalories / hoursRemaining : 0;

    document.getElementById('caloriesPerHour').innerText = `Calories Per Hour Required: ${Math.round(caloriesPerHour)}`;

    updateMealRecommendations(hoursRemaining); // Ensure meal recommendations are updated after summary is updated
}

function handleWorkout() {
    const workedOut = document.getElementById('workoutCheck').checked;
    if (workedOut) {
        totalCalories += 300; // Example adjustment, can be dynamic
        updateSummary();
    }
}

function trackWeight() {
    const currentWeight = document.getElementById('weightInput').value;
    if (currentWeight) {
        weightData.push(currentWeight);
        updateGraphs();
    }
    const initialWeight = 70; // Example initial weight
    const weightChange = currentWeight - initialWeight;
    document.getElementById('weightProgress').innerText = `Progress since 12/07: ${weightChange} kg`;
}

function updateGraphs() {
    timePeriod = document.getElementById('timePeriodSelect').value;

    updateGraph('progressChart', calorieData, `Calorie Intake (${timePeriod})`);
    updateGraph('weightChart', weightData, `Weight Progress (${timePeriod})`);
}

function updateGraph(canvasId, data, label) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const daysInPeriod = {
        'week': 7,
        'twoWeeks': 14,
        'month': 30,
        'threeMonths': 90
    };

    const daysToShow = daysInPeriod[timePeriod];
    const startIndex = Math.max(0, data.length - daysToShow);
    
    const filteredData = data.slice(startIndex);
    const labels = filteredData.map((_, index) => `Day ${index + 1 + startIndex}`);

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: label,
                data: filteredData,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Days'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: label.includes('Calorie') ? 'Calories' : 'Weight (kg)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

// Function to update meal recommendations based on remaining calories and time
function updateMealRecommendations(hoursRemaining) {
    const remainingCalories = totalCalories - consumedCalories;

    // Prioritize 3 big meals and 2 smaller meals (total 5 meals)
    const bigMealsNeeded = 3;
    const smallMealsNeeded = 2;

    // Target calories for big and small meals
    const targetBigMealCalories = 800;  // Rough target for big meals
    const targetSmallMealCalories = (remainingCalories - targetBigMealCalories * bigMealsNeeded) / smallMealsNeeded;

    let bigMealOptions = [];
    let smallMealOptions = [];
    let recommendedMeals = [];

    // Sort meal options from largest to smallest for prioritizing big meals first
    mealOptions.sort((a, b) => b.calories - a.calories);

    // Categorize meals
    mealOptions.forEach(meal => {
        if (meal.calories >= 500) {
            bigMealOptions.push(meal);
        } else {
            smallMealOptions.push(meal);
        }
    });

    function findBigMealCombinations(meals, mealsNeeded, targetCalories, currentCombination) {
        if (currentCombination.length === mealsNeeded || targetCalories <= 0) {
            recommendedMeals.push([...currentCombination]);
            return;
        }

        for (let i = 0; i < meals.length; i++) {
            if (meals[i].calories <= targetCalories && !currentCombination.includes(meals[i])) {
                currentCombination.push(meals[i]);
                findBigMealCombinations(meals.slice(i + 1), mealsNeeded, targetCalories - meals[i].calories, currentCombination);
                currentCombination.pop();  // Backtrack
            }
        }
    }

    function findSmallMealCombinations(meals, mealsNeeded, targetCalories, currentCombination) {
        if (currentCombination.length === mealsNeeded || targetCalories <= 0) {
            recommendedMeals.push([...currentCombination]);
            return;
        }

        for (let i = 0; i < meals.length; i++) {
            if (meals[i].calories <= targetCalories && !currentCombination.includes(meals[i])) {
                currentCombination.push(meals[i]);
                findSmallMealCombinations(meals.slice(i + 1), mealsNeeded, targetCalories - meals[i].calories, currentCombination);
                currentCombination.pop();  // Backtrack
            }
        }
    }

    // Incorporate logged food into the recommendation
    const loggedBigMeals = calorieData.filter(cal => cal >= 500).length;
    const loggedSmallMeals = calorieData.filter(cal => cal < 500 && cal > 0).length;

    const remainingBigMeals = Math.max(bigMealsNeeded - loggedBigMeals, 0);
    const remainingSmallMeals = Math.max(smallMealsNeeded - loggedSmallMeals, 0);

    // Find big meal combinations
    findBigMealCombinations(bigMealOptions, remainingBigMeals, targetBigMealCalories * remainingBigMeals, []);

    // If big meals are found, look for small meal combinations
    if (recommendedMeals.length > 0) {
        findSmallMealCombinations(smallMealOptions, remainingSmallMeals, targetSmallMealCalories * remainingSmallMeals, recommendedMeals[0]);
    }

    if (recommendedMeals.length > 0) {
        // Sort combinations by total calories closest to the remaining calories
        recommendedMeals.sort((a, b) => 
            Math.abs(remainingCalories - a.reduce((sum, meal) => sum + meal.calories, 0)) - 
            Math.abs(remainingCalories - b.reduce((sum, meal) => sum + meal.calories, 0)));

        // Take the best combination (the first one after sorting)
        const bestCombination = recommendedMeals[0];
        const mealText = bestCombination.map(meal => `${meal.name} - ${meal.calories} calories`).join('<br>');
        document.getElementById('mealRecommendations').innerHTML = mealText;
    } else {
        document.getElementById('mealRecommendations').innerHTML = "No suitable meal recommendations. Try logging more calories or adjusting your goal.";
    }
}

// Initial graphs and recommendations rendering
updateGraphs();
updateSummary(); // Ensure summary is updated on page load
