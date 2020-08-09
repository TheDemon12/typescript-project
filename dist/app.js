"use strict";
var ProjectState = /** @class */ (function () {
    function ProjectState() {
        this.projects = [];
    }
    ProjectState.prototype.addProject = function (title, description, people) {
        var newProject = {
            id: Math.random().toString(),
            title: title,
            description: description,
            people: people,
        };
        this.projects.push(newProject);
    };
    ProjectState.prototype.getProjects = function () {
        return this.projects;
    };
    return ProjectState;
}());
var store = new ProjectState();
function validate(config) {
    var isValid = true;
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
var ProjectList = /** @class */ (function () {
    function ProjectList(type) {
        this.type = type;
        this.templateElement = document.querySelector('#project-list');
        this.hostElement = document.getElementById('app');
        var importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = this.type + "-projects";
        console.log(this.element);
        this.attach();
        this.renderContent();
    }
    ProjectList.prototype.renderContent = function () {
        this.element.querySelector('h2').textContent = this.type.toUpperCase() + " PROJECTS";
    };
    ProjectList.prototype.attach = function () {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    };
    return ProjectList;
}());
var ProjectInput = /** @class */ (function () {
    function ProjectInput() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        var importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = 'user-input';
        this.title = this.element.querySelector('#title');
        this.description = this.element.querySelector('#description');
        this.people = this.element.querySelector('#people');
        this.configure();
        this.attach();
    }
    ProjectInput.prototype.gatherUserInput = function () {
        var titleValue = this.title.value;
        var descriptionValue = this.description.value;
        var peopleValue = this.people.value;
        var titleValidatable = {
            value: titleValue,
            minLength: 5,
            maxLength: 255,
        };
        var descriptionValidatable = {
            value: descriptionValue,
            minLength: 5,
            maxLength: 255,
        };
        var peopleValidatable = {
            value: peopleValue,
            min: 1,
            max: 10,
        };
        if (!validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            console.log('Invalid Properties Specified');
            return;
        }
        else {
            return [titleValue, descriptionValue, +peopleValue];
        }
    };
    ProjectInput.prototype.clearInput = function () {
        this.title.value = '';
        this.description.value = '';
        this.people.value = '';
    };
    ProjectInput.prototype.submitHandler = function (e) {
        e.preventDefault();
        var res = this.gatherUserInput();
        if (res) {
            var title = res[0], description = res[1], people = res[2];
            store.addProject(title, description, people);
            this.clearInput();
        }
    };
    ProjectInput.prototype.configure = function () {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    };
    ProjectInput.prototype.attach = function () {
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    };
    return ProjectInput;
}());
var projectInput = new ProjectInput();
var activeProjects = new ProjectList('active');
var finishedProjects = new ProjectList('finished');
//# sourceMappingURL=app.js.map