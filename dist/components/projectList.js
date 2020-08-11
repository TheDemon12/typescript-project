import ProjectElement from '../models/projectElement.js';
import { ProjectStatus } from '../models/project.js';
import { ProjectItem } from '../components/projectItem.js';
import store from '../state/state.js';
export class ProjectList extends ProjectElement {
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
//# sourceMappingURL=projectList.js.map