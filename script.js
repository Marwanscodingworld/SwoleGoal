let totalCalories = 4500; // Default goal, can be set by the user
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
    { name: 'Avocado Toast', calories: 300 }
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
        updateMealRecommendations();
    }
}

function updateSummary() {
    const remainingCalories = totalCalories - consumedCalories;
    document.getElementById('remainingCalories').innerText = `Remaining Calories: ${remainingCalories}`;

    const currentTime = new Date();
    const endTime = new Date();
    endTime.setHours(24, 0, 0); // 9 PM today

    const hoursRemaining = (endTime - currentTime) / (1000 * 60 * 60);
    const caloriesPerHour = (remainingCalories > 0) ? remainingCalories / hoursRemaining : 0;

    document.getElementById('caloriesPerHour').innerText = `Calories Per Hour Required: ${Math.round(caloriesPerHour)}`;
}

function handleWorkout() {
    const workedOut = document.getElementById('workoutCheck').checked;
    if (workedOut) {
        totalCalories += 300; // Example adjustment, can be dynamic
        updateSummary();
        updateMealRecommendations();
    }
}

function trackWeight() {
    const currentWeight = document.getElementById('weightInput').value;
    if (currentWeight) {
        weightData.push(currentWeight);
        updateGraphs();
    }
    const initialWeight = 55; // Example initial weight
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

    // Use the actual current time for normal operation
    const currentTime = new Date();
    currentTime.setHours(8, 0, 0);
    
    const endTime = new Date();
    endTime.setHours(21, 0, 0); // 9:00 PM

    const hoursRemaining = (endTime - currentTime) / (1000 * 60 * 60);
    let recommendedMeals = [];

    function findMealCombinations(meals, targetCalories, currentCombination) {
        if (targetCalories <= 0) {
            recommendedMeals.push([...currentCombination]);
            return;
        }

        for (let i = 0; i < meals.length; i++) {
            if (meals[i].calories <= targetCalories) {
                currentCombination.push(meals[i]);
                findMealCombinations(meals.slice(i), targetCalories - meals[i].calories, currentCombination);
                currentCombination.pop();
            }
        }
    }

    // We consider combinations of meals to make up the remaining calories
    findMealCombinations(mealOptions, remainingCalories, []);

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

}
// Initial graphs rendering
updateGraphs();
