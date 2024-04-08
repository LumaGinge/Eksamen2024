// Hent referencen til tbody i tabellen uden for event listeneren
const tbody = document.getElementById('tableBody');

document.addEventListener('DOMContentLoaded', function () {
    // Ændringer i updateTableFromLocalStorage funktionen
    function updateTableFromLocalStorage() {
        // Hent data fra local storage
        let data = JSON.parse(localStorage.getItem('mealtracker')) || [];

        // Ryd tabellen
        tbody.innerHTML = '';

        // Sorter data efter dato og tid i faldende rækkefølge (nyeste først)
        data.sort((a, b) => {
             // Opdel dato og tid for element a. Så det passer med formateringen fra meal tracker 
            const [dateStringA, timeStringA] = a.date.split(' ');
            const [dayA, monthA, yearA] = dateStringA.split('.');
            const [hourA, minuteA] = timeStringA.split('.');
            const dateA = new Date(yearA, monthA - 1, dayA, hourA, minuteA);

             // Opdel dato og tid for element a. Så det passer med formateringen fra meal tracker 
            const [dateStringB, timeStringB] = b.date.split(' ');
            const [dayB, monthB, yearB] = dateStringB.split('.');
            const [hourB, minuteB] = timeStringB.split('.');
            const dateB = new Date(yearB, monthB - 1, dayB, hourB, minuteB);

            // Sammenlign datoobjekterne for at sortere dem i den ønskede rækkefølge
            return dateB - dateA;
        });

        // Indsæt data i tabellen med det ønskede datoformat
        data.forEach(mealData => {
            const [dateString, timeString] = mealData.date.split(' '); // Opdel datoen og tiden
            const [day, month, year] = dateString.split('.'); // Opdel dato i dag, måned og år
            const [hour, minute] = timeString.split('.'); // Opdel tid i time og minut
            
            // Tjek om måltidet er fra den aktuelle dag
            const currentDate = new Date();
            const mealDate = new Date(year, month - 1, day, hour, minute); // Opret et Date-objekt med opdelte dato- og tidskomponenter
            const timeDifference = currentDate - mealDate;
            const millisecondsInADay = 24 * 60 * 60 * 1000;

            // Hvis måltidet er fra den aktuelle dag, tilføj det til tabellen
            if (timeDifference >= 0 && timeDifference <= millisecondsInADay) {
                // Opret en ny række (row) i tabellen
                const row = tbody.insertRow();

                // Indsæt dato i første celle
                const dateCell = row.insertCell();
                dateCell.textContent = mealData.date;

                // Indsæt måltid i anden celle
                const mealNameCell = row.insertCell();
                mealNameCell.textContent = mealData.mealName;

                // Indsæt vandindtag i tredje celle (fast værdi på 1,8)
                const waterCell = row.insertCell();
                waterCell.textContent = '1,8L'; // Fast værdi for vandindtag

                // Indsæt kalorier i fjerde celle
                const calorieCell = row.insertCell();
                calorieCell.textContent = mealData.WeightEnergy.energy; // Kalorier for dette måltid
            }
        });
    }

    // Kald funktionen for at opdatere tabellen ved indlæsning af siden
    updateTableFromLocalStorage();
});
