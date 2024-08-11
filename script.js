let totalCalories = 3000; // Default goal, can be set by the user
let consumedCalories = 0;
let calorieData = []; // Array to store calorie intake data
let weightData = []; // Array to store weight data
let timePeriod = 'week'; // Default time period for the graphs

// Example high-calorie meal options
const mealOptions = [
    { name: 'Peanut Butter Sandwich', calories: 300 },
    { name: 'Protein Shake', calories: 400 },
    { name: 'Cheese Pizza Slice', calories: 285 },
    { name: 'Chocolate Bar', calories: 250 },
    { name: 'Burger', calories: 500 },
    { name: 'Granola Bar', calories: 200 },
    { name: 'Bacon and Eggs', calories: 350 },
    { name: 'Pasta with Alfredo Sauce', calories: 600 },
    { name: 'Avocado Toast', calories: 300 },
    { name: 'Lasagna', calories: 850 },
    { name: 'Steak and Potatoes', calories: 1000 },
    { name: 'Chicken Alfredo', calories: 700 },
    { name: 'BBQ Ribs', calories: 1200 },
    { name: 'Fried Chicken with Sides', calories: 900 },
    { name: 'Mac and Cheese', calories: 800 },
    { name: 'Salmon with Rice', calories: 750 },
    { name: 'Beef Burrito', calories: 950 },
    { name: 'Cheeseburger and Fries', calories: 1100 },
    { name: 'Spaghetti and Meatballs', calories: 700 }
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
        updateMealRecommendations(); // Call to update meal recommendations
    }
}

function updateSummary() {
    const remainingCalories = totalCalories - consumedCalories;
    document.getElementById('remainingCalories').innerText = `Remaining Calories: ${remainingCalories}`;

    // Simulate current time as 8:00 PM for testing
    const currentTime = new Date();
    currentTime.setHours(8, 0, 0); // 8:00 PM

    const endTime = new Date();
    endTime.setHours(21, 0, 0); // 9 PM today

    const hoursRemaining = (endTime - currentTime) / (1000 * 60 * 60);
    const caloriesPerHour = (remainingCalories > 0 && hoursRemaining > 0) ? remainingCalories / hoursRemaining : 0;

    document.getElementById('caloriesPerHour').innerText = `Calories Per Hour Required: ${Math.round(caloriesPerHour)}`;
}

function handleWorkout() {
    const workedOut = document.getElementById('workoutCheck').checked;
    if (workedOut) {
        totalCalories += 300; // Example adjustment, can be dynamic
        updateSummary();
        updateMealRecommendations(); // Call to update meal recommendations
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
function updateMealRecommendations() {
    const remainingCalories = totalCalories - consumedCalories;

    // Simulate current time as 8:00 PM for testing
    const currentTime = new Date();
    currentTime.setHours(8, 0, 0); // 8:00 PM

    const endTime = new Date();
    endTime.setHours(21, 0, 0); // 9:00 PM

    const hoursRemaining = (endTime - currentTime) / (1000 * 60 * 60);
    let recommendedMeals = [];

    function findMealCombinations(meals, targetCalories, currentCombination, usedMeals) {
        if (targetCalories <= 0) {
            recommendedMeals.push([...currentCombination]);
            return;
        }

        for (let i = 0; i < meals.length; i++) {
            if (meals[i].calories <= targetCalories && !usedMeals.has(meals[i].name)) {
                currentCombination.push(meals[i]);
                usedMeals.add(meals[i].name);  // Mark this meal as used
                findMealCombinations(meals.slice(i + 1), targetCalories - meals[i].calories, currentCombination, usedMeals);
                currentCombination.pop();
                usedMeals.delete(meals[i].name);  // Unmark this meal for other combinations
            }
        }
    }

    // We consider combinations of meals to make up the remaining calories
    findMealCombinations(mealOptions, remainingCalories, [], new Set());

    if (recommendedMeals.length > 0) {
        // Sort combinations by the number of meals (fewer meals is preferred) and by calories closest to target
        recommendedMeals.sort((a, b) => a.length - b.length || 
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


// Initial graphs rendering
updateGraphs();
updateSummary(); // Ensure summary is updated on page load
updateMealRecommendations(); // Ensure meal recommendations are shown on page load
