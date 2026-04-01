// --- całość pliku app.js, różnica w generateScheduleView i renderSingleDayTable + sortowanie nauczycieli ---

// ... (początek jak w Twojej wersji) ...

function znajdzKonfliktyKomorek() {
    const assignments = getAssignments();
    const map = {};
    assignments.forEach(a => {
        const day = a.day || 'monday';
        if (!map[day]) map[day] = {};
        if (!map[day][a.breakId]) map[day][a.breakId] = {};
        if (!map[day][a.breakId][a.teacherId]) map[day][a.breakId][a.teacherId] = [];
        map[day][a.breakId][a.teacherId].push(a);
    });
    const ids = new Set();
    Object.entries(map).forEach(([day, byBreak]) => {
        Object.entries(byBreak).forEach(([breakId, byTeacher]) => {
            Object.values(byTeacher).forEach(assignList => {
                if (assignList.length > 1) {
                    assignList.forEach(assign => {
                        ids.add(`${day}|${breakId}|${assign.locationId}|${assign.teacherId}`);
                    });
                }
            });
        });
    });
    return ids;
}

function generateScheduleView() {
    const assignments = getAssignments();
    const breaks = getBreaks();
    const locations = getLocations();
    const teachers = getTeachers();
    const container = document.getElementById('schedule-view');
    const selectedDay = getSelectedDay();
    container.innerHTML = '';

    const conflictCellIds = znajdzKonfliktyKomorek();

    if (breaks.length === 0 || locations.length === 0) {
        container.innerHTML = '<p class="placeholder">Dodaj przerwy i miejsca przed wyświetleniem harmonogramu.</p>';
        return;
    }

    if (selectedDay === 'all') {
        Object.keys(DAYS).forEach(day => {
            if (day === 'all') return;
            const dayAssignments = assignments.filter(a => a.day === day || !a.day);
            renderSingleDayTable(container, day, dayAssignments, breaks, locations, conflictCellIds);
        });
    } else {
        const filteredAssignments = assignments.filter(a => a.day === selectedDay || !a.day);
        renderSingleDayTable(container, selectedDay, filteredAssignments, breaks, locations, conflictCellIds);
    }

    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'schedule-buttons';
    buttonsDiv.innerHTML = `
        <button class="btn-secondary" onclick="generateScheduleView()">🔄 Odśwież harmonogram</button>
        <button class="btn-secondary" onclick="window.print()">🖨️ Drukuj harmonogram</button>
    `;
    container.appendChild(buttonsDiv);
}

function renderSingleDayTable(container, day, assignments, breaks, locations, conflictCellIds) {
    const outer = document.createElement('div');
    outer.className = 'schedule-table-wrapper';
    let html = `<table class="schedule-table">
        <caption class="schedule-day-header">📅 ${getDayName(day)}</caption>
        <thead><tr><th class="schedule-header-break">⏰ Przerwę / Miejsce</th>`;
    locations.forEach(location => {
        html += `<th class="schedule-header-location">${location.name}</th>`;
    });
    html += '</tr></thead><tbody>';
    breaks.forEach(breakItem => {
        html += '<tr>';
        html += `<td class="schedule-break-time"><strong>${breakItem.name}</strong><br><small>${breakItem.startTime} - ${breakItem.endTime}</small></td>`;
        locations.forEach(location => {
            const assignment = assignments.find(a =>
                a.breakId == breakItem.id &&
                a.locationId == location.id &&
                (a.day === day || !a.day)
            );
            let className = assignment ? "schedule-cell-filled" : "schedule-cell-empty";
            if (assignment && conflictCellIds.has(`${day}|${breakItem.id}|${location.id}|${assignment.teacherId}`)) {
                className += " schedule-cell-conflict";
            }
            if (assignment) {
                html += `<td class="${className}" draggable="true"
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
                html += `<td class="${className}"
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
    outer.innerHTML = html;
    container.appendChild(outer);
}

// --- MODAL przypisania z sortowaniem nauczycieli ---
function openEditModal(breakId, locationId, currentTeacher, assignmentId, day = 'monday') {
    const teachers = getTeachers();
    const breaks = getBreaks();
    const locations = getLocations();
    const sortedTeachers = teachers.slice().sort((a, b) => a.name.localeCompare(b.name, 'pl'));

    const breakItem = breaks.find(b => b.id == breakId);
    const location = locations.find(l => l.id == locationId);

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
                    ${sortedTeachers.map(t => `<option value="${t.id}" ${currentTeacher === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
                </select>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="closeModal()">Anuluj</button>
                <button class="btn-primary" onclick="saveAssignmentFromModal(${breakId}, ${locationId}, ${assignmentId}, '${day}')">Zapisz</button>
            </div>
        </div>`;
    document.body.appendChild(modal);
    modal.style.display = 'flex';
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// --- reszta kodu app.js jak w poprzedniej wersji ---