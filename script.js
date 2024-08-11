let totalCalories = 2000; // Example goal, you can make this dynamic
let consumedCalories = 0;

function addCalories() {
    const input = document.getElementById('caloriesInput').value;
    if (input) {
        consumedCalories += parseInt(input);
        updateSummary();
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
