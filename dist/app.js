"use strict";
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["activeProjects"] = 0] = "activeProjects";
    ProjectStatus[ProjectStatus["finishedProjects"] = 1] = "finishedProjects";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class ProjectState {
    constructor() {
        this.projects = [];
        this.listeners = [];
    }
    callListeners() {
        this.listeners.forEach(listener => listener(this.projects.slice()));
    }
    addListeners(listener) {
        this.listeners.push(listener);
    }
    addProject(title, description, people) {
        const newProject = new Project(Math.random().toString(), title, description, people, ProjectStatus.activeProjects);
        this.projects.push(newProject);
        this.callListeners();
    }
    moveProject(projectId, projectStatus) {
        const project = this.projects.find(project => project.id === projectId);
        if (project) {
            if (project.status !== projectStatus) {
                project.status = projectStatus;
                this.callListeners();
            }
        }
    }
}
const store = new ProjectState();
function validate(config) {
    let isValid = true;
    if (config.required && config.value.toString().trim().length === 0)
        isValid = false;
    if (config.minLength &&
        config.value.toString().trim().length < config.minLength)
        isValid = false;
    if (config.maxLength &&
        config.value.toString().trim().length > config.maxLength)
        isValid = false;
    if (config.max &&
        typeof config.value === 'number' &&
        config.value > config.max)
        isValid = false;
    if (config.min &&
        typeof config.value === 'number' &&
        config.value < config.min)
        isValid = false;
    return isValid;
}
class ProjectElement {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtStart) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
    }
}
class ProjectItem extends ProjectElement {
    constructor(hostId, pr) {
        super('single-project', hostId, false, pr.id);
        this.project = pr;
        this.renderContent();
        this.element.addEventListener('dragstart', this.dragStartHandler.bind(this));
        this.element.addEventListener('dragend', this.dragEndHandler.bind(this));
    }
    get persons() {
        return `${this.project.people} person${this.project.people > 1 ? 's' : ''} assigned`;
    }
    dragStartHandler(event) {
        event.dataTransfer.setData('text/plain', this.project.id);
        event.dataTransfer.effectAllowed = 'move';
    }
    dragEndHandler(_event) {
        // console.log('dragEnd');
    }
    renderContent() {
        this.element.querySelector('h2').textContent = this.project.title;
        this.element.querySelector('h3').textContent = this.persons;
        this.element.querySelector('p').textContent = this.project.description;
    }
}
class ProjectList extends ProjectElement {
    constructor(type) {
        super('project-list', 'app', false, `${type}-projects`);
        this.type = type;
        this.assignedProjects = [];
        this.renderContent();
        this.configure();
    }
    configure() {
        store.addListeners((projects) => {
            const relevantProjects = projects.filter(project => {
                if (this.type === 'active')
                    return project.status === ProjectStatus.activeProjects;
                return project.status === ProjectStatus.finishedProjects;
            });
            this.assignedProjects = relevantProjects;
            this.renderProjects();
        });
        this.element.addEventListener('dragover', this.dragOverHandler.bind(this));
        this.element.addEventListener('dragleave', this.dragLeaveHandler.bind(this));
        this.element.addEventListener('drop', this.dropHandler.bind(this));
    }
    dragOverHandler(event) {
        event.preventDefault();
        this.element.querySelector('ul').classList.add('droppable');
    }
    dragLeaveHandler() {
        this.element.querySelector('ul').classList.remove('droppable');
    }
    dropHandler(event) {
        var _a;
        const id = (_a = event.dataTransfer) === null || _a === void 0 ? void 0 : _a.getData('text/plain');
        console.log(this.type);
        store.moveProject(id, this.type === 'active'
            ? ProjectStatus.activeProjects
            : ProjectStatus.finishedProjects);
        this.element.querySelector('ul').classList.remove('droppable');
    }
    renderProjects() {
        const listEl = document.getElementById(`${this.type}-projects-list`);
        listEl.innerHTML = '';
        this.assignedProjects.forEach(project => {
            new ProjectItem(`${this.type}-projects-list`, project);
        });
    }
    renderContent() {
        this.element.querySelector('h2').textContent = `${this.type.toUpperCase()} PROJECTS`;
        const ulElement = this.element.querySelector('ul');
        ulElement.id = `${this.type}-projects-list`;
        this.assignedProjects.forEach(project => {
            new ProjectItem(`${this.type}-projects-list`, project);
        });
    }
}
class ProjectInput extends ProjectElement {
    constructor() {
        super('project-input', 'app', true, 'user-input');
        this.title = this.element.querySelector('#title');
        this.description = this.element.querySelector('#description');
        this.people = this.element.querySelector('#people');
        this.configure();
    }
    configure() {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    }
    gatherUserInput() {
        const titleValue = this.title.value;
        const descriptionValue = this.description.value;
        const peopleValue = this.people.value;
        const titleValidatable = {
            value: titleValue,
            minLength: 5,
            maxLength: 255,
        };
        const descriptionValidatable = {
            value: descriptionValue,
            minLength: 5,
            maxLength: 255,
        };
        const peopleValidatable = {
            value: peopleValue,
            min: 1,
            max: 10,
        };
        if (!validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            alert('Invalid Properties Specified');
            return;
        }
        else {
            return [titleValue, descriptionValue, +peopleValue];
        }
    }
    clearInput() {
        this.title.value = '';
        this.description.value = '';
        this.people.value = '';
    }
    submitHandler(e) {
        e.preventDefault();
        const res = this.gatherUserInput();
        if (res) {
            const [title, description, people] = res;
            store.addProject(title, description, people);
            this.clearInput();
        }
    }
}
const projectInput = new ProjectInput();
const activeProjects = new ProjectList('active');
const finishedProjects = new ProjectList('finished');
//# sourceMappingURL=app.js.map