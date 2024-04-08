// Funktion til at vise eller skjule en container
function toggleContainer(container) {
    if (container.style.display === 'block') {
        container.style.display = 'none';
    } else {
        container.style.display = 'block';
    }
}

// Funktion til at tilføje et måltid til local storage
function addMealToLocalStorage(mealData) {
    let meals = JSON.parse(localStorage.getItem('mealtracker')) || []; // Hent måltidsdata fra local storage, eller opret et tomt array, hvis der ikke er nogen data
    meals.push(mealData); // Tilføj det nye måltid til måltidslisten
    localStorage.setItem('mealtracker', JSON.stringify(meals)); // Gem den opdaterede måltidsliste til local storage
}

// Funktion til at opdatere tabellen med måltidsdata fra local storage
async function updateTableFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem('mealtracker')) || []; // Hent måltidsdata fra local storage, eller opret et tomt array, hvis der ikke er nogen data
    const tbody = document.getElementById('tableBody'); // Hent reference til tabellen i HTML'en
    tbody.innerHTML = ''; // Ryd tabellen, så den ikke opretter duplikatrækker

    // Går igennem alle måltiderne i local storage-dataene
    data.forEach(async (mealData, index) => {
        // Opretter ny række i tabellen
        const newRow = tbody.insertRow();

        // Indsætter data i de respektive celler
        const { mealName: mealNameFromData, meal, date, geolocation, WeightEnergy } = mealData;

        // Tilføj en kontrol for at håndtere tilfælde, hvor WeightEnergy er udefineret
        if (WeightEnergy) {
            const { weight, energy } = WeightEnergy;
            const { latitude, longitude } = geolocation;

            // Indsæt data i cellerne i den ønskede rækkefølge
            const mealSourceCell = newRow.insertCell();
            const geoLocationCell = newRow.insertCell();
            const mealCell = newRow.insertCell();
            const weightEnergyCell = newRow.insertCell();
            const addedOnCell = newRow.insertCell();
            const dailyConsCell = newRow.insertCell();
            const buttonCell = newRow.insertCell();

            // Sæt indholdet i cellerne
            mealSourceCell.textContent = mealNameFromData;
            geoLocationCell.textContent = `${latitude}, ${longitude}`;
            mealCell.textContent = meal;
            addedOnCell.textContent = date;
            weightEnergyCell.innerHTML = `${weight}g <br> ${energy} Kcal`;

            // Indsæt HTML-knapper i knapcellen (delete, edit, info)
            buttonCell.innerHTML = `
                <button class="infoButton">
                    <img src="aInfo.png" alt="infoButton">
                </button>
                <button class="editButton">
                    <img src="aEdit.png" alt="editButton">
                </button>
                <button class="deleteButton">
                    <img src="aDelete.png" alt="deleteButton">
                </button>`;


            // addEventListener for slet-knappen
            const deleteButton = buttonCell.querySelector('.deleteButton');
            deleteButton.addEventListener('click', function () {
                // Fjern måltidet fra local storage
                data.splice(index, 1);
                // Opdater localStorage med det nye data-array
                localStorage.setItem('mealtracker', JSON.stringify(data));
                // Fjern rækken fra tabellen
                tbody.removeChild(newRow); // Fjern den tilsvarende række fra DOM'en
            });



            // addEventListener for edit-knappen
            const editButton = buttonCell.querySelector('.editButton');
            editButton.addEventListener('click', function () {
                // Vis en prompt boks og gem det indtastede måltidsnavn
                let newMealName = prompt('Edit meal name:', mealNameFromData);

                // Hvis brugeren klikker "OK" i prompt boksen og har indtastet en værdi
                if (newMealName !== null) {
                    // Opdater måltidsnavnet i tabellen
                    mealData.mealName = newMealName;

                    // Opdater måltidsnavnet i local storage
                    data[index].mealName = newMealName;
                    localStorage.setItem('mealtracker', JSON.stringify(data));

                    // Opdater tabellen med de opdaterede data fra local storage
                    updateTableFromLocalStorage();
                }
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Hent reference til de relevante HTML-elementer
    const blueButton = document.querySelector('.bluebutton');
    const greenButton = document.querySelector('.greenbutton');
    const lineContainerBlue = document.querySelector('.blue-line-container');
    const lineContainerGreen = document.querySelector('.grey-line-container');
    const inputDateTime = document.getElementById('inputDateTime');
    const inputDateTimeBlue = document.getElementById('inputDateTime2');

    // Opret en ny datoobjekt til den aktuelle dato og tid
    const currentDate = new Date();
    // Formatér dato- og tidsværdien korrekt og indsæt den i inputfeltet
    inputDateTime.value = currentDate.toISOString().slice(0, 16).replace('T', ' ');

    // Formatér dato- og tidsværdien korrekt og indsæt den i inputfeltet for den blå knap
    inputDateTimeBlue.value = currentDate.toISOString().slice(0, 16).replace('T', ' '); //

    blueButton.addEventListener('click', function () {
        toggleContainer(lineContainerBlue);
    });

    greenButton.addEventListener('click', function () {
        toggleContainer(lineContainerGreen);
    });

    //addEventListener til den blå knap. Hvad skal der ske når man trykker. 
    const addBlueMealButton = document.getElementById('addBlueMealButton');
    addBlueMealButton.addEventListener('click', async function () {

        // Hent det valgte ingrediensnavn fra dropdown-menuen
        const selectedIngredient = document.getElementById('chooseIngredient');
        const chosenIngredient = selectedIngredient.options[selectedIngredient.selectedIndex].text;
        // Hent værdien af det indtastede måltidsnavn
        let mealName = document.getElementById('mealNameInput2').value;
        // Hent vægten af det valgte måltid fra inputfeltet
        const weightInput = document.getElementById('weigthBlue').value;

        // Valider brugerinput: Kontroller om disse felter er udfyldt
        if (!chosenIngredient || !mealName || !weightInput) {
            alert('Alle felter skal udfyldes.');
            return; // Stop funktionen hvis der mangler input
        }

        // Konverter strengen fra inputDateTimeBlue til et Date-objekt
        const inputDateBlue = new Date(inputDateTimeBlue.value); // Konverter strengen til et Date-objekt
        // Formatér datoen og tidspunktet til dansk format
        const formattedDateTimeBlue = inputDateBlue.toLocaleString('da-DK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Funktion til at hente geolokationsdata
        function getLocation(callback) {
            // Kontroller om browseren understøtter geolocation
            if ('geolocation' in navigator) {
                // Hent den aktuelle position ved hjælp af getCurrentPosition-metoden og kald callback-funktionen med positionen som argument
                navigator.geolocation.getCurrentPosition(callback, handleGeolocationError);
            } else {
                // Hvis geolocation ikke understøttes, vis en advarselsbesked
                alert('Geolocation is not available in this browser.');
            }
        }

        // Håndter fejl fra geolocation
        function handleGeolocationError(error) {
            console.error('Error fetching geolocation:', error);
            alert('An error occurred while fetching geolocation.');
        }

        // Hent geolocations koordinater
        getLocation(async function (position) { 
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            // Hent foodID baseret på ingrediensnavnet
            const foodInspector = JSON.parse(localStorage.getItem('foodInspector')); // Hent listen af fødevareinspektører fra lokal storage
            const chosenFood = foodInspector.find(food => food.foodName === chosenIngredient);// Find den valgte ingrediens i listen
            const foodID = chosenFood ? chosenFood.foodID : null;// Hvis foodID ikke findes, vis en fejlmeddelelse

            if (!foodID) {
                alert('Could not find foodID for the selected ingredient.');
                return;
            }

            // Hent detaljer om fødevaren fra sortKeyFoodDetails
            const foodDetails = await sortKeyFoodDetails(foodID);

            const weight = parseFloat(weightInput); // Konverter vægtinputtet til en flydende værdi for nøjagtighed
            // Opdater WeightEnergi med det indtastede vægttal og beregn energi
            const energy = Math.floor((foodDetails['SortKey1030'] / 100) * weight); // Beregn energien 


            // Opret et objekt med måltidsoplysningerne
            const mealData = {
                mealName: chosenIngredient,
                geolocation: { latitude: latitude, longitude: longitude },
                meal: mealName,
                WeightEnergy: { weight: weightInput, energy: energy }, 
                date: formattedDateTimeBlue
            };

            // Tilføj måltidet til local storage
            addMealToLocalStorage(mealData);

            // Opdater tabellen med de opdaterede data fra local storage
            updateTableFromLocalStorage();
        });
    });


        //addEventListener til den grønne knap. Hvad skal der ske når man trykker. 
    const addGreenMealButton = document.getElementById('addGreenMealButton');
    addGreenMealButton.addEventListener('click', function () {
        const selectedmeal = document.getElementById('chooseMeal');
        const chooseMeal = selectedmeal.options[selectedmeal.selectedIndex].text;
        let mealName = document.getElementById('mealNameInput').value;
        const weightInput = document.getElementById('weigthGreen').value; 

        // Valider brugerinput
        if (!chooseMeal || !mealName || !weightInput) {
            alert('Alle felter skal udfyldes.');
            return; 
        }

        //Formater dato
        const inputDate = new Date(inputDateTime.value);
        const formattedDateTime = inputDate.toLocaleString('da-DK', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Funktion til at hente geolokationsdata
        function getLocation(callback) {
            if ('geolocation' in navigator) {
                navigator.geolocation.getCurrentPosition(callback, handleGeolocationError);
            } else {
                alert('Geolocation is not available in this browser.');
            }
        }

        // Håndter fejl fra geolocation
        function handleGeolocationError(error) {
            console.error('Error fetching geolocation:', error);
            alert('An error occurred while fetching geolocation.');
        }

        // Hent geolocation
        getLocation(function (position) {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;

            // Hent oplysningerne om det valgte måltid fra local storage
            const mealCreatorData = JSON.parse(localStorage.getItem('mealcreator')) || [];
            const selectedMealData = mealCreatorData.find(meal => meal.mealName === chooseMeal);

            if (!selectedMealData) {
                alert('Could not find information about the selected meal in local storage.');
                return;
            }

            // Hent det samlede kalorieindhold fra det valgte måltid
            const totalKcal = selectedMealData.totalKcal;

            // Konverter inputvægten til en flydende værdi
            const weight = parseFloat(weightInput);

            // Beregn energien ved at dividere det samlede kalorieindhold med 100 og gange med vægten
            const energy = Math.ceil((totalKcal / 100) * weight);

            // Opret et objekt med måltidsoplysningerne
            const mealData = {
                mealName: chooseMeal,
                geolocation: { latitude: latitude, longitude: longitude },
                meal: mealName,
                WeightEnergy: { weight: weightInput, energy: energy }, 
                date: formattedDateTime
            };

            // Tilføj måltidet til local storage
            addMealToLocalStorage(mealData);

            // Opdater tabellen med de opdaterede data fra local storage
            updateTableFromLocalStorage();

        });
    });

    // Kald funktionen til at opdatere tabellen ved indlæsning af siden
    updateTableFromLocalStorage();
});



// Vælg dropdown-menuen med id'en "chooseIngredient"
const chooseMealDropdown = document.getElementById('chooseIngredient');
// Kald funktionen for at indlæse data i dropdown-menuen
loadIntoDropdown(chooseMealDropdown);

// Hent dataene fra local storage
var mealData = JSON.parse(localStorage.getItem('mealcreator'));

// Vælg select elementet
var selectElement = document.getElementById('chooseMeal');

// Tilføj en placeholder option
var placeholderOption = document.createElement('option');
placeholderOption.text = 'Choose meal:';
placeholderOption.disabled = true;
placeholderOption.selected = true;
selectElement.appendChild(placeholderOption);

// Iterér gennem måltidsdataene og tilføj måltidsnavnene til select-boksen
mealData.forEach(function (meal) {
    var option = document.createElement('option');
    option.text = meal.mealName;
    option.value = meal.mealcounter; 
    selectElement.appendChild(option);
});


// Funktion til at indlæse data i en dropdown (choosefood)
function loadIntoDropdown(dropdown) {
    try {
        // Hent data fra Local Storage
        const data = JSON.parse(localStorage.getItem('foodInspector'));
        // Ryd dropdown'en
        dropdown.innerHTML = "";

        // Der opretten en placeholder til dropdown med teksten: "Choose a food item"
        const placeholderOption = document.createElement("option");
        placeholderOption.text = "Choose a food item";
        placeholderOption.disabled = true;
        placeholderOption.selected = true;
        dropdown.appendChild(placeholderOption);

        // Tilføj hvert element fra data til dropdown'en som en option
        data.forEach(food => {
            const option = document.createElement("option");
            option.text = food.foodName;
            option.value = food.foodID;
            dropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading food items from localStorage:', error);
    }
}

// Kald funktionen for at indlæse data i dropdown-menuen
loadIntoDropdown(chooseMealDropdown);

async function sortKeyFoodDetails(foodID) {
    const sortKey = 1030;
    let details = {};

    const url = `https://nutrimonapi.azurewebsites.net/api/FoodCompSpecs/ByItem/${foodID}/BySortKey/${sortKey}`;

    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "X-API-Key": "171209",
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const [{ resVal } = {}] = data || [];

        details[`SortKey${sortKey}`] = resVal ? Math.round(parseFloat(resVal)) : 'N/A';
    } catch (error) {
        console.error(`Error fetching details for sort key ${sortKey}:`, error);
        details[`SortKey${sortKey}`] = 'Error';
    }

    return details;
}
