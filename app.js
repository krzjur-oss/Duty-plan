// ============================================
// TAB NAVIGATION
// ============================================

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

// ============================================
// DARK MODE TOGGLE
// ============================================

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

// ============================================
// TEACHERS MANAGEMENT
// ============================================

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
}

function deleteTeacherUI(id) {
    if (confirm('Czy na pewno chcesz usunąć tego nauczyciela?')) {
        deleteTeacher(id);
        renderTeachers();
        renderAssignments();
        generateScheduleView();
    }
}

// ============================================
// BREAKS MANAGEMENT
// ============================================

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
}

function deleteBreakUI(id) {
    if (confirm('Czy na pewno chcesz usunąć tę przerwę?')) {
        deleteBreak(id);
        renderBreaks();
        renderAssignments();
        generateScheduleView();
    }
}

// ============================================
// LOCATIONS MANAGEMENT
// ============================================

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
}

function deleteLocationUI(id) {
    if (confirm('Czy na pewno chcesz usunąć to miejsce?')) {
        deleteLocation(id);
        renderLocations();
        renderAssignments();
        generateScheduleView();
    }
}

// ============================================
// ASSIGNMENTS MANAGEMENT
// ============================================

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
                ${assignment.day ? `<div class="list-item-subtitle">📅 ${getDayName(assignment.day)}</div>` : ''}
            </div>
            <div class="list-item-actions">
                <button class="btn-delete" onclick="deleteAssignmentUI(${assignment.id})">🗑️ Usuń</button>
            </div>
        `;
        container.appendChild(item);
    });

    checkAndDisplayConflicts();
}

function deleteAssignmentUI(id) {
    if (confirm('Czy na pewno chcesz usunąć ten dyżur?')) {
        deleteAssignment(id);
        renderAssignments();
        generateScheduleView();
    }
}

// ============================================
// CONFLICT DETECTION
// ============================================

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

// ============================================
// DRAG & DROP STATE
// ============================================

let draggedData = null;

// ============================================
// HELPER FUNCTIONS
// ============================================

const DAYS = {
    'monday': 'Poniedziałek',
    'tuesday': 'Wtorek',
    'wednesday': 'Środa',
    'thursday': 'Czwartek',
    'friday': 'Piątek',
    'all': 'Cały tydzień'
};

function getDayName(day) {
    return DAYS[day] || day;
}

function getSelectedDay() {
    const select = document.getElementById('schedule-week-select');
    return select ? select.value : 'monday';
}

// ============================================
// SCHEDULE VIEW - INTERACTIVE GRID TABLE
// ============================================

function generateScheduleView() {
    const assignments = getAssignments();
    const breaks = getBreaks();
    const locations = getLocations();
    const teachers = getTeachers();
    const container = document.getElementById('schedule-view');
    const selectedDay = getSelectedDay();
    container.innerHTML = '';

    if (breaks.length === 0 || locations.length === 0) {
        container.innerHTML = '<p class="placeholder">Dodaj przerwy i miejsca przed wyświetleniem harmonogramu.</p>';
        return;
    }

    // Filter assignments by selected day
    const filteredAssignments = assignments.filter(a => {
        if (selectedDay === 'all') return true;
        return a.day === selectedDay || !a.day;
    });

    // Determine if showing all days or single day
    const isAllDays = selectedDay === 'all';

    if (isAllDays) {
        // Show tables for each day
        Object.keys(DAYS).forEach(day => {
            if (day === 'all') return;
            
            const dayAssignments = assignments.filter(a => a.day === day || !a.day);
            renderSingleDayTable(container, day, dayAssignments, breaks, locations);
        });
    } else {
        // Show single day table
        renderSingleDayTable(container, selectedDay, filteredAssignments, breaks, locations);
    }

    // Add buttons row
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'schedule-buttons';
    buttonsDiv.innerHTML = `
        <button class="btn-secondary" onclick="generateScheduleView()">🔄 Odśwież harmonogram</button>
        <button class="btn-secondary" onclick="window.print()">🖨️ Drukuj harmonogram</button>
    `;
    container.appendChild(buttonsDiv);
}

function renderSingleDayTable(container, day, assignments, breaks, locations) {
    // Create wrapper for table
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'schedule-table-wrapper';

    // Create HTML table
    let html = `<div class="schedule-day-header">📅 ${getDayName(day)}</div>`;
    html += '<table class="schedule-table">';
    
    // Header row - locations
    html += '<thead><tr>';
    html += '<th class="schedule-header-break">⏰ Przerwę / Miejsce</th>';
    
    locations.forEach(location => {
        html += `<th class="schedule-header-location">${location.name}</th>`;
    });
    
    html += '</tr></thead>';

    // Body rows - breaks
    html += '<tbody>';
    
    breaks.forEach(breakItem => {
        html += '<tr>';
        html += `<td class="schedule-break-time"><strong>${breakItem.name}</strong><br><small>${breakItem.startTime} - ${breakItem.endTime}</small></td>`;
        
        locations.forEach(location => {
            const assignment = assignments.find(a => 
                a.breakId == breakItem.id && 
                a.locationId == location.id &&
                (a.day === day || !a.day)
            );
            
            if (assignment) {
                html += `<td class="schedule-cell-filled" 
                    draggable="true"
                    data-assignment-id="${assignment.id}"
                    data-break-id="${breakItem.id}"
                    data-location-id="${location.id}"
                    data-teacher-id="${assignment.teacherId}"
                    data-day="${day}"
                    ondragstart="onDragStart(event)"
                    ondragover="onDragOver(event)"
                    ondrop="onDrop(event)"
                    ondragend="onDragEnd(event)"
                    onclick="openEditModal(${breakItem.id}, ${location.id}, '${assignment.teacherName}', ${assignment.id}, '${day}')">
                    <div class="schedule-teacher" style="cursor: grab;">✋ ${assignment.teacherName}</div>
                    <small class="edit-hint">Przeciągnij lub kliknij</small>
                </td>`;
            } else {
                html += `<td class="schedule-cell-empty" 
                    ondragover="onDragOver(event)"
                    ondrop="onDrop(event)"
                    data-break-id="${breakItem.id}"
                    data-location-id="${location.id}"
                    data-day="${day}"
                    onclick="openEditModal(${breakItem.id}, ${location.id}, '', null, '${day}')">
                    <div class="schedule-empty-hint">+ Dodaj nauczyciela</div>
                </td>`;
            }
        });
        
        html += '</tr>';
    });
    
    html += '</tbody></table>';

    tableWrapper.innerHTML = html;
    container.appendChild(tableWrapper);
}

// ============================================
// DRAG & DROP HANDLERS
// ============================================

function onDragStart(event) {
    const cell = event.target.closest('td');
    draggedData = {
        assignmentId: cell.dataset.assignmentId,
        teacherId: cell.dataset.teacherId,
        breakId: cell.dataset.breakId,
        locationId: cell.dataset.locationId,
        day: cell.dataset.day,
        teacherName: cell.querySelector('.schedule-teacher').textContent.trim()
    };
    
    cell.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedData.teacherName);
}

function onDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    
    const cell = event.target.closest('td');
    if (cell && !cell.classList.contains('schedule-break-time')) {
        cell.classList.add('drag-over');
    }
}

function onDragEnd(event) {
    const cell = event.target.closest('td');
    if (cell) {
        cell.classList.remove('dragging');
    }
    
    document.querySelectorAll('.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
    
    draggedData = null;
}

function onDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const targetCell = event.target.closest('td');
    
    if (!targetCell || targetCell.classList.contains('schedule-break-time')) {
        return;
    }
    
    if (!draggedData) {
        return;
    }

    const targetBreakId = parseInt(targetCell.dataset.breakId);
    const targetLocationId = parseInt(targetCell.dataset.locationId);
    const targetDay = targetCell.dataset.day;
    
    // Nie przeciągamy na to samo miejsce
    if (draggedData.breakId == targetBreakId && 
        draggedData.locationId == targetLocationId && 
        draggedData.day === targetDay) {
        targetCell.classList.remove('drag-over');
        return;
    }

    // Usuń stare przypisanie
    if (draggedData.assignmentId) {
        deleteAssignment(draggedData.assignmentId);
    }

    // Sprawdź konflikt
    const existingAssignment = getAssignments().find(a => 
        a.breakId == targetBreakId && 
        a.locationId == targetLocationId &&
        (a.day === targetDay || !a.day)
    );

    if (existingAssignment) {
        if (confirm(`To miejsce jest już zajęte przez ${existingAssignment.teacherName}. Zamienić dyżury?`)) {
            deleteAssignment(existingAssignment.id);
            addAssignmentDataWithDay(draggedData.teacherId, targetBreakId, targetLocationId, targetDay);
            addAssignmentDataWithDay(existingAssignment.teacherId, draggedData.breakId, draggedData.locationId, draggedData.day);
        } else {
            // Przywróć stare przypisanie
            addAssignmentDataWithDay(draggedData.teacherId, draggedData.breakId, draggedData.locationId, draggedData.day);
        }
    } else {
        // Po prostu przenieś
        addAssignmentDataWithDay(draggedData.teacherId, targetBreakId, targetLocationId, targetDay);
    }

    targetCell.classList.remove('drag-over');
    renderAssignments();
    generateScheduleView();
}

// ============================================
// MODAL FOR EDITING ASSIGNMENTS
// ============================================

function openEditModal(breakId, locationId, currentTeacher, assignmentId, day = 'monday') {
    const teachers = getTeachers();
    const breaks = getBreaks();
    const locations = getLocations();
    
    const breakItem = breaks.find(b => b.id == breakId);
    const location = locations.find(l => l.id == locationId);

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'editModal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>Przypisz nauczyciela</h3>
                <button class="modal-close" onclick="closeModal()">✕</button>
            </div>
            <div class="modal-body">
                <p><strong>Dzień:</strong> ${getDayName(day)}</p>
                <p><strong>Przerwę:</strong> ${breakItem ? breakItem.name + ' (' + breakItem.startTime + '-' + breakItem.endTime + ')' : 'Nieznana'}</p>
                <p><strong>Miejsce:</strong> ${location ? location.name : 'Nieznane'}</p>
                <p><strong>Nauczyciel:</strong></p>
                <select id="modalTeacherSelect" class="modal-select">
                    <option value="">-- Brak (usuń dyżur) --</option>
                    ${teachers.map(t => `<option value="${t.id}" ${currentTeacher === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
                </select>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Anuluj</button>
                <button class="btn-primary" onclick="saveAssignmentFromModal(${breakId}, ${locationId}, ${assignmentId}, '${day}')">Zapisz</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    modal.style.display = 'flex';

    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function closeModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
        modal.remove();
    }
}

function saveAssignmentFromModal(breakId, locationId, assignmentId, day) {
    const teacherSelect = document.getElementById('modalTeacherSelect');
    const selectedTeacherId = teacherSelect.value;

    // Delete old assignment if exists
    if (assignmentId !== null) {
        deleteAssignment(assignmentId);
    }

    // Add new assignment if teacher selected
    if (selectedTeacherId) {
        addAssignmentDataWithDay(selectedTeacherId, breakId, locationId, day);
    }

    closeModal();
    renderAssignments();
    generateScheduleView();
}

// ============================================
// EXPORT / IMPORT
// ============================================

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
            generateScheduleView();
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
        generateScheduleView();
        showStatus('success', 'Wszystkie dane zostały wyczyszczone');
    }
}

// ============================================
// INSTALLATION PROMPT
// ============================================

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

// ============================================
// INITIAL RENDER
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    renderTeachers();
    renderBreaks();
    renderLocations();
    renderAssignments();
    generateScheduleView();
});