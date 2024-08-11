let totalCalories = 4200; // Default goal, can be set by the user
let consumedCalories = 0;
let calorieData = []; // Array to store calorie intake data

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
        updateGraph();
    }
}

function updateSummary() {
    const remainingCalories = totalCalories - consumedCalories;
    document.getElementById('remainingCalories').innerText = `Remaining Calories: ${remainingCalories}`;

    const currentTime = new Date();
    const endTime = new Date();
    endTime.setHours(21, 0, 0); // 9 PM today

    const hoursRemaining = (endTime - currentTime) / (1000 * 60 * 60);
    const caloriesPerHour = (remainingCalories > 0) ? remainingCalories / hoursRemaining : 0;

    document.getElementById('caloriesPerHour').innerText = `Calories Per Hour Required: ${Math.round(caloriesPerHour)}`;
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
    const initialWeight = 70; // Example initial weight
    const weightChange = currentWeight - initialWeight;
    document.getElementById('weightProgress').innerText = `Progress since 12/07: ${weightChange} kg`;
}

// Function to update the graph with calorie data
function updateGraph() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: calorieData.map((_, index) => `Meal ${index + 1}`), // X-axis labels
            datasets: [{
                label: 'Calorie Intake Over Time',
                data: calorieData, // Y-axis data
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
                        text: 'Meals'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Calories'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}
