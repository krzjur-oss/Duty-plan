document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('active');
        });

        document.getElementById(tabName).classList.add('active');
        btn.classList.add('active');
    });
});

const darkModeToggle = document.getElementById('dark-mode-toggle');
const isDarkMode = localStorage.getItem('darkMode') === 'true';

if (isDarkMode) {
    document.body.classList.add('dark-mode');
    darkModeToggle.textContent = '☀️';
}

darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
});

function renderTeachers() {
    const teachers = getTeachers();
    const container = document.getElementById('teachers-list');
    container.innerHTML = '';

    if (teachers.length === 0) {
        container.innerHTML = '<p class="placeholder">Brak nauczycieli. Dodaj pierwszego!</p>';
        return;
    }

    teachers.forEach(teacher => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">${teacher.name}</div>
                ${teacher.email ? `<div class="list-item-subtitle">${teacher.email}</div>` : ''}
            </div>
            <div class="list-item-actions">
                <button class="btn-delete" onclick="deleteTeacherUI(${teacher.id})">🗑️ Usuń</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function addTeacher() {
    const name = document.getElementById('teacher-name').value.trim();
    const email = document.getElementById('teacher-email').value.trim();

    if (!name) {
        alert('Wpisz imię i nazwisko nauczyciela');
        return;
    }

    addTeacherData(name, email);
    document.getElementById('teacher-name').value = '';
    document.getElementById('teacher-email').value = '';
    renderTeachers();
    updateAssignmentSelects();
}

function deleteTeacherUI(id) {
    if (confirm('Czy na pewno chcesz usunąć tego nauczyciela?')) {
        deleteTeacher(id);
        renderTeachers();
        updateAssignmentSelects();
        renderAssignments();
    }
}

function renderBreaks() {
    const breaks = getBreaks();
    const container = document.getElementById('breaks-list');
    container.innerHTML = '';

    if (breaks.length === 0) {
        container.innerHTML = '<p class="placeholder">Brak przerw. Dodaj pierwszą!</p>';
        return;
    }

    breaks.forEach(breakItem => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">${breakItem.name}</div>
                <div class="list-item-subtitle">⏰ ${breakItem.startTime} - ${breakItem.endTime}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-delete" onclick="deleteBreakUI(${breakItem.id})">🗑️ Usuń</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function addBreak() {
    const name = document.getElementById('break-name').value.trim();
    const startTime = document.getElementById('break-start').value;
    const endTime = document.getElementById('break-end').value;

    if (!name || !startTime || !endTime) {
        alert('Wypełnij wszystkie pola');
        return;
    }

    addBreakData(name, startTime, endTime);
    document.getElementById('break-name').value = '';
    document.getElementById('break-start').value = '';
    document.getElementById('break-end').value = '';
    renderBreaks();
    updateAssignmentSelects();
}

function deleteBreakUI(id) {
    if (confirm('Czy na pewno chcesz usunąć tę przerwę?')) {
        deleteBreak(id);
        renderBreaks();
        updateAssignmentSelects();
        renderAssignments();
    }
}

function renderLocations() {
    const locations = getLocations();
    const container = document.getElementById('locations-list');
    container.innerHTML = '';

    if (locations.length === 0) {
        container.innerHTML = '<p class="placeholder">Brak miejsc. Dodaj pierwsze!</p>';
        return;
    }

    locations.forEach(location => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">📍 ${location.name}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-delete" onclick="deleteLocationUI(${location.id})">🗑️ Usuń</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function addLocation() {
    const name = document.getElementById('location-name').value.trim();

    if (!name) {
        alert('Wpisz nazwę miejsca');
        return;
    }

    addLocationData(name);
    document.getElementById('location-name').value = '';
    renderLocations();
    updateAssignmentSelects();
}

function deleteLocationUI(id) {
    if (confirm('Czy na pewno chcesz usunąć to miejsce?')) {
        deleteLocation(id);
        renderLocations();
        updateAssignmentSelects();
        renderAssignments();
    }
}

function updateAssignmentSelects() {
    const teacherSelect = document.getElementById('assignment-teacher');
    const breakSelect = document.getElementById('assignment-break');
    const locationSelect = document.getElementById('assignment-location');

    teacherSelect.innerHTML = '<option value="">Wybierz nauczyciela</option>';
    breakSelect.innerHTML = '<option value="">Wybierz przerwę</option>';
    locationSelect.innerHTML = '<option value="">Wybierz miejsce</option>';

    getTeachers().forEach(teacher => {
        teacherSelect.innerHTML += `<option value="${teacher.id}">${teacher.name}</option>`;
    });

    getBreaks().forEach(breakItem => {
        breakSelect.innerHTML += `<option value="${breakItem.id}">${breakItem.name} (${breakItem.startTime}-${breakItem.endTime})</option>`;
    });

    getLocations().forEach(location => {
        locationSelect.innerHTML += `<option value="${location.id}">${location.name}</option>`;
    });
}

function addAssignment() {
    const teacherId = document.getElementById('assignment-teacher').value;
    const breakId = document.getElementById('assignment-break').value;
    const locationId = document.getElementById('assignment-location').value;

    if (!teacherId || !breakId || !locationId) {
        alert('Wybierz nauczyciela, przerwę i miejsce');
        return;
    }

    addAssignmentData(teacherId, breakId, locationId);
    updateAssignmentSelects();
    renderAssignments();
    checkAndDisplayConflicts();
}

function renderAssignments() {
    const assignments = getAssignments();
    const container = document.getElementById('assignments-list');
    container.innerHTML = '';

    if (assignments.length === 0) {
        container.innerHTML = '<p class="placeholder">Brak przypisanych dyżurów.</p>';
        return;
    }

    assignments.forEach(assignment => {
        const item = document.createElement('div');
        item.className = 'list-item';
        item.innerHTML = `
            <div class="list-item-info">
                <div class="list-item-title">👨‍🏫 ${assignment.teacherName}</div>
                <div class="list-item-subtitle">⏰ ${assignment.breakName}</div>
                <div class="list-item-subtitle">📍 ${assignment.locationName}</div>
            </div>
            <div class="list-item-actions">
                <button class="btn-delete" onclick="deleteAssignmentUI(${assignment.id})">🗑️ Usuń</button>
            </div>
        `;
        container.appendChild(item);
    });
}

function deleteAssignmentUI(id) {
    if (confirm('Czy na pewno chcesz usunąć ten dyżur?')) {
        deleteAssignment(id);
        renderAssignments();
        checkAndDisplayConflicts();
    }
}

function checkAndDisplayConflicts() {
    const conflicts = checkConflicts();
    const alertDiv = document.getElementById('conflicts-alert');

    if (conflicts.length > 0) {
        alertDiv.style.display = 'block';
        alertDiv.innerHTML = '<strong>⚠️ Konflikty:</strong><br>' + 
            conflicts.map(c => c.message).join('<br>');
    } else {
        alertDiv.style.display = 'none';
    }
}

function generateScheduleView() {
    const assignments = getAssignments();
    const breaks = getBreaks();
    const container = document.getElementById('schedule-view');
    container.innerHTML = '';

    if (assignments.length === 0) {
        container.innerHTML = '<p class="placeholder">Brak dyżurów do wyświetlenia.</p>';
        return;
    }

    const byBreak = {};
    assignments.forEach(a => {
        if (!byBreak[a.breakName]) byBreak[a.breakName] = [];
        byBreak[a.breakName].push(a);
    });

    Object.keys(byBreak).forEach(breakName => {
        const card = document.createElement('div');
        card.className = 'schedule-card';
        
        let content = `<div class="schedule-card-header">⏰ ${breakName}</div>`;
        content += '<div class="schedule-card-content">';
        
        byBreak[breakName].forEach(assignment => {
            content += `<div>👨‍🏫 <strong>${assignment.teacherName}</strong> → 📍 ${assignment.locationName}</div>`;
        });
        
        content += '</div>';
        card.innerHTML = content;
        container.appendChild(card);
    });
}

function exportData() {
    const json = exportToJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `duty-plan-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    showStatus('success', 'Dane wyeksportowane pomyślnie!');
}

function importData() {
    const fileInput = document.getElementById('import-file');
    const file = fileInput.files[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const result = importFromJSON(e.target.result);
        
        if (result.success) {
            showStatus('success', result.message);
            renderTeachers();
            renderBreaks();
            renderLocations();
            renderAssignments();
            updateAssignmentSelects();
            checkAndDisplayConflicts();
        } else {
            showStatus('error', result.message);
        }
    };

    reader.readAsText(file);
    fileInput.value = '';
}

function showStatus(type, message) {
    const statusDiv = document.getElementById('data-status');
    statusDiv.textContent = message;
    statusDiv.className = `status-message ${type}`;
    
    setTimeout(() => {
        statusDiv.className = 'status-message';
    }, 3000);
}

function clearAllData() {
    if (confirm('Czy na pewno chcesz wyczyścić WSZYSTKIE dane? Tej operacji nie można cofnąć!')) {
        clearAllDataStorage();
        renderTeachers();
        renderBreaks();
        renderLocations();
        renderAssignments();
        updateAssignmentSelects();
        showStatus('success', 'Wszystkie dane zostały wyczyszczone');
    }
}

let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('install-prompt').style.display = 'block';
});

function installApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            deferredPrompt = null;
            document.getElementById('install-prompt').style.display = 'none';
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    renderTeachers();
    renderBreaks();
    renderLocations();
    renderAssignments();
    updateAssignmentSelects();
    checkAndDisplayConflicts();
});