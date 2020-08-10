"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["activeProjects"] = 0] = "activeProjects";
    ProjectStatus[ProjectStatus["finishedProjects"] = 1] = "finishedProjects";
})(ProjectStatus || (ProjectStatus = {}));
var Project = /** @class */ (function () {
    function Project(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
    return Project;
}());
var ProjectState = /** @class */ (function () {
    function ProjectState() {
        this.projects = [];
        this.listeners = [];
    }
    ProjectState.prototype.callListeners = function () {
        var _this = this;
        this.listeners.forEach(function (listener) { return listener(_this.projects.slice()); });
    };
    ProjectState.prototype.addListeners = function (listener) {
        this.listeners.push(listener);
    };
    ProjectState.prototype.addProject = function (title, description, people) {
        var newProject = new Project(Math.random.toString(), title, description, people, ProjectStatus.activeProjects);
        this.projects.push(newProject);
        this.callListeners();
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
var ProjectElement = /** @class */ (function () {
    function ProjectElement(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = document.getElementById(templateId);
        this.hostElement = document.getElementById(hostElementId);
        var importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    ProjectElement.prototype.attach = function (insertAtStart) {
        this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
    };
    return ProjectElement;
}());
var ProjectList = /** @class */ (function (_super) {
    __extends(ProjectList, _super);
    function ProjectList(type) {
        var _this = _super.call(this, 'project-list', 'app', false, type + "-projects") || this;
        _this.type = type;
        _this.assignedProjects = [];
        _this.configure();
        _this.renderContent();
        return _this;
    }
    ProjectList.prototype.configure = function () {
        var _this = this;
        store.addListeners(function (projects) {
            var relevantProjects = projects.filter(function (project) {
                if (_this.type === 'active')
                    return project.status === ProjectStatus.activeProjects;
                return project.status === ProjectStatus.finishedProjects;
            });
            _this.assignedProjects = relevantProjects;
            _this.renderProjects();
        });
    };
    ProjectList.prototype.renderProjects = function () {
        var listEl = document.getElementById(this.type + "-projects-list");
        listEl.innerHTML = '';
        this.assignedProjects.forEach(function (project) {
            var liEl = document.createElement('li');
            liEl.textContent = project.description;
            listEl.appendChild(liEl);
        });
    };
    ProjectList.prototype.renderContent = function () {
        this.element.querySelector('h2').textContent = this.type.toUpperCase() + " PROJECTS";
        var ulElement = this.element.querySelector('ul');
        ulElement.id = this.type + "-projects-list";
        var liTemplateElement = document.getElementById('single-project');
        this.assignedProjects.forEach(function (project) {
            var importedNode = document.importNode(liTemplateElement.content, true);
            var liElement = importedNode.firstElementChild;
            liElement.textContent = project.description;
            ulElement.insertAdjacentElement('afterbegin', liElement);
        });
    };
    return ProjectList;
}(ProjectElement));
var ProjectInput = /** @class */ (function (_super) {
    __extends(ProjectInput, _super);
    function ProjectInput() {
        var _this = _super.call(this, 'project-input', 'app', true, 'user-input') || this;
        _this.title = _this.element.querySelector('#title');
        _this.description = _this.element.querySelector('#description');
        _this.people = _this.element.querySelector('#people');
        _this.configure();
        return _this;
    }
    ProjectInput.prototype.configure = function () {
        this.element.addEventListener('submit', this.submitHandler.bind(this));
    };
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
    return ProjectInput;
}(ProjectElement));
var projectInput = new ProjectInput();
var activeProjects = new ProjectList('active');
var finishedProjects = new ProjectList('finished');
//# sourceMappingURL=app.js.map