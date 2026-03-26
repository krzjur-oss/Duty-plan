// ============================================
// DATA MANAGEMENT - LocalStorage Operations
// ============================================

const STORAGE_KEYS = {
    teachers: 'dutyplan_teachers',
    breaks: 'dutyplan_breaks',
    locations: 'dutyplan_locations',
    assignments: 'dutyplan_assignments'
};

// Initialize data from localStorage or set defaults
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.teachers)) {
        localStorage.setItem(STORAGE_KEYS.teachers, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.breaks)) {
        localStorage.setItem(STORAGE_KEYS.breaks, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.locations)) {
        localStorage.setItem(STORAGE_KEYS.locations, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.assignments)) {
        localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify([]));
    }
}

// ============================================
// GETTERS - Retrieve data from localStorage
// ============================================

function getTeachers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.teachers) || '[]');
}

function getBreaks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.breaks) || '[]');
}

function getLocations() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.locations) || '[]');
}

function getAssignments() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.assignments) || '[]');
}

// ============================================
// SETTERS - Save data to localStorage
// ============================================

function setTeachers(data) {
    localStorage.setItem(STORAGE_KEYS.teachers, JSON.stringify(data));
}

function setBreaks(data) {
    localStorage.setItem(STORAGE_KEYS.breaks, JSON.stringify(data));
}

function setLocations(data) {
    localStorage.setItem(STORAGE_KEYS.locations, JSON.stringify(data));
}

function setAssignments(data) {
    localStorage.setItem(STORAGE_KEYS.assignments, JSON.stringify(data));
}

// ============================================
// ADD FUNCTIONS - Create new items
// ============================================

function addTeacherData(name, email = '') {
    const teachers = getTeachers();
    const teacher = {
        id: Date.now(),
        name: name,
        email: email,
        createdAt: new Date().toISOString()
    };
    teachers.push(teacher);
    setTeachers(teachers);
    return teacher;
}

function addBreakData(name, startTime, endTime) {
    const breaks = getBreaks();
    const breakItem = {
        id: Date.now(),
        name: name,
        startTime: startTime,
        endTime: endTime,
        createdAt: new Date().toISOString()
    };
    breaks.push(breakItem);
    setBreaks(breaks);
    return breakItem;
}

function addLocationData(name) {
    const locations = getLocations();
    const location = {
        id: Date.now(),
        name: name,
        createdAt: new Date().toISOString()
    };
    locations.push(location);
    setLocations(locations);
    return location;
}

function addAssignmentData(teacherId, breakId, locationId) {
    const assignments = getAssignments();
    const teachers = getTeachers();
    const breaks = getBreaks();
    const locations = getLocations();

    const teacher = teachers.find(t => t.id == teacherId);
    const breakItem = breaks.find(b => b.id == breakId);
    const location = locations.find(l => l.id == locationId);

    const assignment = {
        id: Date.now(),
        teacherId: teacherId,
        breakId: breakId,
        locationId: locationId,
        teacherName: teacher ? teacher.name : 'Unknown',
        breakName: breakItem ? breakItem.name : 'Unknown',
        locationName: location ? location.name : 'Unknown',
        createdAt: new Date().toISOString()
    };
    assignments.push(assignment);
    setAssignments(assignments);
    return assignment;
}

// ============================================
// ADD ASSIGNMENT WITH DAY
// ============================================

function addAssignmentDataWithDay(teacherId, breakId, locationId, day = 'monday') {
    const assignments = getAssignments();
    const teachers = getTeachers();
    const breaks = getBreaks();
    const locations = getLocations();

    const teacher = teachers.find(t => t.id == teacherId);
    const breakItem = breaks.find(b => b.id == breakId);
    const location = locations.find(l => l.id == locationId);

    const assignment = {
        id: Date.now(),
        teacherId: teacherId,
        breakId: breakId,
        locationId: locationId,
        day: day,
        teacherName: teacher ? teacher.name : 'Unknown',
        breakName: breakItem ? breakItem.name : 'Unknown',
        locationName: location ? location.name : 'Unknown',
        createdAt: new Date().toISOString()
    };
    assignments.push(assignment);
    setAssignments(assignments);
    return assignment;
}

// ============================================
// DELETE FUNCTIONS - Remove items
// ============================================

function deleteTeacher(id) {
    let teachers = getTeachers();
    teachers = teachers.filter(t => t.id != id);
    setTeachers(teachers);
    
    // Remove related assignments
    deleteTeacherAssignments(id);
}

function deleteBreak(id) {
    let breaks = getBreaks();
    breaks = breaks.filter(b => b.id != id);
    setBreaks(breaks);
    
    // Remove related assignments
    deleteBreakAssignments(id);
}

function deleteLocation(id) {
    let locations = getLocations();
    locations = locations.filter(l => l.id != id);
    setLocations(locations);
    
    // Remove related assignments
    deleteLocationAssignments(id);
}

function deleteAssignment(id) {
    let assignments = getAssignments();
    assignments = assignments.filter(a => a.id != id);
    setAssignments(assignments);
}

function deleteTeacherAssignments(teacherId) {
    let assignments = getAssignments();
    assignments = assignments.filter(a => a.teacherId != teacherId);
    setAssignments(assignments);
}

function deleteBreakAssignments(breakId) {
    let assignments = getAssignments();
    assignments = assignments.filter(a => a.breakId != breakId);
    setAssignments(assignments);
}

function deleteLocationAssignments(locationId) {
    let assignments = getAssignments();
    assignments = assignments.filter(a => a.locationId != locationId);
    setAssignments(assignments);
}

// ============================================
// CONFLICT DETECTION
// ============================================

function checkConflicts() {
    const assignments = getAssignments();
    const conflicts = [];

    // Check if same teacher has multiple duties in same break
    for (let i = 0; i < assignments.length; i++) {
        for (let j = i + 1; j < assignments.length; j++) {
            if (assignments[i].teacherId === assignments[j].teacherId &&
                assignments[i].breakId === assignments[j].breakId &&
                (assignments[i].day === assignments[j].day || !assignments[i].day || !assignments[j].day)) {
                conflicts.push({
                    type: 'TEACHER_DOUBLE_DUTY',
                    message: `${assignments[i].teacherName} ma dwa dyżury w ${assignments[i].breakName}`,
                    assignmentIds: [assignments[i].id, assignments[j].id]
                });
            }
        }
    }

    return conflicts;
}

// ============================================
// EXPORT / IMPORT
// ============================================

function exportToJSON() {
    const data = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        teachers: getTeachers(),
        breaks: getBreaks(),
        locations: getLocations(),
        assignments: getAssignments()
    };
    return JSON.stringify(data, null, 2);
}

function importFromJSON(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        
        if (!data.version || !data.teachers || !data.breaks || !data.locations || !data.assignments) {
            throw new Error('Nieprawidłowy format danych');
        }

        setTeachers(data.teachers);
        setBreaks(data.breaks);
        setLocations(data.locations);
        setAssignments(data.assignments);
        
        return { success: true, message: 'Dane zaimportowane pomyślnie!' };
    } catch (error) {
        return { success: false, message: 'Import nie powiódł się: ' + error.message };
    }
}

// ============================================
// CLEAR ALL DATA
// ============================================

function clearAllDataStorage() {
    localStorage.clear();
    initializeData();
}

// Initialize on load
initializeData();