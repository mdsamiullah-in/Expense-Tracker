document.addEventListener("DOMContentLoaded", function () {
    const currentMonthYear = document.getElementById('currentMonthYear');
    const weekDays = document.getElementById('weekDays');
    const prevMonth = document.getElementById('prevMonth');
    const nextMonth = document.getElementById('nextMonth');
    const prevWeek = document.getElementById('prevWeek');
    const nextWeek = document.getElementById('nextWeek');
    const addWorkButton = document.getElementById('addWork');
    const workBoxes = document.getElementById('workBoxes');
    const paginationControls = document.getElementById('paginationControls');
    const searchIcon = document.getElementById('searchIcon');
    const searchBox = document.getElementById('searchEngineBox');

    let currentDate = new Date();
    let selectedDate = new Date(); // Default selected date is the current date
    const itemsPerPage = 12; // Number of items to display per page
    let currentPage = 1; // Current page number

    function updateMonthYear() {
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        currentMonthYear.innerText = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    }

   
function updateWeek() {
    weekDays.innerHTML = '';
    let startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday se start kare

    for (let i = 0; i < 7; i++) {
        let day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        let dayElement = document.createElement('p');
        dayElement.innerText = `${day.toDateString().slice(0, 3)} ${day.getDate()}`; // Din aur date dikhaye

        // Agar yeh current day hai toh styling set kare
        if (day.toDateString() === new Date().toDateString()) {
            dayElement.style.backgroundColor = 'white';
            dayElement.style.color = 'black';
            dayElement.classList.add('current');
            dayElement.classList.add('selected'); // Default selected banaye
            selectedDate = day; // Current date ko select kare
            displayWorkForSelectedDate();
        }

        // Date select karne ke liye click event add kare
        dayElement.addEventListener('click', function () {
            selectedDate = day; // Selected date set kare
            document.querySelectorAll('#weekDays p').forEach(el => el.classList.remove('selected'));
            dayElement.classList.add('selected'); // Selected day ko highlight kare
            displayWorkForSelectedDate(); // Selected date ke liye work dikhaye
        });

        // Hover effect ke liye mouse events add kare
        dayElement.addEventListener('mouseenter', function () {
            if (!dayElement.classList.contains('current')) {
                dayElement.style.backgroundColor = 'white';
                dayElement.style.color = 'black';
            }
        });

        dayElement.addEventListener('mouseleave', function () {
            if (!dayElement.classList.contains('selected')) {
                dayElement.style.backgroundColor = '';
                dayElement.style.color = '';
            }
        });

        weekDays.appendChild(dayElement);
    }
}

    function createWorkBox(workDetails, isEditable) {
        var div = document.createElement("div");
        div.className = "workName";

        // Random light background colors
        const lightColors = [
            '#FFECB3', // Light Yellow
            '#C8E6C9', // Light Green
            '#FFCCBC', // Light Orange
            '#BBDEFB', // Light Blue
            '#D1C4E9', // Light Purple
            '#F8BBD0', // Light Pink
            '#E1BEE7', // Light Violet
        ];
        
        // Select a random color
        const randomColor = lightColors[Math.floor(Math.random() * lightColors.length)];
        div.style.backgroundColor = randomColor;

        div.innerHTML = `
            <label class="workTime">${new Date(workDetails.date).toDateString()}</label>
            <h1 contenteditable="${isEditable}" style="color: black;">${workDetails.name}</h1>
            <p contenteditable="${isEditable}" style="color: black;">${workDetails.time}</p>
            ${isEditable ? '<i class="fa-solid fa-plus addWorks"></i>' : ''}
            <input type="checkbox" class="check">
        `;

        if (isEditable) {
            div.querySelector('.addWorks').onclick = function () {
                var workName = div.querySelector('h1').innerText;
                var workTime = div.querySelector('p').innerText;

                if (selectedDate) {
                    var newWorkDetails = {
                        name: workName,
                        time: workTime,
                        date: selectedDate.toISOString(),
                    };
                    // Save the work details to localStorage
                    var workList = JSON.parse(localStorage.getItem('workList')) || [];
                    workList.push(newWorkDetails);
                    localStorage.setItem('workList', JSON.stringify(workList));

                    // Remove contenteditable attribute and hide the plus icon
                    div.querySelector('h1').contentEditable = "false";
                    div.querySelector('p').contentEditable = "false";
                    this.style.display = 'none';

                    displayWorkForSelectedDate(); // Refresh the work display immediately
                } else {
                    alert("Please select a day to save the work.");
                }
            };
        }

        workBoxes.appendChild(div);
        applyAnimation(div, 'newTaskAnimation');
    }

    function displayWorkForSelectedDate() {
        workBoxes.innerHTML = ''; // Clear the existing works
        paginationControls.innerHTML = ''; // Clear existing pagination controls

        if (!selectedDate) return;

        // Load saved work details from localStorage
        var savedWorkList = JSON.parse(localStorage.getItem('workList')) || [];
        var workListForSelectedDate = savedWorkList.filter(function (workDetails) {
            let workDate = new Date(workDetails.date);
            return workDate.toDateString() === selectedDate.toDateString();
        });

        // Pagination logic
        let totalItems = workListForSelectedDate.length;
        let totalPages = Math.ceil(totalItems / itemsPerPage);
        let startIndex = (currentPage - 1) * itemsPerPage;
        let endIndex = startIndex + itemsPerPage;

        let paginatedWorkList = workListForSelectedDate.slice(startIndex, endIndex);

        paginatedWorkList.forEach(function (workDetails) {
            createWorkBox(workDetails, false);
        });

        // Create "Previous" arrow
        if (currentPage > 1) {
            let prevArrow = document.createElement('button');
            prevArrow.innerText = '←';
            prevArrow.addEventListener('click', function () {
                currentPage--;
                displayWorkForSelectedDate(); // Go to the previous page
            });
            paginationControls.appendChild(prevArrow);
        }

        // Create page numbers
        for (let i = 1; i <= totalPages; i++) {
            let pageButton = document.createElement('button');
            pageButton.innerText = i;
            pageButton.className = (i === currentPage) ? 'active' : '';
            pageButton.addEventListener('click', function () {
                currentPage = i;
                displayWorkForSelectedDate(); // Re-render works for the new page
            });
            paginationControls.appendChild(pageButton);
        }

        // Create "Next" arrow
        if (currentPage < totalPages) {
            let nextArrow = document.createElement('button');
            nextArrow.innerText = '→';
            nextArrow.addEventListener('click', function () {
                currentPage++;
                displayWorkForSelectedDate(); // Go to the next page
            });
            paginationControls.appendChild(nextArrow);
        }

        // Show add work button
        addWorkButton.style.display = 'block';
        applyAnimation(addWorkButton, 'addWorkButtonAnimation');
    }

    function applyAnimation(element, animationClass) {
        element.classList.add(animationClass);
        // Remove the class after animation ends
        element.addEventListener('animationend', () => {
            element.classList.remove(animationClass);
        }, { once: true });
    }

    // Add new work box on click
    addWorkButton.onclick = function () {
        if (!selectedDate) {
            alert("Please select a day first.");
            return;
        }

        var newWorkDetails = {
            name: "Enter work name",
            time: "Enter work time",
            date: selectedDate.toISOString() // This will be updated once the work is saved
        };
        createWorkBox(newWorkDetails, true);
    };








    

    // Initialize
    updateMonthYear();
    updateWeek();

    // Update the month/year when clicking on previous/next month
    prevMonth.onclick = function () {
        currentDate.setMonth(currentDate.getMonth() - 1);
        updateMonthYear();
        updateWeek();
    };

    nextMonth.onclick = function () {
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateMonthYear();
        updateWeek();
    };

    // Update the week when clicking on previous/next week
    prevWeek.onclick = function () {
        currentDate.setDate(currentDate.getDate() - 7);
        updateWeek();
    };

    nextWeek.onclick = function () {
        currentDate.setDate(currentDate.getDate() + 7);
        updateWeek();
    };
});




document.addEventListener("DOMContentLoaded", function () {
    const searchIcon = document.getElementById('searchIcon');
    const searchBox = document.getElementById('search');

    // Normalize text function to handle variations
    function normalizeText(text) {
        return text.toLowerCase().replace(/\s+/g, ''); // Convert to lowercase and remove spaces
    }

    // Search icon click event
    searchIcon.onclick = function () {
        const searchQuery = normalizeText(searchBox.value.trim());
        
        if (!searchQuery) {
            alert("Please enter a search term.");
            return;
        }

        // Load saved work details from localStorage
        const savedWorkList = JSON.parse(localStorage.getItem('workList')) || [];

        // Find the work(s) that match the search query
        const matchingWork = savedWorkList.filter(function (workDetails) {
            const normalizedWorkName = normalizeText(workDetails.name);
            const normalizedWorkDate = normalizeText(new Date(workDetails.date).toDateString());

            // Check if search query is a substring of the work name or date
            return normalizedWorkName.includes(searchQuery) || normalizedWorkDate.includes(searchQuery);
        });

        if (matchingWork.length > 0) {
            matchingWork.forEach(function (work) {
                const workDate = new Date(work.date).toDateString();
                alert(`Found Work: ${work.name}\nDate: ${workDate}`);
            });
        } else {
            alert("No matching work found.");
        }
    };
});




document.getElementById("todo").onclick = function(){
    document.getElementById("workBoxes").style.display = "flex"
        document.getElementById("progressBox").style.display = "none"
            document.getElementById("CompletedBox").style.display = "none"
                document.getElementById("OverdueBox").style.display = "none"
}


document.getElementById("progress").onclick = function(){
    document.getElementById("progressBox").style.display = "flex"
        document.getElementById("workBoxes").style.display = "none"
            document.getElementById("CompletedBox").style.display = "none"
                 document.getElementById("OverdueBox").style.display = "none"
}


document.getElementById("completed").onclick = function(){
    document.getElementById("CompletedBox").style.display = "flex"
        document.getElementById("progressBox").style.display = "none"
           document.getElementById("workBoxes").style.display = "none"
                document.getElementById("OverdueBox").style.display = "none"
}


document.getElementById("overdue").onclick = function(){
    document.getElementById("OverdueBox").style.display = "flex"
         document.getElementById("progressBox").style.display = "none"
            document.getElementById("workBoxes").style.display = "none"
               document.getElementById("CompletedBox").style.display = "none"
}


window.onload = function(){
        document.getElementById("workBoxes").style.display = "flex"
}