let totalCalories = 3500; // Default goal set to 3500 calories
let consumedCalories = 0;
let calorieData = []; // Array to store calorie intake data
let loggedMeals = []; // Array to store logged meals with time, name, and type
let recommendedMealsHistory = []; // Array to track recommended meals
let weightData = []; // Array to store weight data
let timePeriod = 'week'; // Default time period for the graphs
const targetMealCount = 5; // Target total meal count

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
        resetRecommendations();
        updateSummary();
    }
}

function addCalories() {
    const inputCalories = document.getElementById('caloriesInput').value;
    const inputTime = document.getElementById('timeInput').value;
    if (inputCalories && inputTime) {
        const inputTimeDate = new Date();
        const [hours, minutes] = inputTime.split(':');
        inputTimeDate.setHours(parseInt(hours), parseInt(minutes), 0);

        const calories = parseInt(inputCalories);
        consumedCalories += calories;
        calorieData.push(consumedCalories);

        const mealType = calories >= 500 ? "Big Meal" : "Small Meal";
        loggedMeals.push({ type: mealType, calories: calories, time: inputTimeDate });

        updateSummary();
        updateMealLogTable(); // Update the meal log table
        updateGraphs();
    }
}

function resetRecommendations() {
    consumedCalories = 0;
    calorieData = [];
    loggedMeals = [];
    recommendedMealsHistory = [];
    document.getElementById('mealRecommendations').innerHTML = "No recommendations yet.";
    document.getElementById('projectedCalories').innerText = "Projected Total Calories: N/A";
    updateMealLogTable(); // Clear the meal log table
    updateProgressBar(0); // Reset the progress bar
}

function updateSummary() {
    const remainingCalories = totalCalories - consumedCalories;
    document.getElementById('remainingCalories').innerText = `Remaining Calories: ${remainingCalories}`;

    const mealsLogged = loggedMeals.length;
    const mealsRemaining = targetMealCount - mealsLogged;

    if (mealsLogged > 0) {
        const lastMealTime = loggedMeals[loggedMeals.length - 1].time;
        const endTime = new Date(lastMealTime);
        endTime.setHours(21, 0, 0); // Target end time 9 PM

        const hoursRemaining = (endTime - lastMealTime) / (1000 * 60 * 60);
        const caloriesPerHour = (remainingCalories > 0 && hoursRemaining > 0) ? remainingCalories / hoursRemaining : 0;

        document.getElementById('caloriesPerHour').innerText = `Calories Per Hour Required: ${Math.round(caloriesPerHour)}`;

        updateMealRecommendations(lastMealTime, endTime, hoursRemaining, mealsRemaining);
    } else {
        document.getElementById('caloriesPerHour').innerText = `Calories Per Hour Required: N/A`;
    }
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
function updateMealRecommendations(lastMealTime, endTime, hoursRemaining, mealsRemaining) {
    const remainingCalories = totalCalories - consumedCalories;

    // Dynamically calculate the number of meals needed based on remaining time and calories
    let minCaloriesPerMeal = 300;
    let maxCaloriesPerMeal = 1000;

    let recommendedMeals = [];
    let projectedTotalCalories = consumedCalories;

    // Calculate the target calories per meal dynamically
    function calculateMealTimings(mealsRemaining, remainingCalories) {
        let targetCaloriesPerMeal = remainingCalories / mealsRemaining;

        for (let i = 0; i < mealsRemaining; i++) {
            let mealTime = new Date(lastMealTime.getTime());
            mealTime.setHours(lastMealTime.getHours() + Math.max(Math.floor(hoursRemaining / mealsRemaining), 1));

            // Filter out meals that have already been recommended or logged
            let suitableMeals = mealOptions.filter(meal => 
                meal.calories >= minCaloriesPerMeal && 
                meal.calories <= maxCaloriesPerMeal &&
                !recommendedMealsHistory.includes(meal.name)
            );

            suitableMeals.sort((a, b) => Math.abs(a.calories - targetCaloriesPerMeal) - Math.abs(b.calories - targetCaloriesPerMeal));

            if (suitableMeals.length > 0) {
                let selectedMeal = suitableMeals[0];
                remainingCalories -= selectedMeal.calories;
                projectedTotalCalories += selectedMeal.calories;
                targetCaloriesPerMeal = remainingCalories / (mealsRemaining - (i + 1)); // Adjust target for remaining meals
                recommendedMeals.push({
                    meal: selectedMeal,
                    time: mealTime
                });
                recommendedMealsHistory.push(selectedMeal.name); // Track recommended meals to avoid repeats
                lastMealTime = mealTime; // Update last meal time
            }
        }

        return recommendedMeals;
    }

    recommendedMeals = calculateMealTimings(mealsRemaining, remainingCalories);

    // Ensure a suitable meal plan is always generated
    if (recommendedMeals.length < mealsRemaining) {
        let fallbackMeals = mealOptions.filter(meal => meal.calories <= remainingCalories);
        fallbackMeals.sort((a, b) => b.calories - a.calories); // Sort descending by calories

        let fallbackMealText = fallbackMeals.map(meal => `${meal.name} - ${meal.calories} calories`).join('<br>');
        document.getElementById('mealRecommendations').innerHTML = fallbackMealText.length > 0 ? fallbackMealText : "No suitable meals available. Consider adjusting your goal.";
        projectedTotalCalories = totalCalories; // Default to the target goal if no suitable plan
    } else {
        let mealText = recommendedMeals.map(({ meal, time }) => {
            return `${meal.name} - ${meal.calories} calories at ${time.getHours()}:${time.getMinutes().toString().padStart(2, '0')}`;
        }).join('<br>');
        
        document.getElementById('mealRecommendations').innerHTML = mealText;
    }

    document.getElementById('projectedCalories').innerText = `Projected Total Calories: ${projectedTotalCalories}`;
    updateProgressBar((consumedCalories / projectedTotalCalories) * 100);
}

// Function to update the meal log table
function updateMealLogTable() {
    const tableBody = document.getElementById('mealLogTableBody');
    tableBody.innerHTML = ""; // Clear existing table rows

    loggedMeals.forEach((meal, index) => {
        const row = document.createElement('tr');
        const mealNumberCell = document.createElement('td');
        mealNumberCell.innerText = `Meal ${index + 1}`;
        const mealTypeCell = document.createElement('td');
        mealTypeCell.innerText = meal.type;
        const caloriesCell = document.createElement('td');
        caloriesCell.innerText = meal.calories;
        const timeCell = document.createElement('td');
        timeCell.innerText = `${meal.time.getHours()}:${meal.time.getMinutes().toString().padStart(2, '0')}`;

        row.appendChild(mealNumberCell);
        row.appendChild(mealTypeCell);
        row.appendChild(caloriesCell);
        row.appendChild(timeCell);

        tableBody.appendChild(row);
        // Calculate total calories
let totalCaloriesLogged = loggedMeals.reduce((total, meal) => total + meal.calories, 0);

// Create and append a row for the total calories
const totalRow = document.createElement('tr');
const totalLabelCell = document.createElement('td');
totalLabelCell.innerText = 'Total';
totalLabelCell.colSpan = 2;
const totalCaloriesCell = document.createElement('td');
totalCaloriesCell.innerText = totalCaloriesLogged;
totalCaloriesCell.colSpan = 2;

// Append the cells to the row
totalRow.appendChild(totalLabelCell);
totalRow.appendChild(totalCaloriesCell);

// Append the total row to the table body
tableBody.appendChild(totalRow);

    });
}

// Function to update the progress bar
function updateProgressBar(percentage) {
    const progressBar = document.getElementById('calorieProgressBar');
    progressBar.style.width = `${percentage}%`;
    progressBar.style.background = `linear-gradient(90deg, yellow, red ${percentage}%)`;
}

// Initial setup
resetRecommendations();
updateGraphs();

