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

    updateMealRecommendations(currentTime, endTime, hoursRemaining); // Ensure meal recommendations are updated after summary is updated
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
function updateMealRecommendations(currentTime, endTime, hoursRemaining) {
    const remainingCalories = totalCalories - consumedCalories;

    // Dynamically calculate the number of meals needed based on remaining time and calories
    let mealsNeeded = Math.max(Math.floor(hoursRemaining / 2), 1);
    let minCaloriesPerMeal = 300;
    let maxCaloriesPerMeal = 1000;

    let recommendedMeals = [];

    // Calculate the target calories per meal dynamically
    function calculateMealTimings(mealsNeeded, remainingCalories) {
        let targetCaloriesPerMeal = remainingCalories / mealsNeeded;

        // Adjust meal frequency dynamically based on time left and calories remaining
        for (let i = 0; i < mealsNeeded; i++) {
            let mealTime = new Date(currentTime.getTime());
            mealTime.setHours(currentTime.getHours() + i * (hoursRemaining / mealsNeeded));

            let suitableMeals = mealOptions.filter(meal => meal.calories >= minCaloriesPerMeal && meal.calories <= maxCaloriesPerMeal);
            suitableMeals.sort((a, b) => Math.abs(a.calories - targetCaloriesPerMeal) - Math.abs(b.calories - targetCaloriesPerMeal));

            if (suitableMeals.length > 0) {
                let selectedMeal = suitableMeals[0];
                remainingCalories -= selectedMeal.calories;
                targetCaloriesPerMeal = remainingCalories / (mealsNeeded - (i + 1)); // Adjust target for remaining meals
                recommendedMeals.push({
                    meal: selectedMeal,
                    time: mealTime
                });
            }
        }

        return recommendedMeals;
    }

    recommendedMeals = calculateMealTimings(mealsNeeded, remainingCalories);

    // Handle the case where dynamic adjustments couldn't fulfill the goal
    if (recommendedMeals.length < mealsNeeded) {
        recommendedMeals = calculateMealTimings(Math.max(1, mealsNeeded - 1), remainingCalories);
    }

    if (recommendedMeals.length > 0) {
        let mealText = recommendedMeals.map(({ meal, time }) => 
            `${meal.name} - ${meal.calories} calories at ${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`
        ).join('<br>');
        document.getElementById('mealRecommendations').innerHTML = mealText;
    } else {
        document.getElementById('mealRecommendations').innerHTML = "No suitable meal recommendations. Try logging more calories or adjusting your goal.";
    }
}

// Initial graphs and recommendations rendering
updateGraphs();
updateSummary(); // Ensure summary is updated on page load
