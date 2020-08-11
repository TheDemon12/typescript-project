import { Project, ProjectStatus } from '../models/project.js';
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
export default store;
//# sourceMappingURL=state.js.map